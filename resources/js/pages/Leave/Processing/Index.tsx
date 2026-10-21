import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    ClipboardCheck,
    ClipboardList,
    Clock3,
    Search,
    UserRound,
} from 'lucide-react';
import { useMemo, useState } from 'react';


type Employee = {
    id: number;
    name: string;
    employee_number?: string | null;
    department?: string | null;
    organizational_unit?: { name?: string | null } | null;
    position?: { name?: string | null } | null;
};

type LeaveType = {
    id: number;
    name: string;
    code?: string | null;
};

type LeaveApplication = {
    id: number;
    application_no?: string | null;
    status: string;
    submitted_at?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    period_start?: string | null;
    period_end?: string | null;
    total_days?: number | string | null;
    reason?: string | null;
    remarks?: string | null;
    approved_at?: string | null;
    processing_started_at?: string | null;
    processed_at?: string | null;
    completed_at?: string | null;
    processing_started_by?: { id: number; name: string } | null;
    processed_by?: { id: number; name: string } | null;
    employee?: Employee | null;
    leave_type?: LeaveType | null;
    leaveType?: LeaveType | null;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
};

type Props = {
    applications: Paginated<LeaveApplication>;
    stats?: {
        awaiting_hr: number;
        processing: number;
        completed: number;
        total: number;
    };
    filters?: { search?: string; status?: string };
};

function formatDate(value?: string | null) {
    if (!value) return '—';
    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(date);
}

function getEmployeeName(application: LeaveApplication) {
    return application.employee?.name ?? 'Unknown employee';
}

function getPeriod(application: LeaveApplication) {
    const start = application.start_date ?? application.period_start;
    const end = application.end_date ?? application.period_end;
    if (!start && !end) return 'Dates not provided';
    if (start && end && start.slice(0, 10) === end.slice(0, 10)) {
        return formatDate(start);
    }
    return `${formatDate(start)} – ${formatDate(end)}`;
}

function statusLabel(status: string) {
    return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'border-blue-200 bg-blue-50 text-blue-700';
        case 'processing':
            return 'border-amber-200 bg-amber-50 text-amber-800';
        case 'completed':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'rejected':
            return 'border-rose-200 bg-rose-50 text-rose-700';
        default:
            return 'border-slate-200 bg-slate-50 text-slate-700';
    }
}

