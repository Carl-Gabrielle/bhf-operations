<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ApprovalWorkflow extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function steps(): HasMany
    {
        return $this->hasMany(
            ApprovalWorkflowStep::class
        )->orderBy('step_order');
    }

    public function positions(): HasMany
    {
        return $this->hasMany(
            ApprovalWorkflowPosition::class
        );
    }

    public function leaveApplications(): HasMany
    {
        return $this->hasMany(
            LeaveApplication::class
        );
    }
}