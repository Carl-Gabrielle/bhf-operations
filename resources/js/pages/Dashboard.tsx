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
    Users,
    ShieldCheck,
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
    role?: Role;
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
    icon: ElementType;
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
*/

const roleConfig: Record<Role, RoleConfig> = {
    admin: {
        title: 'Administrator',
        description:
            'Manage users, permissions, system configuration, and operational access.',
        requestTitle: 'Recent system activity',
        quickActions: [
            {
                title: 'User management',
                description: 'Manage employee accounts',
                icon: Users,
            },
            {
                title: 'Roles & permissions',
                description: 'Manage access controls',
                icon: ShieldCheck,
            },
            {
                title: 'System settings',
                description: 'Configure system options',
                icon: Clock3,
            },
        ],
    },

    coo: {
        title: 'Executive overview',
        description:
            'Review approvals and monitor operational activity across the organization.',
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
        title: 'Human resources',
        description:
            'Monitor employee requests and manage workforce operations.',
        requestTitle: 'Recent employee requests',
        quickActions: [
            {
                title: 'Leave applications',
                description: 'Review employee leave',
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
                description: 'Manage employee travel',
                icon: Plane,
            },
        ],
    },

    manager: {
        title: 'Team operations',
        description:
            'Review your team’s requests and manage day-to-day operations.',
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
                description: 'Review team travel',
                icon: Plane,
            },
        ],
    },

    employee: {
        title: 'Your workspace',
        description:
            'Submit requests, review their status, and keep track of your activities.',
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
| Role-based statistics
|--------------------------------------------------------------------------
*/

const roleStats: Record<Role, StatItem[]> = {
    admin: [
        {
            label: 'Total users',
            value: '50',
            description: 'Active system users',
            icon: Users,
        },
        {
            label: 'Pending access',
            value: '3',
            description: 'Needs your review',
            icon: ShieldCheck,
        },
        {
            label: 'Active roles',
            value: '5',
            description: 'Configured roles',
            icon: FileText,
        },
        {
            label: 'System alerts',
            value: '2',
            description: 'Requires attention',
            icon: Bell,
        },
    ],

    coo: [
        {
            label: 'Pending approvals',
            value: '12',
            description: 'Needs your review',
            icon: FileText,
        },
        {
            label: 'Leave requests',
            value: '8',
            description: 'Across organization',
            icon: CalendarDays,
        },
        {
            label: 'Time requests',
            value: '5',
            description: 'Overtime & undertime',
            icon: Clock3,
        },
        {
            label: 'Travel orders',
            value: '4',
            description: 'Awaiting approval',
            icon: Plane,
        },
    ],

    hr: [
        {
            label: 'Pending requests',
            value: '12',
            description: 'Needs your review',
            icon: FileText,
        },
        {
            label: 'Leave requests',
            value: '8',
            description: '3 awaiting approval',
            icon: CalendarDays,
        },
        {
            label: 'Time requests',
            value: '5',
            description: 'Overtime & undertime',
            icon: Clock3,
        },
        {
            label: 'Travel orders',
            value: '4',
            description: '2 awaiting approval',
            icon: Plane,
        },
    ],

    manager: [
        {
            label: 'Pending approvals',
            value: '6',
            description: 'Needs your review',
            icon: FileText,
        },
        {
            label: 'Team members',
            value: '8',
            description: 'Within your scope',
            icon: Users,
        },
        {
            label: 'Leave requests',
            value: '4',
            description: 'From your team',
            icon: CalendarDays,
        },
        {
            label: 'Time requests',
            value: '3',
            description: 'Awaiting review',
            icon: Clock3,
        },
    ],

    employee: [
        {
            label: 'Pending requests',
            value: '2',
            description: 'Awaiting approval',
            icon: FileText,
        },
        {
            label: 'Approved requests',
            value: '8',
            description: 'This year',
            icon: ShieldCheck,
        },
        {
            label: 'Leave balance',
            value: '12',
            description: 'Available days',
            icon: CalendarDays,
        },
        {
            label: 'Travel orders',
            value: '1',
            description: 'Active request',
            icon: Plane,
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

function StatusBadge({ status }: { status: Status }) {
    const styles: Record<Status, string> = {
        Approved:
            'border-emerald-200 bg-emerald-50 text-emerald-700',
        Pending:
            'border-amber-200 bg-amber-50 text-amber-700',
        Rejected:
            'border-rose-200 bg-rose-50 text-rose-700',
    };

    return (
        <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${styles[status]}`}
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

    const role: Role =
        user.role && roleConfig[user.role] ? user.role : 'employee';

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
                        className="-ml-2 h-8 px-2 text-xs font-semibold text-slate-500 hover:bg-transparent hover:text-slate-800"
                    >
                        Request
                        <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                ),

                cell: ({ row }) => (
                    <div className="min-w-[170px]">
                        <p className="text-sm font-semibold text-slate-800">
                            {row.original.type}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
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
                        className="-ml-2 h-8 px-2 text-xs font-semibold text-slate-500 hover:bg-transparent hover:text-slate-800"
                    >
                        Employee
                        <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                ),

                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="bg-slate-100 text-[10px] font-bold text-slate-600">
                                {getInitials(row.original.employee)}
                            </AvatarFallback>
                        </Avatar>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-700">
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
                        className="-ml-2 h-8 px-2 text-xs font-semibold text-slate-500 hover:bg-transparent hover:text-slate-800"
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
                        className="-ml-2 h-8 px-2 text-xs font-semibold text-slate-500 hover:bg-transparent hover:text-slate-800"
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
                            className="h-8 w-8 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        >
                            <ChevronRight className="h-4 w-4" />
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

            <div className="min-h-full bg-slate-50 text-slate-900">
                <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                    {/* =====================================================
                        PAGE HEADER
                    ====================================================== */}

                    <header className="mb-7">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="min-w-0">
                                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                                    <span>Dashboard</span>
                                    <span className="text-slate-300">/</span>
                                    <span>{formatRole(role)}</span>
                                </div>

                                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[28px]">
                                    Good morning, {user.name}
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    {config.description}
                                </p>
                            </div>

                            {role !== 'admin' && (
                                <Button
                                    size="sm"
                                    className="h-10 shrink-0 rounded-lg bg-blue-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-slate-800"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    New Request
                                </Button>
                            )}
                        </div>
                    </header>

                    {/* =====================================================
                        KPI CARDS
                    ====================================================== */}

                    <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => (
                            <div
                                key={stat.label}
                                className="group rounded-xl border border-slate-200/90 bg-white px-5 py-4 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-colors hover:border-slate-300"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-slate-500">
                                            {stat.label}
                                        </p>

                                        <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-slate-950 tabular-nums">
                                            {stat.value}
                                        </p>

                                        <p className="mt-2 text-xs text-slate-400">
                                            {stat.description}
                                        </p>
                                    </div>

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <stat.icon
                                            className="h-4 w-4"
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>

                    {/* =====================================================
                        TOOLBAR
                    ====================================================== */}

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative w-full sm:max-w-[360px]">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <Input
                                value={globalFilter}
                                onChange={(event) =>
                                    setGlobalFilter(event.target.value)
                                }
                                placeholder={
                                    role === 'employee'
                                        ? 'Search your requests...'
                                        : 'Search requests, employees...'
                                }
                                className="h-10 rounded-lg border-slate-200 bg-white pl-10 text-sm text-slate-700 shadow-none placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-2 focus-visible:ring-slate-200"
                            />
                        </div>

                        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 sm:w-auto">
                            <Bell className="h-4 w-4" />

                            <span>Notifications</span>

                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1.5 text-[10px] font-semibold text-white">
                                4
                            </span>
                        </button>
                    </div>

                    {/* =====================================================
                        MAIN CONTENT
                    ====================================================== */}

                    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">

                        {/* =================================================
                            REQUESTS
                        ================================================== */}

                        <section className="min-w-0">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-950">
                                        {config.requestTitle}
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Recent activity across your workspace
                                    </p>
                                </div>

                                <button className="flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">
                                    View all
                                    <ArrowUpRight className="h-3.5 w-3.5" />
                                </button>
                            </div>

                            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

                                {/* DESKTOP TABLE */}

                                <div className="hidden overflow-x-auto md:block">
                                    <Table>
                                        <TableHeader>
                                            {table
                                                .getHeaderGroups()
                                                .map((headerGroup) => (
                                                    <TableRow
                                                        key={headerGroup.id}
                                                        className="border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70"
                                                    >
                                                        {headerGroup.headers.map(
                                                            (header) => (
                                                                <TableHead
                                                                    key={
                                                                        header.id
                                                                    }
                                                                    className="h-11 px-5"
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
                                                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70"
                                                    >
                                                        {row
                                                            .getVisibleCells()
                                                            .map((cell) => (
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
                                                            ))}
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={
                                                            columns.length
                                                        }
                                                        className="h-32 text-center text-sm text-slate-400"
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
                                                    className="flex items-center gap-3.5 px-4 py-4 transition-colors hover:bg-slate-50"
                                                >
                                                    <Avatar className="h-9 w-9 shrink-0">
                                                        <AvatarFallback className="bg-slate-100 text-[10px] font-semibold text-slate-600">
                                                            {getInitials(
                                                                request.employee,
                                                            )}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                                    {
                                                                        request.type
                                                                    }
                                                                </p>

                                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                                    {
                                                                        request.employee
                                                                    }
                                                                </p>
                                                            </div>

                                                            <StatusBadge
                                                                status={
                                                                    request.status
                                                                }
                                                            />
                                                        </div>

                                                        <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-400">
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
                                        <div className="px-4 py-12 text-center text-sm text-slate-400">
                                            No requests match your search.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* =================================================
                            SIDEBAR
                        ================================================== */}

                        <aside className="space-y-5">

                            {/* QUICK ACTIONS */}

                            <section className="rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <h2 className="text-sm font-semibold text-slate-950">
                                        Quick actions
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Common tasks and shortcuts
                                    </p>
                                </div>

                                <div className="p-2">
                                    {config.quickActions.map((action) => (
                                        <button
                                            key={action.title}
                                            className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-slate-50"
                                        >
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-200 group-hover:text-slate-800">
                                                <action.icon
                                                    className="h-4 w-4"
                                                    strokeWidth={1.8}
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                    {action.title}
                                                </p>

                                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                                    {action.description}
                                                </p>
                                            </div>

                                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* ACCESS */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                        <ShieldCheck
                                            className="h-4 w-4"
                                            strokeWidth={1.8}
                                        />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                            Access
                                        </p>

                                        <h2 className="mt-1 truncate text-sm font-semibold text-slate-900">
                                            {user.position ||
                                                formatRole(role)}
                                        </h2>
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-500">
                                    {config.title}. Your dashboard content is
                                    based on your assigned access level.
                                </p>

                                <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs text-slate-400">
                                            Role
                                        </span>

                                        <span className="text-sm font-medium capitalize text-slate-700">
                                            {role}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-xs text-slate-400">
                                            Access
                                        </span>

                                        <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            Authorized
                                        </span>
                                    </div>
                                </div>
                            </section>

                            {/* REQUEST STATUS */}

                            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-teal-600" />

                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">
                                            {role === 'employee'
                                                ? 'Request status'
                                                : 'Approval reminder'}
                                        </p>

                                        <p className="mt-2 text-sm leading-6 text-slate-500">
                                            {role === 'employee' ? (
                                                <>
                                                    You currently have{' '}
                                                    <span className="font-semibold text-slate-800">
                                                        2 requests
                                                    </span>{' '}
                                                    awaiting approval.
                                                </>
                                            ) : (
                                                <>
                                                    There are{' '}
                                                    <span className="font-semibold text-slate-800">
                                                        12 requests
                                                    </span>{' '}
                                                    waiting for review.
                                                </>
                                            )}
                                        </p>

                                        <button className="mt-3 flex items-center gap-1.5 text-sm font-medium text-slate-700 transition-colors hover:text-slate-950">
                                            {role === 'employee'
                                                ? 'View requests'
                                                : 'Review requests'}

                                            <ArrowUpRight className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};