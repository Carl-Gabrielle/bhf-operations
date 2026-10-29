import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    Plus,
    Search,
    SlidersHorizontal,
    XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type UndertimeApplication = {
    id: number;
    application_no: string;
    undertime_date: string;
    requested_departure_time: string;
    requested_minutes: number;
    reason: string;
    status: string;
    created_at?: string;
};

type PaginatedApplications = {
    data: UndertimeApplication[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
};

type Props = {
    applications: PaginatedApplications;
    filters?: {
        search?: string;
        status?: string;
    };
};

const statusConfig: Record<
    string,
    { label: string; className: string; icon: typeof FileText }
> = {
    draft: {
        label: 'Draft',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
        icon: FileText,
    },
    submitted: {
        label: 'Submitted',
        className: 'border-blue-200 bg-blue-50 text-blue-800',
        icon: FileText,
    },
    pending_approval: {
        label: 'Pending approval',
        className: 'border-amber-200 bg-amber-50 text-amber-800',
        icon: Clock3,
    },
    approved: {
        label: 'Approved',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Rejected',
        className: 'border-rose-200 bg-rose-50 text-rose-800',
        icon: XCircle,
    },
    returned: {
        label: 'Returned for update',
        className: 'border-orange-200 bg-orange-50 text-orange-800',
        icon: FileText,
    },
    cancelled: {
        label: 'Cancelled',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
        icon: XCircle,
    },
};

function getStatus(statusValue: string) {
    const key = (statusValue ?? '').trim().toLowerCase();

    return (
        statusConfig[key] ?? {
            label: key
                ? key
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (letter) => letter.toUpperCase())
                : 'Unknown',
            className: 'border-slate-200 bg-slate-100 text-slate-600',
            icon: FileText,
        }
    );
}

