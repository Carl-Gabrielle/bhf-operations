<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OvertimeApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_no',
        'employee_id',
        'date_filed',
        'overtime_date',
        'requested_start_time',
        'requested_end_time',
        'requested_minutes',
        'approved_minutes',
        'actual_minutes',
        'actual_started_at',
        'actual_ended_at',
        'work_assignment',
        'reason',
        'attachment_path',
        'status',
        'approval_workflow_id',
        'current_step',
        'employee_confirmed',
        'employee_confirmed_at',
        'submitted_at',
        'approved_at',
        'rejected_at',
        'processed_at',
        'completed_at',
        'cancelled_at',
        'processing_started_by_user_id',
        'processing_started_at',
        'processed_by_user_id',
        'processing_remarks',
        'verified_by_user_id',
        'verified_at',
        'verification_remarks',
    ];

    protected function casts(): array
    {
        return [
            'date_filed' => 'date',
            'overtime_date' => 'date',

            'requested_minutes' => 'integer',
            'approved_minutes' => 'integer',
            'actual_minutes' => 'integer',
            'current_step' => 'integer',

            'actual_started_at' => 'datetime',
            'actual_ended_at' => 'datetime',

            'employee_confirmed' => 'boolean',
            'employee_confirmed_at' => 'datetime',

            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'processed_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',

            'processing_started_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function approvalWorkflow(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class);
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(OvertimeApproval::class)
            ->orderBy('step_order');
    }

    public function processingStartedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'processing_started_by_user_id',
        );
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'processed_by_user_id',
        );
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'verified_by_user_id',
        );
    }
}