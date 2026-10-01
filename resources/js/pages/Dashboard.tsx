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
    ShieldCheck,
    TrendingUp,
    Users,
} from 'lucide-react';
import type { ElementType } from 'react';
import { useEffect, useMemo, useState } from 'react';

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
    accent: 'purple' | 'blue' | 'yellow' | 'green';
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
| Brand
|--------------------------------------------------------------------------
|
| BHF Rural Bank palette:
| Purple  #3F2A8F
| Blue    #4B7BC0
| Yellow  #F0E600
|--------------------------------------------------------------------------
*/

const brand = {
    purple: '#3F2A8F',
    blue: '#4B7BC0',
    yellow: '#F0E600',
};

/*
|--------------------------------------------------------------------------
| Dashboard data
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

const roleStats: Record<Role, StatItem[]> = {
    admin: [
        {
            label: 'Total users',
            value: '50',
            description: 'Active system users',
            icon: Users,
            accent: 'purple',
        },
        {
            label: 'Pending access',
            value: '3',
            description: 'Needs your review',
            icon: ShieldCheck,
            accent: 'yellow',
        },
        {
            label: 'Active roles',
            value: '5',
            description: 'Configured roles',
            icon: FileText,
            accent: 'blue',
        },
        {
            label: 'System alerts',
            value: '2',
            description: 'Requires attention',
            icon: Bell,
            accent: 'yellow',
        },
    ],
    coo: [
        {
            label: 'Pending approvals',
            value: '12',
            description: 'Needs your review',
            icon: FileText,
            accent: 'purple',
        },
        {
            label: 'Leave requests',
            value: '8',
            description: 'Across organization',
            icon: CalendarDays,
            accent: 'blue',
        },
        {
            label: 'Time requests',
            value: '5',
            description: 'Overtime & undertime',
            icon: Clock3,
            accent: 'yellow',
        },
        {
            label: 'Travel orders',
            value: '4',
            description: 'Awaiting approval',
            icon: Plane,
            accent: 'blue',
        },
    ],
    hr: [
        {
            label: 'Pending requests',
            value: '12',
            description: 'Needs your review',
            icon: FileText,
            accent: 'purple',
        },
        {
            label: 'Leave requests',
            value: '8',
            description: '3 awaiting approval',
            icon: CalendarDays,
            accent: 'blue',
        },
        {
            label: 'Time requests',
            value: '5',
            description: 'Overtime & undertime',
            icon: Clock3,
            accent: 'yellow',
        },
        {
            label: 'Travel orders',
            value: '4',
            description: '2 awaiting approval',
            icon: Plane,
            accent: 'blue',
        },
    ],
    manager: [
        {
            label: 'Pending approvals',
            value: '6',
            description: 'Needs your review',
            icon: FileText,
            accent: 'purple',
        },
        {
            label: 'Team members',
            value: '8',
            description: 'Within your scope',
            icon: Users,
            accent: 'blue',
        },
        {
            label: 'Leave requests',
            value: '4',
            description: 'From your team',
            icon: CalendarDays,
            accent: 'yellow',
        },
        {
            label: 'Time requests',
            value: '3',
            description: 'Awaiting review',
            icon: Clock3,
            accent: 'purple',
        },
    ],
    employee: [
        {
            label: 'Pending requests',
            value: '2',
            description: 'Awaiting approval',
            icon: FileText,
            accent: 'purple',
        },
        {
            label: 'Approved requests',
            value: '8',
            description: 'This year',
            icon: ShieldCheck,
            accent: 'blue',
        },
        {
            label: 'Leave balance',
            value: '12',
            description: 'Available days',
            icon: CalendarDays,
            accent: 'yellow',
        },
        {
            label: 'Travel orders',
            value: '1',
            description: 'Active request',
            icon: Plane,
            accent: 'blue',
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
    const styles: Record<
        Status,
        { wrapper: string; dot: string }
    > = {
        Approved: {
            wrapper:
                'border-emerald-200 bg-emerald-50 text-emerald-700',
            dot: 'bg-emerald-500',
        },
        Pending: {
            wrapper:
                'border-[#F0E600]/70 bg-[#FFFDE7] text-[#786F00]',
            dot: 'bg-[#D2C900]',
        },
        Rejected: {
            wrapper: 'border-rose-200 bg-rose-50 text-rose-700',
            dot: 'bg-rose-500',
        },
    };

    const style = styles[status];

    return (
        <Badge
            variant="outline"
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${style.wrapper}`}
        >
            <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {status}
        </Badge>
    );
}

function getStatAccent(accent: StatItem['accent']) {
    switch (accent) {
        case 'purple':
            return {
                bar: 'bg-[#3F2A8F]',
                icon: 'bg-[#F2EFFC] text-[#3F2A8F]',
                glow: 'ring-[#3F2A8F]/10',
            };
        case 'blue':
            return {
                bar: 'bg-[#4B7BC0]',
                icon: 'bg-[#EEF5FC] text-[#3567A8]',
                glow: 'ring-[#4B7BC0]/10',
            };
        case 'yellow':
            return {
                bar: 'bg-[#E5DA00]',
                icon: 'bg-[#FFFDE7] text-[#857B00]',
                glow: 'ring-[#E5DA00]/15',
            };
        case 'green':
            return {
                bar: 'bg-emerald-500',
                icon: 'bg-emerald-50 text-emerald-700',
                glow: 'ring-emerald-500/10',
            };
    }
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
    const [now, setNow] = useState(() => new Date());

    /*
    |--------------------------------------------------------------------------
    | Live date/time
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        const timer = window.setInterval(() => {
            setNow(new Date());
        }, 1000);

        return () => window.clearInterval(timer);
    }, []);

    const formattedDate = now.toLocaleDateString('en-PH', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });

    const formattedTime = now.toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });

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
                        className="-ml-2 h-8 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 hover:bg-transparent hover:text-[#3F2A8F]"
                    >
                        Request
                        <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="min-w-[180px]">
                        <p className="text-sm font-semibold tracking-tight text-slate-800">
                            {row.original.type}
                        </p>
                        <p className="mt-1 text-[11px] font-medium tracking-wide text-slate-400">
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
                        className="-ml-2 h-8 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 hover:bg-transparent hover:text-[#3F2A8F]"
                    >
                        Employee
                        <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0 ring-2 ring-white">
                            <AvatarFallback className="bg-[#F2EFFC] text-[10px] font-bold text-[#3F2A8F]">
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
                        className="-ml-2 h-8 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 hover:bg-transparent hover:text-[#3F2A8F]"
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
                        className="-ml-2 h-8 px-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400 hover:bg-transparent hover:text-[#3F2A8F]"
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
                            className="h-8 w-8 rounded-full text-slate-300 transition-colors hover:bg-[#F2EFFC] hover:text-[#3F2A8F]"
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

            <div className="min-h-full bg-[#F7F8FA] text-slate-900">
                <main className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
                    {/* Header */}
                    <header className="mb-6">
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,.28)]">
                            {/* Small BHF-inspired color accents */}
                            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-[#3F2A8F] via-[#4B7BC0] to-[#F0E600]" />
                            <div className="absolute right-0 top-0 h-32 w-32 translate-x-1/3 -translate-y-1/3 rounded-full bg-[#F0E600]/10 blur-2xl" />

                            <div className="relative flex flex-col gap-6 px-6 py-7 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:justify-between">
                                <div className="min-w-0">
                                    <div className="mb-3 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-[#3F2A8F]" />
                                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                                            {formatRole(role)}
                                        </span>
                                    </div>

                                    <h1 className="text-3xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl">
                                        Good morning,{' '}
                                        <span className="text-[#3F2A8F]">
                                            {user.name}
                                        </span>
                                    </h1>

                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-[15px]">
                                        {config.description}
                                    </p>
                                </div>

                                <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                                    {/* Date + time badge */}
                                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#F2EFFC] text-[#3F2A8F]">
                                            <Clock3
                                                className="h-4 w-4"
                                                strokeWidth={1.8}
                                            />
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                {formattedDate}
                                            </p>
                                            <p className="mt-0.5 text-sm font-semibold tabular-nums text-slate-800">
                                                {formattedTime}
                                            </p>
                                        </div>
                                    </div>

                                    {role !== 'admin' && (
                                        <Button
                                            size="sm"
                                            className="h-11 rounded-xl bg-[#3F2A8F] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#322176] focus-visible:ring-2 focus-visible:ring-[#3F2A8F]/30"
                                        >
                                            <FileText className="mr-2 h-4 w-4" />
                                            New Request
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* KPI cards */}
                    <section className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((stat) => {
                            const accent = getStatAccent(stat.accent);

                            return (
                                <div
                                    key={stat.label}
                                    className={`group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_6px_24px_-20px_rgba(15,23,42,.28)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_30px_-22px_rgba(15,23,42,.32)]`}
                                >
                                    <div
                                        className={`absolute left-0 top-0 h-0.5 w-full ${accent.bar}`}
                                    />

                                    <div className="flex items-start justify-between gap-4">
                                        <div className="min-w-0">
                                            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                {stat.label}
                                            </p>

                                            <p className="mt-3 text-[32px] font-semibold leading-none tracking-[-0.04em] text-slate-950 tabular-nums">
                                                {stat.value}
                                            </p>

                                            <p className="mt-2 text-xs text-slate-400">
                                                {stat.description}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent.icon} ring-1 ${accent.glow}`}
                                        >
                                            <stat.icon
                                                className="h-[18px] w-[18px]"
                                                strokeWidth={1.8}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </section>

                    {/* Main workspace */}
                    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
                        {/* Requests */}
                        <section className="min-w-0">
                            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-[#3F2A8F]" />
                                        <h2 className="text-lg font-semibold tracking-[-0.025em] text-slate-950">
                                            {config.requestTitle}
                                        </h2>
                                    </div>

                                    <p className="mt-1.5 text-xs leading-5 text-slate-400">
                                        Recent activity across your workspace
                                    </p>
                                </div>

                                <div className="flex w-full items-center gap-2 sm:w-auto">
                                    <div className="relative min-w-0 flex-1 sm:w-[270px]">
                                        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <Input
                                            value={globalFilter}
                                            onChange={(event) =>
                                                setGlobalFilter(
                                                    event.target.value,
                                                )
                                            }
                                            placeholder={
                                                role === 'employee'
                                                    ? 'Search your requests...'
                                                    : 'Search requests, employees...'
                                            }
                                            className="h-10 rounded-xl border-slate-200 bg-white pl-10 text-sm shadow-none placeholder:text-slate-400 focus-visible:border-[#3F2A8F]/40 focus-visible:ring-2 focus-visible:ring-[#3F2A8F]/10"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#3F2A8F]/20 hover:bg-[#F2EFFC] hover:text-[#3F2A8F]"
                                        aria-label="Notifications"
                                    >
                                        <Bell className="h-4 w-4" />

                                        <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#F7F8FA] bg-[#F0E600] px-1 text-[8px] font-bold text-[#403A00]">
                                            4
                                        </span>
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,.25)]">
                                <div className="flex items-center justify-end border-b border-slate-100 px-5 py-3 sm:px-6">
                                    <button
                                        type="button"
                                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-[#3F2A8F]"
                                    >
                                        View all
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>

                                {/* Desktop */}
                                <div className="hidden overflow-x-auto md:block">
                                    <Table>
                                        <TableHeader>
                                            {table
                                                .getHeaderGroups()
                                                .map((headerGroup) => (
                                                    <TableRow
                                                        key={headerGroup.id}
                                                        className="border-b border-slate-100 bg-slate-50/70 hover:bg-slate-50/70"
                                                    >
                                                        {headerGroup.headers.map(
                                                            (header) => (
                                                                <TableHead
                                                                    key={
                                                                        header.id
                                                                    }
                                                                    className="h-12 px-5"
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
                                                        className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-[#FAF9FE]"
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
                                                        colSpan={columns.length}
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

                                {/* Mobile */}
                                <div className="divide-y divide-slate-100 md:hidden">
                                    {filteredRows.length > 0 ? (
                                        filteredRows.map((row) => {
                                            const request = row.original;

                                            return (
                                                <div
                                                    key={request.id}
                                                    className="flex items-center gap-3.5 px-4 py-4 transition-colors hover:bg-[#FAF9FE]"
                                                >
                                                    <Avatar className="h-10 w-10 shrink-0">
                                                        <AvatarFallback className="bg-[#F2EFFC] text-[10px] font-semibold text-[#3F2A8F]">
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

                                                        <div className="mt-2.5 flex items-center justify-between gap-3 text-[11px] text-slate-400">
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

                        {/* Sidebar */}
                        <aside className="space-y-5">
                            {/* Quick actions */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_-24px_rgba(15,23,42,.25)]">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#4B7BC0]">
                                        Shortcuts
                                    </p>

                                    <h2 className="mt-1 text-base font-semibold tracking-[-0.02em] text-slate-950">
                                        Quick actions
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Common tasks and shortcuts
                                    </p>
                                </div>

                                <div className="p-2">
                                    {config.quickActions.map(
                                        (action, index) => (
                                            <button
                                                type="button"
                                                key={action.title}
                                                className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-slate-50"
                                            >
                                                <div
                                                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                                                        index % 3 === 0
                                                            ? 'bg-[#F2EFFC] text-[#3F2A8F] group-hover:bg-[#3F2A8F] group-hover:text-white'
                                                            : index % 3 === 1
                                                              ? 'bg-[#EEF5FC] text-[#3567A8] group-hover:bg-[#4B7BC0] group-hover:text-white'
                                                              : 'bg-[#FFFDE7] text-[#857B00] group-hover:bg-[#F0E600] group-hover:text-[#4A4300]'
                                                    }`}
                                                >
                                                    <action.icon
                                                        className="h-4 w-4"
                                                        strokeWidth={1.8}
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                        {action.title}
                                                    </p>

                                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                                        {action.description}
                                                    </p>
                                                </div>

                                                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-[#3F2A8F]" />
                                            </button>
                                        ),
                                    )}
                                </div>
                            </section>

                            {/* Access */}
                            <section className="overflow-hidden rounded-2xl bg-[#171326] p-5 text-white shadow-[0_12px_35px_-24px_rgba(15,23,42,.45)]">
                                <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-[#3F2A8F] via-[#4B7BC0] to-[#F0E600]" />

                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#B9AFFF]">
                                            Access
                                        </p>

                                        <h2 className="mt-1 text-lg font-semibold tracking-[-0.025em]">
                                            {user.position || formatRole(role)}
                                        </h2>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-[#D8D0FF]">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                </div>

                                <p className="mt-4 text-sm leading-6 text-slate-300">
                                    {config.title}. Your dashboard content is
                                    based on your assigned access level.
                                </p>

                                <div className="mt-5 grid grid-cols-2 gap-2">
                                    <div className="rounded-xl bg-white/[0.06] p-3">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                            Role
                                        </p>

                                        <p className="mt-1.5 text-sm font-semibold capitalize text-white">
                                            {role}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-white/[0.06] p-3">
                                        <p className="text-[10px] uppercase tracking-[0.12em] text-slate-500">
                                            Access
                                        </p>

                                        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-emerald-300">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            Authorized
                                        </p>
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
