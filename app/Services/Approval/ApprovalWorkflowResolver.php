<?php

namespace App\Services\Approvals;

use App\Models\ApprovalWorkflow;
use App\Models\ApprovalWorkflowStep;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Validation\ValidationException;

class ApprovalWorkflowResolver
{
    /**
     * Resolve the single active workflow for an employee's position
     * and the requested application module.
     *
     * Supported modules:
     * leave, undertime, overtime.
     */
    public function resolveWorkflow(
        User $employee,
        string $module,
    ): ApprovalWorkflow {
        $supportedModules = [
            'leave',
            'undertime',
            'overtime',
        ];

        if (! in_array($module, $supportedModules, true)) {
            throw ValidationException::withMessages([
                'approval' => 'The requested approval module is not supported.',
            ]);
        }

        $matching = ApprovalWorkflow::query()
            ->where('is_active', true)
            ->where('module', $module)
            ->whereHas('positions', function ($query) use ($employee) {
                $query->where('position_id', $employee->position_id);
            })
            ->with('steps')
            ->get();

        if ($matching->count() === 1) {
            return $matching->first();
        }

        if ($matching->count() > 1) {
            throw ValidationException::withMessages([
                'approval' => "Multiple active {$module} workflows match your position. Please contact HR.",
            ]);
        }

        /*
         * A workflow without position assignments is a global default.
         * Only one active global workflow per module is permitted.
         */
        $global = ApprovalWorkflow::query()
            ->where('is_active', true)
            ->where('module', $module)
            ->whereDoesntHave('positions')
            ->with('steps')
            ->get();

        if ($global->count() === 1) {
            return $global->first();
        }

        throw ValidationException::withMessages([
            'approval' => "No unique active {$module} workflow is configured for your position. Please contact HR.",
        ]);
    }

    /**
     * Resolve the actual user assigned to a workflow step.
     *
     * $permission must be the module-specific approval permission,
     * for example undertime.approve or overtime.approve.
     */
    public function resolveStepApprover(
        ApprovalWorkflowStep $step,
        User $employee,
        string $permission,
    ): User {
        if ($step->approver_user_id !== null) {
            $approver = User::query()
                ->find($step->approver_user_id);

            if (! $approver) {
                throw ValidationException::withMessages([
                    'approval' => "The configured approver for step '{$step->name}' no longer exists.",
                ]);
            }

            return $this->validateApprover(
                $approver,
                $step,
                $permission,
            );
        }

        $type = strtolower(trim($step->approver_type));

        if ($type === 'manager') {
            $manager = User::query()
                ->whereKey($employee->reports_to_user_id)
                ->first();

            if (! $manager) {
                throw ValidationException::withMessages([
                    'approval' => 'You do not have an assigned manager or head. Please contact HR.',
                ]);
            }

            return $this->validateApprover(
                $manager,
                $step,
                $permission,
                true,
            );
        }

        if (in_array($type, ['hr', 'coo'], true)) {
            $users = User::query()
                ->where('account_status', 'active')
                ->whereHas('roles', function ($query) use ($type) {
                    $query->where('name', $type)
                        ->where('guard_name', 'web');
                })
                ->get()
                ->filter(fn (User $user) => $user->can($permission))
                ->values();

            if ($users->count() !== 1) {
                throw ValidationException::withMessages([
                    'approval' => $users->isEmpty()
                        ? "No active user with the '{$type}' role and '{$permission}' permission is configured."
                        : "Multiple active users have the '{$type}' role. Assign a specific approver to workflow step '{$step->name}'.",
                ]);
            }

            return $this->validateApprover(
                $users->first(),
                $step,
                $permission,
            );
        }

        throw ValidationException::withMessages([
            'approval' => "Unsupported approver type '{$step->approver_type}' on workflow step '{$step->name}'.",
        ]);
    }

    /**
     * Resolve all required approvers before creating a request.
     *
     * Each returned item contains the workflow step and its approver.
     */
    public function resolveRequiredSteps(
        ApprovalWorkflow $workflow,
        User $employee,
        string $permission,
    ): Collection {
        $steps = $workflow->steps()
            ->where('is_required', true)
            ->orderBy('step_order')
            ->get();

        if ($steps->isEmpty()) {
            throw ValidationException::withMessages([
                'approval' => 'The configured approval workflow has no required steps. Please contact HR.',
            ]);
        }

        $resolved = $steps->map(function (
            ApprovalWorkflowStep $step,
        ) use ($employee, $permission) {
            return [
                'step' => $step,
                'approver' => $this->resolveStepApprover(
                    $step,
                    $employee,
                    $permission,
                ),
            ];
        });

        $this->ensureNoDuplicateApprovers($resolved);

        return $resolved;
    }

    /**
     * Ensure approvers are active and authorized for this module.
     */
    private function validateApprover(
        User $approver,
        ApprovalWorkflowStep $step,
        string $permission,
        bool $mustBeReportingManager = false,
    ): User {
        if (
            $approver->account_status !== 'active'
            || ! $approver->can($permission)
            || (
                $mustBeReportingManager
                && ! $approver->canBeReportingManager()
            )
        ) {
            throw ValidationException::withMessages([
                'approval' => "The approver configured for step '{$step->name}' is inactive, ineligible, or lacks the '{$permission}' permission.",
            ]);
        }

        return $approver;
    }

    /**
     * Prevent one person from occupying multiple required steps.
     */
    private function ensureNoDuplicateApprovers(
        Collection $resolvedSteps,
    ): void {
        $ids = $resolvedSteps
            ->map(fn (array $item) => $item['approver']->id)
            ->all();

        if (count($ids) !== count(array_unique($ids))) {
            throw ValidationException::withMessages([
                'approval' => 'The same user is assigned to multiple required steps. Please review the workflow configuration.',
            ]);
        }
    }
}