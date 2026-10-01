<?php

namespace App\Http\Controllers;

use App\Http\Resources\UserResource;
use App\Models\AuditLog;
use App\Models\OrganizationalUnit;
use App\Models\Position;
use App\Models\User;
use App\Support\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

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
            ->when(
                $request->filled('search'),
                function ($query) use ($request) {
                    $search = $request->string('search')->toString();

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where('username', 'like', "%{$search}%")
                            ->orWhere('employee_number', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    });
                }
            )
            ->orderByDesc('created_at')
            ->paginate(10)
            ->withQueryString();

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

        $organizationalUnits = OrganizationalUnit::query()
            ->orderBy('code')
            ->get([
                'id',
                'code',
                'name',
            ]);

        $positions = Position::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        $roles = Role::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        /*
         * Load the audit history for this specific account.
         *
         * actor = the administrator/user who performed the action.
         * target_user_id = the account being viewed.
         */
        $auditLogs = AuditLog::query()
            ->with([
                'actor:id,name,username',
            ])
            ->where('target_user_id', $user->id)
            ->latest()
            ->limit(100)
            ->get();

        return Inertia::render('Admin/Users/View', [
            'user' => (new UserResource($user))->resolve(),

            'organizationalUnits' => $organizationalUnits,

            'positions' => $positions,

            'roles' => $roles,

            'auditLogs' => $auditLogs,
        ]);
    }

    /**
     * Display the user creation form.
     */
    public function create(): Response
    {
        $organizationalUnits = OrganizationalUnit::query()
            ->orderBy('code')
            ->get([
                'id',
                'code',
                'name',
            ]);

        $positions = Position::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        $roles = Role::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        return Inertia::render('Admin/Users/Create', [
            'organizationalUnits' => $organizationalUnits,
            'positions' => $positions,
            'roles' => $roles,
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

        $user = DB::transaction(function () use ($validated) {
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

                /*
                 * Never store a plain-text password.
                 */
                'password' => Hash::make(
                    $validated['password']
                ),

                'password_changed_at' => now(),

                'must_change_password' => false,
            ]);

            if (!empty($validated['role'])) {
                $user->assignRole($validated['role']);
            }

            return $user;
        });

        /*
         * Audit who created the account.
         *
         * The password itself is intentionally excluded.
         */
        AuditLogger::log(
            action: 'user_created',
            targetUser: $user,
            description:
                'User account created by ' .
                (
                    auth()->user()?->name ??
                    auth()->user()?->username ??
                    'System administrator'
                ),
            changes: [
                'username' => [
                    'old' => null,
                    'new' => $user->username,
                ],

                'employee_number' => [
                    'old' => null,
                    'new' => $user->employee_number,
                ],

                'name' => [
                    'old' => null,
                    'new' => $user->name,
                ],

                'email' => [
                    'old' => null,
                    'new' => $user->email,
                ],

                'account_status' => [
                    'old' => null,
                    'new' => $user->account_status,
                ],

                'role' => [
                    'old' => null,
                    'new' => $validated['role'] ?? null,
                ],
            ],
        );

        return redirect()
            ->route('admin.users.index')
            ->with(
                'success',
                'User created successfully.',
            );
    }

    /**
     * Reset a user's password.
     *
     * This method can be used by a dedicated reset-password route.
     */
    public function resetPassword(User $user)
    {
        $temporaryPassword = Str::password(
            length: 12,
            letters: true,
            numbers: true,
            symbols: true,
        );

        $user->update([
            /*
             * Always hash the temporary password.
             */
            'password' => Hash::make(
                $temporaryPassword
            ),

            'password_changed_at' => now(),

            /*
             * Force the employee to change it
             * after signing in.
             */
            'must_change_password' => true,
        ]);

        /*
         * Audit the reset.
         *
         * NEVER store the actual temporary password.
         */
        AuditLogger::log(
            action: 'password_reset',
            targetUser: $user,
            description:
                'Password reset by ' .
                (
                    auth()->user()?->name ??
                    auth()->user()?->username ??
                    'System administrator'
                ),
            changes: [
                'password' => [
                    'changed' => true,
                ],

                'must_change_password' => [
                    'old' => false,
                    'new' => true,
                ],
            ],
        );

        /*
         * The temporary password is returned only
         * to the current reset operation.
         *
         * It is NOT stored in the audit log.
         */
        return back()->with([
            'success' =>
                'Password reset successfully.',

            'temporaryPassword' =>
                $temporaryPassword,
        ]);
    }

    /**
     * Update a user.
     *
     * This method also supports the reset-password flow
     * used by the current View.tsx.
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

            /*
             * Password is optional.
             *
             * The current View.tsx uses this field for
             * administrator-generated temporary passwords.
             */
            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        /*
         * Capture the original values BEFORE updating.
         */
        $original = $user->only([
            'username',
            'employee_number',
            'name',
            'first_name',
            'middle_name',
            'last_name',
            'contact_number',
            'email',
            'organizational_unit_id',
            'position_id',
            'account_status',
            'must_change_password',
        ]);

        /*
         * Capture the original role before syncRoles().
         */
        $originalRoles = $user
            ->roles()
            ->pluck('name')
            ->values()
            ->all();

        /*
         * Determine whether the request contains a password.
         *
         * In the current View.tsx this means the administrator
         * is performing a password reset.
         */
        $isPasswordReset =
            filled($validated['password'] ?? null);

        $newRole =
            $validated['role'] ?? null;

        DB::transaction(function () use (
            $user,
            $validated,
            $isPasswordReset,
            $newRole,
        ) {
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

            /*
             * Password reset.
             *
             * NEVER save the plain temporary password.
             */
            if ($isPasswordReset) {
                $user->update([
                    'password' => Hash::make(
                        $validated['password']
                    ),

                    'password_changed_at' => now(),

                    'must_change_password' => true,
                ]);
            }

            /*
             * Update the Spatie role.
             */
            if (array_key_exists('role', $validated)) {
                $user->syncRoles(
                    $newRole
                        ? [$newRole]
                        : [],
                );
            }
        });

        /*
         * Refresh the model after the transaction.
         */
        $user->refresh();

        /*
         * ---------------------------------------------------------
         * PASSWORD RESET AUDIT
         * ---------------------------------------------------------
         *
         * This is deliberately separate from normal user changes.
         */
        if ($isPasswordReset) {
            AuditLogger::log(
                action: 'password_reset',
                targetUser: $user,
                description:
                    'Password reset by ' .
                    (
                        auth()->user()?->name ??
                        auth()->user()?->username ??
                        'System administrator'
                    ),
                changes: [
                    'password' => [
                        'changed' => true,
                    ],

                    'must_change_password' => [
                        'old' =>
                            (bool) (
                                $original['must_change_password']
                                ?? false
                            ),

                        'new' =>
                            (bool) (
                                $user->must_change_password
                            ),
                    ],
                ],
            );

            /*
             * Do not record the generated password in the audit log.
             */
            return redirect()
                ->route(
                    'admin.users.show',
                    $user,
                )
                ->with(
                    'success',
                    'Password reset successfully.',
                );
        }

        /*
         * ---------------------------------------------------------
         * NORMAL USER EDIT AUDIT
         * ---------------------------------------------------------
         */
        $freshValues = $user->only([
            'username',
            'employee_number',
            'name',
            'first_name',
            'middle_name',
            'last_name',
            'contact_number',
            'email',
            'organizational_unit_id',
            'position_id',
            'account_status',
        ]);

        $changes = [];

        foreach ($freshValues as $field => $newValue) {
            $oldValue = $original[$field] ?? null;

            if ((string) $oldValue !== (string) $newValue) {
                $changes[$field] = [
                    'old' => $oldValue,
                    'new' => $newValue,
                ];
            }
        }

        /*
         * Compare role changes.
         */
        $newRoles = $user
            ->roles()
            ->pluck('name')
            ->values()
            ->all();

        if ($originalRoles !== $newRoles) {
            $changes['role'] = [
                'old' => implode(', ', $originalRoles) ?: null,
                'new' => implode(', ', $newRoles) ?: null,
            ];
        }

        /*
         * Only create an audit record when something
         * actually changed.
         */
        if (!empty($changes)) {
            AuditLogger::log(
                action: 'user_updated',
                targetUser: $user,
                description:
                    'User account updated by ' .
                    (
                        auth()->user()?->name ??
                        auth()->user()?->username ??
                        'System administrator'
                    ),
                changes: $changes,
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
        /*
         * Capture identifying information before deletion.
         */
        $deletedUserName =
            $user->name ??
            $user->username ??
            'User';

        $deletedUserId = $user->id;

        /*
         * Record the audit BEFORE deleting the account.
         *
         * target_user_id becomes null automatically if the
         * audit_logs foreign key uses nullOnDelete().
         */
        AuditLogger::log(
            action: 'user_deleted',
            targetUser: $user,
            description:
                'User account deleted by ' .
                (
                    auth()->user()?->name ??
                    auth()->user()?->username ??
                    'System administrator'
                ),
            changes: [
                'user_id' => [
                    'old' => $deletedUserId,
                    'new' => null,
                ],

                'name' => [
                    'old' => $deletedUserName,
                    'new' => null,
                ],
            ],
        );

        $user->delete();

        return redirect()
            ->route('admin.users.index')
            ->with(
                'success',
                'User deleted successfully.',
            );
    }
}
