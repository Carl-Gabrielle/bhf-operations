<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalWorkflowStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'approval_workflow_id',
        'step_order',
        'name',
        'approver_type',
        'approver_user_id',
        'is_required',
    ];

    protected function casts(): array
    {
        return [
            'step_order' => 'integer',
            'is_required' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Parent Workflow
    |--------------------------------------------------------------------------
    */

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(
            ApprovalWorkflow::class,
            'approval_workflow_id',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Configured Fixed Approver
    |--------------------------------------------------------------------------
    */

    public function approver(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'approver_user_id',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Leave Approval Assignments
    |--------------------------------------------------------------------------
    */

    public function approvals(): HasMany
    {
        return $this->hasMany(
            LeaveApproval::class,
            'approval_workflow_step_id',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Undertime Approval Assignments
    |--------------------------------------------------------------------------
    */

    public function undertimeApprovals(): HasMany
    {
        return $this->hasMany(
            UndertimeApproval::class,
            'approval_workflow_step_id',
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Overtime Approval Assignments
    |--------------------------------------------------------------------------
    */

    public function overtimeApprovals(): HasMany
    {
        return $this->hasMany(
            OvertimeApproval::class,
            'approval_workflow_step_id',
        );
    }
}