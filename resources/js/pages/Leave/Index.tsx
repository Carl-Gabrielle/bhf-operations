import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Edit3,
    Eye,
    FileText,
    Plus,
    XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type LeaveApplication = {
    id: number;
    application_no: string;
    start_date: string;
    end_date: string;
    total_days: string | number;
    status: string;
    reason: string;
    schedule_type?: string;
    leave_type?: {
        id: number;
        name: string;
        code: string;
    };
    approvals?: {
        id: number;
        step_order: number;
        approver_id: number;
        action: string;
        remarks?: string | null;
        acted_at?: string | null;
        approver?: {
            id: number;
            name: string;
        };
    }[];
};

type PaginatedApplications = {
    data: LeaveApplication[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
};

type Props = {
    applications: PaginatedApplications;
};

const statusConfig = {
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
    processing: {
        label: 'Processing',
        className: 'border-blue-200 bg-blue-50 text-blue-800',
        icon: Clock3,
    },
    completed: {
        label: 'Completed',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        icon: CheckCircle2,
    },
    cancelled: {
        label: 'Cancelled',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
        icon: XCircle,
    },
    submitted: {
        label: 'Submitted',
        className: 'border-blue-200 bg-blue-50 text-blue-800',
        icon: FileText,
    },
    draft: {
        label: 'Draft',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
        icon: FileText,
    },
} as const;

const getStatus = (value: string) => {
    const key = value?.trim().toLowerCase() ?? '';

    if (Object.prototype.hasOwnProperty.call(statusConfig, key)) {
        return statusConfig[key as keyof typeof statusConfig];
    }

    return {
        label: key
            ? key
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())
            : 'Status unavailable',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
        icon: FileText,
    };
};

const formatDate = (value: string) => {
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
};

const formatSchedule = (schedule?: string) => {
    const labels: Record<string, string> = {
        full_day: 'Full day',
        half_day_am: 'Half day · AM',
        half_day_pm: 'Half day · PM',
    };

    return schedule
        ? labels[schedule] ??
              schedule
                  .replace(/_/g, ' ')
                  .replace(/\b\w/g, (letter) => letter.toUpperCase())
        : 'Schedule not specified';
};

