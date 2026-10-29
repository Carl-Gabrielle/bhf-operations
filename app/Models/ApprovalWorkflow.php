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

    /**
     * Attribute casting.
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Workflow Steps
    |--------------------------------------------------------------------------
    |
    | Defines the ordered approval stages for this workflow.
    |
    */

    public function steps(): HasMany
    {
        return $this->hasMany(ApprovalWorkflowStep::class)
            ->orderBy('step_order');
    }

    /*
    |--------------------------------------------------------------------------
    | Workflow Position Assignments
    |--------------------------------------------------------------------------
    |
    | Defines which employee positions are associated with this workflow.
    |
    */

    public function positions(): HasMany
    {
        return $this->hasMany(ApprovalWorkflowPosition::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Leave Applications
    |--------------------------------------------------------------------------
    */

    public function leaveApplications(): HasMany
    {
        return $this->hasMany(LeaveApplication::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Undertime Applications
    |--------------------------------------------------------------------------
    */

    public function undertimeApplications(): HasMany
    {
        return $this->hasMany(UndertimeApplication::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Overtime Applications
    |--------------------------------------------------------------------------
    */

    public function overtimeApplications(): HasMany
    {
        return $this->hasMany(OvertimeApplication::class);
    }
}