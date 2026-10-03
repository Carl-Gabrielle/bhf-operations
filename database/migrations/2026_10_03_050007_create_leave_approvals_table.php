<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_approvals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('leave_application_id')
                ->constrained('leave_applications')
                ->cascadeOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Workflow Step
            |--------------------------------------------------------------------------
            */

            $table->foreignId('approval_workflow_step_id')
                ->nullable()
                ->constrained('approval_workflow_steps')
                ->nullOnDelete();

            $table->unsignedInteger('step_order');

            /*
            |--------------------------------------------------------------------------
            | Approver
            |--------------------------------------------------------------------------
            */

            $table->foreignId('approver_id')
                ->constrained('users')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Action
            |--------------------------------------------------------------------------
            */

            $table->string('action', 30)
                ->default('pending');

            /*
            | pending
            | approved
            | rejected
            | returned
            */

            $table->text('remarks')->nullable();

            $table->timestamp('acted_at')->nullable();

            $table->timestamps();

            $table->index([
                'leave_application_id',
                'step_order',
            ]);

            $table->index([
                'approver_id',
                'action',
            ]);

            $table->index('action');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_approvals');
    }
};