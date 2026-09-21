<?php

namespace Database\Seeders;

use App\Models\OrganizationalUnit;
use App\Models\Position;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TestAccountSeeder extends Seeder
{
    public function run(): void
    {
        /*
        |--------------------------------------------------------------------------
        | Test Password
        |--------------------------------------------------------------------------
        |
        | You can override this using TEST_USER_PASSWORD in .env
        |
        */

        $password = env('TEST_USER_PASSWORD', 'Test@BHF2026!');

        /*
        |--------------------------------------------------------------------------
        | Test Accounts
        |--------------------------------------------------------------------------
        |
        | Organization is referenced by code instead of database ID.
        |
        */

        $accounts = [
            [
                'username' => 'admin.test',
                'employee_number' => 'TEST-ADMIN',
                'name' => 'Test Administrator',
                'first_name' => 'Test',
                'last_name' => 'Administrator',
                'email' => 'admin.test@bhf.local',

                'role' => 'admin',
                'position' => null,
                'organizational_unit' => '999', // Corporate
            ],

            [
                'username' => 'coo.test',
                'employee_number' => 'TEST-COO',
                'name' => 'Test COO',
                'first_name' => 'Test',
                'last_name' => 'COO',
                'email' => 'coo.test@bhf.local',

                'role' => 'COO',
                'position' => 'COO',
                'organizational_unit' => '999', // Corporate
            ],

            [
                'username' => 'hr.test',
                'employee_number' => 'TEST-HR',
                'name' => 'Test HR Head',
                'first_name' => 'Test',
                'last_name' => 'HR Head',
                'email' => 'hr.test@bhf.local',

                'role' => 'HR',
                'position' => 'HR Head',
                'organizational_unit' => '999', // Corporate
            ],

            [
                'username' => 'manager.test',
                'employee_number' => 'TEST-MANAGER',
                'name' => 'Test Manager',
                'first_name' => 'Test',
                'last_name' => 'Manager',
                'email' => 'manager.test@bhf.local',

                'role' => 'manager',
                'position' => 'Manager',
                'organizational_unit' => '002', // Lingayen
            ],

            [
                'username' => 'head.test',
                'employee_number' => 'TEST-HEAD',
                'name' => 'Test Department Head',
                'first_name' => 'Test',
                'last_name' => 'Department Head',
                'email' => 'head.test@bhf.local',

                'role' => 'head',
                'position' => 'MIS Head',
                'organizational_unit' => '999', // Corporate
            ],

            [
                'username' => 'employee.test',
                'employee_number' => 'TEST-EMPLOYEE',
                'name' => 'Test Employee',
                'first_name' => 'Test',
                'last_name' => 'Employee',
                'email' => 'employee.test@bhf.local',

                'role' => 'employee',
                'position' => 'MIS Staff',
                'organizational_unit' => '999', // Corporate
            ],
        ];

        foreach ($accounts as $account) {

            /*
            |--------------------------------------------------------------------------
            | Resolve Position
            |--------------------------------------------------------------------------
            */

            $positionId = null;

            if ($account['position']) {
                $position = Position::where('name', $account['position'])->first();

                if (!$position) {
                    $this->command->warn(
                        "Position '{$account['position']}' was not found."
                    );
                } else {
                    $positionId = $position->id;
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Resolve Organizational Unit
            |--------------------------------------------------------------------------
            */

            $organizationalUnit = OrganizationalUnit::where(
                'code',
                $account['organizational_unit']
            )->first();

            if (!$organizationalUnit) {
                $this->command->warn(
                    "Organizational unit '{$account['organizational_unit']}' was not found."
                );

                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Create / Update User
            |--------------------------------------------------------------------------
            */

            $user = User::updateOrCreate(
                [
                    'username' => $account['username'],
                ],
                [
                    'employee_number' => $account['employee_number'],

                    'name' => $account['name'],
                    'first_name' => $account['first_name'],
                    'middle_name' => null,
                    'last_name' => $account['last_name'],

                    'contact_number' => null,

                    'email' => $account['email'],

                    'organizational_unit_id' => $organizationalUnit->id,
                    'position_id' => $positionId,

                    'account_status' => 'active',

                    'password' => Hash::make($password),
                    'password_changed_at' => now(),
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Assign Exactly One Test Role
            |--------------------------------------------------------------------------
            */

            $role = Role::where('name', $account['role'])
                ->where('guard_name', 'web')
                ->first();

            if (!$role) {
                $this->command->warn(
                    "Role '{$account['role']}' does not exist for guard 'web'."
                );

                continue;
            }

            $user->syncRoles([$role]);

            /*
            |--------------------------------------------------------------------------
            | Output
            |--------------------------------------------------------------------------
            */

            $this->command->info(
                "Created/updated: {$account['username']} " .
                "→ {$account['role']} " .
                "→ {$organizationalUnit->name}"
            );
        }
    }
}