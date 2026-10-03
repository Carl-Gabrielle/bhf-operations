<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leave_applications', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Application Identification
            |--------------------------------------------------------------------------
            */

            $table->string('application_no', 30)->unique();

            /*
            |--------------------------------------------------------------------------
            | Employee
            |--------------------------------------------------------------------------
            */

            $table->foreignId('employee_id')
                ->constrained('users')
                ->restrictOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Leave Information
            |--------------------------------------------------------------------------
            */

            $table->foreignId('leave_type_id')
                ->constrained('leave_types')
                ->restrictOnDelete();

            $table->date('date_filed');

            $table->date('start_date');
            $table->date('end_date');

            /*
            | Number of leave days.
            | We store the calculated value so historical records
            | remain stable even if calendar rules change later.
            */
            $table->decimal('total_days', 5, 2);

            /*
            |--------------------------------------------------------------------------
            | Schedule
            |--------------------------------------------------------------------------
            */

            $table->string('schedule_type', 20)
                ->default('full_day');

            /*
            |--------------------------------------------------------------------------
            | Employee Input
            |--------------------------------------------------------------------------
            */

            $table->text('reason');

            $table->string('attachment_path')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Workflow
            |--------------------------------------------------------------------------
            */

            $table->string('status', 30)
                ->default('submitted');

            $table->foreignId('approval_workflow_id')
                ->nullable()
                ->constrained('approval_workflows')
                ->nullOnDelete();

            $table->unsignedInteger('current_step')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Employee Confirmation
            |--------------------------------------------------------------------------
            */

            $table->boolean('employee_confirmed')->default(false);
            $table->timestamp('employee_confirmed_at')->nullable();

            /*
            |--------------------------------------------------------------------------
            | Lifecycle Timestamps
            |--------------------------------------------------------------------------
            */

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Indexes
            |--------------------------------------------------------------------------
            */

            $table->index(['employee_id', 'status']);
            $table->index(['status', 'current_step']);
            $table->index(['start_date', 'end_date']);
            $table->index('date_filed');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leave_applications');
    }
};