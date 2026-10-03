<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->foreignId('reports_to_user_id')
                ->nullable()
                ->after('position_id')
                ->constrained('users')
                ->nullOnDelete();

            $table->index('reports_to_user_id');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign([
                'reports_to_user_id',
            ]);

            $table->dropIndex([
                'reports_to_user_id',
            ]);

            $table->dropColumn('reports_to_user_id');
        });
    }
};