<?php

namespace App\Services\Undertime;

use App\Models\ApprovalWorkflow;
use App\Models\ApprovalWorkflowStep;
use App\Models\UndertimeApplication;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UndertimeApplicationService
{
    public function submit(User $employee, array $data): UndertimeApplication
    {
        return DB::transaction(function () use ($employee, $data) {
            $employee = User::query()->whereKey($employee->getKey())
                ->lockForUpdate()->firstOrFail();

            if ($employee->account_status !== 'active') {
                throw ValidationException::withMessages(['employee' => 'Your account is not active.']);
            }

            $workflow = $this->resolveWorkflow($employee);
            $steps = $workflow->steps()->where('is_required', true)
                ->orderBy('step_order')->get();

            if ($steps->isEmpty()) {
                throw ValidationException::withMessages(['approval' => 'The undertime workflow has no required approval steps. Contact HR.']);
            }

            $assignments = $steps->map(fn (ApprovalWorkflowStep $step) => [
                'step' => $step,
                'approver' => $this->resolveApprover($step, $employee),
            ]);

            $ids = $assignments->pluck('approver.id')->all();
            if (count($ids) !== count(array_unique($ids))) {
                throw ValidationException::withMessages(['approval' => 'The same approver is assigned to multiple required steps. Contact HR.']);
            }

            $application = UndertimeApplication::create([
                'application_no' => $this->generateNumber(),
                'employee_id' => $employee->id,
                'date_filed' => now()->toDateString(),
                'undertime_date' => $data['undertime_date'],
                'scheduled_start_time' => $data['scheduled_start_time'] ?? null,
                'scheduled_end_time' => $data['scheduled_end_time'],
                'requested_departure_time' => $data['requested_departure_time'],
                'requested_minutes' => $data['requested_minutes'],
                'reason' => trim($data['reason']),
                'attachment_path' => $data['attachment_path'] ?? null,
                'status' => 'pending_approval',
                'approval_workflow_id' => $workflow->id,
                'current_step' => $assignments->first()['step']->step_order,
                'employee_confirmed' => true,
                'employee_confirmed_at' => now(),
                'submitted_at' => now(),
            ]);

            foreach ($assignments as $index => $assignment) {
                $application->approvals()->create([
                    'approval_workflow_step_id' => $assignment['step']->id,
                    'step_order' => $assignment['step']->step_order,
                    'approver_id' => $assignment['approver']->id,
                    'action' => $index === 0 ? 'pending' : 'waiting',
                ]);
            }

            return $application;
        });
    }

    private function resolveWorkflow(User $employee): ApprovalWorkflow
    {
        $query = ApprovalWorkflow::query()
            ->where('is_active', true)
            ->whereIn('code', ['UNDERTIME_RANK_FILE', 'UNDERTIME_CASHIERS_MANAGERS']);

        $matching = $employee->position_id === null
            ? collect()
            : (clone $query)->whereHas('positions', fn ($q) => $q->where('position_id', $employee->position_id))->get();

        if ($matching->count() > 1) {
            throw ValidationException::withMessages(['approval' => 'Multiple undertime workflows match your position. Contact HR.']);
        }
        if ($matching->count() === 1) {
            return $matching->first();
        }

        $default = (clone $query)->where('code', 'UNDERTIME_RANK_FILE')
            ->whereDoesntHave('positions')->first();

        if (!$default) {
            throw ValidationException::withMessages(['approval' => 'No default undertime workflow is configured. Contact HR.']);
        }

        return $default;
    }

    private function resolveApprover(ApprovalWorkflowStep $step, User $employee): User
    {
        if ($step->approver_user_id !== null) {
            $approver = User::find($step->approver_user_id);
        } else {
            $type = strtolower(trim($step->approver_type));
            if ($type === 'manager') {
                $approver = $employee->reportsTo;
            } elseif (in_array($type, ['coo', 'hr'], true)) {
                $candidates = User::query()->where('account_status', 'active')
                    ->role($type)->get()
                    ->filter(fn (User $user) => $user->can('undertime.approve'));
                if ($candidates->count() !== 1) {
                    throw ValidationException::withMessages(['approval' => "Exactly one active {$type} with undertime approval permission is required; otherwise configure a fixed approver."]);
                }
                $approver = $candidates->first();
            } else {
                throw ValidationException::withMessages(['approval' => "Unsupported approver type: {$step->approver_type}."]);
            }
        }

        if (!$approver || $approver->account_status !== 'active' || !$approver->can('undertime.approve')) {
            throw ValidationException::withMessages(['approval' => "An active, authorized approver is missing for '{$step->name}'."]);
        }
        if ($approver->id === $employee->id) {
            throw ValidationException::withMessages(['approval' => 'You cannot approve your own undertime request.']);
        }
        if ($step->approver_user_id === null && strtolower(trim($step->approver_type)) === 'manager'
            && !$approver->canBeReportingManager()) {
            throw ValidationException::withMessages(['approval' => 'Your reporting manager is not eligible to approve requests.']);
        }
        return $approver;
    }

    private function generateNumber(): string
    {
        return 'UT-' . now()->format('Ymd') . '-' . Str::upper(Str::random(12));
    }
}
