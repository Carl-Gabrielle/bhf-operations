<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('undertime_approvals', function (Blueprint $table) {
            $table->id();

            $table->foreignId('undertime_application_id')
                ->constrained('undertime_applications')
                ->cascadeOnDelete();

            $table->foreignId('approval_workflow_step_id')
                ->nullable()
                ->constrained('approval_workflow_steps')
                ->nullOnDelete();

            $table->unsignedInteger('step_order');

            $table->foreignId('approver_id')
                ->constrained('users')
                ->restrictOnDelete();

            $table->string('action', 30)->default('pending');

            $table->text('remarks')->nullable();

            $table->timestamp('acted_at')->nullable();

            $table->timestamps();

            $table->index(
                ['undertime_application_id', 'step_order'],
                'undertime_approvals_application_step_idx'
            );

            $table->index(
                ['approver_id', 'action'],
                'undertime_approvals_approver_action_idx'
            );

            $table->index('action', 'undertime_approvals_action_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('undertime_approvals');
    }
};