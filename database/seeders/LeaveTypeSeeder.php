<?php

namespace Database\Seeders;

use App\Models\LeaveType;
use Illuminate\Database\Seeder;

class LeaveTypeSeeder extends Seeder
{
    public function run(): void
    {
        $leaveTypes = [
            [
                'name' => 'Vacation Leave',
                'code' => 'VL',
                'description' => 'Leave taken for vacation, rest, or personal time.',
                'is_paid' => true,
                'requires_attachment' => false,
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'Sick Leave',
                'code' => 'SL',
                'description' => 'Leave taken due to illness or medical condition.',
                'is_paid' => true,
                'requires_attachment' => false,
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Emergency Leave',
                'code' => 'EL',
                'description' => 'Leave for urgent or unforeseen personal circumstances.',
                'is_paid' => true,
                'requires_attachment' => false,
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Other Leave',
                'code' => 'OL',
                'description' => 'Other approved leave types not covered by the standard categories.',
                'is_paid' => true,
                'requires_attachment' => false,
                'is_active' => true,
                'sort_order' => 99,
            ],
        ];

        foreach ($leaveTypes as $leaveType) {
            LeaveType::updateOrCreate(
                ['code' => $leaveType['code']],
                $leaveType
            );
        }
    }
}