function StatusBadge({ value }: { value: string }) {
    const status = getStatus(value);
    const Icon = status.icon;

    return (
        <span
            className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${status.className}`}
        >
            <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{status.label}</span>
        </span>
    );
}

function MetricCard({
    label,
    value,
    detail,
    icon: Icon,
    iconClassName,
}: {
    label: string;
    value: string | number;
    detail: string;
    icon: typeof FileText;
    iconClassName: string;
}) {
    return (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,42,76,0.04)] sm:p-5">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-[#17366b]">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </div>

                <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}
                >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
            </div>
        </section>
    );
}

function formatDate(value?: string) {
    if (!value) return '—';

    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);

    const date = dateOnly
        ? new Date(
              Date.UTC(
                  Number(dateOnly[1]),
                  Number(dateOnly[2]) - 1,
                  Number(dateOnly[3]),
              ),
          )
        : new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        ...(dateOnly ? { timeZone: 'UTC' } : {}),
    }).format(date);
}

function formatTime(value?: string) {
    if (!value) return '—';

    const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);

    if (!match) return value;

    const date = new Date();
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);

    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatMinutes(value: number) {
    const minutes = Math.max(0, Number(value) || 0);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours && remainingMinutes) {
        return `${hours}h ${remainingMinutes}m`;
    }

    if (hours) return `${hours}h`;

    return `${remainingMinutes}m`;
}

export default function Index({ applications, filters = {} }: Props) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [status, setStatus] = useState(filters.status ?? '');

    const rows = applications?.data ?? [];
    const total = applications?.total ?? 0;

    const pendingCount = rows.filter((application) =>
        ['submitted', 'pending_approval'].includes(
            (application.status ?? '').toLowerCase(),
        ),
    ).length;

    const approvedCount = rows.filter(
        (application) =>
            (application.status ?? '').toLowerCase() === 'approved',
    ).length;

    const rangeLabel = total
        ? `${applications.from ?? 0}–${applications.to ?? 0}`
        : '0';

    function applyFilters(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        router.get(
            '/undertime',
            {
                search: search.trim() || undefined,
                status: status || undefined,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    function clearFilters() {
        setSearch('');
        setStatus('');

        router.get(
            '/undertime',
            {},
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            },
        );
    }

    return (
        <div className="min-h-full bg-[#f4f7fb] text-slate-900">
            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                {/* Page header */}
                <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,42,76,0.04)] sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17366b] text-sm font-extrabold tracking-wide text-white shadow-sm">
                                BHF
                            </span>

                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                    Employee Services
                                </p>

                                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#17366b] sm:text-3xl">
                                    Undertime applications
                                </h1>

                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                                    Submit an early-departure request and
                                    monitor its approval status.
                                </p>
                            </div>
                        </div>

                        <Button
                            asChild
                            className="w-full shrink-0 rounded-lg bg-[#17366b] px-4 text-white shadow-sm hover:bg-[#102950] sm:w-auto"
                        >
                            <Link  href="/undertime/applications/create">
                                <Plus
                                    aria-hidden="true"
                                    className="mr-2 h-4 w-4"
                                />
                                File an undertime request
                            </Link>
                        </Button>
                    </div>
                </header>

                {/* Summary cards */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MetricCard
                        label="My requests"
                        value={total}
                        detail="All matching undertime requests"
                        icon={FileText}
                        iconClassName="bg-[#eaf3fb] text-[#2c6f9f]"
                    />

                    <MetricCard
                        label="Awaiting approval"
                        value={pendingCount}
                        detail="On this page"
                        icon={Clock3}
                        iconClassName="bg-amber-50 text-amber-700"
                    />

                    <MetricCard
                        label="Approved"
                        value={approvedCount}
                        detail="On this page"
                        icon={CheckCircle2}
                        iconClassName="bg-emerald-50 text-emerald-700"
                    />
                </div>

                {/* Search and filters */}
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,42,76,0.04)] sm:p-5">
                    <form
                        onSubmit={applyFilters}
                        className="flex flex-col gap-3 lg:flex-row lg:items-end"
                    >
                        <div className="min-w-0 flex-1">
                            <label
                                htmlFor="undertime-search"
                                className="mb-2 block text-xs font-semibold text-slate-600"
                            >
                                Search requests
                            </label>

                            <div className="relative">
                                <Search
                                    aria-hidden="true"
                                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    id="undertime-search"
                                    type="search"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search application number or reason..."
                                    className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#4389bc] focus:ring-2 focus:ring-[#4389bc]/20"
                                />
                            </div>
                        </div>

                        <div className="w-full lg:w-56">
                            <label
                                htmlFor="undertime-status"
                                className="mb-2 block text-xs font-semibold text-slate-600"
                            >
                                Application status
                            </label>

                            <select
                                id="undertime-status"
                                value={status}
                                onChange={(event) =>
                                    setStatus(event.target.value)
                                }
                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-[#4389bc] focus:ring-2 focus:ring-[#4389bc]/20"
                            >
                                <option value="">All statuses</option>
                                <option value="draft">Draft</option>
                                <option value="submitted">Submitted</option>
                                <option value="pending_approval">
                                    Pending approval
                                </option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="returned">
                                    Returned for update
                                </option>
                                <option value="cancelled">Cancelled</option>
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                className="h-11 flex-1 rounded-lg bg-[#17366b] px-4 text-white hover:bg-[#102950] lg:flex-none"
                            >
                                <SlidersHorizontal
                                    aria-hidden="true"
                                    className="mr-2 h-4 w-4"
                                />
                                Apply filters
                            </Button>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={clearFilters}
                                className="h-11 rounded-lg border-slate-200 px-4"
                            >
                                Reset
                            </Button>
                        </div>
                    </form>
                </section>

                {/* Applications */}
                <section
                    aria-labelledby="undertime-list-heading"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]"
                >
                    <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                        <h2
                            id="undertime-list-heading"
                            className="text-base font-semibold text-[#17366b]"
                        >
                            Your undertime requests
                        </h2>

                        <p className="text-sm text-slate-500">
                            Review your requested departure times and track
                            each application's progress.
                        </p>
                    </div>

                    {rows.length === 0 ? (
                        <div className="flex flex-col items-center px-5 py-14 text-center sm:py-20">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf3fb] text-[#4389bc]">
                                <CalendarDays
                                    aria-hidden="true"
                                    className="h-7 w-7"
                                />
                            </span>

                            <h3 className="mt-5 text-base font-semibold text-[#17366b]">
                                No undertime requests found
                            </h3>

                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                Try changing your search or filters, or file a
                                new request when you need to leave before your
                                scheduled working hours.
                            </p>

                            <Button
                                asChild
                                className="mt-6 rounded-lg bg-[#17366b] text-white hover:bg-[#102950]"
                            >
                                <Link  href="/undertime/applications/create">
                                    <Plus
                                        aria-hidden="true"
                                        className="mr-2 h-4 w-4"
                                    />
                                    File an undertime request
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            {/* Desktop table header */}
                            <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_auto] gap-5 bg-[#f8fafc] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500 md:grid">
                                <span>Application</span>
                                <span>Undertime date</span>
                                <span>Departure time</span>
                                <span>Status</span>
                                <span className="text-right">Actions</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {rows.map((application) => {
                                    const viewUrl =
                                        `/undertime/${application.id}`;

                                    return (
                                        <article
                                            key={application.id}
                                            className="transition-colors hover:bg-slate-50/70"
                                        >
                                            {/* Mobile layout */}
                                            <div className="space-y-4 p-4 md:hidden sm:p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={viewUrl}
                                                            className="break-all text-sm font-semibold text-[#17366b] underline-offset-4 hover:underline"
                                                        >
                                                            {application.application_no}
                                                        </Link>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Undertime request
                                                        </p>
                                                    </div>

                                                    <StatusBadge
                                                        value={application.status}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f8fafc] p-3">
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                            Request date
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                                            {formatDate(
                                                                application.undertime_date,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                            Departure
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                                            {formatTime(
                                                                application.requested_departure_time,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <p className="text-xs text-slate-600">
                                                        <span className="font-semibold text-slate-800">
                                                            {formatMinutes(
                                                                application.requested_minutes,
                                                            )}
                                                        </span>{' '}
                                                        requested
                                                    </p>

                                                    <Link
                                                        href={viewUrl}
                                                        className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#17366b] transition-colors hover:border-[#4389bc] hover:bg-[#f3f8fc]"
                                                    >
                                                        <Eye
                                                            aria-hidden="true"
                                                            className="h-4 w-4"
                                                        />
                                                        View details
                                                    </Link>
                                                </div>
                                            </div>

                                            {/* Desktop layout */}
                                            <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_auto] items-center gap-5 px-6 py-4 md:grid">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={viewUrl}
                                                        className="break-all text-sm font-semibold text-[#17366b] underline-offset-4 hover:underline"
                                                    >
                                                        {application.application_no}
                                                    </Link>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {formatMinutes(
                                                            application.requested_minutes,
                                                        )}{' '}
                                                        requested
                                                    </p>
                                                </div>

                                                <p className="text-sm font-medium text-slate-800">
                                                    {formatDate(
                                                        application.undertime_date,
                                                    )}
                                                </p>

                                                <p className="text-sm font-medium text-slate-800">
                                                    {formatTime(
                                                        application.requested_departure_time,
                                                    )}
                                                </p>

                                                <div>
                                                    <StatusBadge
                                                        value={application.status}
                                                    />
                                                </div>

                                                <div className="flex justify-end">
                                                    <Link
                                                        href={viewUrl}
                                                        aria-label={`View application ${application.application_no}`}
                                                        title="View application"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#4389bc] hover:bg-[#f3f8fc] hover:text-[#17366b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2"
                                                    >
                                                        <Eye
                                                            aria-hidden="true"
                                                            className="h-4 w-4"
                                                        />
                                                    </Link>
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </section>

                {/* Pagination */}
                {applications.last_page > 1 && (
                    <nav
                        aria-label="Undertime application pages"
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,42,76,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                        <p className="text-sm text-slate-600">
                            Showing{' '}
                            <span className="font-semibold text-slate-900">
                                {rangeLabel}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-slate-900">
                                {total}
                            </span>{' '}
                            requests
                        </p>

                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                            {applications.current_page > 1 ? (
                                <Link
                                    href={`/undertime?page=${applications.current_page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}`}
                                    preserveScroll
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                    Previous
                                </Link>
                            ) : (
                                <span className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-100 px-3 text-sm font-semibold text-slate-300">
                                    <ArrowLeft className="h-4 w-4" />
                                    Previous
                                </span>
                            )}

                            <span
                                aria-current="page"
                                className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-[#17366b] px-3 text-sm font-semibold text-white"
                            >
                                {applications.current_page}
                                <span className="sr-only">
                                    {' '}
                                    of {applications.last_page}
                                </span>
                            </span>

                            {applications.current_page <
                            applications.last_page ? (
                                <Link
                                    href={`/undertime?page=${applications.current_page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${status ? `&status=${encodeURIComponent(status)}` : ''}`}
                                    preserveScroll
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <span className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-100 px-3 text-sm font-semibold text-slate-300">
                                    Next
                                    <ArrowRight className="h-4 w-4" />
                                </span>
                            )}
                        </div>
                    </nav>
                )}

                <footer className="flex flex-col gap-1 px-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>BHF Rural Bank · Operations Management</span>
                    <span>
                        For questions about undertime requests, contact HR.
                    </span>
                </footer>
            </div>
        </div>
    );
}