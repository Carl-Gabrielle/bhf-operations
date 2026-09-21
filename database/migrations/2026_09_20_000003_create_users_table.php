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
        /*
        |--------------------------------------------------------------------------
        | Users
        |--------------------------------------------------------------------------
        */

        Schema::create('users', function (Blueprint $table) {
            $table->id();

            /*
            |--------------------------------------------------------------------------
            | Login
            |--------------------------------------------------------------------------
            |
            | Username is the primary login identifier.
            | Email is optional and is NOT used for login.
            |
            */

            $table->string('username', 30)
                ->unique();

            /*
            |--------------------------------------------------------------------------
            | Employee Information
            |--------------------------------------------------------------------------
            */

            $table->string('employee_number')
                ->nullable()
                ->unique();

            $table->string('name');

            $table->string('first_name')
                ->nullable();

            $table->string('middle_name')
                ->nullable();

            $table->string('last_name')
                ->nullable();

            $table->string('contact_number')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Optional Contact Information
            |--------------------------------------------------------------------------
            */

            $table->string('email')
                ->nullable()
                ->unique();

            $table->timestamp('email_verified_at')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Organization
            |--------------------------------------------------------------------------
            */

            $table->foreignId('organizational_unit_id')
                ->nullable()
                ->constrained('organizational_units')
                ->nullOnDelete();

            $table->foreignId('position_id')
                ->nullable()
                ->constrained('positions')
                ->nullOnDelete();

            /*
            |--------------------------------------------------------------------------
            | Account
            |--------------------------------------------------------------------------
            */

            $table->string('account_status', 20)
                ->default('pending')
                ->index();

            $table->timestamp('last_login_at')
                ->nullable();

            $table->timestamp('password_changed_at')
                ->nullable();

            /*
            |--------------------------------------------------------------------------
            | Authentication
            |--------------------------------------------------------------------------
            */

            $table->string('password');

            $table->rememberToken();

            $table->timestamps();
        });

        /*
        |--------------------------------------------------------------------------
        | Password Reset Tokens
        |--------------------------------------------------------------------------
        |
        | Username is the account identifier instead of email.
        |
        */

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('username')
                ->primary();

            $table->string('token');

            $table->timestamp('created_at')
                ->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');

        Schema::dropIfExists('users');
    }
};