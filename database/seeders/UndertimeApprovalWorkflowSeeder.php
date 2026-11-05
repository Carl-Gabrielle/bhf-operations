<?php

namespace Database\Seeders;

use App\Models\ApprovalWorkflow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UndertimeApprovalWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // Workflow 1: Rank-and-File
            $rankAndFile = ApprovalWorkflow::updateOrCreate(
                ['code' => 'UNDERTIME_RANK_FILE'],
                [
                    'name' => 'Undertime Application - Rank-and-File',
                    'description' => 'The employee reporting manager reviews the undertime request. HR processes it after approval.',
                    'is_active' => true,
                ]
            );

            $rankAndFile->positions()->delete();

            $rankAndFile->steps()->updateOrCreate(
                ['step_order' => 1],
                [
                    'name' => 'Manager Review',
                    'approver_type' => 'manager',
                    'approver_user_id' => null,
                    'is_required' => true,
                ]
            );

            // Workflow 2: Cashiers and Managers
            $cashiersAndManagers = ApprovalWorkflow::updateOrCreate(
                ['code' => 'UNDERTIME_CASHIERS_MANAGERS'],
                [
                    'name' => 'Undertime Application - Cashiers and Managers',
                    'description' => 'The COO reviews the undertime request. HR processes it after approval.',
                    'is_active' => true,
                ]
            );

            $cashiersAndManagers->steps()->updateOrCreate(
                ['step_order' => 1],
                [
                    'name' => 'COO Review',
                    'approver_type' => 'coo',
                    'approver_user_id' => null,
                    'is_required' => true,
                ]
            );

            // Position mappings: 1 = Manager, 2 = Cashier/Teller
            $cashiersAndManagers->positions()->delete();

            $cashiersAndManagers->positions()->createMany([
                ['position_id' => 1],
                ['position_id' => 2],
            ]);
        });
    }
}
