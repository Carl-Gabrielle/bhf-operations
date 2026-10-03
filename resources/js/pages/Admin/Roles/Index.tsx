import { FormEvent, useMemo, useState } from 'react';
import { Head, router } from '@inertiajs/react';

import {
    Check,
    ChevronRight,
    Lock,
    Shield,
    ShieldCheck,
    Users,
    X,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';

import { Badge } from '@/components/ui/badge';

import { Checkbox } from '@/components/ui/checkbox';

import { Separator } from '@/components/ui/separator';

import { toast } from 'sonner';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Permission = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
    users_count: number;
    permissions: Permission[];
};

type Props = {
    roles: Role[];
    permissions: Permission[];
};

/*
|--------------------------------------------------------------------------
| Permission Configuration
|--------------------------------------------------------------------------
|
| These labels are what administrators see.
|
| The actual Spatie permission names remain hidden.
|
|--------------------------------------------------------------------------
*/

type PermissionDefinition = {
    key: string;
    label: string;
};

type PermissionModule = {
    key: string;
    label: string;
    description: string;
    permissions: PermissionDefinition[];
};

const permissionModules: PermissionModule[] = [
    {
        key: 'employees',
        label: 'Employees',
        description: 'Employee records and workforce information.',
        permissions: [
            {
                key: 'employees.view',
                label: 'View',
            },
            {
                key: 'employees.create',
                label: 'Create',
            },
            {
                key: 'employees.edit',
                label: 'Edit',
            },
            {
                key: 'employees.delete',
                label: 'Delete',
            },
        ],
    },

    {
        key: 'leave',
        label: 'Leave Management',
        description: 'Employee leave applications and approvals.',
        permissions: [
            {
                key: 'leave.view',
                label: 'View',
            },
            {
                key: 'leave.create',
                label: 'Create',
            },
            {
                key: 'leave.edit',
                label: 'Edit',
            },
            {
                key: 'leave.delete',
                label: 'Delete',
            },
            {
                key: 'leave.approve',
                label: 'Approve',
            },
        ],
    },

    {
        key: 'overtime',
        label: 'Overtime',
        description: 'Overtime requests and approval workflows.',
        permissions: [
            {
                key: 'overtime.view',
                label: 'View',
            },
            {
                key: 'overtime.create',
                label: 'Create',
            },
            {
                key: 'overtime.edit',
                label: 'Edit',
            },
            {
                key: 'overtime.delete',
                label: 'Delete',
            },
            {
                key: 'overtime.approve',
                label: 'Approve',
            },
        ],
    },

    {
        key: 'undertime',
        label: 'Undertime',
        description: 'Undertime requests and approval workflows.',
        permissions: [
            {
                key: 'undertime.view',
                label: 'View',
            },
            {
                key: 'undertime.create',
                label: 'Create',
            },
            {
                key: 'undertime.edit',
                label: 'Edit',
            },
            {
                key: 'undertime.delete',
                label: 'Delete',
            },
            {
                key: 'undertime.approve',
                label: 'Approve',
            },
        ],
    },

    {
        key: 'travel',
        label: 'Travel Orders',
        description: 'Official travel requests and approvals.',
        permissions: [
            {
                key: 'travel.view',
                label: 'View',
            },
            {
                key: 'travel.create',
                label: 'Create',
            },
            {
                key: 'travel.edit',
                label: 'Edit',
            },
            {
                key: 'travel.delete',
                label: 'Delete',
            },
            {
                key: 'travel.approve',
                label: 'Approve',
            },
        ],
    },

    {
        key: 'reports',
        label: 'Reports',
        description: 'Operational and management reports.',
        permissions: [
            {
                key: 'reports.view',
                label: 'View',
            },
        ],
    },

    {
        key: 'users',
        label: 'User Management',
        description: 'System accounts and access administration.',
        permissions: [
            {
                key: 'users.view',
                label: 'View',
            },
            {
                key: 'users.create',
                label: 'Create',
            },
            {
                key: 'users.edit',
                label: 'Edit',
            },
            {
                key: 'users.delete',
                label: 'Delete',
            },
            {
                key: 'users.manage-roles',
                label: 'Manage Roles',
            },
            {
                key: 'users.reset-password',
                label: 'Reset Password',
            },
        ],
    },
];

