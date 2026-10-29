<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UndertimeApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'undertime_application_id',
        'approval_workflow_step_id',
        'step_order',
        'approver_id',
        'action',
        'remarks',
        'acted_at',
    ];

    protected function casts(): array
    {
        return [
            'step_order' => 'integer',
            'acted_at' => 'datetime',
        ];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(
            UndertimeApplication::class,
            'undertime_application_id',
        );
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'approver_id',
        );
    }

    public function workflowStep(): BelongsTo
    {
        return $this->belongsTo(
            ApprovalWorkflowStep::class,
            'approval_workflow_step_id',
        );
    }
}