export default function Index({ applications, stats, filters }: Props) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? 'all');

    const visibleApplications = useMemo(() => {
        const query = search.trim().toLowerCase();

        return applications.data.filter((application) => {
            const matchesSearch =
                !query ||
                getEmployeeName(application).toLowerCase().includes(query) ||
                (application.employee?.employee_number ?? '').toLowerCase().includes(query) ||
                (application.leaveType?.name ?? application.leave_type?.name ?? '')
                    .toLowerCase()
                    .includes(query) ||
                String(application.application_no ?? application.id)
                    .toLowerCase()
                    .includes(query);

            const matchesStatus =
                status === 'all' || application.status.toLowerCase() === status;

            return matchesSearch && matchesStatus;
        });
    }, [applications.data, search, status]);

    // Prefer server-side totals so the summary cards reflect all pages,
    // not only the currently displayed page.
    const approvedCount =
        stats?.awaiting_hr ??
        applications.data.filter(
            (application) => application.status.toLowerCase() === 'approved',
        ).length;

    const processingCount =
        stats?.processing ??
        applications.data.filter(
            (application) => application.status.toLowerCase() === 'processing',
        ).length;

    const completedCount =
        stats?.completed ??
        applications.data.filter(
            (application) => application.status.toLowerCase() === 'completed',
        ).length;

    return (
        <>
            <Head title="HR Leave Processing" />

            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-700">
                            <ClipboardList className="size-4" />
                            HR Operations
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                            Leave Processing
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                            Review fully approved leave applications and complete the HR processing stage.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                        HR processing overview
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Applications in queue</p>
                            <ClipboardList className="size-5 text-sky-700" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                            {stats?.total ?? applications.total}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Awaiting HR, in progress, and completed</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Awaiting HR</p>
                            <Clock3 className="size-5 text-blue-700" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                            {approvedCount}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Fully approved and awaiting HR</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">In progress</p>
                            <CheckCircle2 className="size-5 text-amber-700" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                            {processingCount}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">Currently being handled by HR</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-slate-500">Completed</p>
                            <ClipboardCheck className="size-5 text-emerald-700" />
                        </div>
                        <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">
                            {completedCount}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">HR processing finished</p>
                    </div>
                </div>

                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div>
                            <h2 className="font-semibold text-slate-900">Processing queue</h2>
                            <p className="mt-1 text-xs text-slate-500">
                                {applications.total} application{applications.total === 1 ? '' : 's'} available
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <label className="relative block">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search employee or reference..."
                                    aria-label="Search leave processing queue"
                                    className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100 sm:w-64"
                                />
                            </label>
                            <select
                                value={status}
                                onChange={(event) => setStatus(event.target.value)}
                                aria-label="Filter by processing status"
                                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                            >
                                <option value="all">All statuses</option>
                                <option value="approved">Awaiting HR</option>
                                <option value="processing">In progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {visibleApplications.length === 0 ? (
                        <div className="px-6 py-16 text-center">
                            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                                <ClipboardList className="size-6" />
                            </div>
                            <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                No matching applications
                            </h3>
                            <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
                                There are no applications matching your search and status filters.
                                Approved, in-progress, and completed applications appear here. Try another status or clear your search.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="divide-y divide-slate-100">
                                {visibleApplications.map((application) => {
                                    const leaveType =
                                        application.leaveType?.name ??
                                        application.leave_type?.name ??
                                        'Leave';

                                    const reference =
                                        application.application_no ?? `LA-${application.id}`;

                                    const department =
                                        application.employee?.organizational_unit?.name ??
                                        application.employee?.department ??
                                        'Department not set';

                                    return (
                                        <div
                                            key={application.id}
                                            className="flex flex-col gap-4 p-4 transition hover:bg-slate-50/70 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                                        >
                                            <div className="flex min-w-0 gap-3">
                                                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-800 ring-1 ring-inset ring-sky-100">
                                                    <UserRound className="size-5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <h3 className="truncate text-sm font-semibold text-slate-900">
                                                            {getEmployeeName(application)}
                                                        </h3>
                                                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClass(application.status)}`}>
                                                            {statusLabel(application.status)}
                                                        </span>
                                                    </div>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {reference} · {application.employee?.employee_number ?? 'No employee number'} · {department}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                                                        <span className="font-medium text-slate-700">{leaveType}</span>
                                                        <span className="inline-flex items-center gap-1.5">
                                                            <CalendarDays className="size-3.5 text-slate-400" />
                                                            {getPeriod(application)}
                                                        </span>
                                                        {application.total_days != null && (
                                                            <span>
                                                                {application.total_days} day{Number(application.total_days) === 1 ? '' : 's'}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                                                <div className="text-left sm:text-right">
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                        {application.status.toLowerCase() === 'completed'
                                                            ? 'Completed'
                                                            : application.status.toLowerCase() === 'processing'
                                                              ? 'Started'
                                                              : 'Approved'}
                                                    </p>
                                                    <p className="mt-1 text-xs font-medium text-slate-700">
                                                        {formatDate(
                                                            application.status.toLowerCase() === 'completed'
                                                                ? application.completed_at ?? application.processed_at
                                                                : application.status.toLowerCase() === 'processing'
                                                                  ? application.processing_started_at
                                                                  : application.approved_at,
                                                        )}
                                                    </p>
                                                </div>
                                                <Link
                                                    href={`/leave/processing/${application.id}`}
                                                    className={[
                                                        'inline-flex h-10 items-center justify-center gap-2 rounded-xl px-3.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-2',
                                                        application.status.toLowerCase() === 'completed'
                                                            ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                            : 'bg-sky-800 text-white hover:bg-sky-900',
                                                    ].join(' ')}
                                                >
                                                    {application.status.toLowerCase() === 'completed'
                                                        ? 'View details'
                                                        : 'Review'}
                                                    <ArrowRight className="size-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {applications.links.length > 0 && (
                                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-4 sm:px-5">
                                    <p className="text-xs text-slate-500">
                                        Page {applications.current_page} of {applications.last_page}
                                    </p>
                                    <div className="flex flex-wrap gap-1">
                                        {applications.links.map((link, index) => (
                                            <Link
                                                key={`${link.label}-${index}`}
                                                href={link.url ?? '#'}
                                                preserveScroll
                                                preserveState
                                                aria-disabled={!link.url}
                                                className={[
                                                    'inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg border px-3 text-xs font-medium',
                                                    link.active
                                                        ? 'border-sky-800 bg-sky-800 text-white'
                                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                                                    !link.url ? 'pointer-events-none opacity-40' : '',
                                                ].join(' ')}
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </section>
            </div>
        </>
    );
}
