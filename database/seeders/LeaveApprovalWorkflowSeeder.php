<?php

namespace Database\Seeders;

use App\Models\ApprovalWorkflow;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LeaveApprovalWorkflowSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            /*
             * Workflow 1: Rank-and-File
             *
             * This is the default workflow. Do not assign positions
             * to it, so the service can resolve it as the fallback.
             */
            $rankAndFile = ApprovalWorkflow::updateOrCreate(
                ['code' => 'LEAVE_RANK_FILE'],
                [
                    'name' => 'Leave Application - Rank-and-File',
                    'description' =>
                        'Manager reviews the leave request. After approval, HR processes the leave, updates records, and informs the employee.',
                    'is_active' => true,
                ]
            );

            // Keep the default workflow free of position mappings.
            $rankAndFile->positions()->delete();

            // Replace steps so running the seeder is repeatable.
            $rankAndFile->steps()->delete();

            $rankAndFile->steps()->create([
                'step_order' => 1,
                'name' => 'Manager Review',
                'approver_type' => 'manager',
                'approver_user_id' => null,
                'is_required' => true,
            ]);

            /*
             * Workflow 2: Cashiers and Managers
             *
             * The COO reviews the request. HR processes it after
             * approval; HR is not another approval step.
             */
            $cashiersAndManagers = ApprovalWorkflow::updateOrCreate(
                ['code' => 'LEAVE_CASHIERS_MANAGERS'],
                [
                    'name' => 'Leave Application - Cashiers and Managers',
                    'description' =>
                        'COO reviews the leave request. After approval, HR processes the leave, updates records, and informs the employee.',
                    'is_active' => true,
                ]
            );

            $cashiersAndManagers->steps()->delete();

            $cashiersAndManagers->steps()->create([
                'step_order' => 1,
                'name' => 'COO Review',
                'approver_type' => 'coo',
                'approver_user_id' => null,
                'is_required' => true,
            ]);

            /*
             * Position mappings:
             * 1 = Manager
             * 2 = Cashier/Teller
             */
            $cashiersAndManagers->positions()->delete();

            $cashiersAndManagers->positions()->createMany([
                ['position_id' => 1],
                ['position_id' => 2],
            ]);
        });
    }
}
