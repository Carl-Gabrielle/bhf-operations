<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();

            /*
             * The authenticated admin/user who performed the action.
             */
            $table->foreignId('actor_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * The user account affected by the action.
             */
            $table->foreignId('target_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            /*
             * Examples:
             * user_created
             * user_updated
             * password_reset
             * password_changed
             */
            $table->string('action', 100);

            /*
             * Human-readable description.
             */
            $table->string('description');

            /*
             * Old/new values for changed fields.
             *
             * NEVER store passwords here.
             */
            $table->json('changes')->nullable();

            /*
             * Optional IP address and user-agent
             * for additional audit information.
             */
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();

            $table->timestamps();

            $table->index(['target_user_id', 'created_at']);
            $table->index(['actor_id', 'created_at']);
            $table->index('action');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};