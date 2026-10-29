<?php

namespace App\Http\Controllers\Undertime;

use App\Http\Controllers\Controller;
use App\Models\UndertimeApplication;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UndertimeApplicationController extends Controller
{
    /**
     * Display the authenticated employee's undertime applications.
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
     * Display the undertime application form.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('Undertime/Create', [
            'employee' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
            ],
        ]);
    }

    /**
     * Validate and submit an undertime application.
     */
    public function store(Request $request): RedirectResponse
    {
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
         * Validate the same-day schedule and calculate duration
         * on the server. Never trust a duration calculated by React.
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

        if (
            ! empty($validated['scheduled_start_time']) &&
            $this->timeToMinutes($validated['scheduled_start_time']) >= $scheduledEnd
        ) {
            throw ValidationException::withMessages([
                'scheduled_start_time' =>
                    'The scheduled start time must be earlier than the scheduled end time.',
            ]);
        }

        $requestedMinutes = $scheduledEnd - $departure;

        /*
         * Store attachments privately. The download endpoint must
         * authorize access before serving these files.
         */
        $attachmentPath = null;

        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')
                ->store('undertime-attachments', 'local');
        }

        try {
            $application = DB::transaction(function () use (
                $request,
                $validated,
                $requestedMinutes,
                $attachmentPath
            ) {
                $user = $request->user();

                return UndertimeApplication::create([
                    'application_no' => $this->generateApplicationNumber(),

                    // Always use the authenticated employee.
                    'employee_id' => $user->id,

                    // Filing date comes from the server.
                    'date_filed' => now()->toDateString(),

                    'undertime_date' => $validated['undertime_date'],

                    'scheduled_start_time' =>
                        $validated['scheduled_start_time'] ?? null,

                    'scheduled_end_time' =>
                        $validated['scheduled_end_time'],

                    'requested_departure_time' =>
                        $validated['requested_departure_time'],

                    'requested_minutes' => $requestedMinutes,

                    'reason' => trim($validated['reason']),

                    'attachment_path' => $attachmentPath,

                    /*
                     * This initial status assumes the next phase
                     * will process requests through an approval workflow.
                     */
                    'status' => 'pending_approval',

                    'current_step' => 1,

                    'employee_confirmed' => true,

                    'employee_confirmed_at' => now(),

                    'submitted_at' => now(),
                ]);
            });
        } catch (\Throwable $exception) {
            /*
             * Avoid leaving an uploaded file behind if persistence fails.
             */
            if ($attachmentPath !== null) {
                Storage::disk('local')->delete($attachmentPath);
            }

            throw $exception;
        }

        return redirect()
            ->route('undertime.applications.show', $application)
            ->with(
                'success',
                'Your undertime request has been submitted successfully.'
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
            ],
        ]);
    }

    /**
     * Convert an HH:mm time into minutes after midnight.
     */
    private function timeToMinutes(string $time): int
    {
        [$hours, $minutes] = array_map(
            'intval',
            explode(':', $time)
        );

        return ($hours * 60) + $minutes;
    }

    /**
     * Generate a unique application reference.
     */
    private function generateApplicationNumber(): string
    {
        do {
            $applicationNumber = 'UT-' . now()->format('Ymd') . '-'
                . Str::upper(Str::random(8));
        } while (
            UndertimeApplication::query()
                ->where('application_no', $applicationNumber)
                ->exists()
        );

        return $applicationNumber;
    }
}