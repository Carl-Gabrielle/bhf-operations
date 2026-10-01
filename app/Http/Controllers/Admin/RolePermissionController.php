<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | Protected System Roles
    |--------------------------------------------------------------------------
    |
    | These roles are created by the system and therefore cannot be
    | renamed or deleted.
    |
    | Their permissions CAN still be modified.
    |
    */

    private const PROTECTED_ROLES = [
        'admin',
        'coo',
        'hr',
        'employee',
    ];


    /*
    |--------------------------------------------------------------------------
    | Index
    |--------------------------------------------------------------------------
    |
    | Display all roles and all available permissions.
    |
    */

    public function index(): Response
    {
        $roles = Role::query()
            ->where('guard_name', 'web')
            ->with([
                'permissions' => function ($query) {
                    $query
                        ->select([
                            'permissions.id',
                            'permissions.name',
                        ])
                        ->where(
                            'permissions.guard_name',
                            'web'
                        );
                },
            ])
            ->withCount('users')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'guard_name',
            ]);

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'guard_name',
            ]);

        return Inertia::render('Admin/Roles/Index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }


    /*
    |--------------------------------------------------------------------------
    | Store
    |--------------------------------------------------------------------------
    |
    | Create a new custom role.
    |
    */

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-zA-Z0-9\s\-_]+$/',
                'unique:roles,name',
            ],

            'permissions' => [
                'nullable',
                'array',
            ],

            'permissions.*' => [
                'integer',
                'exists:permissions,id',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Normalize Role Name
        |--------------------------------------------------------------------------
        */

        $roleName = strtolower(
            trim($validated['name'])
        );


        /*
        |--------------------------------------------------------------------------
        | Create Role
        |--------------------------------------------------------------------------
        */

        $role = Role::create([
            'name' => $roleName,
            'guard_name' => 'web',
        ]);


        /*
        |--------------------------------------------------------------------------
        | Assign Permissions
        |--------------------------------------------------------------------------
        */

        $permissionIds =
            $validated['permissions'] ?? [];

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn(
                'id',
                $permissionIds
            )
            ->get();

        $role->syncPermissions(
            $permissions
        );


        /*
        |--------------------------------------------------------------------------
        | Clear Permission Cache
        |--------------------------------------------------------------------------
        */

        $this->clearPermissionCache();


        return back()->with(
            'success',
            "Role '{$role->name}' created successfully."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Update Role
    |--------------------------------------------------------------------------
    |
    | Updates both:
    |
    | - Role name
    | - Role permissions
    |
    */

    public function update(
        Request $request,
        Role $role
    ): RedirectResponse {

        $validated = $request->validate([
            'name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-zA-Z0-9\s\-_]+$/',
                'unique:roles,name,' . $role->id,
            ],

            'permissions' => [
                'nullable',
                'array',
            ],

            'permissions.*' => [
                'integer',
                'exists:permissions,id',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Normalize Names
        |--------------------------------------------------------------------------
        */

        $oldName = strtolower(
            trim($role->name)
        );

        $newName = strtolower(
            trim($validated['name'])
        );


        /*
        |--------------------------------------------------------------------------
        | Prevent Renaming Protected Roles
        |--------------------------------------------------------------------------
        */

        if (
            $this->isProtectedRole($oldName) &&
            $oldName !== $newName
        ) {
            return back()->withErrors([
                'name' =>
                    'System roles cannot be renamed.',
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | Update Role Name
        |--------------------------------------------------------------------------
        */

        if ($oldName !== $newName) {
            $role->update([
                'name' => $newName,
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | Update Permissions
        |--------------------------------------------------------------------------
        */

        $permissionIds =
            $validated['permissions'] ?? [];

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn(
                'id',
                $permissionIds
            )
            ->get();

        $role->syncPermissions(
            $permissions
        );


        /*
        |--------------------------------------------------------------------------
        | Clear Permission Cache
        |--------------------------------------------------------------------------
        */

        $this->clearPermissionCache();


        return back()->with(
            'success',
            "Role '{$role->name}' updated successfully."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Update Permissions
    |--------------------------------------------------------------------------
    |
    | This is the endpoint used by your checkbox UI.
    |
    | PUT:
    |
    | /admin/roles/{role}/permissions
    |
    */

    public function updatePermissions(
        Request $request,
        Role $role
    ): RedirectResponse {

        /*
        |--------------------------------------------------------------------------
        | Validate Request
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            'permissions' => [
                'nullable',
                'array',
            ],

            'permissions.*' => [
                'integer',
                'exists:permissions,id',
            ],
        ]);


        /*
        |--------------------------------------------------------------------------
        | Get Permission IDs
        |--------------------------------------------------------------------------
        */

        $permissionIds =
            $validated['permissions'] ?? [];


        /*
        |--------------------------------------------------------------------------
        | Get Valid Web Permissions
        |--------------------------------------------------------------------------
        */

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->whereIn(
                'id',
                $permissionIds
            )
            ->get();


        /*
        |--------------------------------------------------------------------------
        | Sync Permissions
        |--------------------------------------------------------------------------
        |
        | This will:
        |
        | - Add selected permissions
        | - Remove unchecked permissions
        | - Keep existing selected permissions
        |
        */

        $role->syncPermissions(
            $permissions
        );


        /*
        |--------------------------------------------------------------------------
        | Clear Spatie Permission Cache
        |--------------------------------------------------------------------------
        */

        $this->clearPermissionCache();


        /*
        |--------------------------------------------------------------------------
        | Return
        |--------------------------------------------------------------------------
        */

        return back()->with(
            'success',
            "Permissions for role '{$role->name}' updated successfully."
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Destroy
    |--------------------------------------------------------------------------
    |
    | Delete a custom role.
    |
    */

    public function destroy(
        Role $role
    ): RedirectResponse {

        $roleName = strtolower(
            trim($role->name)
        );


        /*
        |--------------------------------------------------------------------------
        | Protect System Roles
        |--------------------------------------------------------------------------
        */

        if (
            $this->isProtectedRole($roleName)
        ) {
            return back()->withErrors([
                'role' =>
                    'System roles cannot be deleted.',
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | Prevent Deleting Assigned Roles
        |--------------------------------------------------------------------------
        */

        if (
            $role->users()->exists()
        ) {
            return back()->withErrors([
                'role' =>
                    'This role cannot be deleted because it is assigned to one or more users.',
            ]);
        }


        /*
        |--------------------------------------------------------------------------
        | Delete Role
        |--------------------------------------------------------------------------
        */

        $role->delete();


        /*
        |--------------------------------------------------------------------------
        | Clear Permission Cache
        |--------------------------------------------------------------------------
        */

        $this->clearPermissionCache();


        return back()->with(
            'success',
            'Role deleted successfully.'
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Check Protected Role
    |--------------------------------------------------------------------------
    */

    private function isProtectedRole(
        string $roleName
    ): bool {
        return in_array(
            strtolower($roleName),
            self::PROTECTED_ROLES,
            true
        );
    }


    /*
    |--------------------------------------------------------------------------
    | Clear Permission Cache
    |--------------------------------------------------------------------------
    */

    private function clearPermissionCache(): void
    {
        app()[
            PermissionRegistrar::class
        ]->forgetCachedPermissions();
    }
}