function StatusBadge({ value }: { value: string }) {
    const status = getStatus(value);
    const StatusIcon = status.icon;

    return (
        <span
            className={
                'inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ' +
                status.className
            }
        >
            <StatusIcon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
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
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                        {label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold tracking-tight text-[#17366b]">
                        {value}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">{detail}</p>
                </div>
                <span
                    className={
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ' +
                        iconClassName
                    }
                >
                    <Icon aria-hidden="true" className="h-5 w-5" />
                </span>
            </div>
        </section>
    );
}

export default function Index({ applications }: Props) {
    const hasApplications = applications.data.length > 0;
    const pendingOnPage = applications.data.filter((application) =>
        ['pending_approval', 'submitted', 'processing'].includes(
            application.status,
        ),
    ).length;
    const rangeLabel = applications.total
        ? String(applications.from ?? 0) + '–' + String(applications.to ?? 0)
        : '0';

    return (
        <div className="min-h-full bg-[#f4f7fb] text-slate-900">
            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,42,76,0.04)] sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17366b] text-sm font-extrabold tracking-wide text-white shadow-sm">
                                BHF
                            </span>
                            <div className="min-w-0">
                                <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#17366b] sm:text-3xl">
                                    Leave applications
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                                    View your requests, check their status, and
                                    keep track of upcoming leave.
                                </p>
                            </div>
                        </div>

                        <Button
                            asChild
                            className="w-full shrink-0 rounded-lg bg-[#17366b] px-4 text-white shadow-sm hover:bg-[#102950] sm:w-auto"
                        >
                            <Link href="/leave/applications/create">
                                <Plus
                                    aria-hidden="true"
                                    className="mr-2 h-4 w-4"
                                />
                                Apply for leave
                            </Link>
                        </Button>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <MetricCard
                        label="My applications"
                        value={applications.total}
                        detail="All submitted leave requests"
                        icon={FileText}
                        iconClassName="bg-[#eaf3fb] text-[#2c6f9f]"
                    />
                    <MetricCard
                        label="In progress"
                        value={pendingOnPage}
                        detail="On this page"
                        icon={Clock3}
                        iconClassName="bg-amber-50 text-amber-700"
                    />
                    <MetricCard
                        label="Showing"
                        value={rangeLabel}
                        detail={'of ' + applications.total + ' applications'}
                        icon={CalendarDays}
                        iconClassName="bg-[#f2efff] text-[#5b4a9d]"
                    />
                </div>

                <section
                    aria-labelledby="applications-heading"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]"
                >
                    <div className="flex flex-col gap-1 border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">
                        <h2
                            id="applications-heading"
                            className="text-base font-semibold text-[#17366b]"
                        >
                            Your leave requests
                        </h2>
                        <p className="text-sm text-slate-500">
                            Select a request to view its details. Draft and
                            returned requests can be edited.
                        </p>
                    </div>

                    {!hasApplications ? (
                        <div className="flex flex-col items-center px-5 py-14 text-center sm:py-20">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf3fb] text-[#4389bc]">
                                <CalendarDays
                                    aria-hidden="true"
                                    className="h-7 w-7"
                                />
                            </span>
                            <h3 className="mt-5 text-base font-semibold text-[#17366b]">
                                No leave applications yet
                            </h3>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                When you submit a leave request, you’ll be able
                                to review its status and details here.
                            </p>
                            <Button
                                asChild
                                className="mt-6 rounded-lg bg-[#17366b] text-white hover:bg-[#102950]"
                            >
                                <Link href="/leave/applications/create">
                                    <Plus
                                        aria-hidden="true"
                                        className="mr-2 h-4 w-4"
                                    />
                                    Start an application
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            <div className="hidden grid-cols-[1.25fr_0.95fr_1.35fr_1fr_auto] gap-5 bg-[#f8fafc] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500 md:grid">
                                <span>Application</span>
                                <span>Leave type</span>
                                <span>Leave period</span>
                                <span>Status</span>
                                <span className="text-right">Actions</span>
                            </div>

                            <div className="divide-y divide-slate-100">
                                {applications.data.map((application) => {
                                    const canEdit = [
                                        'draft',
                                        'returned',
                                    ].includes(application.status);
                                    const viewUrl =
                                        '/leave/applications/' + application.id;
                                    const editUrl = viewUrl + '/edit';

                                    return (
                                        <article
                                            key={application.id}
                                            className="transition-colors hover:bg-slate-50/70"
                                        >
                                            <div className="space-y-4 p-4 md:hidden sm:p-5">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={viewUrl}
                                                            className="break-all text-sm font-semibold text-[#17366b] decoration-[#4389bc] underline-offset-4 hover:underline"
                                                        >
                                                            {application.application_no}
                                                        </Link>
                                                        <p className="mt-1 text-sm text-slate-600">
                                                            {application
                                                                .leave_type
                                                                ?.name ?? 'Leave'}
                                                        </p>
                                                    </div>
                                                    <StatusBadge
                                                        value={application.status}
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 rounded-xl bg-[#f8fafc] p-3">
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                            From
                                                        </p>
                                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                                            {formatDate(
                                                                application.start_date,
                                                            )}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                            To
                                                        </p>
                                                        <p className="mt-1 text-sm font-medium text-slate-800">
                                                            {formatDate(
                                                                application.end_date,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                    <p className="text-xs text-slate-600">
                                                        <span className="font-semibold text-slate-800">
                                                            {application.total_days}{' '}
                                                            day(s)
                                                        </span>
                                                        <span className="mx-2 text-slate-300">
                                                            ·
                                                        </span>
                                                        {formatSchedule(
                                                            application.schedule_type,
                                                        )}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Link
                                                            href={viewUrl}
                                                            aria-label={
                                                                'View application ' +
                                                                application.application_no
                                                            }
                                                            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-[#17366b] transition-colors hover:border-[#4389bc] hover:bg-[#f3f8fc]"
                                                        >
                                                            <Eye
                                                                aria-hidden="true"
                                                                className="h-4 w-4"
                                                            />
                                                            View
                                                        </Link>
                                                        {canEdit ? (
                                                            <Link
                                                                href={editUrl}
                                                                aria-label={
                                                                    'Edit application ' +
                                                                    application.application_no
                                                                }
                                                                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition-colors hover:border-amber-300 hover:bg-amber-50"
                                                            >
                                                                <Edit3
                                                                    aria-hidden="true"
                                                                    className="h-4 w-4"
                                                                />
                                                                Edit
                                                            </Link>
                                                        ) : (
                                                            <span
                                                                aria-disabled="true"
                                                                title="Only draft or returned applications can be edited"
                                                                className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 text-xs font-semibold text-slate-300"
                                                            >
                                                                <Edit3
                                                                    aria-hidden="true"
                                                                    className="h-4 w-4"
                                                                />
                                                                Edit
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="hidden grid-cols-[1.25fr_0.95fr_1.35fr_1fr_auto] items-center gap-5 px-6 py-4 md:grid">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={viewUrl}
                                                        className="break-all text-sm font-semibold text-[#17366b] decoration-[#4389bc] underline-offset-4 hover:underline"
                                                    >
                                                        {application.application_no}
                                                    </Link>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        Leave request
                                                    </p>
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-slate-800">
                                                        {application.leave_type
                                                            ?.name ?? 'Leave'}
                                                    </p>
                                                    {application.leave_type
                                                        ?.code && (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {
                                                                application
                                                                    .leave_type
                                                                    .code
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {formatDate(
                                                            application.start_date,
                                                        )}
                                                        <span className="mx-1.5 text-slate-400">
                                                            –
                                                        </span>
                                                        {formatDate(
                                                            application.end_date,
                                                        )}
                                                    </p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {application.total_days}{' '}
                                                        day(s) ·{' '}
                                                        {formatSchedule(
                                                            application.schedule_type,
                                                        )}
                                                    </p>
                                                </div>

                                                <div>
                                                    <StatusBadge
                                                        value={application.status}
                                                    />
                                                </div>

                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={viewUrl}
                                                        aria-label={
                                                            'View application ' +
                                                            application.application_no
                                                        }
                                                        title="View application"
                                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-[#4389bc] hover:bg-[#f3f8fc] hover:text-[#17366b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2"
                                                    >
                                                        <Eye
                                                            aria-hidden="true"
                                                            className="h-4 w-4"
                                                        />
                                                    </Link>
                                                    {canEdit ? (
                                                        <Link
                                                            href={editUrl}
                                                            aria-label={
                                                                'Edit application ' +
                                                                application.application_no
                                                            }
                                                            title="Edit application"
                                                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                                                        >
                                                            <Edit3
                                                                aria-hidden="true"
                                                                className="h-4 w-4"
                                                            />
                                                        </Link>
                                                    ) : (
                                                        <span
                                                            aria-disabled="true"
                                                            title="Only draft or returned applications can be edited"
                                                            className="inline-flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300"
                                                        >
                                                            <Edit3
                                                                aria-hidden="true"
                                                                className="h-4 w-4"
                                                            />
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </section>

                {applications.last_page > 1 && (
                    <nav
                        aria-label="Leave application pages"
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,42,76,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                        <p className="text-sm text-slate-600">
                            Showing{' '}
                            <span className="font-semibold text-slate-900">
                                {applications.from ?? 0}–{applications.to ?? 0}
                            </span>{' '}
                            of{' '}
                            <span className="font-semibold text-slate-900">
                                {applications.total}
                            </span>{' '}
                            applications
                        </p>

                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                            {applications.current_page > 1 ? (
                                <Link
                                    href={
                                        '/leave/applications?page=' +
                                        (applications.current_page - 1)
                                    }
                                    preserveScroll
                                    aria-label="Go to previous page"
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2"
                                >
                                    <ArrowLeft
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                    <span>Previous</span>
                                </Link>
                            ) : (
                                <span className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-100 px-3 text-sm font-semibold text-slate-300">
                                    <ArrowLeft
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                    <span>Previous</span>
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
                                    href={
                                        '/leave/applications?page=' +
                                        (applications.current_page + 1)
                                    }
                                    preserveScroll
                                    aria-label="Go to next page"
                                    className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2"
                                >
                                    <span>Next</span>
                                    <ArrowRight
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                </Link>
                            ) : (
                                <span className="inline-flex min-h-10 cursor-not-allowed items-center gap-2 rounded-lg border border-slate-100 px-3 text-sm font-semibold text-slate-300">
                                    <span>Next</span>
                                    <ArrowRight
                                        aria-hidden="true"
                                        className="h-4 w-4"
                                    />
                                </span>
                            )}
                        </div>
                    </nav>
                )}

                <footer className="flex flex-col gap-1 px-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>BHF Rural Bank </span>
                    <span>For leave policy questions, contact your HR team.</span>
                </footer>
            </div>
        </div>
    );
}
