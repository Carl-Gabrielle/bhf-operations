import { Head, Link, router } from '@inertiajs/react';
import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
    ArrowDownToLine,
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    FileSpreadsheet,
    FileText,
    History,
    Inbox,
    Search,
    UserRound,
    X,
    XCircle,
} from 'lucide-react';

type Employee = {
    id: number;
    name: string;
    employee_number?: string | null;
    department?: string | null;
    position?: string | null;
};

type Application = {
    id: number;
    application_no?: string | null;
    undertime_date?: string | null;
    scheduled_end_time?: string | null;
    requested_departure_time?: string | null;
    requested_minutes?: number | null;
    reason?: string | null;
    status: string;
    submitted_at?: string | null;
    employee?: Employee | null;
};

type HistoryItem = {
    id: number;
    application_id: number;
    application_no?: string | null;
    employee_name?: string | null;
    employee_number?: string | null;
    department?: string | null;
    undertime_date?: string | null;
    action: string;
    remarks?: string | null;
    acted_at?: string | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    links?: PaginationLink[];
};

type Props = {
    applications: Paginated<Application>;
    recentHistory?: HistoryItem[];
    stats?: {
        pending_count?: number;
        approved_count?: number;
        rejected_count?: number;
        decisions_count?: number;
    };
    filters?: {
        search?: string | null;
        date_from?: string | null;
        date_to?: string | null;
    };
    approver?: {
        id: number;
        name: string;
        employee_number?: string | null;
        department?: string | null;
        position?: string | null;
    } | null;
};

function formatDate(value?: string | null): string {
    if (!value) return '—';

    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const date = dateOnly
        ? new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])))
        : new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        ...(dateOnly ? { timeZone: 'UTC' } : {}),
    }).format(date);
}

