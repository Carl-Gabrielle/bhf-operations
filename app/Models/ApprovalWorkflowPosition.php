<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApprovalWorkflowPosition extends Model
{
    use HasFactory;

    protected $fillable = [
        'approval_workflow_id',
        'position_id',
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(
            ApprovalWorkflow::class,
            'approval_workflow_id'
        );
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }
}