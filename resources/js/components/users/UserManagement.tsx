import { useEffect, useMemo, useState } from 'react';

import { Link } from '@inertiajs/react';

import {
    type ColumnDef,
    type SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
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
| Types
|--------------------------------------------------------------------------
*/

interface UserManagementProps {
    users: PaginatedUsers;

    organizationalUnits: OrganizationalUnit[];

    filters?: {
        search?: string;
    };
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getInitials(name: string): string {
    return name
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part.charAt(0))
        .join('')
        .toUpperCase();
}

function formatRole(role: string): string {
    if (!role) {
        return 'No role';
    }

    return role
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function formatStatus(status: string): string {
    if (!status) {
        return 'Unknown';
    }

    return status
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
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
    status: string;
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
    direction?: false | 'asc' | 'desc';
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
| User Management
|--------------------------------------------------------------------------
*/

export default function UserManagement({
    users,
    organizationalUnits,
    filters,
}: UserManagementProps) {
    /*
    |--------------------------------------------------------------------------
    | Local state
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState(
        filters?.search ?? '',
    );

    const [status, setStatus] = useState('all');

    const [role, setRole] = useState('all');

    const [organization, setOrganization] =
        useState('all');

    const [sorting, setSorting] =
        useState<SortingState>([
            {
                id: 'created_at',
                desc: true,
            },
        ]);

    /*
    |--------------------------------------------------------------------------
    | Filter options
    |--------------------------------------------------------------------------
    */

    /*
     * Statuses are based on actual user accounts.
     */
    const statusOptions = useMemo(() => {
        const statuses = users.data
            .map((user) => user.account_status)
            .filter(Boolean);

        return [...new Set(statuses)].sort();
    }, [users.data]);

    /*
     * Roles are based on actual roles assigned
     * to users.
     */
    const roleOptions = useMemo(() => {
        const roles = users.data.flatMap(
            (user) =>
                user.roles?.map(
                    (item) => item.name,
                ) ?? [],
        );

        return [...new Set(roles)].sort();
    }, [users.data]);

    /*
     * Organizations come directly from the
     * organizational_units table through Laravel.
     *
     * This means organizations with zero users
     * will still appear in the dropdown.
     */
   const organizationOptions = useMemo(() => {
    return [...organizationalUnits].sort(
        (a, b) => a.code.localeCompare(b.code),
    );
}, [organizationalUnits]);

    /*
    |--------------------------------------------------------------------------
    | Search + dropdown filtering
    |--------------------------------------------------------------------------
    */

    const filteredUsers = useMemo(() => {
        return users.data.filter((user) => {
            const matchesStatus =
                status === 'all' ||
                user.account_status === status;

            const matchesRole =
                role === 'all' ||
                user.roles?.some(
                    (item) => item.name === role,
                );

            const matchesOrganization =
                organization === 'all' ||
                String(
                    user.organizational_unit?.id ?? '',
                ) === organization;

            return (
                matchesStatus &&
                matchesRole &&
                matchesOrganization
            );
        });
    }, [
        users.data,
        status,
        role,
        organization,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Columns
    |--------------------------------------------------------------------------
    */

    const columns =
        useMemo<ColumnDef<ManagedUser>[]>(
            () => [
                {
                    accessorKey: 'name',

                    header: ({ column }) => (
                        <button
                            type="button"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() ===
                                        'asc',
                                )
                            }
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                        >
                            Employee

                            <SortIcon
                                direction={column.getIsSorted()}
                            />
                        </button>
                    ),

                    cell: ({ row }) => {
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
                                        {user.name}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                        {user.employee_number ||
                                            user.username}
                                    </p>
                                </div>
                            </div>
                        );
                    },
                },

                {
                    id: 'organizational_unit',

                    accessorFn: (user) =>
                        user
                            .organizational_unit
                            ?.name ?? '',

                    header: 'Organization',

                    cell: ({ row }) => {
                        const organization =
                            row.original
                                .organizational_unit
                                ?.name;

                        return (
                            <div className="flex items-center gap-2">
                                <Building2 className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                <span className="text-sm text-slate-600">
                                    {organization ||
                                        '—'}
                                </span>
                            </div>
                        );
                    },
                },

                {
                    id: 'position',

                    accessorFn: (user) =>
                        user.position?.name ?? '',

                    header: 'Position',

                    cell: ({ row }) => (
                        <span className="text-sm text-slate-600">
                            {row.original.position
                                ?.name || '—'}
                        </span>
                    ),
                },

                {
                    id: 'role',

                    accessorFn: (user) =>
                        user.roles?.[0]?.name ?? '',

                    header: 'Role',

                    cell: ({ row }) => {
                        const primaryRole =
                            row.original.roles?.[0];

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

                {
                    accessorKey:
                        'account_status',

                    header: ({ column }) => (
                        <button
                            type="button"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() ===
                                        'asc',
                                )
                            }
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                        >
                            Status

                            <SortIcon
                                direction={column.getIsSorted()}
                            />
                        </button>
                    ),

                    cell: ({ row }) => (
                        <StatusBadge
                            status={
                                row.original
                                    .account_status
                            }
                        />
                    ),
                },

                {
                    accessorKey:
                        'created_at',

                    header: ({ column }) => (
                        <button
                            type="button"
                            onClick={() =>
                                column.toggleSorting(
                                    column.getIsSorted() ===
                                        'asc',
                                )
                            }
                            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-slate-900"
                        >
                            Created

                            <SortIcon
                                direction={column.getIsSorted()}
                            />
                        </button>
                    ),

                    cell: ({ row }) => (
                        <span className="whitespace-nowrap text-sm text-slate-500">
                            {row.original.created_at
                                ? new Date(
                                      row.original.created_at,
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

                {
                    id: 'actions',

                    enableSorting: false,

                    header: '',

                    cell: ({ row }) => (
                        <Button
                            asChild
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-[#173B67]"
                        >
                            <Link
                                href={`/admin/users/${row.original.id}`}
                                aria-label={`View ${row.original.name}`}
                            >
                                <Eye className="h-4 w-4" />
                            </Link>
                        </Button>
                    ),
                },
            ],
            [],
        );

    /*
    |--------------------------------------------------------------------------
    | TanStack Table
    |--------------------------------------------------------------------------
    */

    const table = useReactTable({
        data: filteredUsers,

        columns,

        state: {
            sorting,
            globalFilter: search,
        },

        onSortingChange: setSorting,

        onGlobalFilterChange: setSearch,

        globalFilterFn: (
            row,
            _columnId,
            filterValue,
        ) => {
            const query = String(
                filterValue ?? '',
            )
                .trim()
                .toLowerCase();

            if (!query) {
                return true;
            }

            const user = row.original;

            const searchableValues = [
                user.name,
                user.username,
                user.employee_number,
                user.email,
                user.contact_number,
                user.account_status,
                user.position?.name,
                user.organizational_unit?.name,
                ...(user.roles?.map(
                    (item) => item.name,
                ) ?? []),
            ];

            return searchableValues.some(
                (value) =>
                    String(value ?? '')
                        .toLowerCase()
                        .includes(query),
            );
        },

        getCoreRowModel:
            getCoreRowModel(),

        getFilteredRowModel:
            getFilteredRowModel(),

        getSortedRowModel:
            getSortedRowModel(),

        getPaginationRowModel:
            getPaginationRowModel(),

        initialState: {
            pagination: {
                pageSize: 20,
            },
        },

        enableSortingRemoval: false,
    });

    /*
    |--------------------------------------------------------------------------
    | Reset pagination when filters change
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        table.setPageIndex(0);
    }, [
        search,
        status,
        role,
        organization,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Clear filters
    |--------------------------------------------------------------------------
    */

    const clearFilters = () => {
        setSearch('');
        setStatus('all');
        setRole('all');
        setOrganization('all');
        table.setPageIndex(0);
    };

    const hasFilters =
        search.trim() !== '' ||
        status !== 'all' ||
        role !== 'all' ||
        organization !== 'all';

    /*
    |--------------------------------------------------------------------------
    | Table statistics
    |--------------------------------------------------------------------------
    */

    const filteredCount =
        table.getFilteredRowModel().rows.length;

    const currentPage =
        table.getState().pagination.pageIndex + 1;

    const pageCount =
        table.getPageCount();

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
                            type="button"
                            className="h-10 rounded-lg bg-[#173B67] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#123052]"
                        >
                            Add user
                        </Button>
                    </header>

                    {/* Search + Filters */}

                    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

                            {/* Search */}

                            <div className="relative min-w-0 flex-1 xl:max-w-xl">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <Input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="Search employees..."
                                    className="h-10 rounded-lg border-slate-200 bg-white pl-10 pr-16 text-sm shadow-none focus-visible:border-[#173B67] focus-visible:ring-[#173B67]/20"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch('')
                                        }
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">

                                {/* Status */}

                                <Select
                                    value={status}
                                    onValueChange={setStatus}
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
                                            (item) => (
                                                <SelectItem
                                                    key={item}
                                                    value={item}
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
                                    onValueChange={setRole}
                                >
                                    <SelectTrigger className="h-10 w-[135px] rounded-lg border-slate-200 bg-white text-sm shadow-none">
                                        <SelectValue placeholder="Role" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value="all">
                                            All roles
                                        </SelectItem>

                                        {roleOptions.map(
                                            (item) => (
                                                <SelectItem
                                                    key={item}
                                                    value={item}
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

                                        {organizationOptions.map((org) => (
                                <SelectItem key={org.id} value={String(org.id)}>
                                    {org.code} — {org.name}
                                </SelectItem>
                            ))}
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
                                    {filteredCount}
                                </span>{' '}
                                {filteredCount === 1
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
                                    {table
                                        .getRowModel()
                                        .rows.length >
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
                                                        No users
                                                        found
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

                        {filteredCount > 0 && (
                            <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-slate-400">
                                    Showing{' '}
                                    <span className="font-medium text-slate-600">
                                        {table.getState()
                                            .pagination
                                            .pageIndex *
                                            table.getState()
                                                .pagination
                                                .pageSize +
                                            1}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-medium text-slate-600">
                                        {Math.min(
                                            (table.getState()
                                                .pagination
                                                .pageIndex +
                                                1) *
                                                table.getState()
                                                    .pagination
                                                    .pageSize,
                                            filteredCount,
                                        )}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-medium text-slate-600">
                                        {filteredCount}
                                    </span>{' '}
                                    users
                                </p>

                                <div className="flex items-center gap-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={
                                            !table.getCanPreviousPage()
                                        }
                                        onClick={() =>
                                            table.previousPage()
                                        }
                                        className="h-8 w-8 rounded-md border-slate-200"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>

                                    <div className="flex h-8 min-w-8 items-center justify-center rounded-md bg-[#173B67] px-2 text-xs font-medium text-white">
                                        {currentPage}
                                    </div>

                                    <span className="px-1 text-xs text-slate-400">
                                        of {pageCount}
                                    </span>

                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="icon"
                                        disabled={
                                            !table.getCanNextPage()
                                        }
                                        onClick={() =>
                                            table.nextPage()
                                        }
                                        className="h-8 w-8 rounded-md border-slate-200"
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