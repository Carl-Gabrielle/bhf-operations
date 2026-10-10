<?php

namespace App\Http\Controllers\Leave;

use App\Enums\LeaveApplicationStatus;
use App\Http\Controllers\Controller;
use App\Models\LeaveApplication;
use App\Models\LeaveApproval;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class LeaveApprovalController extends Controller
{
    /**
     * Authorization is based on the specific permission and active account.
     * Being a reporting manager by itself does not grant approval access.
     */
    private function authorizeApprover(Request $request): User
    {
        $user = $request->user();

        abort_unless(
            $user instanceof User
                && $user->account_status === 'active'
                && $user->can('leave.approve'),
            403,
        );

        return $user;
    }

    /**
     * Show only applications with a pending approval assigned to this user.
     *
     * Important: this inbox is assignment-driven, not just based on the
     * employee's current reports_to_user_id relationship.
     */
    public function index(Request $request): Response
    {
        $user = $this->authorizeApprover($request);

        $applications = LeaveApplication::query()
            ->where(
                'status',
                LeaveApplicationStatus::PendingApproval->value,
            )
            ->whereHas('approvals', function ($query) use ($user) {
                $query
                    ->where('approver_id', $user->id)
                    ->where('action', 'pending');
            })
            ->with([
                'employee:id,name,employee_number,organizational_unit_id,position_id',
                'employee.organizationalUnit',
                'employee.position',
                'leaveType',
                'approvals' => function ($query) use ($user) {
                    $query
                        ->where('approver_id', $user->id)
                        ->where('action', 'pending')
                        ->select([
                            'id',
                            'leave_application_id',
                            'approval_workflow_step_id',
                            'step_order',
                            'approver_id',
                            'action',
                            'remarks',
                            'acted_at',
                        ]);
                },
            ])
            ->orderByDesc('submitted_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Leave/Approvals/Index', [
            'applications' => $applications,
            'approver' => [
                'id' => $user->id,
                'name' => $user->name,
                'employee_number' => $user->employee_number,
            ],
        ]);
    }

    /**
     * Show a request only if the user has a pending assigned approval.
     */
    public function show(
        Request $request,
        LeaveApplication $leaveApplication,
    ): Response {
        $user = $this->authorizeApprover($request);

        $this->authorizePendingAssignment($leaveApplication, $user->id);

        $leaveApplication->load([
            'employee.organizationalUnit',
            'employee.position',
            'employee.reportsTo',
            'leaveType',
            'approvalWorkflow',
            'approvals.approver.position',
            'approvals.workflowStep',
        ]);

        return Inertia::render('Leave/Approvals/Show', [
            'application' => $leaveApplication,
            'approver' => [
                'id' => $user->id,
                'name' => $user->name,
                'employee_number' => $user->employee_number,
            ],
        ]);
    }

    /**
     * Record the authenticated user's approval.
     *
     * The current LeaveApplicationService creates only the first manager
     * approval. Therefore, this version completes the application when that
     * assigned approval is accepted. Do not use this finalization behavior
     * for a multi-stage workflow until later workflow steps are created and
     * activated explicitly by the workflow service.
     */
    public function approve(
        Request $request,
        LeaveApplication $leaveApplication,
    ): RedirectResponse {
        $user = $this->authorizeApprover($request);

        // The existing Show.tsx submits `comments`; accept `remarks` too
        // for compatibility with forms that use the database field name.
        $validated = $request->validate([
            'comments' => ['nullable', 'string', 'max:2000'],
            'remarks' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use (
            $leaveApplication,
            $user,
            $validated,
        ): void {
            $application = LeaveApplication::query()
                ->whereKey($leaveApplication->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $application->status === LeaveApplicationStatus::PendingApproval->value,
                409,
            );

            $approval = LeaveApproval::query()
                ->where('leave_application_id', $application->id)
                ->where('approver_id', $user->id)
                ->where('action', 'pending')
                ->lockForUpdate()
                ->first();

            if (!$approval) {
                abort(403);
            }

            $approval->update([
                'action' => 'approved',
                'remarks' => $validated['remarks'] ?? $validated['comments'] ?? null,
                'acted_at' => now(),
            ]);

            // Current implementation has one approval step only.
            $application->update([
                'status' => LeaveApplicationStatus::Approved->value,
                'approved_at' => now(),
                'current_step' => $approval->step_order,
            ]);
        });

        return redirect()
            ->route('leave.approvals.index')
            ->with(
                'success',
                "Leave application {$leaveApplication->application_no} has been approved.",
            );
    }

    /**
     * Record the authenticated user's rejection.
     */
    public function reject(
        Request $request,
        LeaveApplication $leaveApplication,
    ): RedirectResponse {
        $user = $this->authorizeApprover($request);

        // Existing Show.tsx submits `comments`; support both names.
        $validated = $request->validate([
            'remarks' => ['required_without:comments', 'nullable', 'string', 'max:2000'],
            'comments' => ['required_without:remarks', 'nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use (
            $leaveApplication,
            $user,
            $validated,
        ): void {
            $application = LeaveApplication::query()
                ->whereKey($leaveApplication->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $application->status === LeaveApplicationStatus::PendingApproval->value,
                409,
            );

            $approval = LeaveApproval::query()
                ->where('leave_application_id', $application->id)
                ->where('approver_id', $user->id)
                ->where('action', 'pending')
                ->lockForUpdate()
                ->first();

            if (!$approval) {
                abort(403);
            }

            $approval->update([
                'action' => 'rejected',
                'remarks' => $validated['remarks'] ?? $validated['comments'],
                'acted_at' => now(),
            ]);

            $application->update([
                'status' => LeaveApplicationStatus::Rejected->value,
                'rejected_at' => now(),
                'current_step' => $approval->step_order,
            ]);
        });

        return redirect()
            ->route('leave.approvals.index')
            ->with(
                'success',
                "Leave application {$leaveApplication->application_no} has been rejected.",
            );
    }

    /**
     * Confirm the application has a pending approval assigned to this user.
     */
    private function authorizePendingAssignment(
        LeaveApplication $leaveApplication,
        int $userId,
    ): void {
        abort_unless(
            $leaveApplication->status === LeaveApplicationStatus::PendingApproval->value
                && $leaveApplication->approvals()
                    ->where('approver_id', $userId)
                    ->where('action', 'pending')
                    ->exists(),
            403,
        );
    }
}
