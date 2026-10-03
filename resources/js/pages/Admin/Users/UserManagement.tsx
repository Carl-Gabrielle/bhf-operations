import { useEffect, useMemo, useRef, useState } from 'react';

import { Link, router } from '@inertiajs/react';

import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';

import {
    ArrowDown,
    ArrowUp,
    ArrowUpDown,
    Building2,
    ChevronLeft,
    ChevronRight,
    Eye,
    Filter,
    Loader2,
    Search,
    SlidersHorizontal,
    UserRound,
    X,
} from 'lucide-react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import type {
    ManagedUser,
    OrganizationalUnit,
    PaginatedUsers,
} from '@/types/auth';

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

interface UserManagementProps {
    users: PaginatedUsers;

    organizationalUnits: OrganizationalUnit[];

    filters?: {
        search?: string;
        status?: string;
        role?: string;
        organization?: string;
        sort?: string;
        direction?: string;
    };
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getInitials(
    name?: string | null,
): string {
    if (!name || !name.trim()) {
        return 'U';
    }

    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) =>
            part.charAt(0),
        )
        .join('')
        .toUpperCase();
}

function formatRole(
    role?: string | null,
): string {
    if (!role) {
        return 'No role';
    }

    return role
        .replace(/[-_]/g, ' ')
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}

function formatStatus(
    status?: string | null,
): string {
    if (!status) {
        return 'Unknown';
    }

    return status
        .replace(/[-_]/g, ' ')
        .replace(
            /\b\w/g,
            (letter) =>
                letter.toUpperCase(),
        );
}

