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
     * The inbox is based on an explicit pending assignment, not merely
     * on the employee's current reporting-manager relationship.
     */
    public function index(Request $request): Response
    {
        $user = $this->authorizeApprover($request);

        $applications = LeaveApplication::query()
            ->where('status', LeaveApplicationStatus::PendingApproval->value)
            ->whereHas('approvals', fn ($query) => $query
                ->where('approver_id', $user->id)
                ->where('action', 'pending'))
            ->with([
                'employee:id,name,employee_number,organizational_unit_id,position_id',
                'employee.organizationalUnit',
                'employee.position',
                'leaveType',
                'approvalWorkflow',
                'approvals' => fn ($query) => $query
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
                    ]),
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
            'approvalWorkflow.steps.approver',
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

    public function approve(
        Request $request,
        LeaveApplication $leaveApplication,
    ): RedirectResponse {
        $user = $this->authorizeApprover($request);

        $validated = $request->validate([
            'remarks' => ['nullable', 'string', 'max:2000'],
            'comments' => ['nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($leaveApplication, $user, $validated): void {
            $application = LeaveApplication::query()
                ->whereKey($leaveApplication->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $application->status === LeaveApplicationStatus::PendingApproval,
                409,
            );

            $approval = LeaveApproval::query()
                ->where('leave_application_id', $application->id)
                ->where('approver_id', $user->id)
                ->where('action', 'pending')
                ->lockForUpdate()
                ->first();

            abort_unless($approval, 403);

            $approval->update([
                'action' => 'approved',
                'remarks' => $validated['remarks'] ?? $validated['comments'] ?? null,
                'acted_at' => now(),
            ]);

            // There should be only one active pending step. Activate the
            // earliest waiting step; do not finalize before it is approved.
            $nextApproval = LeaveApproval::query()
                ->where('leave_application_id', $application->id)
                ->where('action', 'waiting')
                ->orderBy('step_order')
                ->lockForUpdate()
                ->first();

            if ($nextApproval) {
                $nextApproval->update(['action' => 'pending']);

                $application->update([
                    'current_step' => $nextApproval->step_order,
                ]);
            } else {
                $unfinishedSteps = LeaveApproval::query()
                    ->where('leave_application_id', $application->id)
                    ->whereIn('action', ['pending', 'waiting'])
                    ->exists();

                abort_if($unfinishedSteps, 409);

                $application->update([
                    'status' => LeaveApplicationStatus::Approved,
                    'approved_at' => now(),
                    'current_step' => $approval->step_order,
                ]);
            }
        });

        return redirect()
            ->route('leave.approvals.index')
            ->with(
                'success',
                "Leave application {$leaveApplication->application_no} has been approved.",
            );
    }

    public function reject(
        Request $request,
        LeaveApplication $leaveApplication,
    ): RedirectResponse {
        $user = $this->authorizeApprover($request);

        $validated = $request->validate([
            'remarks' => ['required_without:comments', 'nullable', 'string', 'max:2000'],
            'comments' => ['required_without:remarks', 'nullable', 'string', 'max:2000'],
        ]);

        DB::transaction(function () use ($leaveApplication, $user, $validated): void {
            $application = LeaveApplication::query()
                ->whereKey($leaveApplication->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            abort_unless(
                $application->status === LeaveApplicationStatus::PendingApproval,
                409,
            );

            $approval = LeaveApproval::query()
                ->where('leave_application_id', $application->id)
                ->where('approver_id', $user->id)
                ->where('action', 'pending')
                ->lockForUpdate()
                ->first();

            abort_unless($approval, 403);

            $approval->update([
                'action' => 'rejected',
                'remarks' => $validated['remarks'] ?? $validated['comments'] ?? null,
                'acted_at' => now(),
            ]);

            // A rejected request must never leave actionable future steps.
            LeaveApproval::query()
                ->where('leave_application_id', $application->id)
                ->where('action', 'waiting')
                ->update([
                    'action' => 'cancelled',
                    'acted_at' => now(),
                ]);

            $application->update([
                'status' => LeaveApplicationStatus::Rejected,
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

    private function authorizePendingAssignment(
        LeaveApplication $leaveApplication,
        int $userId,
    ): void {
        abort_unless(
            $leaveApplication->status === LeaveApplicationStatus::PendingApproval
                && $leaveApplication->approvals()
                    ->where('approver_id', $userId)
                    ->where('action', 'pending')
                    ->exists(),
            403,
        );
    }
}
