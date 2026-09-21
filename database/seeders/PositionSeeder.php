<?php

namespace Database\Seeders;

use App\Models\Position;
use Illuminate\Database\Seeder;

class PositionSeeder extends Seeder
{
    public function run(): void
    {
        $positions = [
            'Manager',
            'Cashier/Teller',
            'BOO',
            'Account Officer',
            'HR Head',
            'HR Assistant',
            'COO',
            'Accounting Head',
            'Accounting Staff',
            'Credit Head',
            'Credit Staff',
            'DRU',
            'MIS Head',
            'MIS Staff',
            'Compliance Head',
            'Audit Head',
            'Audit Staff',
            'RAMU Head',
            'RAMU Staff',
            'Messenger/Utility',
        ];

        foreach ($positions as $name) {
            Position::updateOrCreate(
                ['name' => $name],
                ['is_active' => true],
            );
        }
    }
}