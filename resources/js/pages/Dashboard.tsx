import { Head, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    ArrowUpRight,
    Bell,
    CalendarDays,
    ChevronRight,
    Clock3,
    FileText,
    Plane,
    Search,
    TrendingUp,
} from 'lucide-react';
import type { ElementType } from 'react';
import { useMemo, useState } from 'react';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getSortedRowModel,
    useReactTable,
    type ColumnDef,
    type SortingState,
} from '@tanstack/react-table';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

import { dashboard } from '@/routes';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type Role = 'admin' | 'coo' | 'hr' | 'manager' | 'employee';

type Status = 'Approved' | 'Pending' | 'Rejected';

interface DashboardUser {
    id: number;
    name: string;
    role: Role;
    position?: string | null;
}

type PageProps = {
    user: DashboardUser;
};

interface RequestItem {
    id: string;
    employee: string;
    department: string;
    type: string;
    date: string;
    status: Status;
}

interface StatItem {
    label: string;
    value: string;
    description: string;
}

interface QuickActionItem {
    title: string;
    description: string;
    icon: ElementType;
}

interface RoleConfig {
    title: string;
    description: string;
    requestTitle: string;
    quickActions: QuickActionItem[];
}

/*
|--------------------------------------------------------------------------
| Temporary dashboard data
|--------------------------------------------------------------------------
|
| This is still sample data for now.
|
| The next backend step will replace this with real database data that is
| already scoped according to the authenticated user's role, position,
| department, branch, and permissions.
|
*/

const requests: RequestItem[] = [
    {
        id: 'REQ-00124',
        employee: 'Maria Santos',
        department: 'Operations',
        type: 'Leave Application',
        date: 'Sep 11, 2026',
        status: 'Pending',
    },
    {
        id: 'REQ-00123',
        employee: 'John Dela Cruz',
        department: 'Finance',
        type: 'Overtime',
        date: 'Sep 10, 2026',
        status: 'Approved',
    },
    {
        id: 'REQ-00122',
        employee: 'Angela Ramos',
        department: 'Human Resources',
        type: 'Travel Order',
        date: 'Sep 10, 2026',
        status: 'Approved',
    },
    {
        id: 'REQ-00121',
        employee: 'Carlos Mendoza',
        department: 'Information Technology',
        type: 'Undertime',
        date: 'Sep 09, 2026',
        status: 'Pending',
    },
    {
        id: 'REQ-00120',
        employee: 'Sofia Garcia',
        department: 'Loans',
        type: 'Leave Application',
        date: 'Sep 09, 2026',
        status: 'Rejected',
    },
];

/*
|--------------------------------------------------------------------------
| Role configuration
|--------------------------------------------------------------------------
|
| One dashboard.
|
| The role changes:
| - description
| - request section title
| - available quick actions
|
| The actual authorization must still be enforced by Laravel.
|
*/

