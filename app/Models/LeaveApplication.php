<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_no',
        'employee_id',
        'leave_type_id',
        'date_filed',
        'start_date',
        'end_date',
        'total_days',
        'schedule_type',
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
    ];

    protected function casts(): array
    {
        return [
            'date_filed' => 'date',
            'start_date' => 'date',
            'end_date' => 'date',

            'total_days' => 'decimal:2',

            'employee_confirmed' => 'boolean',

            'employee_confirmed_at' => 'datetime',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
            'rejected_at' => 'datetime',
            'processed_at' => 'datetime',
            'completed_at' => 'datetime',
            'cancelled_at' => 'datetime',
        ];
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employee_id');
    }

    public function leaveType(): BelongsTo
    {
        return $this->belongsTo(LeaveType::class);
    }

    public function approvalWorkflow(): BelongsTo
    {
        return $this->belongsTo(ApprovalWorkflow::class);
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(LeaveApproval::class)
            ->orderBy('step_order');
    }
}