<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_workflow_positions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('approval_workflow_id')
                ->constrained('approval_workflows')
                ->cascadeOnDelete();

            $table->foreignId('position_id')
                ->constrained('positions')
                ->cascadeOnDelete();

            $table->timestamps();

            /*
            |--------------------------------------------------------------------------
            | Prevent duplicate workflow/position assignments
            |--------------------------------------------------------------------------
            */

            $table->unique(
                ['approval_workflow_id', 'position_id'],
                'awp_workflow_position_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_workflow_positions');
    }
};