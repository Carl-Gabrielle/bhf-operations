import { Head, usePage } from '@inertiajs/react';
import {
    ArrowUpDown,
    ArrowUpRight,
    Bell,
    CalendarDays,
    ChevronRight,
    Clock3,
    FileCheck2,
    FileText,
    Plane,
    Search,
    Users,
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

type PageProps = {
    auth: {
        user: {
            name: string;
            position?: string;
        };
    };
};

type Status = 'Approved' | 'Pending' | 'Rejected';

interface RequestItem {
    id: string;
    employee: string;
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

const requests: RequestItem[] = [
    {
        id: 'REQ-00124',
        employee: 'Maria Santos',
        type: 'Leave Application',
        date: 'Sep 22, 2026',
        status: 'Pending',
    },
    {
        id: 'REQ-00123',
        employee: 'Pedro Ramos',
        type: 'Overtime',
        date: 'Sep 21, 2026',
        status: 'Pending',
    },
    {
        id: 'REQ-00122',
        employee: 'Ana Garcia',
        type: 'Travel Order',
        date: 'Sep 20, 2026',
        status: 'Pending',
    },
    {
        id: 'REQ-00121',
        employee: 'Carlos Mendoza',
        type: 'Undertime',
        date: 'Sep 19, 2026',
        status: 'Approved',
    },
    {
        id: 'REQ-00120',
        employee: 'Sofia Garcia',
        type: 'Leave Application',
        date: 'Sep 18, 2026',
        status: 'Approved',
    },
];

const stats: StatItem[] = [
    {
        label: 'Team members',
        value: '8',
        description: 'Assigned to your team',
        icon: Users,
    },
    {
        label: 'Pending approvals',
        value: '4',
        description: 'Needs your review',
        icon: FileCheck2,
    },
    {
        label: 'On leave',
        value: '1',
        description: 'Team member today',
        icon: CalendarDays,
    },
    {
        label: 'Travel orders',
        value: '2',
        description: 'Awaiting your review',
        icon: Plane,
    },
];

const quickActions: QuickActionItem[] = [
    {
        title: 'Leave application',
        description: 'Submit your own leave',
        icon: CalendarDays,
    },
    {
        title: 'Undertime',
        description: 'Submit an undertime request',
        icon: Clock3,
    },
    {
        title: 'Overtime',
        description: 'Submit overtime hours',
        icon: Clock3,
    },
    {
        title: 'Travel order',
        description: 'Create your travel request',
        icon: Plane,
    },
];

const teamMembers = [
    {
        name: 'Maria Santos',
        position: 'Staff',
        status: 'Present',
    },
    {
        name: 'Pedro Ramos',
        position: 'Staff',
        status: 'Present',
    },
    {
        name: 'Ana Garcia',
        position: 'Staff',
        status: 'On leave',
    },
    {
        name: 'Carlos Mendoza',
        position: 'Staff',
        status: 'Present',
    },
];

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

export default function ManagerDashboard() {
    const { auth } = usePage<PageProps>().props;

    const [sorting, setSorting] = useState<SortingState>([]);
    const [globalFilter, setGlobalFilter] = useState('');

    const position = auth.user.position || 'Team Lead';

    const scopeLabel =
        position.toLowerCase().includes('branch')
            ? 'Your branch'
            : position.toLowerCase().includes('department')
              ? 'Your department'
              : 'Your team';

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

                        <p className="truncate text-sm text-slate-700">
                            {row.original.employee}
                        </p>
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
            <Head title="Operations Portal" />

            <div className="min-h-full bg-[#f7f8f7]">
                <main className="mx-auto w-full max-w-[1360px] px-4 py-8 sm:px-6 lg:px-8">

                    {/* HEADER */}
                    <header className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-sm text-slate-500">
                                Operations Portal
                            </p>

                            <h1 className="mt-1 text-[26px] font-semibold tracking-tight text-slate-900">
                                Welcome back, {auth.user.name}
                            </h1>

                            <p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">
                                Review requests and manage daily operations
                                across {scopeLabel.toLowerCase()}.
                            </p>
                        </div>

                        <Button
                            size="sm"
                            className="h-9 w-full rounded-md bg-teal-700 px-4 text-sm font-medium text-white shadow-none hover:bg-teal-800 sm:w-auto"
                        >
                            <FileText className="mr-1.5 h-3.5 w-3.5" />
                            New Request
                        </Button>
                    </header>

                    {/* SEARCH / NOTIFICATIONS */}
                    <div className="mb-6 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="relative max-w-md flex-1">
                            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />

                            <Input
                                value={globalFilter}
                                onChange={(event) =>
                                    setGlobalFilter(event.target.value)
                                }
                                placeholder="Search requests or employees"
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
                            {stats.map((stat, index) => {
                                const Icon = stat.icon;

                                return (
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
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-slate-500">
                                                {stat.label}
                                            </p>

                                            <Icon className="h-4 w-4 text-slate-300" />
                                        </div>

                                        <p className="mt-1.5 text-[26px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
                                            {stat.value}
                                        </p>

                                        <p className="mt-2 text-xs text-slate-400">
                                            {stat.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* CONTENT */}
                    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">

                        {/* REQUESTS */}
                        <section className="min-w-0">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Team requests
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-400">
                                        Requests submitted by your team
                                    </p>
                                </div>

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
                                                                    key={header.id}
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
                                                                    key={cell.id}
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
                                                        No team requests match
                                                        your search.
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
                                            No team requests match your search.
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

                                    <p className="mt-1 text-xs text-slate-400">
                                        Manage your own requests
                                    </p>
                                </div>

                                <div className="mt-2 divide-y divide-slate-100 px-2 pb-2">
                                    {quickActions.map((action) => {
                                        const Icon = action.icon;

                                        return (
                                            <button
                                                key={action.title}
                                                className="flex w-full items-center gap-3 px-2 py-3 text-left transition-colors hover:bg-slate-50"
                                            >
                                                <Icon
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
                                        );
                                    })}
                                </div>
                            </section>

                            {/* MY TEAM */}
                            <section className="rounded-lg border border-slate-200 bg-white">
                                <div className="flex items-center justify-between px-4 pt-4">
                                    <div>
                                        <h2 className="text-base font-semibold text-slate-900">
                                            My team
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-400">
                                            {teamMembers.length} assigned employees
                                        </p>
                                    </div>

                                    <Users className="h-4 w-4 text-slate-300" />
                                </div>

                                <div className="mt-2 divide-y divide-slate-100">
                                    {teamMembers.map((member) => (
                                        <div
                                            key={member.name}
                                            className="flex items-center gap-3 px-4 py-3"
                                        >
                                            <Avatar className="h-8 w-8 shrink-0">
                                                <AvatarFallback className="bg-slate-100 text-[10px] font-semibold text-slate-600">
                                                    {getInitials(member.name)}
                                                </AvatarFallback>
                                            </Avatar>

                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium text-slate-800">
                                                    {member.name}
                                                </p>

                                                <p className="truncate text-xs text-slate-400">
                                                    {member.position}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <span
                                                    className={`size-1.5 rounded-full ${
                                                        member.status ===
                                                        'Present'
                                                            ? 'bg-emerald-500'
                                                            : 'bg-amber-500'
                                                    }`}
                                                />

                                                <span className="text-[11px] text-slate-400">
                                                    {member.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-slate-100 px-4 py-3">
                                    <button className="flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800">
                                        View team
                                        <ArrowUpRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </section>

                            {/* APPROVAL REMINDER */}
                            <section className="rounded-lg border border-slate-200 bg-white p-4">
                                <div className="border-l-2 border-teal-700 pl-3">
                                    <p className="text-sm font-medium text-slate-900">
                                        Approval reminder
                                    </p>

                                    <p className="mt-1 text-sm leading-5 text-slate-500">
                                        You have{' '}
                                        <span className="font-medium text-slate-800">
                                            4 requests
                                        </span>{' '}
                                        waiting for your review.
                                    </p>

                                    <button className="mt-2 flex items-center gap-1 text-sm font-medium text-teal-700 hover:text-teal-800">
                                        Review requests
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            </section>
                        </aside>
                    </div>
                </main>
            </div>
        </>
    );
}
