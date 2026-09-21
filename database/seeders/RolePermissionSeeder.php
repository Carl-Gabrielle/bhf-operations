<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Clear cached permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | Permissions
        |--------------------------------------------------------------------------
        */

        $permissions = [
            'dashboard.view',

            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',

            'leave.view',
            'leave.create',
            'leave.edit',
            'leave.delete',
            'leave.approve',

            'overtime.view',
            'overtime.create',
            'overtime.edit',
            'overtime.delete',
            'overtime.approve',

            'undertime.view',
            'undertime.create',
            'undertime.edit',
            'undertime.delete',
            'undertime.approve',

            'travel.view',
            'travel.create',
            'travel.edit',
            'travel.delete',
            'travel.approve',

            'reports.view',

            'users.view',
            'users.create',
            'users.edit',
            'users.delete',
            'users.manage-roles',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => 'web',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Roles
        |--------------------------------------------------------------------------
        */

        $admin = Role::firstOrCreate([
            'name' => 'admin',
            'guard_name' => 'web',
        ]);

        $coo = Role::firstOrCreate([
            'name' => 'coo',
            'guard_name' => 'web',
        ]);

        $hr = Role::firstOrCreate([
            'name' => 'hr',
            'guard_name' => 'web',
        ]);

        $employee = Role::firstOrCreate([
            'name' => 'employee',
            'guard_name' => 'web',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Admin
        |--------------------------------------------------------------------------
        */

        $admin->syncPermissions(
            Permission::all()
        );

        /*
        |--------------------------------------------------------------------------
        | COO
        |--------------------------------------------------------------------------
        */

        $coo->syncPermissions([
            'dashboard.view',

            'employees.view',

            'leave.view',
            'leave.approve',

            'overtime.view',
            'overtime.approve',

            'undertime.view',
            'undertime.approve',

            'travel.view',
            'travel.approve',

            'reports.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | HR
        |--------------------------------------------------------------------------
        */

        $hr->syncPermissions([
            'dashboard.view',

            'employees.view',
            'employees.create',
            'employees.edit',

            'leave.view',
            'leave.approve',

            'overtime.view',
            'overtime.approve',

            'undertime.view',
            'undertime.approve',

            'travel.view',
            'travel.approve',

            'reports.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Employee
        |--------------------------------------------------------------------------
        */

        $employee->syncPermissions([
            'dashboard.view',

            'leave.view',
            'leave.create',
            'leave.edit',

            'overtime.view',
            'overtime.create',
            'overtime.edit',

            'undertime.view',
            'undertime.create',
            'undertime.edit',

            'travel.view',
            'travel.create',
            'travel.edit',
        ]);

        // Clear cache again
        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}