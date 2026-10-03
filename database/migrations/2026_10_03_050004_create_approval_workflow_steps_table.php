<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_workflow_steps', function (Blueprint $table) {
            $table->id();

            $table->foreignId('approval_workflow_id')
                ->constrained('approval_workflows')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Step
            |--------------------------------------------------------------------------
            */

            $table->unsignedInteger('step_order');

            $table->string('name');

            /*
            |--------------------------------------------------------------------------
            | Approval Role
            |--------------------------------------------------------------------------
            |
            | Examples:
            | manager
            | coo
            | hr
            |
            */

            $table->string('approver_type', 50);

            /*
            |--------------------------------------------------------------------------
            | Optional Fixed Approver
            |--------------------------------------------------------------------------
            |
            | Usually NULL because the system can resolve the
            | approver dynamically from the employee hierarchy.
            |
            */

            $table->foreignId('approver_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Configuration
            |--------------------------------------------------------------------------
            */

            $table->boolean('is_required')->default(true);

            $table->timestamps();

           $table->unique(
                ['approval_workflow_id', 'step_order'],
                'aws_workflow_step_unique'
            );

            $table->index([
                'approval_workflow_id',
                'approver_type',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_workflow_steps');
    }
};