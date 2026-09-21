import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpDown,
    ArrowUpRight,
    CalendarDays,
    ChevronRight,
    Clock3,
    FileCheck2,
    FileText,
    Plane,
    TrendingUp,
    Search,
    Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type Status = 'Pending' | 'Approved' | 'Rejected';

interface RequestItem {
    id: string;
    employee: string;
    department: string;
    type: string;
    date: string;
    status: Status;
}

const requests: RequestItem[] = [
    {
        id: 'REQ-00124',
        employee: 'Maria Santos',
        department: 'Lingayen Branch',
        type: 'Leave Application',
        date: 'Sep 18, 2026',
        status: 'Pending',
    },
    {
        id: 'REQ-00123',
        employee: 'John Dela Cruz',
        department: 'Finance',
        type: 'Overtime',
        date: 'Sep 17, 2026',
        status: 'Pending',
    },
    {
        id: 'REQ-00122',
        employee: 'Angela Ramos',
        department: 'Human Resources',
        type: 'Travel Order',
        date: 'Sep 17, 2026',
        status: 'Approved',
    },
    {
        id: 'REQ-00121',
        employee: 'Carlos Mendoza',
        department: 'Information Technology',
        type: 'Undertime',
        date: 'Sep 16, 2026',
        status: 'Pending',
    },
    {
        id: 'REQ-00120',
        employee: 'Sofia Garcia',
        department: 'Loans',
        type: 'Leave Application',
        date: 'Sep 16, 2026',
        status: 'Approved',
    },
];

const stats = [
    {
        label: 'Pending approvals',
        value: '12',
        description: 'Requires your review',
        icon: FileCheck2,
    },
    {
        label: 'Leave requests',
        value: '8',
        description: 'Across all locations',
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
        value: '3',
        description: 'Awaiting approval',
        icon: Plane,
    },
];

const quickActions = [
    {
        title: 'Leave application',
        description: 'Create leave request',
        href: '/leave/create',
        icon: CalendarDays,
    },
    {
        title: 'Undertime',
        description: 'Create undertime request',
        href: '/undertime/create',
        icon: Clock3,
    },
    {
        title: 'Overtime',
        description: 'Create overtime request',
        href: '/overtime/create',
        icon: TrendingUp,
    },
    {
        title: 'Travel order',
        description: 'Create travel order',
        href: '/travel/create',
        icon: Plane,
    },
];

const branches = [
    'Lingayen',
    'Dagupan',
    'Alaminos',
    'Mangatarem',
    'Rosario',
    'Urdaneta',
    'Tayug',
    'Head Office',
];

