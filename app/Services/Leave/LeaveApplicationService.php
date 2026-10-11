<?php

namespace App\Services\Leave;

use App\Enums\LeaveApplicationStatus;
use App\Models\ApprovalWorkflow;
use App\Models\ApprovalWorkflowStep;
use App\Models\LeaveApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class LeaveApplicationService
{
    /**
     * Submit a leave application and create sequential approval assignments
     * from the active workflow mapped to the employee's position.
     *
     * Required steps are assigned in step_order sequence. The first is
     * pending; later steps are waiting until the previous step is approved.
     */
    public function submit(User $employee, array $data): LeaveApplication
    {
        Log::info('Leave application submission started.', [
            'employee_id' => $employee->getKey(),
            'leave_type_id' => $data['leave_type_id'] ?? null,
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null,
        ]);

        return DB::transaction(function () use ($employee, $data) {
            $employee = User::query()
                ->whereKey($employee->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($employee->account_status !== 'active') {
                throw ValidationException::withMessages([
                    'employee' => 'Your account is not active.',
                ]);
            }

            $startDate = Carbon::parse($data['start_date'])->startOfDay();
            $endDate = Carbon::parse($data['end_date'])->startOfDay();

            if ($endDate->lt($startDate)) {
                throw ValidationException::withMessages([
                    'end_date' => 'The end date must be on or after the start date.',
                ]);
            }

            Log::debug('Leave submission: resolving approval workflow.', [
                'employee_id' => $employee->id,
                'position_id' => $employee->position_id,
            ]);

            $workflow = $this->resolveWorkflow($employee);

            Log::info('Leave submission: workflow resolved.', [
                'employee_id' => $employee->id,
                'workflow_id' => $workflow->id,
            ]);

            // Optional steps are skipped in this implementation. If your
            // policy requires optional-step decisions, model that explicitly.
            $steps = $workflow->steps()
                ->where('is_required', true)
                ->orderBy('step_order')
                ->get();

            Log::debug('Leave submission: required workflow steps loaded.', [
                'workflow_id' => $workflow->id,
                'step_count' => $steps->count(),
                'step_ids' => $steps->pluck('id')->all(),
            ]);

            if ($steps->isEmpty()) {
                throw ValidationException::withMessages([
                    'approval' => 'The configured leave approval workflow has no required steps. Please contact HR.',
                ]);
            }

            // Resolve every required approver before writing the application,
            // so a broken later step cannot strand an already-submitted request.
            $resolvedSteps = $steps->map(function (ApprovalWorkflowStep $step) use ($employee) {
                return [
                    'step' => $step,
                    'approver' => $this->resolveStepApprover($step, $employee),
                ];
            });

            $this->ensureNoDuplicateApprover($resolvedSteps);

            Log::info('Leave submission: approvers resolved.', [
                'employee_id' => $employee->id,
                'workflow_id' => $workflow->id,
                'approver_ids' => $resolvedSteps->map(fn (array $item) => $item['approver']->id)->all(),
            ]);

            $first = $resolvedSteps->first();

            $application = LeaveApplication::create([
                'application_no' => $this->generateApplicationNumber(),
                'employee_id' => $employee->id,
                'leave_type_id' => $data['leave_type_id'],
                'date_filed' => now()->toDateString(),
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'total_days' => $startDate->diffInDays($endDate) + 1,
                'schedule_type' => $data['schedule_type'] ?? 'full_day',
                'reason' => $data['reason'],
                'attachment_path' => $data['attachment_path'] ?? null,
                'status' => LeaveApplicationStatus::PendingApproval,
                'approval_workflow_id' => $workflow->id,
                'current_step' => $first['step']->step_order,
                'employee_confirmed' => true,
                'employee_confirmed_at' => now(),
                'submitted_at' => now(),
            ]);

            Log::info('Leave submission: application record created.', [
                'application_id' => $application->id,
                'application_no' => $application->application_no,
            ]);

            foreach ($resolvedSteps as $index => $resolved) {
                /** @var ApprovalWorkflowStep $step */
                $step = $resolved['step'];
                /** @var User $approver */
                $approver = $resolved['approver'];

                $application->approvals()->create([
                    'approval_workflow_step_id' => $step->id,
                    'step_order' => $step->step_order,
                    'approver_id' => $approver->id,
                    'action' => $index === 0 ? 'pending' : 'waiting',
                ]);
            }

            Log::info('Leave submission: approval assignments created.', [
                'application_id' => $application->id,
                'approval_count' => $application->approvals()->count(),
            ]);

            return $application->load([
                'employee.organizationalUnit',
                'employee.position',
                'leaveType',
                'approvalWorkflow.steps.approver',
                'approvals.approver',
                'approvals.workflowStep',
            ]);
        });
    }

    private function resolveWorkflow(User $employee): ApprovalWorkflow
    {
        $matching = collect();

        if ($employee->position_id !== null) {
            $matching = ApprovalWorkflow::query()
                ->where('is_active', true)
                ->whereHas('positions', fn ($query) => $query
                    ->where('position_id', $employee->position_id))
                ->with('steps')
                ->get();
        }

        if ($matching->count() === 1) {
            return $matching->first();
        }

        if ($matching->count() > 1) {
            throw ValidationException::withMessages([
                'approval' => 'More than one active workflow matches your position. Please contact HR.',
            ]);
        }

        // A single active workflow without position mappings can act as the
        // global default. Multiple global workflows are ambiguous and rejected.
        $global = ApprovalWorkflow::query()
            ->where('is_active', true)
            ->whereDoesntHave('positions')
            ->with('steps')
            ->get();

        if ($global->count() === 1) {
            return $global->first();
        }

        throw ValidationException::withMessages([
            'approval' => 'No unique active approval workflow is configured for your position. Please contact HR.',
        ]);
    }

    private function resolveStepApprover(
        ApprovalWorkflowStep $step,
        User $employee,
    ): User {
        // A fixed approver takes precedence over approver_type.
        if ($step->approver_user_id !== null) {
            $approver = User::query()->find($step->approver_user_id);

            if (!$approver) {
                throw ValidationException::withMessages([
                    'approval' => "The configured approver for step '{$step->name}' no longer exists.",
                ]);
            }

            return $this->validateApprover($approver, $step);
        }

        $type = strtolower(trim($step->approver_type));

        if ($type === 'manager') {
            $manager = $employee->reportsTo;

            if (!$manager) {
                throw ValidationException::withMessages([
                    'approval' => 'You do not have an assigned manager or head. Please contact HR.',
                ]);
            }

            return $this->validateApprover($manager, $step, true);
        }

        if (in_array($type, ['hr', 'coo'], true)) {
            $users = User::query()
                ->where('account_status', 'active')
                ->whereHas('roles', fn ($query) => $query
                    ->where('name', $type)
                    ->where('guard_name', 'web'))
                ->get()
                ->filter(fn (User $user) => $user->can('leave.approve'))
                ->values();

            if ($users->count() !== 1) {
                throw ValidationException::withMessages([
                    'approval' => $users->isEmpty()
                        ? "No active user with the '{$type}' role and leave approval permission is configured."
                        : "Multiple active users have the '{$type}' role. Assign a specific approver to workflow step '{$step->name}'.",
                ]);
            }

            return $this->validateApprover($users->first(), $step);
        }

        throw ValidationException::withMessages([
            'approval' => "Unsupported approver type '{$step->approver_type}' on workflow step '{$step->name}'. Assign a specific user or configure a supported approver type.",
        ]);
    }

    private function validateApprover(
        User $approver,
        ApprovalWorkflowStep $step,
        bool $mustBeReportingManager = false,
    ): User {
        if (
            $approver->account_status !== 'active'
            || !$approver->can('leave.approve')
            || ($mustBeReportingManager && !$approver->canBeReportingManager())
        ) {
            throw ValidationException::withMessages([
                'approval' => "The approver configured for step '{$step->name}' is inactive, ineligible, or lacks the leave approval permission.",
            ]);
        }

        return $approver;
    }

    private function ensureNoDuplicateApprover(Collection $resolvedSteps): void
    {
        $ids = $resolvedSteps
            ->map(fn (array $item) => $item['approver']->id)
            ->all();

        if (count($ids) !== count(array_unique($ids))) {
            throw ValidationException::withMessages([
                'approval' => 'The same user is assigned to multiple required steps. Please review the workflow configuration.',
            ]);
        }
    }

    /**
     * The application_no column should have a unique database index.
     * For high-concurrency environments, use a sequence table or retry
     * on unique-key conflicts rather than relying solely on the latest ID.
     */
    private function generateApplicationNumber(): string
    {
        $year = now()->year;

        $lastApplication = LeaveApplication::query()
            ->where('application_no', 'like', "LV-{$year}-%")
            ->orderByDesc('id')
            ->first();

        $nextNumber = $lastApplication
            ? ((int) substr($lastApplication->application_no, -5)) + 1
            : 1;

        return sprintf('LV-%d-%05d', $year, $nextNumber);
    }
}
