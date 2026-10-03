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
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /*
    |--------------------------------------------------------------------------
    | USER LIST
    |--------------------------------------------------------------------------
    */

    public function index(Request $request): Response
    {
        $allowedSorts = [
            'name',
            'username',
            'employee_number',
            'account_status',
            'created_at',
        ];

        $sort = $request->string('sort')->toString();

        $sort = in_array($sort, $allowedSorts, true)
            ? $sort
            : 'created_at';

        $direction = $request->string('direction')->toString();

        $direction = in_array($direction, ['asc', 'desc'], true)
            ? $direction
            : 'desc';

        $users = User::query()
            ->with([
                'organizationalUnit:id,code,name',
                'position:id,name',
                'roles:id,name',

                'reportsTo:id,name,employee_number,position_id,organizational_unit_id,can_be_reporting_manager',
                'reportsTo.position:id,name',
                'reportsTo.organizationalUnit:id,code,name',
            ])

            /*
            |--------------------------------------------------------------------------
            | Search
            |--------------------------------------------------------------------------
            */

            ->when(
                $request->filled('search'),
                function ($query) use ($request) {
                    $search = $request
                        ->string('search')
                        ->trim()
                        ->toString();

                    $query->where(function ($query) use ($search) {
                        $query
                            ->where(
                                'username',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'employee_number',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'email',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
            )

            /*
            |--------------------------------------------------------------------------
            | Status
            |--------------------------------------------------------------------------
            */

            ->when(
                $request->filled('status'),
                function ($query) use ($request) {
                    $status = $request
                        ->string('status')
                        ->toString();

                    if ($status !== 'all') {
                        $query->where(
                            'account_status',
                            $status
                        );
                    }
                }
            )

            /*
            |--------------------------------------------------------------------------
            | Role
            |--------------------------------------------------------------------------
            */

            ->when(
                $request->filled('role'),
                function ($query) use ($request) {
                    $role = $request
                        ->string('role')
                        ->toString();

                    if ($role !== 'all') {
                        $query->whereHas(
                            'roles',
                            function ($query) use ($role) {
                                $query->where(
                                    'name',
                                    $role
                                );
                            }
                        );
                    }
                }
            )

            /*
            |--------------------------------------------------------------------------
            | Organization
            |--------------------------------------------------------------------------
            */

            ->when(
                $request->filled('organization'),
                function ($query) use ($request) {
                    $organization = $request
                        ->integer('organization');

                    if ($organization > 0) {
                        $query->where(
                            'organizational_unit_id',
                            $organization
                        );
                    }
                }
            )

            ->orderBy($sort, $direction)
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        $organizationalUnits = OrganizationalUnit::query()
            ->orderBy('code')
            ->get([
                'id',
                'code',
                'name',
            ]);

        return Inertia::render(
            'Admin/Users/Index',
            [
                'users' =>
                    UserResource::collection($users),

                'organizationalUnits' =>
                    $organizationalUnits,

                'filters' => [
                    'search' =>
                        $request
                            ->string('search')
                            ->toString(),

                    'status' =>
                        $request
                            ->string('status')
                            ->toString(),

                    'role' =>
                        $request
                            ->string('role')
                            ->toString(),

                    'organization' =>
                        $request
                            ->string('organization')
                            ->toString(),

                    'sort' => $sort,

                    'direction' => $direction,
                ],
                'flash' => [
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ],
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | SHOW USER
    |--------------------------------------------------------------------------
    */

    public function show(User $user): Response
    {
        $user->load([
            'organizationalUnit:id,code,name',
            'position:id,name',
            'roles:id,name',

            /*
            |--------------------------------------------------------------------------
            | Reporting Structure
            |--------------------------------------------------------------------------
            */

            'reportsTo:id,name,employee_number,position_id,organizational_unit_id,can_be_reporting_manager',
            'reportsTo.position:id,name',
            'reportsTo.organizationalUnit:id,code,name',

            'directReports:id,name,employee_number,position_id,reports_to_user_id,can_be_reporting_manager',
            'directReports.position:id,name',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Organizational Units
        |--------------------------------------------------------------------------
        */

        $organizationalUnits = OrganizationalUnit::query()
            ->orderBy('code')
            ->get([
                'id',
                'code',
                'name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Positions
        |--------------------------------------------------------------------------
        */

        $positions = Position::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Roles
        |--------------------------------------------------------------------------
        */

        $roles = Role::query()
            ->orderBy('name')
            ->get([
                'id',
                'name',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Available Reporting Managers / Heads
        |--------------------------------------------------------------------------
        |
        | IMPORTANT:
        |
        | We no longer determine eligibility by checking whether the
        | position name contains "manager", "head", "chief", etc.
        |
        | Admin explicitly controls this through:
        |
        | can_be_reporting_manager = true
        |
        */

        $managers = User::query()
            ->reportingManagers()
            ->whereKeyNot($user->id)
            ->with([
                'position:id,name',
                'organizationalUnit:id,code,name',
                'roles:id,name',
            ])
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'first_name',
                'middle_name',
                'last_name',
                'username',
                'employee_number',
                'position_id',
                'organizational_unit_id',
                'account_status',
                'can_be_reporting_manager',
            ]);

        /*
        |--------------------------------------------------------------------------
        | Audit History
        |--------------------------------------------------------------------------
        */

        $auditLogs = AuditLog::query()
            ->with([
                'actor:id,name,username',
            ])
            ->where(
                'target_user_id',
                $user->id
            )
            ->latest()
            ->limit(100)
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Response
        |--------------------------------------------------------------------------
        */

        return Inertia::render(
            'Admin/Users/View',
            [
                'user' =>
                    (new UserResource($user))->resolve(),

                'organizationalUnits' =>
                    $organizationalUnits,

                'positions' =>
                    $positions,

                'roles' =>
                    $roles,

                'managers' =>
                    $managers,

                'auditLogs' =>
                    $auditLogs,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | CREATE USER
    |--------------------------------------------------------------------------
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

        /*
        |--------------------------------------------------------------------------
        | Available Reporting Managers / Heads
        |--------------------------------------------------------------------------
        */

        $managers = User::query()
            ->reportingManagers()
            ->with([
                'position:id,name',
                'organizationalUnit:id,code,name',
                'roles:id,name',
            ])
            ->orderBy('name')
            ->get([
                'id',
                'name',
                'first_name',
                'middle_name',
                'last_name',
                'username',
                'employee_number',
                'position_id',
                'organizational_unit_id',
                'account_status',
                'can_be_reporting_manager',
            ]);

        return Inertia::render(
            'Admin/Users/Create',
            [
                'organizationalUnits' =>
                    $organizationalUnits,

                'positions' =>
                    $positions,

                'roles' =>
                    $roles,

                'managers' =>
                    $managers,
            ]
        );
    }

    /*
    |--------------------------------------------------------------------------
    | STORE USER
    |--------------------------------------------------------------------------
    */

    public function store(Request $request)
    {
        $validated = $request->validate([
            /*
            |--------------------------------------------------------------------------
            | Account
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Personal Information
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Organization
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Reporting Structure
            |--------------------------------------------------------------------------
            */

            'reports_to_user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
            ],

            'can_be_reporting_manager' => [
                'sometimes',
                'boolean',
            ],

            /*
            |--------------------------------------------------------------------------
            | Account Status
            |--------------------------------------------------------------------------
            */

            'account_status' => [
                'required',
                'string',
                'max:20',
            ],

            /*
            |--------------------------------------------------------------------------
            | Role
            |--------------------------------------------------------------------------
            */

            'role' => [
                'nullable',
                'string',
                'exists:roles,name',
            ],

            /*
            |--------------------------------------------------------------------------
            | Password
            |--------------------------------------------------------------------------
            */

            'password' => [
                'required',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Normalize Reporting Manager Flag
        |--------------------------------------------------------------------------
        */

        $canBeReportingManager =
            $request->boolean(
                'can_be_reporting_manager'
            );

        /*
        |--------------------------------------------------------------------------
        | Validate Reporting Manager
        |--------------------------------------------------------------------------
        |
        | The selected manager must:
        |
        | 1. Exist
        | 2. Be active
        | 3. Explicitly be marked as a reporting manager/head
        |
        */

        if (!empty($validated['reports_to_user_id'])) {
            $manager = User::query()
                ->reportingManagers()
                ->whereKey(
                    $validated['reports_to_user_id']
                )
                ->first();

            if (!$manager) {
                return back()
                    ->withErrors([
                        'reports_to_user_id' =>
                            'The selected user is not authorized to be a reporting manager or head.',
                    ])
                    ->withInput();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Create User
        |--------------------------------------------------------------------------
        */

        $user = DB::transaction(
            function () use (
                $validated,
                $canBeReportingManager
            ) {
                $user = User::create([
                    'username' =>
                        $validated['username'],

                    'employee_number' =>
                        $validated['employee_number'] ?? null,

                    'name' =>
                        $validated['name'],

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

                    /*
                    |--------------------------------------------------------------------------
                    | Reporting Structure
                    |--------------------------------------------------------------------------
                    */

                    'reports_to_user_id' =>
                        $validated['reports_to_user_id'] ?? null,

                    'can_be_reporting_manager' =>
                        $canBeReportingManager,

                    /*
                    |--------------------------------------------------------------------------
                    | Account
                    |--------------------------------------------------------------------------
                    */

                    'account_status' =>
                        $validated['account_status'],

                    'password' =>
                        Hash::make(
                            $validated['password']
                        ),

                    'password_changed_at' =>
                        now(),

                    'must_change_password' =>
                        false,
                ]);

                /*
                |--------------------------------------------------------------------------
                | Assign Role
                |--------------------------------------------------------------------------
                */

                if (!empty($validated['role'])) {
                    $user->assignRole(
                        $validated['role']
                    );
                }

                return $user;
            }
        );

        /*
        |--------------------------------------------------------------------------
        | Audit
        |--------------------------------------------------------------------------
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

                'organizational_unit_id' => [
                    'old' => null,
                    'new' => $user->organizational_unit_id,
                ],

                'position_id' => [
                    'old' => null,
                    'new' => $user->position_id,
                ],

                'reports_to_user_id' => [
                    'old' => null,
                    'new' => $user->reports_to_user_id,
                ],

                'can_be_reporting_manager' => [
                    'old' => null,
                    'new' => $user->can_be_reporting_manager,
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
                'User created successfully.'
            );
    }

    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
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
            'password' =>
                Hash::make(
                    $temporaryPassword
                ),

            'password_changed_at' =>
                now(),

            'must_change_password' =>
                true,
        ]);

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

        return back()->with([
            'success' =>
                'Password reset successfully.',

            'temporaryPassword' =>
                $temporaryPassword,
        ]);
    }

    /*
    |--------------------------------------------------------------------------
    | UPDATE USER
    |--------------------------------------------------------------------------
    */

    public function update(
        Request $request,
        User $user
    ) {
        /*
        |--------------------------------------------------------------------------
        | Validate Request
        |--------------------------------------------------------------------------
        */

        $validated = $request->validate([
            /*
            |--------------------------------------------------------------------------
            | Account
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Personal Information
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Organization
            |--------------------------------------------------------------------------
            */

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

            /*
            |--------------------------------------------------------------------------
            | Reporting Structure
            |--------------------------------------------------------------------------
            */

            'reports_to_user_id' => [
                'nullable',
                'integer',
                'exists:users,id',
                Rule::notIn([$user->id]),
            ],

            'can_be_reporting_manager' => [
                'sometimes',
                'boolean',
            ],

            /*
            |--------------------------------------------------------------------------
            | Account Status
            |--------------------------------------------------------------------------
            */

            'account_status' => [
                'required',
                'string',
                'max:20',
            ],

            /*
            |--------------------------------------------------------------------------
            | Role
            |--------------------------------------------------------------------------
            */

            'role' => [
                'nullable',
                'string',
                'exists:roles,name',
            ],

            /*
            |--------------------------------------------------------------------------
            | Password
            |--------------------------------------------------------------------------
            */

            'password' => [
                'nullable',
                'string',
                'min:8',
                'confirmed',
            ],
        ]);

        /*
        |--------------------------------------------------------------------------
        | Normalize Reporting Manager Flag
        |--------------------------------------------------------------------------
        */

        $canBeReportingManager =
            $request->boolean(
                'can_be_reporting_manager'
            );

        /*
        |--------------------------------------------------------------------------
        | Resolve Reporting Manager
        |--------------------------------------------------------------------------
        |
        | A reporting manager must:
        |
        | 1. Be active
        | 2. Have can_be_reporting_manager = true
        | 3. Not be the current user
        |
        */

        $manager = null;

        if (
            array_key_exists(
                'reports_to_user_id',
                $validated
            ) &&
            filled(
                $validated['reports_to_user_id']
            )
        ) {
            $manager = User::query()
                ->reportingManagers()
                ->whereKey(
                    $validated['reports_to_user_id']
                )
                ->whereKeyNot(
                    $user->id
                )
                ->first();

            if (!$manager) {
                return back()
                    ->withErrors([
                        'reports_to_user_id' =>
                            'The selected user is not authorized to be a reporting manager or head.',
                    ])
                    ->withInput();
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent Invalid Reporting Structure
        |--------------------------------------------------------------------------
        |
        | A user who is inactive should not retain a reporting manager.
        |
        */

        if (
            $validated['account_status'] !== 'active' &&
            !empty($validated['reports_to_user_id'])
        ) {
            return back()
                ->withErrors([
                    'reports_to_user_id' =>
                        'Inactive users cannot be assigned to a reporting manager.',
                ])
                ->withInput();
        }

        /*
        |--------------------------------------------------------------------------
        | Update User
        |--------------------------------------------------------------------------
        */

        DB::transaction(function () use (
            $user,
            $validated,
            $canBeReportingManager
        ) {
            $oldValues = [
                'username' =>
                    $user->username,

                'employee_number' =>
                    $user->employee_number,

                'name' =>
                    $user->name,

                'email' =>
                    $user->email,

                'organizational_unit_id' =>
                    $user->organizational_unit_id,

                'position_id' =>
                    $user->position_id,

                'reports_to_user_id' =>
                    $user->reports_to_user_id,

                'can_be_reporting_manager' =>
                    $user->can_be_reporting_manager,

                'account_status' =>
                    $user->account_status,
            ];

            /*
            |--------------------------------------------------------------------------
            | Basic User Information
            |--------------------------------------------------------------------------
            */

            $user->username =
                $validated['username'];

            $user->employee_number =
                $validated['employee_number'] ?? null;

            $user->name =
                $validated['name'];

            $user->first_name =
                $validated['first_name'] ?? null;

            $user->middle_name =
                $validated['middle_name'] ?? null;

            $user->last_name =
                $validated['last_name'] ?? null;

            $user->contact_number =
                $validated['contact_number'] ?? null;

            $user->email =
                $validated['email'] ?? null;

            /*
            |--------------------------------------------------------------------------
            | Organization
            |--------------------------------------------------------------------------
            */

            $user->organizational_unit_id =
                $validated['organizational_unit_id'] ?? null;

            $user->position_id =
                $validated['position_id'] ?? null;

            /*
            |--------------------------------------------------------------------------
            | Reporting Structure
            |--------------------------------------------------------------------------
            */

            $user->reports_to_user_id =
                $validated['reports_to_user_id'] ?? null;

            $user->can_be_reporting_manager =
                $canBeReportingManager;

            /*
            |--------------------------------------------------------------------------
            | Account
            |--------------------------------------------------------------------------
            */

            $user->account_status =
                $validated['account_status'];

            /*
            |--------------------------------------------------------------------------
            | Password
            |--------------------------------------------------------------------------
            */

            if (
                !empty(
                    $validated['password']
                )
            ) {
                $user->password =
                    Hash::make(
                        $validated['password']
                    );

                $user->password_changed_at =
                    now();

                $user->must_change_password =
                    false;
            }

            $user->save();

            /*
            |--------------------------------------------------------------------------
            | Role
            |--------------------------------------------------------------------------
            */

            if (
                array_key_exists(
                    'role',
                    $validated
                )
            ) {
                $user->syncRoles(
                    $validated['role']
                        ? [$validated['role']]
                        : []
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Audit
            |--------------------------------------------------------------------------
            */

            $newValues = [
                'username' =>
                    $user->username,

                'employee_number' =>
                    $user->employee_number,

                'name' =>
                    $user->name,

                'email' =>
                    $user->email,

                'organizational_unit_id' =>
                    $user->organizational_unit_id,

                'position_id' =>
                    $user->position_id,

                'reports_to_user_id' =>
                    $user->reports_to_user_id,

                'can_be_reporting_manager' =>
                    $user->can_be_reporting_manager,

                'account_status' =>
                    $user->account_status,
            ];

            $changes = [];

            foreach ($newValues as $field => $newValue) {
                if (
                    $oldValues[$field] !==
                    $newValue
                ) {
                    $changes[$field] = [
                        'old' =>
                            $oldValues[$field],

                        'new' =>
                            $newValue,
                    ];
                }
            }

            if (
                array_key_exists(
                    'role',
                    $validated
                )
            ) {
                $changes['role'] = [
                    'new' =>
                        $validated['role'] ?? null,
                ];
            }

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
        });

        return redirect()
            ->route(
                'admin.users.show',
                $user
            )
            ->with(
                'success',
                'User updated successfully.'
            );
    }
}