function getInitials(name: string) {
    return name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function getRequestIcon(type: string) {
    switch (type) {
        case 'Leave Application':
            return CalendarDays;
        case 'Overtime':
            return TrendingUp;
        case 'Undertime':
            return Clock3;
        case 'Travel Order':
            return Plane;
        default:
            return FileText;
    }
}

function StatusBadge({ status }: { status: Status }) {
    const styles: Record<Status, string> = {
        Pending: 'border-amber-200 bg-amber-50 text-amber-700',
        Approved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
        Rejected: 'border-rose-200 bg-rose-50 text-rose-700',
    };

    return (
        <Badge
            variant="outline"
            className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${styles[status]}`}
        >
            {status}
        </Badge>
    );
}

export default function COODashboard() {
    const [search, setSearch] = useState('');
    const [newestFirst, setNewestFirst] = useState(true);

    const filteredRequests = useMemo(() => {
        const query = search.trim().toLowerCase();

        const result = requests.filter((request) => {
            if (!query) return true;

            return [
                request.id,
                request.employee,
                request.department,
                request.type,
                request.status,
            ].some((value) =>
                value.toLowerCase().includes(query),
            );
        });

        return [...result].sort((a, b) => {
            const first = new Date(a.date).getTime();
            const second = new Date(b.date).getTime();

            return newestFirst ? second - first : first - second;
        });
    }, [search, newestFirst]);

    const pendingCount = requests.filter(
        (request) => request.status === 'Pending',
    ).length;

    return (
        <>
            <Head title="COO Dashboard" />

            <div className="min-h-full bg-[#f7f8f7] text-slate-900">
                <main className="mx-auto w-full max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8">
                    {/* -------------------------------------------------
                        HEADER
                    ------------------------------------------------- */}
                    <header className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                Operations
                            </p>

                            <h1 className="mt-1 text-[25px] font-semibold leading-tight tracking-[-0.02em] text-slate-900">
                                Good afternoon, COO
                            </h1>

                            <p className="mt-1.5 text-sm text-slate-500">
                                Review approvals and monitor operational
                                activity across the bank.
                            </p>
                        </div>

                        <Link href="/leave/create">
                            <Button
                                size="sm"
                                className="h-9 w-full rounded-md bg-slate-900 px-4 text-sm font-medium shadow-none hover:bg-slate-800 sm:w-auto"
                            >
                                <FileText className="mr-1.5 h-3.5 w-3.5" />
                                New request
                            </Button>
                        </Link>
                    </header>

                    {/* -------------------------------------------------
                        STATISTICS
                    ------------------------------------------------- */}
                    <section className="mb-5 overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <div className="grid grid-cols-2 sm:grid-cols-4">
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;

                                return (
                                    <div
                                        key={stat.label}
                                        className={`
                                            relative flex min-h-[104px]
                                            items-center justify-between
                                            px-5 py-4
                                            ${index !== 0 ? 'border-slate-200 sm:border-l' : ''}
                                            ${index === 2 ? 'border-t sm:border-t-0' : ''}
                                            ${index === 3 ? 'border-t border-slate-200 sm:border-t-0' : ''}
                                            ${index % 2 === 1 ? 'border-l border-slate-200 sm:border-l-0' : ''}
                                        `}
                                    >
                                        <div>
                                            <p className="text-xs font-medium text-slate-500">
                                                {stat.label}
                                            </p>

                                            <div className="mt-1.5 flex items-baseline gap-2">
                                                <span className="text-[25px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
                                                    {stat.value}
                                                </span>
                                            </div>

                                            <p className="mt-2 text-[11px] text-slate-400">
                                                {stat.description}
                                            </p>
                                        </div>

                                        <div className="hidden h-8 w-8 items-center justify-center rounded-md bg-slate-50 sm:flex">
                                            <Icon className="h-4 w-4 text-slate-500" />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* -------------------------------------------------
                        CONTENT GRID
                    ------------------------------------------------- */}
                    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_285px]">
                        {/* REQUESTS */}
                        <section className="min-w-0">
                            <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Recent requests
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Review recent operational requests and
                                        approval status.
                                    </p>
                                </div>

                                <div className="relative w-full sm:w-[250px]">
                                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search requests..."
                                        className="h-8 rounded-md border-slate-200 bg-white pl-9 text-xs shadow-none placeholder:text-slate-400 focus-visible:border-slate-400 focus-visible:ring-slate-400/20"
                                    />
                                </div>
                            </div>

                            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                {/* TABLE TOOLBAR */}
                                <div className="flex h-11 items-center justify-between border-b border-slate-100 px-4">
                                    <p className="text-xs text-slate-500">
                                        {filteredRequests.length}{' '}
                                        {filteredRequests.length === 1
                                            ? 'request'
                                            : 'requests'}
                                    </p>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            setNewestFirst((value) => !value)
                                        }
                                        className="h-7 gap-1.5 px-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                    >
                                        <ArrowUpDown className="h-3 w-3" />
                                        {newestFirst
                                            ? 'Newest'
                                            : 'Oldest'}
                                    </Button>
                                </div>

                                {/* DESKTOP */}
                                <div className="hidden overflow-x-auto md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-slate-200 bg-slate-50/70 hover:bg-slate-50/70">
                                                <TableHead className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Request
                                                </TableHead>

                                                <TableHead className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Employee
                                                </TableHead>

                                                <TableHead className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Date
                                                </TableHead>

                                                <TableHead className="h-9 px-4 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                                    Status
                                                </TableHead>

                                                <TableHead className="h-9 w-10 px-2" />
                                            </TableRow>
                                        </TableHeader>

                                        <TableBody>
                                            {filteredRequests.length > 0 ? (
                                                filteredRequests.map(
                                                    (request) => {
                                                        const Icon =
                                                            getRequestIcon(
                                                                request.type,
                                                            );

                                                        return (
                                                            <TableRow
                                                                key={request.id}
                                                                className="border-slate-100 hover:bg-slate-50/60"
                                                            >
                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50">
                                                                            <Icon className="h-3.5 w-3.5 text-slate-500" />
                                                                        </div>

                                                                        <div className="min-w-0">
                                                                            <p className="truncate text-sm font-medium text-slate-800">
                                                                                {
                                                                                    request.type
                                                                                }
                                                                            </p>

                                                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                                                {
                                                                                    request.id
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell className="px-4 py-3">
                                                                    <div className="flex items-center gap-2.5">
                                                                        <Avatar className="h-7 w-7 shrink-0">
                                                                            <AvatarFallback className="bg-slate-100 text-[10px] font-semibold text-slate-600">
                                                                                {getInitials(
                                                                                    request.employee,
                                                                                )}
                                                                            </AvatarFallback>
                                                                        </Avatar>

                                                                        <div className="min-w-0">
                                                                            <p className="truncate text-sm text-slate-700">
                                                                                {
                                                                                    request.employee
                                                                                }
                                                                            </p>

                                                                            <p className="truncate text-[11px] text-slate-400">
                                                                                {
                                                                                    request.department
                                                                                }
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                </TableCell>

                                                                <TableCell className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">
                                                                    {
                                                                        request.date
                                                                    }
                                                                </TableCell>

                                                                <TableCell className="px-4 py-3">
                                                                    <StatusBadge
                                                                        status={
                                                                            request.status
                                                                        }
                                                                    />
                                                                </TableCell>

                                                                <TableCell className="px-2 py-3">
                                                                    <div className="flex justify-end">
                                                                        <Link
                                                                            href={`/requests/${request.id}`}
                                                                        >
                                                                            <Button
                                                                                variant="ghost"
                                                                                size="icon"
                                                                                className="h-7 w-7 text-slate-300 hover:bg-slate-100 hover:text-slate-600"
                                                                            >
                                                                                <ChevronRight className="h-3.5 w-3.5" />
                                                                            </Button>
                                                                        </Link>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        );
                                                    },
                                                )
                                            ) : (
                                                <TableRow>
                                                    <TableCell
                                                        colSpan={5}
                                                        className="h-28 text-center text-xs text-slate-400"
                                                    >
                                                        No requests found.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* MOBILE */}
                                <div className="divide-y divide-slate-100 md:hidden">
                                    {filteredRequests.length > 0 ? (
                                        filteredRequests.map((request) => {
                                            const Icon = getRequestIcon(
                                                request.type,
                                            );

                                            return (
                                                <Link
                                                    key={request.id}
                                                    href={`/requests/${request.id}`}
                                                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-50">
                                                        <Icon className="h-3.5 w-3.5 text-slate-500" />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="truncate text-sm font-medium text-slate-800">
                                                                {
                                                                    request.type
                                                                }
                                                            </p>

                                                            <StatusBadge
                                                                status={
                                                                    request.status
                                                                }
                                                            />
                                                        </div>

                                                        <p className="mt-0.5 truncate text-xs text-slate-500">
                                                            {
                                                                request.employee
                                                            }
                                                        </p>

                                                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                                                            <span>
                                                                {request.id}
                                                            </span>

                                                            <span>
                                                                {request.date}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
                                                </Link>
                                            );
                                        })
                                    ) : (
                                        <div className="px-4 py-10 text-center text-xs text-slate-400">
                                            No requests found.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* SIDEBAR */}
                        <aside className="space-y-5">
                            {/* QUICK ACTIONS */}
                            <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                                <div className="border-b border-slate-100 px-4 py-3">
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Quick actions
                                    </h2>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Create a new request.
                                    </p>
                                </div>

                                <div className="p-2">
                                    {quickActions.map((action) => {
                                        const Icon = action.icon;

                                        return (
                                            <Link
                                                key={action.title}
                                                href={action.href}
                                                className="flex items-center gap-3 rounded-md px-2.5 py-2.5 transition-colors hover:bg-slate-50"
                                            >
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-50">
                                                    <Icon className="h-3.5 w-3.5 text-slate-600" />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-xs font-medium text-slate-700">
                                                        {action.title}
                                                    </p>

                                                    <p className="truncate text-[11px] text-slate-400">
                                                        {action.description}
                                                    </p>
                                                </div>

                                                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                                            </Link>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* WORKFORCE */}
                            <section className="rounded-lg border border-slate-200 bg-white p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Workforce
                                        </h2>

                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Current overview
                                        </p>
                                    </div>

                                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-slate-50">
                                        <Users className="h-3.5 w-3.5 text-slate-500" />
                                    </div>
                                </div>

                                <div className="mt-4 flex items-end justify-between">
                                    <div>
                                        <p className="text-[25px] font-semibold leading-none tracking-tight text-slate-900">
                                            50
                                        </p>

                                        <p className="mt-1 text-[11px] text-slate-400">
                                            Total employees
                                        </p>
                                    </div>

                                    <span className="text-xs font-medium text-slate-600">
                                        88% present
                                    </span>
                                </div>

                                <Progress
                                    value={88}
                                    className="mt-3 h-1.5 [&>div]:bg-slate-700"
                                />

                                <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                                    <span>44 present</span>
                                    <span>6 on leave</span>
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-2">
                                    <div>
                                        <p className="text-base font-semibold text-slate-900">
                                            7
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Branches
                                        </p>
                                    </div>

                                    <div className="border-l border-slate-100 pl-4">
                                        <p className="text-base font-semibold text-slate-900">
                                            1
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            Head office
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* LOCATIONS */}
                            <section className="rounded-lg border border-slate-200 bg-white p-4">
                                <div>
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Locations
                                    </h2>

                                    <p className="mt-0.5 text-[11px] text-slate-400">
                                        Active operating locations
                                    </p>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-1.5">
                                    {branches.map((branch) => (
                                        <div
                                            key={branch}
                                            className="rounded-md bg-slate-50 px-2.5 py-2 text-[11px] font-medium text-slate-600"
                                        >
                                            {branch}
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* APPROVAL REMINDER */}
                            <section className="rounded-lg border border-slate-200 bg-white p-4">
                                <div className="border-l-2 border-slate-800 pl-3">
                                    <p className="text-xs font-semibold text-slate-900">
                                        Approval reminder
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-slate-500">
                                        You have{' '}
                                        <span className="font-semibold text-slate-800">
                                            {pendingCount} requests
                                        </span>{' '}
                                        waiting for your review.
                                    </p>

                                    <Link
                                        href="/requests?status=pending"
                                        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-slate-700 hover:text-slate-900"
                                    >
                                        Review approvals
                                        <ArrowUpRight className="h-3 w-3" />
                                    </Link>
                                </div>
                            </section>
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}