/*
|--------------------------------------------------------------------------
| Protected Roles
|--------------------------------------------------------------------------
*/

const protectedRoles = [
    'admin',
    'coo',
    'hr',
    'employee',
];

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function roleLabel(name: string) {
    const labels: Record<string, string> = {
        admin: 'Administrator',
        coo: 'Chief Operating Officer',
        hr: 'Human Resources',
        employee: 'Employee',
    };

    return labels[name.toLowerCase()] ?? name;
}

function roleDescription(name: string) {
    const descriptions: Record<string, string> = {
        admin: 'Full system administration and access control.',
        coo: 'Operational oversight, approvals and reporting.',
        hr: 'Human resources and employee management.',
        employee: 'Standard employee access and request management.',
    };

    return (
        descriptions[name.toLowerCase()] ??
        'Custom organizational access role.'
    );
}

function roleInitial(name: string) {
    return name.charAt(0).toUpperCase();
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function Index({
    roles,
    permissions,
}: Props) {
    const [selectedRole, setSelectedRole] =
        useState<Role | null>(null);

    const [selectedPermissions, setSelectedPermissions] =
        useState<string[]>([]);

    const [roleName, setRoleName] = useState('');

    const [saving, setSaving] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Permission Lookup
    |--------------------------------------------------------------------------
    */

    const permissionLookup = useMemo(() => {
        return new Map(
            permissions.map((permission) => [
                permission.name,
                permission,
            ]),
        );
    }, [permissions]);

    /*
    |--------------------------------------------------------------------------
    | Open Role Editor
    |--------------------------------------------------------------------------
    */

    const openRoleEditor = (role: Role) => {
        setSelectedRole(role);

        setRoleName(role.name);

        setSelectedPermissions(
            role.permissions.map(
                (permission) => permission.name,
            ),
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Close Editor
    |--------------------------------------------------------------------------
    */

    const closeRoleEditor = () => {
        if (saving) {
            return;
        }

        setSelectedRole(null);
        setSelectedPermissions([]);
        setRoleName('');
    };

    /*
    |--------------------------------------------------------------------------
    | Toggle Permission
    |--------------------------------------------------------------------------
    */

    const togglePermission = (
        permission: string,
        checked: boolean,
    ) => {
        setSelectedPermissions((current) => {
            if (checked) {
                if (current.includes(permission)) {
                    return current;
                }

                return [
                    ...current,
                    permission,
                ];
            }

            return current.filter(
                (item) =>
                    item !== permission,
            );
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Module Helpers
    |--------------------------------------------------------------------------
    */

    const moduleHasPermission = (
        module: PermissionModule,
    ) => {
        return module.permissions.some(
            (permission) =>
                selectedPermissions.includes(
                    permission.key,
                ),
        );
    };

    const modulePermissionCount = (
        module: PermissionModule,
    ) => {
        return module.permissions.filter(
            (permission) =>
                selectedPermissions.includes(
                    permission.key,
                ),
        ).length;
    };

    /*
    |--------------------------------------------------------------------------
    | Select Entire Module
    |--------------------------------------------------------------------------
    */

    const toggleModule = (
        module: PermissionModule,
    ) => {
        const modulePermissions =
            module.permissions.map(
                (permission) =>
                    permission.key,
            );

        const allSelected =
            modulePermissions.every(
                (permission) =>
                    selectedPermissions.includes(
                        permission,
                    ),
            );

        if (allSelected) {
            setSelectedPermissions(
                (current) =>
                    current.filter(
                        (permission) =>
                            !modulePermissions.includes(
                                permission,
                            ),
                    ),
            );

            return;
        }

        setSelectedPermissions((current) => {
            const merged = new Set([
                ...current,
                ...modulePermissions,
            ]);

            return Array.from(merged);
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Save Role
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        if (!selectedRole) {
            return;
        }

        setSaving(true);

        /*
        |----------------------------------------------------------------------
        | Send permission names to Laravel.
        |----------------------------------------------------------------------
        */

        router.put(
            `/admin/roles/${selectedRole.id}`,
            {
                name: roleName,
                permissions: selectedPermissions
                    .map(
                        (name) =>
                            permissionLookup.get(
                                name,
                            )?.id,
                    )
                    .filter(
                        (
                            id,
                        ): id is number =>
                            typeof id ===
                            'number',
                    ),
            },
            {
                preserveScroll: true,

                onSuccess: () => {
                    toast.success(
                        'Role access updated',
                        {
                            description: `${roleLabel(
                                roleName,
                            )} permissions were updated successfully.`,
                        },
                    );

                    closeRoleEditor();
                },

                onError: () => {
                    toast.error(
                        'Unable to update role',
                        {
                            description:
                                'Please review the form and try again.',
                        },
                    );
                },

                onFinish: () => {
                    setSaving(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Roles & Permissions" />

            <div className="min-h-full bg-[#F6F8FB]">
                {/* ========================================================= */}
                {/* PAGE HEADER                                                */}
                {/* ========================================================= */}

                <div className="border-b border-slate-200 bg-white">
                    <div className="mx-auto max-w-[1500px] px-6 py-7 lg:px-8">
                        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#4389BC]">
                                    <ShieldCheck className="size-4" />

                                    <span>
                                        Access Control
                                    </span>
                                </div>

                                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                                    Roles & Permissions
                                </h1>

                                <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                                    Manage organizational roles
                                    and control which areas of
                                    the system each role can
                                    access.
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-[#EEF5FA]">
                                            <Shield className="size-4 text-[#4389BC]" />
                                        </div>

                                        <div>
                                            <p className="text-lg font-semibold leading-none text-slate-900">
                                                {
                                                    roles.length
                                                }
                                            </p>

                                            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Roles
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-lg bg-slate-100">
                                            <Lock className="size-4 text-slate-600" />
                                        </div>

                                        <div>
                                            <p className="text-lg font-semibold leading-none text-slate-900">
                                                {
                                                    permissions.length
                                                }
                                            </p>

                                            <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                                                Capabilities
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ========================================================= */}
                {/* CONTENT                                                    */}
                {/* ========================================================= */}

                <main className="mx-auto max-w-[1500px] px-6 py-7 lg:px-8">
                    <div className="mb-5">
                        <h2 className="text-sm font-semibold text-slate-900">
                            Organizational Roles
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Select a role to manage its system
                            access.
                        </p>
                    </div>

                    {/* ===================================================== */}
                    {/* ROLE CARDS                                             */}
                    {/* ===================================================== */}

                    <div className="grid gap-4 xl:grid-cols-2">
                        {roles.map((role) => {
                            const isProtected =
                                protectedRoles.includes(
                                    role.name.toLowerCase(),
                                );

                            const permissionCount =
                                role.permissions.length;

                            const moduleCount =
                                permissionModules.filter(
                                    (module) =>
                                        module.permissions.some(
                                            (
                                                permission,
                                            ) =>
                                                role.permissions.some(
                                                    (
                                                        assigned,
                                                    ) =>
                                                        assigned.name ===
                                                        permission.key,
                                                ),
                                        ),
                                ).length;

                            return (
                                <div
                                    key={role.id}
                                    className="
                                        group
                                        overflow-hidden
                                        rounded-2xl
                                        border
                                        border-slate-200
                                        bg-white
                                        shadow-[0_1px_2px_rgba(15,23,42,0.04)]
                                        transition
                                        duration-200
                                        hover:border-slate-300
                                        hover:shadow-[0_8px_30px_rgba(15,23,42,0.06)]
                                    "
                                >
                                    <div className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex min-w-0 items-center gap-4">
                                                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FA] text-base font-bold text-[#28658F]">
                                                    {roleInitial(
                                                        role.name,
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="truncate text-[15px] font-semibold text-slate-900">
                                                            {roleLabel(
                                                                role.name,
                                                            )}
                                                        </h3>

                                                        {isProtected && (
                                                            <Badge
                                                                variant="secondary"
                                                                className="gap-1 rounded-full border-0 bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500"
                                                            >
                                                                <Lock className="size-2.5" />

                                                                System
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
                                                        {roleDescription(
                                                            role.name,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    openRoleEditor(
                                                        role,
                                                    )
                                                }
                                                className="size-9 shrink-0 rounded-lg text-slate-400 hover:bg-[#EEF5FA] hover:text-[#28658F]"
                                            >
                                                <ChevronRight className="size-5" />
                                            </Button>
                                        </div>

                                        <Separator className="my-5" />

                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div className="flex items-center gap-6">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <Users className="size-4 text-slate-400" />

                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {
                                                                role.users_count
                                                            }
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        Assigned users
                                                    </p>
                                                </div>

                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <ShieldCheck className="size-4 text-slate-400" />

                                                        <span className="text-sm font-semibold text-slate-800">
                                                            {
                                                                moduleCount
                                                            }
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        Modules
                                                    </p>
                                                </div>

                                                <div>
                                                    <div className="text-sm font-semibold text-slate-800">
                                                        {
                                                            permissionCount
                                                        }
                                                    </div>

                                                    <p className="mt-1 text-[11px] text-slate-400">
                                                        Access rules
                                                    </p>
                                                </div>
                                            </div>

                                            <Button
                                                onClick={() =>
                                                    openRoleEditor(
                                                        role,
                                                    )
                                                }
                                                className=" cursor-pointer h-9 rounded-lg bg-[#4389BC] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#28658F]"
                                            >
                                                Manage Access

                                                <ChevronRight className="ml-1.5 size-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </main>
            </div>

            {/* ============================================================= */}
            {/* ROLE ACCESS DIALOG                                             */}
            {/* ============================================================= */}

            <Dialog
                open={!!selectedRole}
                onOpenChange={(open) => {
                    if (!open) {
                        closeRoleEditor();
                    }
                }}
            >
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-hidden p-0">
                    <form onSubmit={handleSubmit}>
                        {/* ================================================= */}
                        {/* DIALOG HEADER                                      */}
                        {/* ================================================= */}

                        <DialogHeader className="border-b border-slate-200 px-6 py-5">
                            <div className="flex items-start gap-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF5FA] text-sm font-bold text-[#28658F]">
                                    {selectedRole
                                        ? roleInitial(
                                              selectedRole.name,
                                          )
                                        : ''}
                                </div>

                                <div className="min-w-0">
                                    <DialogTitle className="text-lg font-semibold text-slate-900">
                                        Manage Role Access
                                    </DialogTitle>

                                    <DialogDescription className="mt-1 text-sm text-slate-500">
                                        Configure the capabilities
                                        available to this role.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        {/* ================================================= */}
                        {/* ROLE INFORMATION                                  */}
                        {/* ================================================= */}

                        <div className="max-h-[calc(90vh-180px)] overflow-y-auto">
                            <div className="space-y-6 px-6 py-6">
                                <div>
                                    <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Role Name
                                    </label>

                                    <Input
                                        value={roleName}
                                        disabled={
                                            !!selectedRole &&
                                            protectedRoles.includes(
                                                selectedRole.name.toLowerCase(),
                                            )
                                        }
                                        onChange={(event) =>
                                            setRoleName(
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 rounded-lg border-slate-200 bg-white text-sm shadow-none focus-visible:ring-[#4389BC]"
                                    />

                                    {selectedRole &&
                                        protectedRoles.includes(
                                            selectedRole.name.toLowerCase(),
                                        ) && (
                                            <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
                                                <Lock className="size-3" />

                                                System roles cannot
                                                be renamed.
                                            </div>
                                        )}
                                </div>

                                <div>
                                    <div className="mb-4 flex items-end justify-between">
                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                System Access
                                            </h3>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Choose which capabilities
                                                this role can use.
                                            </p>
                                        </div>

                                        <div className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
                                            {
                                                selectedPermissions.length
                                            }{' '}
                                            selected
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        {permissionModules.map(
                                            (module) => {
                                                const selectedCount =
                                                    modulePermissionCount(
                                                        module,
                                                    );

                                                const allSelected =
                                                    selectedCount ===
                                                    module.permissions
                                                        .length;

                                                const partiallySelected =
                                                    selectedCount >
                                                        0 &&
                                                    !allSelected;

                                                return (
                                                    <div
                                                        key={
                                                            module.key
                                                        }
                                                        className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                                    >
                                                        <div className="flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <Checkbox
                                                                    checked={
                                                                        allSelected
                                                                            ? true
                                                                            : partiallySelected
                                                                              ? 'indeterminate'
                                                                              : false
                                                                    }
                                                                    onCheckedChange={() =>
                                                                        toggleModule(
                                                                            module,
                                                                        )
                                                                    }
                                                                    className="data-[state=checked]:border-[#4389BC] data-[state=checked]:bg-[#4389BC]"
                                                                />

                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold text-slate-800">
                                                                        {
                                                                            module.label
                                                                        }
                                                                    </p>

                                                                    <p className="mt-0.5 truncate text-[11px] text-slate-400">
                                                                        {
                                                                            module.description
                                                                        }
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                                                {
                                                                    selectedCount
                                                                }{' '}
                                                                /{' '}
                                                                {
                                                                    module
                                                                        .permissions
                                                                        .length
                                                                }
                                                            </span>
                                                        </div>

                                                        <div className="grid gap-1 p-3 sm:grid-cols-2 lg:grid-cols-3">
                                                            {module.permissions.map(
                                                                (
                                                                    permission,
                                                                ) => {
                                                                    const checked =
                                                                        selectedPermissions.includes(
                                                                            permission.key,
                                                                        );

                                                                    return (
                                                                        <label
                                                                            key={
                                                                                permission.key
                                                                            }
                                                                            className={`
                                                                                flex
                                                                                cursor-pointer
                                                                                items-center
                                                                                gap-3
                                                                                rounded-lg
                                                                                border
                                                                                px-3
                                                                                py-2.5
                                                                                transition
                                                                                ${
                                                                                    checked
                                                                                        ? 'border-[#BBD8E9] bg-[#F3F8FB]'
                                                                                        : 'border-transparent hover:border-slate-200 hover:bg-slate-50'
                                                                                }
                                                                            `}
                                                                        >
                                                                            <Checkbox
                                                                                checked={
                                                                                    checked
                                                                                }
                                                                                onCheckedChange={(
                                                                                    value,
                                                                                ) =>
                                                                                    togglePermission(
                                                                                        permission.key,
                                                                                        value ===
                                                                                            true,
                                                                                    )
                                                                                }
                                                                                className="data-[state=checked]:border-[#4389BC] data-[state=checked]:bg-[#4389BC]"
                                                                            />

                                                                            <span
                                                                                className={`text-xs font-medium ${
                                                                                    checked
                                                                                        ? 'text-[#28658F]'
                                                                                        : 'text-slate-600'
                                                                                }`}
                                                                            >
                                                                                {
                                                                                    permission.label
                                                                                }
                                                                            </span>
                                                                        </label>
                                                                    );
                                                                },
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            },
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ================================================= */}
                        {/* FOOTER                                            */}
                        {/* ================================================= */}

                        <DialogFooter className="border-t border-slate-200 bg-slate-50/70 px-6 py-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeRoleEditor}
                                disabled={saving}
                                className="h-9 rounded-lg border-slate-200 bg-white px-4 text-xs font-semibold"
                            >
                                Cancel
                            </Button>

                            <Button
                                type="submit"
                                disabled={saving}
                                className="h-9 rounded-lg bg-[#4389BC] px-5 text-xs font-semibold text-white hover:bg-[#28658F]"
                            >
                                {saving
                                    ? 'Saving...'
                                    : 'Save Changes'}

                                {!saving && (
                                    <Check className="ml-1.5 size-3.5" />
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}