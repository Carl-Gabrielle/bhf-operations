<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('undertime_applications', function (Blueprint $table) {
            $table->id();

            // Application identification
            $table->string('application_no')->unique();

            // Employee
            $table->foreignId('employee_id')
                ->constrained('users')
                ->restrictOnDelete();

            // Application details
            $table->date('date_filed');
            $table->date('undertime_date');

            $table->time('scheduled_start_time')->nullable();
            $table->time('scheduled_end_time')->nullable();

            $table->time('requested_departure_time');

            // Duration stored in minutes
            $table->unsignedInteger('requested_minutes');

            // Reason and supporting documents
            $table->text('reason');
            $table->string('attachment_path')->nullable();

            // Approval workflow
            $table->string('status', 40)
                ->default('draft')
                ->index();

            $table->foreignId('approval_workflow_id')
                ->nullable()
                ->constrained('approval_workflows')
                ->restrictOnDelete();

            $table->unsignedInteger('current_step')->default(1);

            // Employee confirmation
            $table->boolean('employee_confirmed')->default(false);
            $table->timestamp('employee_confirmed_at')->nullable();

            // Lifecycle timestamps
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            // HR processing audit
            $table->foreignId('processing_started_by_user_id')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();

            $table->timestamp('processing_started_at')->nullable();

            $table->foreignId('processed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->restrictOnDelete();

            $table->text('processing_remarks')->nullable();

            $table->timestamps();

            $table->index([
                'employee_id',
                'status',
                'created_at',
            ], 'undertime_employee_status_created_idx');

            $table->index([
                'undertime_date',
                'status',
            ], 'undertime_date_status_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('undertime_applications');
    }
};