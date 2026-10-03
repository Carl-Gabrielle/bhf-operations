<?php

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveType;
use App\Services\Leave\LeaveApplicationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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
        |
        | IMPORTANT:
        | Current route name is:
        |
        | leave.applications.show
        |
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

        return Inertia::render('Leave/Show', [
            'application' => $leaveApplication,
        ]);
    }
}