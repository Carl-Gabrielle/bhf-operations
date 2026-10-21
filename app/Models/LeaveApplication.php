<?php

namespace App\Models;

use App\Enums\LeaveApplicationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        /*
        |--------------------------------------------------------------------------
        | Application Identification
        |--------------------------------------------------------------------------
        */
        'application_no',

        /*
        |--------------------------------------------------------------------------
        | Employee and Leave Information
        |--------------------------------------------------------------------------
        */
        'employee_id',
        'leave_type_id',
        'date_filed',
        'start_date',
        'end_date',
        'total_days',
        'schedule_type',
        'reason',
        'attachment_path',

        /*
        |--------------------------------------------------------------------------
        | Approval Workflow
        |--------------------------------------------------------------------------
        */
        'status',
        'approval_workflow_id',
        'current_step',

        /*
        |--------------------------------------------------------------------------
        | Employee Confirmation
        |--------------------------------------------------------------------------
        */
        'employee_confirmed',
        'employee_confirmed_at',

        /*
        |--------------------------------------------------------------------------
        | Lifecycle Timestamps
        |--------------------------------------------------------------------------
        */
        'submitted_at',
        'approved_at',
        'rejected_at',
        'processed_at',
        'completed_at',
        'cancelled_at',

        /*
        |--------------------------------------------------------------------------
        | HR Processing Audit
        |--------------------------------------------------------------------------
        */
        'processing_started_by_user_id',
        'processing_started_at',
        'processed_by_user_id',
        'processing_remarks',
    ];

    /**
     * Attribute casting.
     */
    protected function casts(): array
    {
        return [
            'date_filed' => 'date',
            'start_date' => 'date',
            'end_date' => 'date',

            'total_days' => 'decimal:2',

            'status' => LeaveApplicationStatus::class,

            'employee_confirmed' => 'boolean',

            'employee_confirmed_at' => 'datetime',

            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'processed_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',

            'processing_started_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Employee
    |--------------------------------------------------------------------------
    */

    public function employee(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'employee_id',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Leave Type
    |--------------------------------------------------------------------------
    */

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(
            LeaveType::class,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Approval Workflow
    |--------------------------------------------------------------------------
    */

    public function approvalWorkflow(): BelongsTo
    {
        return $this->belongsTo(
            ApprovalWorkflow::class,
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Approval Workflow Assignments
    |--------------------------------------------------------------------------
    */

    public function approvals(): HasMany
    {
        return $this->hasMany(
            LeaveApproval::class,
        )->orderBy('step_order');
    }

    /*
    |--------------------------------------------------------------------------
    | HR User Who Started Processing
    |--------------------------------------------------------------------------
    */

    public function processingStartedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'processing_started_by_user_id',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | HR User Who Completed Processing
    |--------------------------------------------------------------------------
    */

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'processed_by_user_id',
        );
    }
}