const roleConfig: Record<Role, RoleConfig> = {
    admin: {
        title: 'System administration and access management.',
        description:
            'Manage system users, permissions, configuration, and operational access.',
        requestTitle: 'Recent activity',
        quickActions: [
            {
                title: 'User management',
                description: 'Manage system users',
                icon: FileText,
            },
            {
                title: 'Roles & permissions',
                description: 'Manage access controls',
                icon: TrendingUp,
            },
            {
                title: 'System settings',
                description: 'Configure system options',
                icon: Clock3,
            },
        ],
    },

    coo: {
        title: 'Executive overview and pending approvals.',
        description:
            'Review executive approvals and monitor operational activity across the organization.',
        requestTitle: 'Requests requiring attention',
        quickActions: [
            {
                title: 'Approval queue',
                description: 'Review pending approvals',
                icon: FileText,
            },
            {
                title: 'Travel orders',
                description: 'Review travel requests',
                icon: Plane,
            },
            {
                title: 'Operations overview',
                description: 'View operational activity',
                icon: TrendingUp,
            },
        ],
    },

    hr: {
        title: 'Workforce activity and HR operations.',
        description:
            "Monitor employee requests and what's happening across the workforce today.",
        requestTitle: 'Recent employee requests',
        quickActions: [
            {
                title: 'Leave applications',
                description: 'Create or review leave',
                icon: CalendarDays,
            },
            {
                title: 'Undertime',
                description: 'Manage undertime requests',
                icon: Clock3,
            },
            {
                title: 'Overtime',
                description: 'Review overtime requests',
                icon: TrendingUp,
            },
            {
                title: 'Travel orders',
                description: 'Create employee travel order',
                icon: Plane,
            },
        ],
    },

    manager: {
        title: 'Team activity and approval requests.',
        description:
            'Review your team’s requests and manage daily operations.',
        requestTitle: 'Team requests',
        quickActions: [
            {
                title: 'Leave applications',
                description: 'Review team leave requests',
                icon: CalendarDays,
            },
            {
                title: 'Undertime',
                description: 'Review team undertime',
                icon: Clock3,
            },
            {
                title: 'Overtime',
                description: 'Review team overtime',
                icon: TrendingUp,
            },
            {
                title: 'Travel orders',
                description: 'Review team travel orders',
                icon: Plane,
            },
        ],
    },

    employee: {
        title: 'Your requests and daily activities.',
        description:
            'View your requests, submit applications, and keep track of your activities.',
        requestTitle: 'My recent requests',
        quickActions: [
            {
                title: 'Leave application',
                description: 'Submit a leave request',
                icon: CalendarDays,
            },
            {
                title: 'Undertime',
                description: 'Submit an undertime request',
                icon: Clock3,
            },
            {
                title: 'Overtime',
                description: 'Submit an overtime request',
                icon: TrendingUp,
            },
            {
                title: 'Travel order',
                description: 'Create a travel request',
                icon: Plane,
            },
        ],
    },
};

/*
|--------------------------------------------------------------------------
| Role-based sample statistics
|--------------------------------------------------------------------------
|
| These will eventually come from DashboardController / DashboardService.
|
*/

