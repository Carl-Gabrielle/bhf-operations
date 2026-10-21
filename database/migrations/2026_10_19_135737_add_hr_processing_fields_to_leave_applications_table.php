
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('leave_applications', function (Blueprint $table) {
            $table->foreignId('processing_started_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('processed_by_user_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->timestamp('processing_started_at')->nullable();

            $table->text('processing_remarks')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('leave_applications', function (Blueprint $table) {
            $table->dropForeign([
                'processing_started_by_user_id',
            ]);

            $table->dropForeign([
                'processed_by_user_id',
            ]);

            $table->dropColumn([
                'processing_started_by_user_id',
                'processed_by_user_id',
                'processing_started_at',
                'processing_remarks',
            ]);
        });
    }
};
