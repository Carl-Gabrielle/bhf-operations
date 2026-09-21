<?php

namespace Database\Seeders;

use App\Models\OrganizationalUnit;
use Illuminate\Database\Seeder;

class OrganizationalUnitSeeder extends Seeder
{
    public function run(): void
    {
        $units = [
            [
                'code' => '001',
                'name' => 'Dagupan',
                'type' => 'branch',
            ],
            [
                'code' => '002',
                'name' => 'Lingayen',
                'type' => 'branch',
            ],
            [
                'code' => '003',
                'name' => 'Urdaneta',
                'type' => 'branch',
            ],
            [
                'code' => '004',
                'name' => 'Tayug',
                'type' => 'branch',
            ],
            [
                'code' => '005',
                'name' => 'Mangatarem',
                'type' => 'branch',
            ],
            [
                'code' => '006',
                'name' => 'Rosario',
                'type' => 'branch',
            ],
            [
                'code' => '007',
                'name' => 'Alaminos',
                'type' => 'branch',
            ],
            [
                'code' => '999',
                'name' => 'Corporate',
                'type' => 'corporate',
            ],
        ];

        foreach ($units as $unit) {
            OrganizationalUnit::updateOrCreate(
                ['code' => $unit['code']],
                [
                    'name' => $unit['name'],
                    'type' => $unit['type'],
                    'is_active' => true,
                ],
            );
        }
    }
}