const roleStats: Record<Role, StatItem[]> = {
    admin: [
        {
            label: 'Total users',
            value: '50',
            description: 'Active system users',
        },
        {
            label: 'Pending access',
            value: '3',
            description: 'Needs your review',
        },
        {
            label: 'Active roles',
            value: '5',
            description: 'Configured system roles',
        },
        {
            label: 'System alerts',
            value: '2',
            description: 'Requires attention',
        },
    ],

    coo: [
        {
            label: 'Pending approvals',
            value: '12',
            description: 'Needs your review',
        },
        {
            label: 'Leave requests',
            value: '8',
            description: 'Across the organization',
        },
        {
            label: 'Time requests',
            value: '5',
            description: 'Overtime and undertime',
        },
        {
            label: 'Travel orders',
            value: '4',
            description: 'Awaiting approval',
        },
    ],

    hr: [
        {
            label: 'Pending requests',
            value: '12',
            description: 'Needs your review',
        },
        {
            label: 'Leave requests',
            value: '8',
            description: '3 awaiting approval',
        },
        {
            label: 'Time requests',
            value: '5',
            description: 'Overtime and undertime',
        },
        {
            label: 'Travel orders',
            value: '4',
            description: '2 awaiting approval',
        },
    ],

    manager: [
        {
            label: 'Pending approvals',
            value: '6',
            description: 'Needs your review',
        },
        {
            label: 'Team members',
            value: '8',
            description: 'Within your scope',
        },
        {
            label: 'Leave requests',
            value: '4',
            description: 'From your team',
        },
        {
            label: 'Time requests',
            value: '3',
            description: 'Awaiting review',
        },
    ],

    employee: [
        {
            label: 'Pending requests',
            value: '2',
            description: 'Awaiting approval',
        },
        {
            label: 'Approved requests',
            value: '8',
            description: 'This year',
        },
        {
            label: 'Leave balance',
            value: '12',
            description: 'Available days',
        },
        {
            label: 'Travel orders',
            value: '1',
            description: 'Active request',
        },
    ],
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function getInitials(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function StatusBadge({ status }: { status: Status }) {
    const styles: Record<Status, string> = {
        Approved: 'border-teal-200 bg-teal-50 text-teal-700',
        Pending: 'border-amber-200 bg-amber-50 text-amber-700',
        Rejected: 'border-rose-200 bg-rose-50 text-rose-700',
    };

    return (
        <Badge
            variant="outline"
            className={`rounded-md border px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}
        >
            {status}
        </Badge>
    );
}

/*
|--------------------------------------------------------------------------
| Dashboard
|--------------------------------------------------------------------------
*/

export default function Dashboard() {
    const { user } = usePage<PageProps>().props;

    const role: Role = roleConfig[user.role] ? user.role : 'employee';

    const config = roleConfig[role];
    const stats = roleStats[role];

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const columns = useMemo<ColumnDef<RequestItem>[]>(
        () => [
            {
                accessorKey: 'type',

                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(
                                column.getIsSorted() === 'asc',
                            )
                        }
                        className="-ml-2 h-7 px-2 text-xs font-medium text-slate-500 hover:bg-transparent hover:text-slate-700"
                    >
                        Request
                        <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                ),

                cell: ({ row }) => (
                    <div>
                        <p className="text-sm font-medium text-slate-800">
                            {row.original.type}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                            {row.original.id}
                        </p>
                    </div>
                ),
            },

            {
                accessorKey: 'employee',

                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(
                                column.getIsSorted() === 'asc',
                            )
                        }
                        className="-ml-2 h-7 px-2 text-xs font-medium text-slate-500 hover:bg-transparent hover:text-slate-700"
                    >
                        Employee
                        <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                ),

                cell: ({ row }) => (
                    <div className="flex items-center gap-2.5">
                        <Avatar className="h-7 w-7">
                            <AvatarFallback className="bg-slate-100 text-[10px] font-semibold text-slate-600">
                                {getInitials(row.original.employee)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <p className="truncate text-sm text-slate-700">
                                {row.original.employee}
                            </p>

                            <p className="truncate text-xs text-slate-400">
                                {row.original.department}
                            </p>
                        </div>
                    </div>
                ),
            },

            {
                accessorKey: 'date',

                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(
                                column.getIsSorted() === 'asc',
                            )
                        }
                        className="-ml-2 h-7 px-2 text-xs font-medium text-slate-500 hover:bg-transparent hover:text-slate-700"
                    >
                        Date
                        <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                ),

                cell: ({ row }) => (
                    <span className="whitespace-nowrap text-sm text-slate-500">
                        {row.original.date}
                    </span>
                ),
            },

            {
                accessorKey: 'status',

                header: ({ column }) => (
                    <Button
                        variant="ghost"
                        onClick={() =>
                            column.toggleSorting(
                                column.getIsSorted() === 'asc',
                            )
                        }
                        className="-ml-2 h-7 px-2 text-xs font-medium text-slate-500 hover:bg-transparent hover:text-slate-700"
                    >
                        Status
                        <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                ),

                cell: ({ row }) => (
                    <StatusBadge status={row.original.status} />
                ),
            },

            {
                id: 'actions',
                enableSorting: false,
                enableGlobalFilter: false,

                header: () => null,

                cell: () => (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                        >
                            <ChevronRight className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ),
            },
        ],
        [],
    );

    const table = useReactTable({
        data: requests,
        columns,

        state: {
            sorting,
            globalFilter,
        },

        onSortingChange: setSorting,
        onGlobalFilterChange: setGlobalFilter,

        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const filteredRows = table.getRowModel().rows;

    return (
        <>
            <Head title="Dashboard" />

            <div className="min-h-full bg-[#f7f8f7]">
                <main className="mx-auto w-full max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">

                    {/* HEADER */}

                    <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Friday, September 11, 2026
                            </p>

                            <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-slate-900">
                                Good morning, {user.name}
                            </h1>

                            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                {config.description}
                            </p>
                        </div>

                        {role !== 'admin' && (
                            <Button
                                size="sm"
                                className="h-9 w-full rounded-md bg-teal-700 px-4 text-sm font-medium text-white shadow-none hover:bg-teal-800 sm:w-auto"
                            >
                                <FileText className="mr-1.5 h-3.5 w-3.5" />
                                New Request
                            </Button>
                        )}
                    </header>

                    {/* SEARCH */}

                    <div className="mb-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                            <Input
                                value={globalFilter}
                                onChange={(event) =>
                                    setGlobalFilter(event.target.value)
                                }
                                placeholder={
                                    role === 'employee'
                                        ? 'Search your requests'
                                        : 'Search requests, employees, departments'
                                }
                                className="h-9 rounded-md border-slate-200 bg-white pl-9 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-teal-600 focus-visible:ring-teal-600/20"
                            />
                        </div>

                        <button className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 transition-colors hover:bg-slate-50">
                            <Bell className="h-3.5 w-3.5" />

                            <span>Notifications</span>

                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[10px] font-medium text-white">
                                4
                            </span>
                        </button>
                    </div>

                    {/* STATISTICS */}

                    <section className="mb-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <div className="grid grid-cols-2 divide-slate-200 sm:grid-cols-4 sm:divide-x">
                            {stats.map((stat, index) => (
                                <div
                                    key={stat.label}
                                    className={`px-5 py-4 ${
                                        index < 2
                                            ? 'border-b border-slate-200 sm:border-b-0'
                                            : ''
                                    } ${
                                        index % 2 === 0
                                            ? 'border-r border-slate-200 sm:border-r-0'
                                            : ''
                                    }`}
                                >
                                    <p className="text-sm text-slate-500">
                                        {stat.label}
                                    </p>

                                    <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
                                        {stat.value}
                                    </p>

                                    <p className="mt-2 text-xs text-slate-400">
                                        {stat.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* CONTENT */}

                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">

                        {/* REQUESTS */}

                        <section className="min-w-0">
                            <div className="mb-3 flex items-center justify-between">
                                <h2 className="text-base font-semibold text-slate-900">
                                    {config.requestTitle}
                                </h2>

                                <button className="flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800">
                                    View all
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">

                                {/* DESKTOP */}

                                <div className="hidden overflow-x-auto md:block">
                                    <Table>
                                        <TableHeader>
                                            {table
                                                .getHeaderGroups()
                                                .map((headerGroup) => (
                                                    <TableRow
                                                        key={headerGroup.id}
                                                        className="border-slate-200 bg-slate-50 hover:bg-slate-50"
                                                    >
                                                        {headerGroup.headers.map(
                                                            (header) => (
                                                                <TableHead
                                                                    key={
                                                                        header.id
                                                                    }
                                                                    className="h-10 px-4"
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
                                                ))}
                                        </TableHeader>

                                        <TableBody>
                                            {filteredRows.length > 0 ? (
                                                filteredRows.map((row) => (
                                                    <TableRow
                                                        key={row.id}
                                                        className="border-slate-100 transition-colors hover:bg-slate-50/70"
                                                    >
                                                        {row
                                                            .getVisibleCells()
                                                            .map((cell) => (
                                                                <TableCell
                                                                    key={
                                                                        cell.id
                                                                    }
                                                                    className="px-4 py-3.5"
                                                                >
                                                                    {flexRender(
                                                                        cell
                                                                            .column
                                                                            .columnDef
                                                                            .cell,
                                                                        cell.getContext(),
                                                                    )}
                                                                </TableCell>
                                                            ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={columns.length}
                                                        className="h-28 text-center text-sm text-slate-400"
                                                    >
                                                        No requests match your
                                                        search.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* MOBILE */}

                                <div className="divide-y divide-slate-100 md:hidden">
                                    {filteredRows.length > 0 ? (
                                        filteredRows.map((row) => {
                                            const request = row.original;

                                            return (
                                                <div
                                                    key={request.id}
                                                    className="flex items-center gap-3 px-4 py-3.5"
                                                >
                                                    <Avatar className="h-8 w-8 shrink-0">
                                                        <AvatarFallback className="bg-slate-100 text-[10px] font-semibold text-slate-600">
                                                            {getInitials(
                                                                request.employee,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="truncate text-sm font-medium text-slate-800">
                                                                {request.type}
                                                            </p>

                                                            <StatusBadge
                                                                status={
                                                                    request.status
                                                                }
                                                            />
                                                        </div>

                                                        <p className="mt-1 truncate text-xs text-slate-500">
                                                            {request.employee}
                                                        </p>

                                                        <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                                                            <span>
                                                                {request.id}
                                                            </span>

                                                            <span>
                                                                {request.date}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-10 text-center text-sm text-slate-400">
                                            No requests match your search.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* SIDEBAR */}

                        <aside className="space-y-6">

                            {/* QUICK ACTIONS */}

                            <section className="rounded-lg border border-slate-200 bg-white">
                                <div className="px-4 pt-4">
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Quick actions
                                    </h2>
                                </div>

                                <div className="mt-2 divide-y divide-slate-100 px-2 pb-2">
                                    {config.quickActions.map((action) => (
                                        <button
                                            key={action.title}
                                            className="flex w-full items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-slate-50"
                                        >
                                            <action.icon
                                                className="h-4 w-4 shrink-0 text-teal-700"
                                                strokeWidth={1.8}
                                            />

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                    {action.title}
                                                </p>

                                                <p className="truncate text-xs text-slate-400">
                                                    {action.description}
                                                </p>
                                            </div>

                                            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* ROLE / SCOPE OVERVIEW */}

                            <section className="rounded-lg border border-slate-200 bg-white p-4">
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Access
                                </p>

                                <h2 className="mt-1 text-base font-semibold text-slate-900">
                                    {user.position || formatRole(user.role)}
                                </h2>

                                <p className="mt-1 text-sm leading-5 text-slate-500">
                                    {config.title}
                                </p>

                                <div className="mt-4 border-t border-slate-100 pt-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            Role
                                        </span>

                                        <span className="text-sm font-medium capitalize text-slate-700">
                                            {user.role}
                                        </span>
                                    </div>

                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-xs text-slate-400">
                                            Access level
                                        </span>

                                        <span className="text-sm font-medium text-teal-700">
                                            Authorized
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* APPROVAL / STATUS */}

                            <div className="rounded-lg border border-slate-200 bg-white p-4">
                                <div className="border-l-2 border-teal-700 pl-3">
                                    <p className="text-sm font-medium text-slate-900">
                                        {role === 'employee'
                                            ? 'Request status'
                                            : 'Approval reminder'}
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        {role === 'employee' ? (
                                            <>
                                                You have{' '}
                                                <span className="font-medium text-slate-800">
                                                    2 requests
                                                </span>{' '}
                                                currently awaiting approval.
                                            </>
                                        ) : (
                                            <>
                                                You have{' '}
                                                <span className="font-medium text-slate-800">
                                                    12 requests
                                                </span>{' '}
                                                waiting for review.
                                            </>
                                        )}
                                    </p>

                                    <button className="mt-2 flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800">
                                        {role === 'employee'
                                            ? 'View requests'
                                            : 'Review requests'}

                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function formatRole(role: Role) {
    switch (role) {
        case 'admin':
            return 'Administrator';

        case 'coo':
            return 'COO';

        case 'hr':
            return 'HR Administrator';

        case 'manager':
            return 'Manager / Head';

        case 'employee':
            return 'Employee';

        default:
            return 'User';
    }
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
