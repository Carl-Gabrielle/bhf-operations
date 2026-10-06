<?php

namespace App\Http\Controllers\Leave;

use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveApproval;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeaveApprovalController extends Controller
{
    /**
     * Make sure the authenticated user is actually
     * eligible to approve leave requests.
     */
    private function authorizeApprover(Request $request): void
    {
        $user = $request->user();

        abort_unless(
            $user
                && $user->can_be_reporting_manager
                && $user->can('leave.approve'),
            403
        );
    }

    /**
     * Display leave requests assigned to the
     * authenticated reporting manager / head.
     */
    public function index(Request $request): Response
    {
        $this->authorizeApprover($request);

        $user = $request->user();

        $applications = LeaveApplication::query()
            ->with([
                'employee.organizationalUnit',
                'employee.position',
                'leaveType',
                'approvals.approver',
            ])
            ->whereHas('employee', function ($query) use ($user) {
                $query->where(
                    'reports_to_user_id',
                    $user->id
                );
            })
            ->whereIn('status', [
                'pending',
                'for_approval',
            ])
            ->latest('created_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Leave/Approvals/Index', [
            'applications' => $applications,

            'approver' => [
                'id' => $user->id,
                'name' => $user->name,
                'employee_number' =>
                    $user->employee_number,
                'can_be_reporting_manager' =>
                    (bool) $user->can_be_reporting_manager,
            ],
        ]);
    }

    /**
     * Display a leave request for approval.
     */
    public function show(
        Request $request,
        LeaveApplication $leaveApplication
    ): Response {
        $this->authorizeApprover($request);

        $user = $request->user();

        $this->authorizeApplication(
            $leaveApplication,
            $user->id
        );

        $leaveApplication->load([
            'employee.organizationalUnit',
            'employee.position',
            'employee.reportsTo',
            'leaveType',
            'approvalWorkflow',
            'approvals.approver.position',
        ]);

        return Inertia::render(
            'Leave/Approvals/Show',
            [
                'application' => $leaveApplication,
                'approver' => [
                    'id' => $user->id,
                    'name' => $user->name,
                ],
            ]
        );
    }

    /**
     * Approve a leave request.
     */
    public function approve(
        Request $request,
        LeaveApplication $leaveApplication
    ): RedirectResponse {
        $this->authorizeApprover($request);

        $user = $request->user();

        $this->authorizeApplication(
            $leaveApplication,
            $user->id
        );

        $request->validate([
            'remarks' => [
                'nullable',
                'string',
                'max:2000',
            ],
        ]);

        DB::transaction(function () use (
            $leaveApplication,
            $user,
            $request
        ) {
            $approval = LeaveApproval::query()
                ->where(
                    'leave_application_id',
                    $leaveApplication->id
                )
                ->where(
                    'approver_id',
                    $user->id
                )
                ->where('status', 'pending')
                ->firstOrFail();

            $approval->update([
                'status' => 'approved',
                'remarks' => $request->input('remarks'),
                'approved_at' => now(),
            ]);

            $leaveApplication->update([
                'status' => 'approved',
            ]);
        });

        return redirect()
            ->route(
                'leave.approvals.index'
            )
            ->with(
                'success',
                "Leave application {$leaveApplication->application_no} has been approved."
            );
    }

    /**
     * Reject a leave request.
     */
    public function reject(
        Request $request,
        LeaveApplication $leaveApplication
    ): RedirectResponse {
        $this->authorizeApprover($request);

        $user = $request->user();

        $this->authorizeApplication(
            $leaveApplication,
            $user->id
        );

        $validated = $request->validate([
            'remarks' => [
                'required',
                'string',
                'max:2000',
            ],
        ]);

        DB::transaction(function () use (
            $leaveApplication,
            $user,
            $validated
        ) {
            $approval = LeaveApproval::query()
                ->where(
                    'leave_application_id',
                    $leaveApplication->id
                )
                ->where(
                    'approver_id',
                    $user->id
                )
                ->where('status', 'pending')
                ->firstOrFail();

            $approval->update([
                'status' => 'rejected',
                'remarks' => $validated['remarks'],
                'approved_at' => now(),
            ]);

            $leaveApplication->update([
                'status' => 'rejected',
            ]);
        });

        return redirect()
            ->route(
                'leave.approvals.index'
            )
            ->with(
                'success',
                "Leave application {$leaveApplication->application_no} has been rejected."
            );
    }

    /**
     * Make sure the request actually belongs to
     * the current reporting manager.
     */
    private function authorizeApplication(
        LeaveApplication $leaveApplication,
        int $userId
    ): void {
        abort_unless(
            $leaveApplication
                ->employee()
                ->where(
                    'reports_to_user_id',
                    $userId
                )
                ->exists(),
            403
        );
    }
}