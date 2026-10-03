<?php

namespace App\Services\Leave;

use App\Enums\LeaveApplicationStatus;
use App\Models\LeaveApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LeaveApplicationService
{
    /**
     * Submit a new leave application.
     */
    public function submit(
        User $employee,
        array $data
    ): LeaveApplication {
        return DB::transaction(function () use ($employee, $data) {

            /*
            |--------------------------------------------------------------------------
            | 1. Validate employee
            |--------------------------------------------------------------------------
            */

            if ($employee->account_status !== 'active') {
                throw ValidationException::withMessages([
                    'employee' => 'Your account is not active.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | 2. Resolve manager/head
            |--------------------------------------------------------------------------
            */

            $manager = $employee->reportsTo;

            if (!$manager) {
                throw ValidationException::withMessages([
                    'approval' => 'You do not have an assigned manager or head. Please contact HR.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | 3. Validate dates
            |--------------------------------------------------------------------------
            */

            $startDate = Carbon::parse($data['start_date']);
            $endDate = Carbon::parse($data['end_date']);

            if ($endDate->lt($startDate)) {
                throw ValidationException::withMessages([
                    'end_date' => 'The end date must be on or after the start date.',
                ]);
            }

            /*
            |--------------------------------------------------------------------------
            | 4. Calculate total leave days
            |--------------------------------------------------------------------------
            */

            $totalDays = $startDate->diffInDays($endDate) + 1;

            /*
            |--------------------------------------------------------------------------
            | 5. Generate application number
            |--------------------------------------------------------------------------
            */

            $applicationNo = $this->generateApplicationNumber();

            /*
            |--------------------------------------------------------------------------
            | 6. Create leave application
            |--------------------------------------------------------------------------
            */

            $application = LeaveApplication::create([
                'application_no' => $applicationNo,

                'employee_id' => $employee->id,

                'leave_type_id' => $data['leave_type_id'],

                'date_filed' => now()->toDateString(),

                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),

                'total_days' => $totalDays,

                'schedule_type' => $data['schedule_type'] ?? 'full_day',

                'reason' => $data['reason'],

                'attachment_path' => $data['attachment_path'] ?? null,

                /*
                |--------------------------------------------------------------------------
                | Workflow state
                |--------------------------------------------------------------------------
                */

                'status' => LeaveApplicationStatus::PendingApproval->value,

                'current_step' => 1,

                /*
                |--------------------------------------------------------------------------
                | Employee confirmation
                |--------------------------------------------------------------------------
                */

                'employee_confirmed' => true,
                'employee_confirmed_at' => now(),

                /*
                |--------------------------------------------------------------------------
                | Submission
                |--------------------------------------------------------------------------
                */

                'submitted_at' => now(),
            ]);

            /*
            |--------------------------------------------------------------------------
            | 7. Create first approval
            |--------------------------------------------------------------------------
            */

            $application->approvals()->create([
                'approval_workflow_step_id' => null,

                'step_order' => 1,

                'approver_id' => $manager->id,

                'action' => 'pending',
            ]);

            /*
            |--------------------------------------------------------------------------
            | 8. Return complete application
            |--------------------------------------------------------------------------
            */

            return $application->load([
                'employee',
                'employee.organizationalUnit',
                'employee.position',
                'leaveType',
                'approvals.approver',
            ]);
        });
    }

    /**
     * Generate a unique leave application number.
     */
    private function generateApplicationNumber(): string
    {
        $year = now()->year;

        $lastApplication = LeaveApplication::query()
            ->whereYear('created_at', $year)
            ->latest('id')
            ->first();

        $nextNumber = $lastApplication
            ? ((int) substr($lastApplication->application_no, -5)) + 1
            : 1;

        return sprintf(
            'LV-%d-%05d',
            $year,
            $nextNumber
        );
    }
}