function getStatusClass(
    status?: string | null,
): string {
    switch (
        (status ?? '').toLowerCase()
    ) {
        case 'active':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';

        case 'inactive':
            return 'border-slate-200 bg-slate-50 text-slate-500';

        case 'pending':
            return 'border-amber-200 bg-amber-50 text-amber-700';

        case 'suspended':
            return 'border-red-200 bg-red-50 text-red-700';

        default:
            return 'border-slate-200 bg-slate-50 text-slate-600';
    }
}

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function StatusBadge({
    status,
}: {
    status?: string | null;
}) {
    return (
        <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${getStatusClass(
                status,
            )}`}
        >
            {formatStatus(status)}
        </Badge>
    );
}

/*
|--------------------------------------------------------------------------
| Sort Icon
|--------------------------------------------------------------------------
*/

function SortIcon({
    direction,
}: {
    direction?:
        | false
        | 'asc'
        | 'desc';
}) {
    if (direction === 'asc') {
        return (
            <ArrowUp className="h-3.5 w-3.5" />
        );
    }

    if (direction === 'desc') {
        return (
            <ArrowDown className="h-3.5 w-3.5" />
        );
    }

    return (
        <ArrowUpDown className="h-3.5 w-3.5" />
    );
}

/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function UserManagement({
    users,
    organizationalUnits,
    filters,
}: UserManagementProps) {
    /*
    |--------------------------------------------------------------------------
    | State
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] =
        useState(
            filters?.search ?? '',
        );

    const [status, setStatus] =
        useState(
            filters?.status ?? 'all',
        );

    const [role, setRole] =
        useState(
            filters?.role ?? 'all',
        );

    const [organization, setOrganization] =
        useState(
            filters?.organization ?? 'all',
        );

    /*
    |--------------------------------------------------------------------------
    | Sorting
    |--------------------------------------------------------------------------
    */

    const initialSort =
        filters?.sort ?? 'created_at';

    const initialDirection =
        filters?.direction ?? 'desc';

    const [sorting, setSorting] =
        useState<SortingState>([
            {
                id: initialSort,
                desc:
                    initialDirection ===
                    'desc',
            },
        ]);

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */

    const [isLoading, setIsLoading] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Prevent duplicate initial requests
    |--------------------------------------------------------------------------
    */

    const initialized =
        useRef(false);

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const currentPage =
        users.meta?.current_page ?? 1;

    const lastPage =
        users.meta?.last_page ?? 1;

    const from =
        users.meta?.from ?? 0;

    const to =
        users.meta?.to ?? 0;

    const total =
        users.meta?.total ?? 0;

    const previousUrl =
        users.links?.prev ?? null;

    const nextUrl =
        users.links?.next ?? null;

    /*
    |--------------------------------------------------------------------------
    | Organization options
    |--------------------------------------------------------------------------
    |
    | These come directly from Laravel so all
    | organizations remain available regardless
    | of the current page.
    |
    */

    const organizationOptions =
        useMemo(() => {
            return [
                ...organizationalUnits,
            ].sort((a, b) =>
                a.code.localeCompare(
                    b.code,
                ),
            );
        }, [
            organizationalUnits,
        ]);

    /*
    |--------------------------------------------------------------------------
    | Status options
    |--------------------------------------------------------------------------
    |
    | Keep these static so they don't change
    | depending on the current page.
    |
    */

    const statusOptions = [
        'active',
        'inactive',
        'pending',
        'suspended',
    ];

    /*
    |--------------------------------------------------------------------------
    | Role options
    |--------------------------------------------------------------------------
    |
    | Roles should ideally come from the backend.
    | For now we derive them from loaded users.
    |
    */

    const roleOptions = useMemo(() => {
        const roles =
            users.data.flatMap(
                (user) =>
                    user.roles?.map(
                        (item) =>
                            item.name,
                    ) ?? [],
            );

        return [
            ...new Set(roles),
        ].sort();
    }, [users.data]);

    /*
    |--------------------------------------------------------------------------
    | Server Request
    |--------------------------------------------------------------------------
    */

    const requestUsers = (
        overrides?: {
            search?: string;
            status?: string;
            role?: string;
            organization?: string;
            page?: number;
            sort?: string;
            direction?: string;
        },
    ) => {
        const currentSorting =
            sorting[0];

        const sort =
            overrides?.sort ??
            currentSorting?.id ??
            'created_at';

        const direction =
            overrides?.direction ??
            (currentSorting?.desc
                ? 'desc'
                : 'asc');

        setIsLoading(true);

        router.get(
            '/admin/users',
            {
                search:
                    (
                        overrides?.search ??
                        search
                    ).trim() ||
                    undefined,

                status:
                    (
                        overrides?.status ??
                        status
                    ) !== 'all'
                        ? overrides?.status ??
                          status
                        : undefined,

                role:
                    (
                        overrides?.role ??
                        role
                    ) !== 'all'
                        ? overrides?.role ??
                          role
                        : undefined,

                organization:
                    (
                        overrides?.organization ??
                        organization
                    ) !== 'all'
                        ? overrides?.organization ??
                          organization
                        : undefined,

                sort,

                direction,

                page:
                    overrides?.page ??
                    1,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,

                only: [
                    'users',
                    'filters',
                ],

                onFinish: () => {
                    setIsLoading(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Search Debounce
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!initialized.current) {
            initialized.current = true;
            return;
        }

        const timeout =
            window.setTimeout(() => {
                const currentSearch =
                    filters?.search ?? '';

                if (
                    search.trim() !==
                    currentSearch.trim()
                ) {
                    requestUsers({
                        search,
                        page: 1,
                    });
                }
            }, 300);

        return () =>
            window.clearTimeout(
                timeout,
            );
    }, [search]);

    /*
    |--------------------------------------------------------------------------
    | Status Filter
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!initialized.current) {
            return;
        }

        const currentStatus =
            filters?.status ?? 'all';

        if (
            status !==
            currentStatus
        ) {
            requestUsers({
                status,
                page: 1,
            });
        }
    }, [status]);

    /*
    |--------------------------------------------------------------------------
    | Role Filter
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!initialized.current) {
            return;
        }

        const currentRole =
            filters?.role ?? 'all';

        if (
            role !== currentRole
        ) {
            requestUsers({
                role,
                page: 1,
            });
        }
    }, [role]);

    /*
    |--------------------------------------------------------------------------
    | Organization Filter
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        if (!initialized.current) {
            return;
        }

        const currentOrganization =
            filters?.organization ??
            'all';

        if (
            organization !==
            currentOrganization
        ) {
            requestUsers({
                organization,
                page: 1,
            });
        }
    }, [organization]);

    /*
    |--------------------------------------------------------------------------
    | TanStack Columns
    |--------------------------------------------------------------------------
    */

    const columns =
        useMemo<
            ColumnDef<ManagedUser>[]
        >(
            () => [
                /*
                |--------------------------------------------------------------------------
                | Employee
                |--------------------------------------------------------------------------
                */

                {
                    accessorKey: 'name',

                    header: ({
                        column,
                    }) => (
                        <button
                            type="button"
                            onClick={() => {
                                const nextDirection =
                                    column.getIsSorted() ===
                                    'asc'
                                        ? 'desc'
                                        : 'asc';

                                setSorting([
                                    {
                                        id: 'name',
                                        desc:
                                            nextDirection ===
                                            'desc',
                                    },
                                ]);

                                requestUsers({
                                    sort: 'name',
                                    direction:
                                        nextDirection,
                                    page: 1,
                                });
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                        >
                            Employee

                            <SortIcon
                                direction={
                                    column.getIsSorted()
                                }
                            />
                        </button>
                    ),

                    cell: ({
                        row,
                    }) => {
                        const user =
                            row.original;

                        return (
                            <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 shrink-0">
                                    <AvatarFallback className="bg-[#173B67]/[0.07] text-[11px] font-semibold text-[#173B67]">
                                        {getInitials(
                                            user.name,
                                        )}
                                    </AvatarFallback>
                                </Avatar>

                                <div className="min-w-0">
                                    <p className="truncate text-sm font-semibold text-slate-800">
                                        {user.name ||
                                            'Unnamed User'}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                        {user.employee_number ||
                                            user.username ||
                                            '—'}
                                    </p>
                                </div>
                            </div>
                        );
                    },
                },

                /*
                |--------------------------------------------------------------------------
                | Organization
                |--------------------------------------------------------------------------
                */

                {
                    id: 'organizational_unit',

                    accessorFn: (
                        user,
                    ) =>
                        user
                            .organizational_unit
                            ?.name ??
                        '',

                    header:
                        'Organization',

                    cell: ({
                        row,
                    }) => (
                        <div className="flex items-center gap-2">
                            <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span className="text-sm text-slate-600">
                                {row
                                    .original
                                    .organizational_unit
                                    ?.name ||
                                    '—'}
                            </span>
                        </div>
                    ),
                },

                /*
                |--------------------------------------------------------------------------
                | Position
                |--------------------------------------------------------------------------
                */

                {
                    id: 'position',

                    accessorFn: (
                        user,
                    ) =>
                        user.position
                            ?.name ?? '',

                    header:
                        'Position',

                    cell: ({
                        row,
                    }) => (
                        <span className="text-sm text-slate-600">
                            {row.original
                                .position
                                ?.name ||
                                '—'}
                        </span>
                    ),
                },

                /*
                |--------------------------------------------------------------------------
                | Role
                |--------------------------------------------------------------------------
                */

                {
                    id: 'role',

                    accessorFn: (
                        user,
                    ) =>
                        user.roles?.[0]
                            ?.name ?? '',

                    header: 'Role',

                    cell: ({
                        row,
                    }) => {
                        const primaryRole =
                            row.original
                                .roles?.[0];

                        return primaryRole ? (
                            <Badge
                                variant="outline"
                                className="rounded-md border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-600"
                            >
                                {formatRole(
                                    primaryRole.name,
                                )}
                            </Badge>
                        ) : (
                            <span className="text-xs text-slate-400">
                                No role
                            </span>
                        );
                    },
                },

                /*
                |--------------------------------------------------------------------------
                | Status
                |--------------------------------------------------------------------------
                */

                {
                    accessorKey:
                        'account_status',

                    header: ({
                        column,
                    }) => (
                        <button
                            type="button"
                            onClick={() => {
                                const nextDirection =
                                    column.getIsSorted() ===
                                    'asc'
                                        ? 'desc'
                                        : 'asc';

                                setSorting([
                                    {
                                        id: 'account_status',
                                        desc:
                                            nextDirection ===
                                            'desc',
                                    },
                                ]);

                                requestUsers({
                                    sort: 'account_status',
                                    direction:
                                        nextDirection,
                                    page: 1,
                                });
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                        >
                            Status

                            <SortIcon
                                direction={
                                    column.getIsSorted()
                                }
                            />
                        </button>
                    ),

                    cell: ({
                        row,
                    }) => (
                        <StatusBadge
                            status={
                                row.original
                                    .account_status
                            }
                        />
                    ),
                },

                /*
                |--------------------------------------------------------------------------
                | Created
                |--------------------------------------------------------------------------
                */

                {
                    accessorKey:
                        'created_at',

                    header: ({
                        column,
                    }) => (
                        <button
                            type="button"
                            onClick={() => {
                                const nextDirection =
                                    column.getIsSorted() ===
                                    'asc'
                                        ? 'desc'
                                        : 'asc';

                                setSorting([
                                    {
                                        id: 'created_at',
                                        desc:
                                            nextDirection ===
                                            'desc',
                                    },
                                ]);

                                requestUsers({
                                    sort: 'created_at',
                                    direction:
                                        nextDirection,
                                    page: 1,
                                });
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
                        >
                            Created

                            <SortIcon
                                direction={
                                    column.getIsSorted()
                                }
                            />
                        </button>
                    ),

                    cell: ({
                        row,
                    }) => (
                        <span className="whitespace-nowrap text-sm text-slate-500">
                            {row.original
                                .created_at
                                ? new Date(
                                      row
                                          .original
                                          .created_at,
                                  ).toLocaleDateString(
                                      'en-US',
                                      {
                                          month: 'short',
                                          day: 'numeric',
                                          year: 'numeric',
                                      },
                                  )
                                : '—'}
                        </span>
                    ),
                },

                /*
                |--------------------------------------------------------------------------
                | Actions
                |--------------------------------------------------------------------------
                */

                {
                    id: 'actions',

                    enableSorting:
                        false,

                    header: '',

                    cell: ({
                        row,
                    }) => (
                        <Button
                            asChild
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-[#173B67]"
                        >
                            <Link
                                href={`/admin/users/${row.original.id}`}
                                aria-label={`View ${
                                    row.original
                                        .name ??
                                    'user'
                                }`}
                            >
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                    ),
                },
            ],
            [
                sorting,
                search,
                status,
                role,
                organization,
            ],
        );

    /*
    |--------------------------------------------------------------------------
    | TanStack Table
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | No getPaginationRowModel().
    |
    | Laravel owns pagination.
    |
    */

    const table =
        useReactTable({
            data: users.data,

            columns,

            state: {
                sorting,
            },

            getCoreRowModel:
                getCoreRowModel(),

            manualPagination:
                true,

            manualSorting: true,

            pageCount: lastPage,
        });

    /*
    |--------------------------------------------------------------------------
    | Pagination
    |--------------------------------------------------------------------------
    */

    const goToPage = (
        page: number,
    ) => {
        if (
            page < 1 ||
            page > lastPage ||
            page === currentPage
        ) {
            return;
        }

        requestUsers({
            page,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Clear Filters
    |--------------------------------------------------------------------------
    */

    const clearFilters =
        () => {
            setSearch('');
            setStatus('all');
            setRole('all');
            setOrganization(
                'all',
            );

            requestUsers({
                search: '',
                status: 'all',
                role: 'all',
                organization:
                    'all',
                page: 1,
            });
        };

    /*
    |--------------------------------------------------------------------------
    | Filter State
    |--------------------------------------------------------------------------
    */

    const hasFilters =
        search.trim() !== '' ||
        status !== 'all' ||
        role !== 'all' ||
        organization !==
            'all';

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-full bg-slate-50 text-slate-900">
            <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div className="space-y-6">

                    {/* Header */}

                    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                                <span>
                                    Administration
                                </span>

                                <span className="text-slate-300">
                                    /
                                </span>

                                <span>
                                    User Management
                                </span>
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                                User Management
                            </h1>

                            <p className="mt-1.5 text-sm text-slate-500">
                                Manage employee accounts,
                                organizational assignments,
                                roles, and system access.
                            </p>
                        </div>

                        <Button
                            asChild
                            type="button"
                            className="h-10 rounded-lg bg-[#173B67] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#123052]"
                        >
                            <Link href="/admin/users/create">
                                Add User
                            </Link>
                        </Button>
                    </header>

                    {/* Filters */}

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

                            {/* Search */}

                            <div className="relative min-w-0 flex-1 xl:max-w-xl">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <Input
                                    value={search}
                                    onChange={(
                                        event,
                                    ) =>
                                        setSearch(
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    placeholder="Search employees..."
                                    className="h-10 rounded-lg border-slate-200 bg-white pl-10 pr-16 text-sm shadow-none focus-visible:border-[#173B67] focus-visible:ring-[#173B67]/20"
                                />

                                {isLoading && (
                                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-[#173B67]" />
                                )}

                                {!isLoading &&
                                    search && (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSearch(
                                                    '',
                                                )
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-700"
                                        >
                                            Clear
                                        </button>
                                    )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">

                                {/* Status */}

                                <Select
                                    value={
                                        status
                                    }
                                    onValueChange={
                                        setStatus
                                    }
                                >
                                    <SelectTrigger className="h-10 w-[145px] rounded-lg border-slate-200 bg-white text-sm shadow-none">
                                        <Filter className="mr-2 h-3.5 w-3.5 text-slate-400" />

                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">
                                            All statuses
                                        </SelectItem>

                                        {statusOptions.map(
                                            (
                                                item,
                                            ) => (
                                                <SelectItem
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {formatStatus(
                                                        item,
                                                    )}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Role */}

                                <Select
                                    value={role}
                                    onValueChange={
                                        setRole
                                    }
                                >
                                    <SelectTrigger className="h-10 w-[145px] rounded-lg border-slate-200 bg-white text-sm shadow-none">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">
                                            All roles
                                        </SelectItem>

                                        {roleOptions.map(
                                            (
                                                item,
                                            ) => (
                                                <SelectItem
                                                    key={
                                                        item
                                                    }
                                                    value={
                                                        item
                                                    }
                                                >
                                                    {formatRole(
                                                        item,
                                                    )}
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Organization */}

                                <Select
                                    value={
                                        organization
                                    }
                                    onValueChange={
                                        setOrganization
                                    }
                                >
                                    <SelectTrigger className="h-10 w-[185px] rounded-lg border-slate-200 bg-white text-sm shadow-none">
                                        <SelectValue placeholder="Organization" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">
                                            All organizations
                                        </SelectItem>

                                        {organizationOptions.map(
                                            (
                                                org,
                                            ) => (
                                                <SelectItem
                                                    key={
                                                        org.id
                                                    }
                                                    value={String(
                                                        org.id,
                                                    )}
                                                >
                                                    {
                                                        org.code
                                                    }{' '}
                                                    —{' '}
                                                    {
                                                        org.name
                                                    }
                                                </SelectItem>
                                            ),
                                        )}
                                    </SelectContent>
                                </Select>

                                {/* Clear */}

                                {hasFilters && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={
                                            clearFilters
                                        }
                                        className="h-10 gap-1.5 rounded-lg px-3 text-sm text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                    >
                                        <X className="h-3.5 w-3.5" />

                                        Clear
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Summary */}

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <SlidersHorizontal className="h-3.5 w-3.5" />

                                {hasFilters
                                    ? 'Filtered results'
                                    : 'All employee accounts'}
                            </div>

                            <div className="text-sm text-slate-400">
                                <span className="font-semibold text-slate-700">
                                    {total}
                                </span>{' '}
                                {total ===
                                1
                                    ? 'user'
                                    : 'users'}
                            </div>
                        </div>
                    </section>

                    {/* Table */}

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    {table
                                        .getHeaderGroups()
                                        .map(
                                            (
                                                headerGroup,
                                            ) => (
                                                <TableRow
                                                    key={
                                                        headerGroup.id
                                                    }
                                                    className="border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70"
                                                >
                                                    {headerGroup.headers.map(
                                                        (
                                                            header,
                                                        ) => (
                                                            <TableHead
                                                                key={
                                                                    header.id
                                                                }
                                                                className="h-11 whitespace-nowrap px-5 text-xs font-semibold text-slate-500"
                                                            >
                                                                {header.isPlaceholder
                                                                    ? null
                                                                    : flexRender(
                                                                          header
                                                                              .column
                                                                              .columnDef
                                                                              .header,
                                                                          header.getContext(),
                                                                      )}
                                                            </TableHead>
                                                        ),
                                                    )}
                                                </TableRow>
                                            ),
                                        )}
                                </TableHeader>

                                <TableBody>
                                    {isLoading ? (
                                        <TableRow>
                                            <TableCell
                                                colSpan={
                                                    columns.length
                                                }
                                                className="h-48 text-center"
                                            >
                                                <div className="flex items-center justify-center gap-2 text-sm text-slate-400">
                                                    <Loader2 className="h-4 w-4 animate-spin" />

                                                    Loading users...
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : table
                                        .getRowModel()
                                        .rows
                                        .length >
                                      0 ? (
                                        table
                                            .getRowModel()
                                            .rows
                                            .map(
                                                (
                                                    row,
                                                ) => (
                                                    <TableRow
                                                        key={
                                                            row.id
                                                        }
                                                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/60"
                                                    >
                                                        {row
                                                            .getVisibleCells()
                                                            .map(
                                                                (
                                                                    cell,
                                                                ) => (
                                                                    <TableCell
                                                                        key={
                                                                            cell.id
                                                                        }
                                                                        className="px-5 py-4"
                                                                    >
                                                                        {flexRender(
                                                                            cell
                                                                                .column
                                                                                .columnDef
                                                                                .cell,
                                                                            cell.getContext(),
                                                                        )}
                                                                    </TableCell>
                                                                ),
                                                            )}
                                                    </TableRow>
                                                ),
                                            )
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={
                                                    columns.length
                                                }
                                                className="h-52 text-center"
                                            >
                                                <div className="flex flex-col items-center justify-center">
                                                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-50">
                                                        <UserRound className="h-5 w-5 text-slate-400" />
                                                    </div>

                                                    <p className="text-sm font-medium text-slate-700">
                                                        No users found
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        Try adjusting
                                                        your search or
                                                        filters.
                                                    </p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}

                        {total >
                            0 && (
                            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">

                                <p className="text-xs text-slate-400">
                                    Showing{' '}
                                    <span className="font-medium text-slate-600">
                                        {from}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-slate-600">
                                        {to}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-slate-600">
                                        {total}
                                    </span>{' '}
                                    users
                                </p>

                                <div className="flex items-center gap-1">

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={
                                            !previousUrl ||
                                            isLoading
                                        }
                                        onClick={() =>
                                            goToPage(
                                                currentPage -
                                                    1,
                                            )
                                        }
                                        className="h-8 w-8 rounded-md border-slate-200"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="flex h-8 min-w-8 items-center justify-center rounded-md bg-[#173B67] px-2 text-xs font-medium text-white">
                                        {currentPage}
                                    </div>

                                    <span className="px-1 text-xs text-slate-400">
                                        of{' '}
                                        {
                                            lastPage
                                        }
                                    </span>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={
                                            !nextUrl ||
                                            isLoading
                                        }
                                        onClick={() =>
                                            goToPage(
                                                currentPage +
                                                    1,
                                            )
                                        }
                                        className="h-8 w-8 rounded-md border-slate-200"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}