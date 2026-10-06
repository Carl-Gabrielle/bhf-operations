<?php

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Services\Leave\LeaveApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class LeaveApplicationController extends Controller
{
    public function __construct(
        private LeaveApplicationService $leaveApplicationService
    ) {}

    /*
    |--------------------------------------------------------------------------
    | Leave Applications
    |--------------------------------------------------------------------------
    */

    /**
     * Display the authenticated employee's leave applications.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();

        $applications = LeaveApplication::query()
            ->with([
                'leaveType',
                'approvals.approver',
            ])
            ->where('employee_id', $user->id)
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Leave/Index', [
            'applications' => $applications,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    /**
     * Display the leave application form.
     */
    public function create(Request $request): Response
    {
        $user = $request->user();

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

        return Inertia::render('Leave/Create', [
            'leaveTypes' => $leaveTypes,

            'employee' => [
                'id' => $user->id,
                'name' => $user->name,
                'employee_number' => $user->employee_number,

                'organizational_unit' =>
                    $user->organizationalUnit?->name,

                'position' =>
                    $user->position?->name,

                'manager' =>
                    $user->reportsTo?->name,
            ],
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    */

    /**
     * Store a new leave application.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'leave_type_id' => [
                'required',
                'integer',
                'exists:leave_types,id',
            ],

            'start_date' => [
                'required',
                'date',
            ],

            'end_date' => [
                'required',
                'date',
                'after_or_equal:start_date',
            ],

            'schedule_type' => [
                'required',
                'string',
                'in:full_day,half_day_am,half_day_pm',
            ],

            'reason' => [
                'required',
                'string',
                'max:2000',
            ],

            'attachment' => [
                'nullable',
                'file',
                'max:5120',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Store Attachment
        |--------------------------------------------------------------------------
        */

        $attachmentPath = null;

        if ($request->hasFile('attachment')) {
            $attachmentPath = $request
                ->file('attachment')
                ->store(
                    'leave-attachments',
                    'public'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Submit Application
        |--------------------------------------------------------------------------
        */

        $application = $this->leaveApplicationService->submit(
            $request->user(),
            [
                'leave_type_id' => $validated['leave_type_id'],
                'start_date' => $validated['start_date'],
                'end_date' => $validated['end_date'],
                'schedule_type' => $validated['schedule_type'],
                'reason' => $validated['reason'],
                'attachment_path' => $attachmentPath,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Redirect to Application Details
        |--------------------------------------------------------------------------
        */

        return redirect()
            ->route(
                'leave.applications.show',
                $application
            )
            ->with(
                'success',
                "Leave application {$application->application_no} submitted successfully."
            );
    }

    /*
    |--------------------------------------------------------------------------
    | Show
    |--------------------------------------------------------------------------
    */

    /**
     * Display a specific leave application.
     */
    public function show(
        Request $request,
        LeaveApplication $leaveApplication
    ): Response {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        |
        | Employees can view their own applications.
        | Users with leave.approve can view applications for approval.
        |
        */

        abort_unless(
            $leaveApplication->employee_id === $user->id
                || $user->can('leave.approve'),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Load Relationships
        |--------------------------------------------------------------------------
        */

        $leaveApplication->load([
            'employee.organizationalUnit',
            'employee.position',
            'employee.reportsTo',
            'leaveType',
            'approvalWorkflow',
            'approvals.approver.position',
        ]);

        return Inertia::render('Leave/View', [
            'application' => $leaveApplication,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | Download Attachment
    |--------------------------------------------------------------------------
    */

    /**
     * Download the attachment for a leave application.
     *
     * This is intentionally protected through Laravel instead of
     * exposing the /storage URL directly.
     */
    public function download(
        Request $request,
        LeaveApplication $leaveApplication
    ) {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Authorization
        |--------------------------------------------------------------------------
        |
        | The employee who owns the application can download it.
        | Users with leave.approve can also access it.
        |
        */

        abort_unless(
            $leaveApplication->employee_id === $user->id
                || $user->can('leave.approve'),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Check Attachment
        |--------------------------------------------------------------------------
        */

        abort_unless(
            !empty($leaveApplication->attachment_path),
            404
        );

        /*
        |--------------------------------------------------------------------------
        | Storage Disk
        |--------------------------------------------------------------------------
        */

        $disk = Storage::disk('public');

        /*
        |--------------------------------------------------------------------------
        | Check File Exists
        |--------------------------------------------------------------------------
        */

        abort_unless(
            $disk->exists($leaveApplication->attachment_path),
            404
        );

        /*
        |--------------------------------------------------------------------------
        | Filename
        |--------------------------------------------------------------------------
        */

        $filename = basename(
            $leaveApplication->attachment_path
        );

        /*
        |--------------------------------------------------------------------------
        | MIME Type
        |--------------------------------------------------------------------------
        */

        $mimeType = $disk->mimeType(
            $leaveApplication->attachment_path
        );

        /*
        |--------------------------------------------------------------------------
        | Force Download
        |--------------------------------------------------------------------------
        |
        | Content-Disposition: attachment explicitly tells the browser
        | to download the file instead of displaying it inline.
        |
        */

        return response()->streamDownload(
            function () use ($disk, $leaveApplication) {
                echo $disk->get(
                    $leaveApplication->attachment_path
                );
            },
            $filename,
            [
                'Content-Type' => $mimeType ?: 'application/octet-stream',

                'Content-Disposition' =>
                    'attachment; filename="' .
                    $filename .
                    '"',

                'Cache-Control' =>
                    'private, no-store, no-cache, must-revalidate',

                'Pragma' => 'no-cache',

                'Expires' => '0',
            ]
        );
    }
}