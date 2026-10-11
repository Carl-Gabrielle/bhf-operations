<?php

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Services\Leave\LeaveApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class LeaveApplicationController extends Controller
{
    public function __construct(
        private readonly LeaveApplicationService $leaveApplicationService,
    ) {}

    /**
     * List only the authenticated employee's applications.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user, 401);

        $applications = LeaveApplication::query()
            ->where('employee_id', $user->id)
            ->with([
                'leaveType',
                'approvals.approver',
                'approvals.workflowStep',
            ])
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Leave/Index', [
            'applications' => $applications,
        ]);
    }

    /**
     * Display the leave application form.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

        abort_unless($user, 401);

        $leaveTypes = LeaveType::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'code',
                'description',
                'is_paid',
                'requires_attachment',
            ]);

        $user->loadMissing([
            'organizationalUnit',
            'position',
            'reportsTo',
        ]);

        return Inertia::render('Leave/Create', [
            'leaveTypes' => $leaveTypes,
            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
                'employee_number' => $user->employee_number,
                'organizational_unit' => $user->organizationalUnit?->name,
                'position' => $user->position?->name,
                'manager' => $user->reportsTo?->name,
            ],
        ]);
    }

    /**
     * Validate and submit a leave application.
     */
    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user, 401);

        Log::info('Leave application POST received.', [
            'employee_id' => $user->id,
            'has_attachment' => $request->hasFile('attachment'),
            'content_type' => $request->header('Content-Type'),
        ]);

        $validated = $request->validate([
            'leave_type_id' => [
                'required',
                'integer',
                'exists:leave_types,id',
            ],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after_or_equal:start_date'],
            'schedule_type' => [
                'required',
                'string',
                'in:full_day,half_day_am,half_day_pm',
            ],
            'reason' => ['required', 'string', 'max:2000'],
            'attachment' => [
                'nullable',
                'file',
                'max:5120',
                'mimes:pdf,jpg,jpeg,png',
            ],
        ]);

        $attachmentPath = null;

        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store(
                'leave-attachments',
                'local',
            );

            if ($attachmentPath === false) {
                Log::error('Leave attachment upload failed.', ['employee_id' => $user->id]);
                throw new \RuntimeException('The leave attachment could not be saved.');
            }
        }

        try {
            $application = $this->leaveApplicationService->submit(
                $user,
                [
                    'leave_type_id' => $validated['leave_type_id'],
                    'start_date' => $validated['start_date'],
                    'end_date' => $validated['end_date'],
                    'schedule_type' => $validated['schedule_type'],
                    'reason' => $validated['reason'],
                    'attachment_path' => $attachmentPath,
                ],
            );
        } catch (ValidationException $exception) {
            // Expected configuration/validation problems are recorded without
            // dumping sensitive request data into the log. Laravel will show
            // the validation errors to the user as usual.
            Log::warning('Leave application submission rejected.', [
                'employee_id' => $user->id,
                'errors' => $exception->errors(),
            ]);

            if ($attachmentPath !== null) {
                Storage::disk('local')->delete($attachmentPath);
            }

            throw $exception;
        } catch (\Throwable $exception) {
            Log::error('Leave application submission crashed.', [
                'employee_id' => $user->id,
                'exception' => get_class($exception),
                'message' => $exception->getMessage(),
                'file' => $exception->getFile(),
                'line' => $exception->getLine(),
                'trace' => $exception->getTraceAsString(),
            ]);

            if ($attachmentPath !== null) {
                Storage::disk('local')->delete($attachmentPath);
            }

            throw $exception;
        }

        Log::info('Leave application submitted successfully.', [
            'employee_id' => $user->id,
            'application_id' => $application->id,
            'application_no' => $application->application_no,
        ]);

        return redirect()
            ->route('leave.applications.show', $application)
            ->with(
                'success',
                "Leave application {$application->application_no} submitted successfully.",
            );
    }

    /**
     * Employee can view their own application. An approver can view only
     * while a pending assignment is specifically assigned to them.
     */
    public function show(
        Request $request,
        LeaveApplication $leaveApplication,
    ): Response {
        $user = $request->user();

        abort_unless($user, 401);

        $isOwner = (int) $leaveApplication->employee_id === (int) $user->id;

        $hasPendingAssignment = $user->account_status === 'active'
            && $user->can('leave.approve')
            && $leaveApplication->status?->value === 'pending_approval'
            && $leaveApplication->approvals()
                ->where('approver_id', $user->id)
                ->where('action', 'pending')
                ->exists();

        abort_unless($isOwner || $hasPendingAssignment, 403);

        $leaveApplication->load([
            'employee.organizationalUnit',
            'employee.position',
            'employee.reportsTo',
            'leaveType',
            'approvalWorkflow.steps.approver',
            'approvals.approver.position',
            'approvals.workflowStep',
        ]);

        return Inertia::render('Leave/View', [
            'application' => $leaveApplication,
        ]);
    }

    /**
     * Download an attachment without exposing a public storage URL.
     */
    public function download(
        Request $request,
        LeaveApplication $leaveApplication,
    ) {
        $user = $request->user();

        abort_unless($user, 401);

        $isOwner = (int) $leaveApplication->employee_id === (int) $user->id;

        $hasPendingAssignment = $user->account_status === 'active'
            && $user->can('leave.approve')
            && $leaveApplication->status?->value === 'pending_approval'
            && $leaveApplication->approvals()
                ->where('approver_id', $user->id)
                ->where('action', 'pending')
                ->exists();

        abort_unless($isOwner || $hasPendingAssignment, 403);
        abort_unless($leaveApplication->attachment_path, 404);

        // Files are stored on a private disk. Only the authorized route serves them.
        $disk = Storage::disk('local');
        $path = $leaveApplication->attachment_path;

        abort_unless($disk->exists($path), 404);

        return response()->streamDownload(
            static function () use ($disk, $path): void {
                echo $disk->get($path);
            },
            basename($path),
            [
                'Content-Type' => $disk->mimeType($path) ?: 'application/octet-stream',
                'Content-Disposition' => 'attachment; filename="' . basename($path) . '"',
                'Cache-Control' => 'private, no-store, no-cache, must-revalidate',
                'Pragma' => 'no-cache',
                'Expires' => '0',
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }
}
