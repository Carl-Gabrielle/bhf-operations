<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\OrganizationalUnit;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Display all users.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->with([
                'organizationalUnit:id,code,name',
                'position:id,name',
                'roles:id,name',
            ])
            ->orderByDesc('created_at')
            ->get();

        $organizationalUnits = OrganizationalUnit::query()
            ->orderBy('code')
            ->get([
                'id',
                'code',
                'name',
            ]);

        return Inertia::render('Admin/Users/Index', [
            'users' => UserResource::collection($users),

            'organizationalUnits' => $organizationalUnits,

            'filters' => [
                'search' => $request
                    ->string('search')
                    ->toString(),
            ],
        ]);
    }

    /**
     * Display a specific user.
     */
    public function show(User $user): Response
    {
        $user->load([
            'organizationalUnit:id,code,name',
            'position:id,name',
            'roles:id,name',
        ]);

        return Inertia::render('Admin/Users/Show', [
            'user' => new UserResource($user),
        ]);
    }

    /**
     * Store a new user.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'max:30',
                'unique:users,username',
            ],

            'employee_number' => [
                'nullable',
                'string',
                'max:255',
                'unique:users,employee_number',
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'first_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'middle_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'last_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'contact_number' => [
                'nullable',
                'string',
                'max:255',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
                'unique:users,email',
            ],

            'organizational_unit_id' => [
                'nullable',
                'integer',
                'exists:organizational_units,id',
            ],

            'position_id' => [
                'nullable',
                'integer',
                'exists:positions,id',
            ],

            'account_status' => [
                'required',
                'string',
                'max:20',
            ],

            'role' => [
                'nullable',
                'string',
                'exists:roles,name',
            ],

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user = User::create([
            'username' => $validated['username'],

            'employee_number' =>
                $validated['employee_number'] ?? null,

            'name' => $validated['name'],

            'first_name' =>
                $validated['first_name'] ?? null,

            'middle_name' =>
                $validated['middle_name'] ?? null,

            'last_name' =>
                $validated['last_name'] ?? null,

            'contact_number' =>
                $validated['contact_number'] ?? null,

            'email' =>
                $validated['email'] ?? null,

            'organizational_unit_id' =>
                $validated['organizational_unit_id'] ?? null,

            'position_id' =>
                $validated['position_id'] ?? null,

            'account_status' =>
                $validated['account_status'],

            'password' =>
                bcrypt($validated['password']),

            'password_changed_at' => now(),
        ]);

        if (!empty($validated['role'])) {
            $user->assignRole($validated['role']);
        }

        return redirect()
            ->route('admin.users.index')
            ->with(
                'success',
                'User created successfully.',
            );
    }

    /**
     * Update a user.
     */
    public function update(
        Request $request,
        User $user,
    ) {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'max:30',
                'unique:users,username,' . $user->id,
            ],

            'employee_number' => [
                'nullable',
                'string',
                'max:255',
                'unique:users,employee_number,' . $user->id,
            ],

            'name' => [
                'required',
                'string',
                'max:255',
            ],

            'first_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'middle_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'last_name' => [
                'nullable',
                'string',
                'max:255',
            ],

            'contact_number' => [
                'nullable',
                'string',
                'max:255',
            ],

            'email' => [
                'nullable',
                'email',
                'max:255',
                'unique:users,email,' . $user->id,
            ],

            'organizational_unit_id' => [
                'nullable',
                'integer',
                'exists:organizational_units,id',
            ],

            'position_id' => [
                'nullable',
                'integer',
                'exists:positions,id',
            ],

            'account_status' => [
                'required',
                'string',
                'max:20',
            ],

            'role' => [
                'nullable',
                'string',
                'exists:roles,name',
            ],

            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        $user->update([
            'username' => $validated['username'],

            'employee_number' =>
                $validated['employee_number'] ?? null,

            'name' => $validated['name'],

            'first_name' =>
                $validated['first_name'] ?? null,

            'middle_name' =>
                $validated['middle_name'] ?? null,

            'last_name' =>
                $validated['last_name'] ?? null,

            'contact_number' =>
                $validated['contact_number'] ?? null,

            'email' =>
                $validated['email'] ?? null,

            'organizational_unit_id' =>
                $validated['organizational_unit_id'] ?? null,

            'position_id' =>
                $validated['position_id'] ?? null,

            'account_status' =>
                $validated['account_status'],
        ]);

        if (!empty($validated['password'] ?? null)) {
            $user->update([
                'password' =>
                    bcrypt($validated['password']),

                'password_changed_at' => now(),
            ]);
        }

        if (array_key_exists('role', $validated)) {
            $user->syncRoles(
                $validated['role']
                    ? [$validated['role']]
                    : [],
            );
        }

        return redirect()
            ->route(
                'admin.users.show',
                $user,
            )
            ->with(
                'success',
                'User updated successfully.',
            );
    }

    /**
     * Delete a user.
     */
    public function destroy(User $user)
    {
        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with(
                'success',
                'User deleted successfully.',
            );
    }
}