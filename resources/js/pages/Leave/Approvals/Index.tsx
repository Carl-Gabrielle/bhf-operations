import { Head, Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
    History,
    Inbox,
    UserRound,
    XCircle,
} from 'lucide-react';

type Employee = {
    id: number;
    name: string;
    employee_number?: string | null;
    organizational_unit?: { name?: string | null } | null;
    position?: { name?: string | null } | null;
};

type LeaveType = {
    id?: number;
    name?: string | null;
    code?: string | null;
};

type LeaveApplication = {
    id: number;
    application_no?: string | null;
    start_date: string;
    end_date: string;
    total_days?: number | string | null;
    status: string;
    submitted_at?: string | null;
    reason?: string | null;
    remarks?: string | null;
    employee?: Employee | null;
    leave_type?: LeaveType | null;
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

type RecentApprovedApplication = {
    id: number;
    application_no?: string | null;
    start_date: string;
    end_date: string;
    total_days?: number | string | null;
    approved_at?: string | null;
    employee?: Employee | null;
    leave_type?: LeaveType | null;
};

type ApprovalHistoryItem = {
    id: number;
    action: string;
    remarks?: string | null;
    acted_at?: string | null;
    step_order?: number | null;
    leave_application?: (LeaveApplication & {
        approved_at?: string | null;
        rejected_at?: string | null;
    }) | null;
};

type Props = {
    applications: Paginated<LeaveApplication>;
    dashboard?: {
        pending_count: number;
        approved_count: number;
        rejected_count: number;
        decisions_count: number;
    };
    recentApproved?: RecentApprovedApplication[];
    approvalHistory?: Paginated<ApprovalHistoryItem>;
    approver?: {
        id: number;
        name: string;
        employee_number?: string | null;
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

function formatStatus(status?: string | null): string {
    if (!status) return 'Unavailable';

    return status
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function StatusBadge({ status }: { status?: string | null }) {
    const key = (status ?? '').toLowerCase();
    const isPending = ['pending', 'pending_approval', 'submitted'].includes(key);
    const isApproved = key === 'approved';
    const isRejected = key === 'rejected';
    const isProcessing = key === 'processing';

    const className = isPending
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : isApproved
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : isRejected
            ? 'border-rose-200 bg-rose-50 text-rose-800'
            : isProcessing
              ? 'border-blue-200 bg-blue-50 text-blue-800'
              : 'border-slate-200 bg-slate-50 text-slate-600';

    const Icon = isPending
        ? Clock3
        : isApproved
          ? CheckCircle2
          : isRejected
            ? XCircle
            : isProcessing
              ? Clock3
              : FileText;

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

function Pagination({
    page,
    lastPage,
    from,
    to,
    total,
    previous,
    next,
    label,
}: {
    page: number;
    lastPage: number;
    from?: number | null;
    to?: number | null;
    total: number;
    previous: string | null;
    next: string | null;
    label: string;
}) {
    if (lastPage <= 1) return null;

    const buttonClass =
        'inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500';

    return (
        <nav
            aria-label={label}
            className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between"
        >
            <p className="text-xs text-slate-500">
                Showing <span className="font-semibold text-slate-700">{from ?? 0}–{to ?? 0}</span> of{' '}
                <span className="font-semibold text-slate-700">{total}</span>
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

function EmployeeCell({ employee }: { employee?: Employee | null }) {
    return (
        <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <UserRound className="h-4 w-4" />
            </span>
            <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">
                    {employee?.name ?? 'Unknown employee'}
                </p>
                <p className="truncate text-xs text-slate-500">
                    {employee?.employee_number ?? 'No employee number'}
                    {employee?.organizational_unit?.name
                        ? ` · ${employee.organizational_unit.name}`
                        : ''}
                </p>
            </div>
        </div>
    );
}

export default function Index({
    applications,
    dashboard,
    approvalHistory,
    approver,
}: Props) {
    const requests = applications?.data ?? [];
    const historyItems = approvalHistory?.data ?? [];

    const total = applications?.total ?? requests.length;
    const currentPage = applications?.current_page ?? 1;
    const lastPage = applications?.last_page ?? 1;

    const historyTotal = approvalHistory?.total ?? historyItems.length;
    const historyCurrentPage = approvalHistory?.current_page ?? 1;
    const historyLastPage = approvalHistory?.last_page ?? 1;

    const pendingCount = dashboard?.pending_count ?? total;
    const approvedCount = dashboard?.approved_count ?? 0;
    const rejectedCount = dashboard?.rejected_count ?? 0;
    const decisionsCount = dashboard?.decisions_count ?? approvedCount + rejectedCount;

    const previousUrl =
        applications?.links?.find((link) => /previous|laquo/i.test(link.label))?.url ??
        (currentPage > 1 ? `/leave/approvals?page=${currentPage - 1}` : null);
    const nextUrl =
        applications?.links?.find((link) => /next|raquo/i.test(link.label))?.url ??
        (currentPage < lastPage ? `/leave/approvals?page=${currentPage + 1}` : null);

    const historyPreviousUrl =
        approvalHistory?.links?.find((link) => /previous|laquo/i.test(link.label))?.url ??
        (historyCurrentPage > 1
            ? `/leave/approvals?history_page=${historyCurrentPage - 1}`
            : null);
    const historyNextUrl =
        approvalHistory?.links?.find((link) => /next|raquo/i.test(link.label))?.url ??
        (historyCurrentPage < historyLastPage
            ? `/leave/approvals?history_page=${historyCurrentPage + 1}`
            : null);

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
            <Head title="Leave Approvals" />

            <main className="min-h-full bg-slate-50/70 text-slate-900">
                <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
                    <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                                BHF Operations
                            </p>
                            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">
                                Leave approvals
                            </h1>
                            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
                                Review assigned leave applications and monitor your approval activity.
                            </p>
                        </div>

                        {approver && (
                            <div className="text-left sm:text-right">
                                <p className="text-xs text-slate-500">Signed in as</p>
                                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                                    {approver.name}
                                </p>
                                <p className="mt-0.5 text-xs text-slate-500">
                                    {approver.employee_number ?? 'Authorized approver'}
                                </p>
                            </div>
                        )}
                    </header>

                    <section aria-label="Leave approval summary" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {metrics.map((metric) => (
                            <MetricCard key={metric.label} {...metric} />
                        ))}
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
                        <SectionHeading
                            title="Applications awaiting review"
                            description="Leave applications currently assigned to your approval step."
                            action={
                                <span className="w-fit rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                                    {total.toLocaleString('en-PH')} records
                                </span>
                            }
                        />

                        {requests.length === 0 ? (
                            <EmptyState
                                title="No applications to review"
                                description="There are no leave applications currently assigned to you. New requests will appear here when they reach your approval step."
                            />
                        ) : (
                            <>
                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full min-w-[850px] text-left">
                                        <thead className="bg-slate-50">
                                            <tr className="border-y border-slate-100">
                                                {[
                                                    'Employee',
                                                    'Leave type',
                                                    'Leave period',
                                                    'Duration',
                                                    'Status',
                                                    '',
                                                ].map((heading, index) => (
                                                    <th
                                                        key={`${heading}-${index}`}
                                                        scope="col"
                                                        className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                                                    >
                                                        {heading}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {requests.map((application) => (
                                                <tr
                                                    key={application.id}
                                                    className="transition-colors hover:bg-slate-50/70"
                                                >
                                                    <td className="px-5 py-4">
                                                        <EmployeeCell employee={application.employee} />
                                                        <p className="ml-12 mt-1 text-xs text-blue-800">
                                                            {application.application_no ??
                                                                `Application #${application.id}`}
                                                        </p>
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {application.leave_type?.name ?? 'Leave'}
                                                        </p>
                                                        {application.leave_type?.code && (
                                                            <p className="mt-1 text-xs text-slate-500">
                                                                {application.leave_type.code}
                                                            </p>
                                                        )}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-start gap-2">
                                                            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                            <div>
                                                                <p className="text-sm text-slate-800">
                                                                    {formatDate(application.start_date)}
                                                                </p>
                                                                <p className="mt-1 text-xs text-slate-500">
                                                                    to {formatDate(application.end_date)}
                                                                </p>
                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    Filed {formatDate(application.submitted_at)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-4 text-sm text-slate-700">
                                                        {application.total_days != null
                                                            ? `${application.total_days} ${Number(application.total_days) === 1 ? 'day' : 'days'}`
                                                            : '—'}
                                                    </td>

                                                    <td className="px-5 py-4">
                                                        <StatusBadge status={application.status} />
                                                    </td>

                                                    <td className="px-5 py-4 text-right">
                                                        <Link
                                                            href={`/leave/approvals/${application.id}`}
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
                                    {requests.map((application) => (
                                        <article key={application.id} className="space-y-3 p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <Link
                                                        href={`/leave/approvals/${application.id}`}
                                                        className="text-xs font-semibold text-blue-800"
                                                    >
                                                        {application.application_no ??
                                                            `Application #${application.id}`}
                                                    </Link>
                                                    <div className="mt-2">
                                                        <EmployeeCell employee={application.employee} />
                                                    </div>
                                                </div>
                                                <StatusBadge status={application.status} />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 rounded-lg bg-slate-50 p-3">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        Leave type
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {application.leave_type?.name ?? 'Leave'}
                                                    </p>
                                                    {application.leave_type?.code && (
                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {application.leave_type.code}
                                                        </p>
                                                    )}
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        Duration
                                                    </p>
                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {application.total_days != null
                                                            ? `${application.total_days} ${Number(application.total_days) === 1 ? 'day' : 'days'}`
                                                            : '—'}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        Start date
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-800">
                                                        {formatDate(application.start_date)}
                                                    </p>
                                                </div>

                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                                        End date
                                                    </p>
                                                    <p className="mt-1 text-sm text-slate-800">
                                                        {formatDate(application.end_date)}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between gap-3">
                                                <p className="text-xs text-slate-500">
                                                    Filed {formatDate(application.submitted_at)}
                                                </p>
                                                <Link
                                                    href={`/leave/approvals/${application.id}`}
                                                    className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-900 px-3 text-sm font-medium text-white transition hover:bg-slate-700"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                    Review
                                                </Link>
                                            </div>
                                        </article>
                                    ))}
                                </div>
                            </>
                        )}

                        <Pagination
                            page={currentPage}
                            lastPage={lastPage}
                            from={applications?.from}
                            to={applications?.to}
                            total={total}
                            previous={previousUrl}
                            next={nextUrl}
                            label="Leave applications pagination"
                        />
                    </section>

                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm shadow-slate-200/30">
                        <SectionHeading
                            title="Approval history"
                            description="A record of decisions you have made on submitted leave applications."
                            action={
                                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                                    <History className="h-3.5 w-3.5" />
                                    {historyTotal.toLocaleString('en-PH')} records
                                </span>
                            }
                        />

                        {historyItems.length === 0 ? (
                            <EmptyState
                                title="No decisions recorded"
                                description="Your approved and rejected leave decisions will appear here."
                            />
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {historyItems.map((item) => {
                                    const application = item.leave_application;
                                    const decision = item.action?.toLowerCase();
                                    const isApproved = decision === 'approved';

                                    return (
                                        <article
                                            key={item.id}
                                            className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                            <div className="flex min-w-0 items-start gap-3">
                                                <span
                                                    className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                                        isApproved
                                                            ? 'bg-emerald-50 text-emerald-700'
                                                            : 'bg-rose-50 text-rose-700'
                                                    }`}
                                                >
                                                    {isApproved ? (
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4" />
                                                    )}
                                                </span>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-800">
                                                        {application?.employee?.name ?? 'Unknown employee'}
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        {application?.application_no ??
                                                            `Application #${application?.id ?? '—'}`}
                                                        {' · '}
                                                        {application?.leave_type?.name ?? 'Leave'}
                                                        {application?.employee?.employee_number
                                                            ? ` · ${application.employee.employee_number}`
                                                            : ''}
                                                        {application?.employee?.organizational_unit?.name
                                                            ? ` · ${application.employee.organizational_unit.name}`
                                                            : ''}
                                                    </p>
                                                    {item.remarks && (
                                                        <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-500">
                                                            <span className="font-medium text-slate-600">
                                                                Remarks:{' '}
                                                            </span>
                                                            {item.remarks}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
                                                <StatusBadge status={item.action} />
                                                <div className="text-left sm:text-right">
                                                    <p className="text-xs font-medium text-slate-700">
                                                        {formatDate(item.acted_at)}
                                                    </p>
                                                    {item.step_order != null && (
                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            Approval step {item.step_order}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}

                        <Pagination
                            page={historyCurrentPage}
                            lastPage={historyLastPage}
                            from={approvalHistory?.from}
                            to={approvalHistory?.to}
                            total={historyTotal}
                            previous={historyPreviousUrl}
                            next={historyNextUrl}
                            label="Approval history pagination"
                        />
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