function formatDateTime(value?: string | null): string {
    if (!value) return '—';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatTime(value?: string | null): string {
    if (!value) return '—';

    const [hour, minute] = value.split(':');
    if (hour === undefined || minute === undefined) return value;

    const date = new Date();
    date.setHours(Number(hour), Number(minute), 0, 0);

    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatStatus(status?: string | null): string {
    if (!status) return 'Unknown';

    return status
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ status }: { status?: string | null }) {
    const key = (status ?? '').toLowerCase();
    const isPending = key === 'pending' || key === 'pending_approval';
    const isApproved = key === 'approved';
    const isRejected = key === 'rejected';

    const className = isPending
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : isApproved
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : isRejected
            ? 'border-rose-200 bg-rose-50 text-rose-800'
            : 'border-slate-200 bg-slate-50 text-slate-600';

    const Icon = isPending ? Clock3 : isApproved ? CheckCircle2 : isRejected ? XCircle : FileText;

    return (
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${className}`}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5" />
            {formatStatus(status)}
        </span>
    );
}

function MetricCard({
    label,
    value,
    description,
    icon: Icon,
    tone,
}: {
    label: string;
    value: number;
    description: string;
    icon: typeof Clock3;
    tone: 'amber' | 'green' | 'rose' | 'slate';
}) {
    const tones = {
        amber: 'bg-amber-50 text-amber-700',
        green: 'bg-emerald-50 text-emerald-700',
        rose: 'bg-rose-50 text-rose-700',
        slate: 'bg-slate-100 text-slate-600',
    };

    return (
        <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/30 sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 tabular-nums">
                        {value.toLocaleString('en-PH')}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{description}</p>
                </div>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}>
                    <Icon className="h-4 w-4" />
                </span>
            </div>
        </article>
    );
}

function Pagination({
    page,
    lastPage,
    from,
    to,
    total,
    previous,
    next,
}: {
    page: number;
    lastPage: number;
    from?: number | null;
    to?: number | null;
    total: number;
    previous: string | null;
    next: string | null;
}) {
    if (lastPage <= 1) return null;

    const buttonClass =
        'inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

    return (
        <nav
            aria-label="Undertime applications pagination"
            className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{from ?? 0}–{to ?? 0}</span> of{' '}
                <span className="font-semibold text-slate-700">{total}</span> applications
            </p>

            <div className="flex items-center gap-2">
                {previous ? (
                    <Link href={previous} preserveScroll className={buttonClass}>
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </Link>
                ) : (
                    <span className={`${buttonClass} cursor-not-allowed opacity-40`}>
                        <ArrowLeft className="h-4 w-4" />
                        Previous
                    </span>
                )}

                <span className="px-2 text-xs font-medium tabular-nums text-slate-500">
                    {page} / {lastPage}
                </span>

                {next ? (
                    <Link href={next} preserveScroll className={buttonClass}>
                        Next
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                ) : (
                    <span className={`${buttonClass} cursor-not-allowed opacity-40`}>
                        Next
                        <ArrowRight className="h-4 w-4" />
                    </span>
                )}
            </div>
        </nav>
    );
}

function SectionHeading({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                <p className="mt-1 text-xs text-slate-500">{description}</p>
            </div>
            {action}
        </div>
    );
}

function EmptyState({ title, description }: { title: string; description: string }) {
    return (
        <div className="flex flex-col items-center px-6 py-12 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <Inbox className="h-5 w-5" />
            </span>
            <h3 className="mt-3 text-sm font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
        </div>
    );
}

export default function Index({ applications, recentHistory = [], stats, filters, approver }: Props) {
    const rows = applications?.data ?? [];
    const total = applications?.total ?? rows.length;
    const page = applications?.current_page ?? 1;
    const lastPage = applications?.last_page ?? 1;

    const [search, setSearch] = useState(filters?.search ?? '');
    const [dateFrom, setDateFrom] = useState(filters?.date_from ?? '');
    const [dateTo, setDateTo] = useState(filters?.date_to ?? '');

    const pendingCount = stats?.pending_count ?? total;
    const approvedCount = stats?.approved_count ?? 0;
    const rejectedCount = stats?.rejected_count ?? 0;
    const decisionsCount = stats?.decisions_count ?? approvedCount + rejectedCount;

    const queryString = useMemo(() => {
        const params = new URLSearchParams();

        if (search) params.set('search', search);
        if (dateFrom) params.set('date_from', dateFrom);
        if (dateTo) params.set('date_to', dateTo);

        return params.toString();
    }, [search, dateFrom, dateTo]);

    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.get(
            '/undertime/approvals',
            {
                search: search || undefined,
                date_from: dateFrom || undefined,
                date_to: dateTo || undefined,
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    }

    function clearFilters() {
        setSearch('');
        setDateFrom('');
        setDateTo('');

        router.get('/undertime/approvals', {}, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    }

    const exportBase = '/undertime/approvals/reports';
    const exportQuery = queryString ? `?${queryString}` : '';

    const previous =
        applications?.links?.find((item) => /previous|laquo/i.test(item.label))?.url ??
        (page > 1 ? `/undertime/approvals?page=${page - 1}` : null);
    const next =
        applications?.links?.find((item) => /next|raquo/i.test(item.label))?.url ??
        (page < lastPage ? `/undertime/approvals?page=${page + 1}` : null);

    const metrics = [
        {
            label: 'Pending review',
            value: pendingCount,
            description: 'Applications awaiting your action',
            icon: Clock3,
            tone: 'amber' as const,
        },
        {
            label: 'Approved',
            value: approvedCount,
            description: 'Approved at your workflow step',
            icon: CheckCircle2,
            tone: 'green' as const,
        },
        {
            label: 'Rejected',
            value: rejectedCount,
            description: 'Rejected at your workflow step',
            icon: XCircle,
            tone: 'rose' as const,
        },
        {
            label: 'Total decisions',
            value: decisionsCount,
            description: 'Approved and rejected actions',
            icon: History,
            tone: 'slate' as const,
        },
    ];

    return (
        <>
            <Head title="Undertime Approvals" />

            <main className="min-h-full bg-slate-50/70 text-slate-900">
                <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                                BHF Operations
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                                Undertime approvals
                            </h1>
                            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                                Review assigned applications and monitor your approval activity.
                            </p>
                        </div>

                        {approver && (
                            <div className="text-left sm:text-right">
                                <p className="text-xs text-slate-500">Signed in as</p>
                                <p className="mt-0.5 text-sm font-semibold text-slate-800">{approver.name}</p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {[approver.position, approver.department].filter(Boolean).join(' · ') ||
                                        approver.employee_number ||
                                        'Authorized approver'}
                                </p>
                            </div>
                        )}
                    </header>

                    <section aria-label="Approval summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {metrics.map((metric) => (
                            <MetricCard key={metric.label} {...metric} />
                        ))}
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
                        <SectionHeading
                            title="Search and filters"
                            description="Narrow the approval queue by employee, application number, or undertime date."
                        />

                        <form onSubmit={applyFilters} className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">
                            <label className="xl:col-span-2">
                                <span className="mb-1.5 block text-xs font-medium text-slate-600">Search</span>
                                <span className="relative block">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <input
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Application no., employee name or ID"
                                        className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                    />
                                </span>
                            </label>

                            <label>
                                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                                    Date from
                                </span>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(event) => setDateFrom(event.target.value)}
                                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </label>

                            <label>
                                <span className="mb-1.5 block text-xs font-medium text-slate-600">
                                    Date to
                                </span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(event) => setDateTo(event.target.value)}
                                    className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                                />
                            </label>

                            <div className="flex items-end gap-2">
                                <button
                                    type="submit"
                                    className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                                >
                                    <Search className="h-4 w-4" />
                                    Apply
                                </button>
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    aria-label="Clear filters"
                                    title="Clear filters"
                                    className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </form>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
                        <SectionHeading
                            title="Applications awaiting review"
                            description="Applications currently assigned to your approval step."
                            action={
                                <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                    {total.toLocaleString('en-PH')} records
                                </span>
                            }
                        />

                        {rows.length === 0 ? (
                            <EmptyState
                                title="No applications to review"
                                description="There are no undertime applications currently assigned to you. New requests will appear here when they reach your approval step."
                            />
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[850px] text-left">
                                        <thead className="bg-slate-50">
                                            <tr className="border-y border-slate-100">
                                                {[
                                                    'Application / employee',
                                                    'Department',
                                                    'Undertime date',
                                                    'Departure',
                                                    'Duration',
                                                    'Status',
                                                    '',
                                                ].map((heading, index) => (
                                                    <th
                                                        key={`${heading}-${index}`}
                                                        className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                                                    >
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {rows.map((application) => (
                                                <tr
                                                    key={application.id}
                                                    className="transition-colors hover:bg-slate-50/70"
                                                >
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                                                                <UserRound className="h-4 w-4" />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <Link
                                                                    href={`/undertime/approvals/${application.id}`}
                                                                    className="text-sm font-semibold text-blue-800 hover:underline"
                                                                >
                                                                    {application.application_no ??
                                                                        `Application #${application.id}`}
                                                                </Link>
                                                                <p className="mt-0.5 truncate text-sm font-medium text-slate-800">
                                                                    {application.employee?.name ?? 'Unknown employee'}
                                                                </p>
                                                                <p className="text-xs text-slate-500">
                                                                    {application.employee?.employee_number ?? 'No employee number'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-600">
                                                        {application.employee?.department ?? '—'}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-700">
                                                        <span className="flex items-center gap-2">
                                                            <CalendarDays className="h-4 w-4 text-slate-400" />
                                                            {formatDate(application.undertime_date)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-sm font-medium text-slate-700">
                                                        {formatTime(application.requested_departure_time)}
                                                    </td>
                                                    <td className="px-5 py-4 text-sm text-slate-700">
                                                        {application.requested_minutes ?? 0} min
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={application.status} />
                                                    </td>
                                                    <td className="px-5 py-4 text-right">
                                                        <Link
                                                            href={`/undertime/approvals/${application.id}`}
                                                            className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Review
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="divide-y divide-slate-100 md:hidden">
                                    {rows.map((application) => (
                                        <article key={application.id} className="space-y-3 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/undertime/approvals/${application.id}`}
                                                        className="text-xs font-semibold text-blue-800"
                                                    >
                                                        {application.application_no ??
                                                            `Application #${application.id}`}
                                                    </Link>
                                                    <p className="mt-1 text-sm font-semibold text-slate-900">
                                                        {application.employee?.name ?? 'Unknown employee'}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {application.employee?.employee_number ?? 'No employee number'}
                                                        {application.employee?.department
                                                            ? ` · ${application.employee.department}`
                                                            : ''}
                                                    </p>
                                                </div>
                                                <StatusBadge status={application.status} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        Undertime date
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {formatDate(application.undertime_date)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        Departure
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {formatTime(application.requested_departure_time)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        Duration
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {application.requested_minutes ?? 0} minutes
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        Submitted
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {formatDate(application.submitted_at)}
                                                    </p>
                                                </div>
                                            </div>

                                            <Link
                                                href={`/undertime/approvals/${application.id}`}
                                                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-900 text-sm font-medium text-white transition hover:bg-slate-700"
                                            >
                                                <Eye className="h-4 w-4" />
                                                Review application
                                            </Link>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}

                        <Pagination
                            page={page}
                            lastPage={lastPage}
                            from={applications?.from}
                            to={applications?.to}
                            total={total}
                            previous={previous}
                            next={next}
                        />
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
                        <SectionHeading
                            title="Recent approval history"
                            description="Your latest approved and rejected decisions."
                            action={
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                    <History className="h-3.5 w-3.5" />
                                    Latest {recentHistory.length}
                                </span>
                            }
                        />

                        {recentHistory.length === 0 ? (
                            <EmptyState
                                title="No decisions recorded"
                                description="Your approval and rejection activity will be listed here."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {recentHistory.map((item) => (
                                    <article
                                        key={item.id}
                                        className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="flex min-w-0 items-start gap-3">
                                            <span
                                                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                    item.action.toLowerCase() === 'approved'
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-rose-50 text-rose-700'
                                                }`}
                                            >
                                                {item.action.toLowerCase() === 'approved' ? (
                                                    <CheckCircle2 className="h-4 w-4" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                            </span>

                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-800">
                                                    {item.employee_name ?? 'Unknown employee'}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    {item.application_no ?? `Application #${item.application_id}`}
                                                    {' · '}
                                                    {item.employee_number ?? 'No employee number'}
                                                    {item.department ? ` · ${item.department}` : ''}
                                                </p>
                                                {item.remarks && (
                                                    <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                                                        <span className="font-medium text-slate-600">Remarks: </span>
                                                        {item.remarks}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
                                            <StatusBadge status={item.action} />
                                            <div className="text-left sm:text-right">
                                                <p className="text-xs font-medium text-slate-700">
                                                    {formatDate(item.undertime_date)}
                                                </p>
                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    {formatDateTime(item.acted_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        )}
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">Approval reports</h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Export approval activity using the current search and date filters.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={`${exportBase}/pdf${exportQuery}`}
                                    className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    <FileText className="h-4 w-4 text-rose-600" />
                                    PDF
                                </a>
                                <a
                                    href={`${exportBase}/excel${exportQuery}`}
                                    className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                                >
                                    <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                                    Excel
                                </a>
                                <a
                                    href={`${exportBase}/word${exportQuery}`}
                                    className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-700"
                                >
                                    <ArrowDownToLine className="h-4 w-4" />
                                    Word
                                </a>
                            </div>
                        </div>
                    </section>

                    <footer className="flex flex-col gap-1 border-t border-slate-200 pt-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                        <span>BHF Rural Bank · Operations</span>
                        <span>Approval activity is limited to your assigned workflow.</span>
                    </footer>
                </div>
            </main>
        </>
    );
}
