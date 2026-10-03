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
        /*
        |--------------------------------------------------------------------------
        | Reset Permission Cache
        |--------------------------------------------------------------------------
        */

        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        /*
        |--------------------------------------------------------------------------
        | Permissions
        |--------------------------------------------------------------------------
        */

        $permissions = [
            // Dashboard
            'dashboard.view',

            // Employees
            'employees.view',
            'employees.create',
            'employees.edit',
            'employees.delete',

            // Leave
            'leave.view',
            'leave.create',
            'leave.edit',
            'leave.delete',
            'leave.approve',
            'leave.process',

            // Overtime
            'overtime.view',
            'overtime.create',
            'overtime.edit',
            'overtime.delete',
            'overtime.approve',

            // Undertime
            'undertime.view',
            'undertime.create',
            'undertime.edit',
            'undertime.delete',
            'undertime.approve',

            // Travel
            'travel.view',
            'travel.create',
            'travel.edit',
            'travel.delete',
            'travel.approve',

            // Reports
            'reports.view',

            // User Management
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
        | ADMIN
        |--------------------------------------------------------------------------
        |
        | Admin has full system access.
        |
        */

        $admin->syncPermissions(
            Permission::where('guard_name', 'web')->get()
        );

        /*
        |--------------------------------------------------------------------------
        | COO
        |--------------------------------------------------------------------------
        |
        | COO is an organizational approver.
        |
        | Important:
        | `leave.approve` gives the COO authorization to approve.
        |
        | Reporting hierarchy is NOT controlled by this role.
        |
        */

        $coo->syncPermissions([
            'dashboard.view',

            'employees.view',

            // Leave
            'leave.view',
            'leave.approve',

            // Overtime
            'overtime.view',
            'overtime.approve',

            // Undertime
            'undertime.view',
            'undertime.approve',

            // Travel
            'travel.view',
            'travel.approve',

            // Reports
            'reports.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | HR
        |--------------------------------------------------------------------------
        |
        | HR is also an approver and processor.
        |
        */

        $hr->syncPermissions([
            'dashboard.view',

            // Employees
            'employees.view',
            'employees.create',
            'employees.edit',

            // Leave
            'leave.view',
            'leave.approve',
            'leave.process',

            // Overtime
            'overtime.view',
            'overtime.approve',

            // Undertime
            'undertime.view',
            'undertime.approve',

            // Travel
            'travel.view',
            'travel.approve',

            // Reports
            'reports.view',
        ]);

        /*
        |--------------------------------------------------------------------------
        | EMPLOYEE
        |--------------------------------------------------------------------------
        |
        | Regular employees can file their own requests.
        | They cannot approve.
        |
        */

        $employee->syncPermissions([
            'dashboard.view',

            // Leave
            'leave.view',
            'leave.create',
            'leave.edit',

            // Overtime
            'overtime.view',
            'overtime.create',
            'overtime.edit',

            // Undertime
            'undertime.view',
            'undertime.create',
            'undertime.edit',

            // Travel
            'travel.view',
            'travel.create',
            'travel.edit',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Clear Permission Cache
        |--------------------------------------------------------------------------
        */

        app()[PermissionRegistrar::class]->forgetCachedPermissions();
    }
}