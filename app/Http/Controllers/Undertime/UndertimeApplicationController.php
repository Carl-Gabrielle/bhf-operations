<?php

namespace App\Http\Controllers\Undertime;

use App\Http\Controllers\Controller;
use App\Models\UndertimeApplication;
use App\Services\Undertime\UndertimeApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UndertimeApplicationController extends Controller
{
    /**
     * Display the authenticated employee's applications.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $query = UndertimeApplication::query()
            ->where('employee_id', $user->id);

        if ($request->filled('search')) {
            $search = trim($request->string('search')->toString());

            $query->where(function ($subQuery) use ($search) {
                $subQuery
                    ->where('application_no', 'like', "%{$search}%")
                    ->orWhere('reason', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $applications = $query
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString()
            ->through(function (UndertimeApplication $application) {
                return [
                    'id' => $application->id,
                    'application_no' => $application->application_no,
                    'undertime_date' => $application->undertime_date?->format('Y-m-d'),
                    'requested_departure_time' => $application->requested_departure_time,
                    'requested_minutes' => $application->requested_minutes,
                    'reason' => $application->reason,
                    'status' => $application->status,
                    'created_at' => $application->created_at?->toISOString(),
                ];
            });

        return Inertia::render('Undertime/Index', [
            'applications' => $applications,
            'filters' => [
                'search' => $request->input('search', ''),
                'status' => $request->input('status', ''),
            ],
        ]);
    }

    /**
     * Display the application form.
     */
    public function create(Request $request): Response
    {
        $user = $request->user()->loadMissing([
            'organizationalUnit:id,code,name',
            'position:id,name',
            'reportsTo.position:id,name',
        ]);

        $manager = $user->reportsTo;

        $hasApprover = $manager
            && $manager->account_status === 'active'
            && (bool) $manager->can_be_reporting_manager
            && $manager->can('undertime.approve');

        return Inertia::render('Undertime/Create', [
            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
                'employee_number' => $user->employee_number,
                'organizational_unit' => $user->organizationalUnit?->name,
                'position' => $user->position?->name,
                'manager' => $hasApprover ? $manager->name : null,
                'manager_position' => $hasApprover
                    ? $manager->position?->name
                    : null,
                'has_approver' => (bool) $hasApprover,
            ],
        ]);
    }

    /**
     * Validate and submit an Undertime application.
     */
    public function store(
        Request $request,
        UndertimeApplicationService $service
    ): RedirectResponse {
        $validated = $request->validate([
            'undertime_date' => [
                'required',
                'date_format:Y-m-d',
                'after_or_equal:today',
            ],

            'scheduled_start_time' => [
                'nullable',
                'date_format:H:i',
            ],

            'scheduled_end_time' => [
                'required',
                'date_format:H:i',
            ],

            'requested_departure_time' => [
                'required',
                'date_format:H:i',
            ],

            'reason' => [
                'required',
                'string',
                'min:10',
                'max:2000',
            ],

            'attachment' => [
                'nullable',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:5120',
            ],

            'employee_confirmed' => [
                'required',
                'accepted',
            ],
        ]);

        /*
         * Calculate the requested undertime duration on the server.
         */
        $scheduledEnd = $this->timeToMinutes(
            $validated['scheduled_end_time']
        );

        $departure = $this->timeToMinutes(
            $validated['requested_departure_time']
        );

        if ($departure >= $scheduledEnd) {
            throw ValidationException::withMessages([
                'requested_departure_time' =>
                    'The requested departure time must be earlier than the scheduled end time.',
            ]);
        }

        if (!empty($validated['scheduled_start_time'])) {
            $scheduledStart = $this->timeToMinutes(
                $validated['scheduled_start_time']
            );

            if ($scheduledStart >= $scheduledEnd) {
                throw ValidationException::withMessages([
                    'scheduled_start_time' =>
                        'The scheduled start time must be earlier than the scheduled end time.',
                ]);
            }

            if ($departure < $scheduledStart) {
                throw ValidationException::withMessages([
                    'requested_departure_time' =>
                        'The requested departure time cannot be earlier than the scheduled start time.',
                ]);
            }
        }

        $validated['requested_minutes'] = $scheduledEnd - $departure;

        /*
         * Store the attachment privately.
         */
        $attachmentPath = null;

        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')
                ->store('undertime-attachments', 'local');
        }

        $validated['attachment_path'] = $attachmentPath;

        try {
            $application = $service->submit(
                $request->user(),
                $validated
            );
        } catch (\Throwable $exception) {
            // Remove uploaded file if submission fails.
            if ($attachmentPath !== null) {
                Storage::disk('local')->delete($attachmentPath);
            }

            throw $exception;
        }

        return redirect()
            ->route('undertime.applications.show', $application)
            ->with(
                'success',
                'Your Undertime application has been submitted successfully for approval.'
            );
    }

    /**
     * Display an application owned by the authenticated employee.
     */
    public function show(
        Request $request,
        UndertimeApplication $undertimeApplication
    ): Response {
        abort_unless(
            $undertimeApplication->employee_id === $request->user()->id,
            403
        );

        $undertimeApplication->load([
            'employee:id,name',
            'approvalWorkflow.steps',
            'approvals.approver:id,name',
            'approvals.workflowStep:id,name,step_order',
        ]);

        return Inertia::render('Undertime/Show', [
            'application' => [
                'id' => $undertimeApplication->id,
                'application_no' => $undertimeApplication->application_no,

                'employee' => [
                    'id' => $undertimeApplication->employee?->id,
                    'name' => $undertimeApplication->employee?->name,
                ],

                'date_filed' => $undertimeApplication->date_filed?->format('Y-m-d'),
                'undertime_date' => $undertimeApplication->undertime_date?->format('Y-m-d'),

                'scheduled_start_time' => $undertimeApplication->scheduled_start_time,
                'scheduled_end_time' => $undertimeApplication->scheduled_end_time,
                'requested_departure_time' => $undertimeApplication->requested_departure_time,

                'requested_minutes' => $undertimeApplication->requested_minutes,
                'reason' => $undertimeApplication->reason,

                'has_attachment' => filled($undertimeApplication->attachment_path),

                'status' => $undertimeApplication->status,

                'employee_confirmed' => $undertimeApplication->employee_confirmed,
                'submitted_at' => $undertimeApplication->submitted_at?->toISOString(),
                'created_at' => $undertimeApplication->created_at?->toISOString(),

                'workflow' => $undertimeApplication->approvalWorkflow?->name,

                'approvals' => $undertimeApplication->approvals
                    ->map(fn ($approval) => [
                        'id' => $approval->id,
                        'step_order' => $approval->step_order,
                        'step_name' => $approval->workflowStep?->name,
                        'approver' => $approval->approver?->name,
                        'action' => $approval->action,
                        'remarks' => $approval->remarks,
                        'acted_at' => $approval->acted_at?->toISOString(),
                    ])
                    ->values(),
            ],
        ]);
    }

    /**
     * Convert HH:mm into minutes after midnight.
     */
    private function timeToMinutes(string $time): int
    {
        [$hours, $minutes] = array_map(
            'intval',
            explode(':', $time)
        );

        return ($hours * 60) + $minutes;
    }
}
