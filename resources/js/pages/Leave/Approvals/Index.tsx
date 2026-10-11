import { Link } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    Eye,
    FileText,
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
    leave_type?: {
        id?: number;
        name?: string | null;
        code?: string | null;
    } | null;
};

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginatedApplications = {
    data: LeaveApplication[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from?: number | null;
    to?: number | null;
    links?: PaginationLink[];
};

type Props = {
    applications: PaginatedApplications;
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

function StatusBadge({ status }: { status?: string | null }) {
    const key = (status ?? '').trim().toLowerCase();
    const config: Record<string, { label: string; className: string; icon: typeof Clock3 }> = {
        pending_approval: {
            label: 'Pending approval',
            className: 'border-amber-200 bg-amber-50 text-amber-800',
            icon: Clock3,
        },
        submitted: {
            label: 'Submitted',
            className: 'border-blue-200 bg-blue-50 text-blue-800',
            icon: FileText,
        },
        processing: {
            label: 'Processing',
            className: 'border-blue-200 bg-blue-50 text-blue-800',
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
    };

    const selected = config[key] ?? {
        label: key
            ? key.replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
            : 'Status unavailable',
        className: 'border-slate-200 bg-slate-100 text-slate-600',
        icon: FileText,
    };
    const Icon = selected.icon;

    return (
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${selected.className}`}>
            <Icon aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
            {selected.label}
        </span>
    );
}

function PaginationButton({
    href,
    children,
    disabled,
    label,
}: {
    href: string | null;
    children: React.ReactNode;
    disabled: boolean;
    label: string;
}) {
    const base =
        'inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2';

    if (disabled || !href) {
        return (
            <span aria-disabled="true" className={`${base} cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300`}>
                {children}
            </span>
        );
    }

    return (
        <Link
            href={href}
            preserveScroll
            aria-label={label}
            className={`${base} border-slate-200 bg-white text-slate-700 hover:border-[#b7cfe2] hover:bg-[#f3f8fc] hover:text-[#205c86]`}
        >
            {children}
        </Link>
    );
}

export default function Index({ applications }: Props) {
    const requests = applications?.data ?? [];
    const total = applications?.total ?? requests.length;
    const currentPage = applications?.current_page ?? 1;
    const lastPage = applications?.last_page ?? 1;
    const hasRequests = requests.length > 0;

    const previousUrl =
        applications?.links?.find((link) => /previous|laquo/i.test(link.label))?.url ??
        (currentPage > 1 ? `/leave/approvals?page=${currentPage - 1}` : null);
    const nextUrl =
        applications?.links?.find((link) => /next|raquo/i.test(link.label))?.url ??
        (currentPage < lastPage ? `/leave/approvals?page=${currentPage + 1}` : null);

    return (
        <div className="min-h-full bg-[#f4f7fb] text-slate-900">
            <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(16,42,76,0.04)] sm:p-7">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex min-w-0 items-start gap-4">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17366b] text-xs font-extrabold tracking-wide text-white shadow-sm">
                                BHF
                            </span>
                            <div className="min-w-0">
                                <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-[#4389bc]">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#4389bc]" />
                                    Approval workspace
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight text-[#17366b] sm:text-3xl">
                                    Leave approvals
                                </h1>
                                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                                    Review employee leave requests assigned to you and record your decision.
                                </p>
                            </div>
                        </div>
                        <div className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 sm:w-auto">
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700 ring-1 ring-amber-200">
                                <Clock3 aria-hidden="true" className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="text-xs font-medium text-amber-800">Awaiting your review</p>
                                <p className="mt-0.5 text-xl font-semibold leading-6 text-amber-900">{total}</p>
                            </div>
                        </div>
                    </div>
                </header>

                <section
                    aria-labelledby="approvals-heading"
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]"
                >
                    <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                        <div>
                            <h2 id="approvals-heading" className="text-base font-semibold text-[#17366b]">
                                Requests for review
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Open a request to review its details and take action.
                            </p>
                        </div>
                        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
                            <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                            {total} {total === 1 ? 'request' : 'requests'}
                        </span>
                    </div>

                    {!hasRequests ? (
                        <div className="flex flex-col items-center px-5 py-14 text-center sm:py-20">
                            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#eaf3fb] text-[#4389bc]">
                                <Inbox aria-hidden="true" className="h-7 w-7" />
                            </span>
                            <h3 className="mt-5 text-base font-semibold text-[#17366b]">
                                No pending leave requests
                            </h3>
                            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                                There are no applications currently assigned to you for review. New requests will appear here when they reach your approval step.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="hidden overflow-x-auto md:block">
                                <table className="w-full min-w-[850px] border-collapse text-left">
                                    <thead className="bg-[#f8fafc]">
                                        <tr className="border-b border-slate-200">
                                            <th scope="col" className="px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Employee</th>
                                            <th scope="col" className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Leave type</th>
                                            <th scope="col" className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Leave period</th>
                                            <th scope="col" className="px-4 py-3.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Status</th>
                                            <th scope="col" className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-[0.09em] text-slate-500">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {requests.map((application) => {
                                            const employee = application.employee;
                                            const reviewUrl = `/leave/approvals/${application.id}`;

                                            return (
                                                <tr key={application.id} className="transition-colors hover:bg-slate-50/80">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-start gap-3">
                                                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3fb] text-[#205c86]">
                                                                <UserRound aria-hidden="true" className="h-5 w-5" />
                                                            </span>
                                                            <div className="min-w-0">
                                                                <Link href={reviewUrl} className="text-sm font-semibold text-[#205c86] hover:text-[#17366b] hover:underline">
                                                                    {application.application_no ?? `Application #${application.id}`}
                                                                </Link>
                                                                <p className="mt-1 truncate text-sm font-medium text-slate-800">{employee?.name ?? 'Unknown employee'}</p>
                                                                <p className="mt-1 truncate text-xs text-slate-500">
                                                                    {employee?.employee_number ?? 'No employee number'}
                                                                    {employee?.organizational_unit?.name ? ` · ${employee.organizational_unit.name}` : ''}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <p className="text-sm font-medium text-slate-800">{application.leave_type?.name ?? 'Leave'}</p>
                                                        {application.leave_type?.code && <p className="mt-1 text-xs text-slate-500">{application.leave_type.code}</p>}
                                                        {application.total_days != null && (
                                                            <p className="mt-2 text-xs text-slate-500">
                                                                {application.total_days} {Number(application.total_days) === 1 ? 'day' : 'days'}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="px-4 py-4">
                                                        <div className="flex items-start gap-2.5">
                                                            <CalendarDays aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-800">{formatDate(application.start_date)}</p>
                                                                <p className="mt-1 text-sm text-slate-500">to {formatDate(application.end_date)}</p>
                                                                <p className="mt-2 text-xs text-slate-400">Submitted {formatDate(application.submitted_at)}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-4"><StatusBadge status={application.status} /></td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link
                                                            href={reviewUrl}
                                                            aria-label={`Review application ${application.application_no ?? application.id}`}
                                                            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-[#205c86] transition-colors hover:border-[#b7cfe2] hover:bg-[#f3f8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2"
                                                        >
                                                            <Eye aria-hidden="true" className="h-4 w-4" />
                                                            Review
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="divide-y divide-slate-100 md:hidden">
                                {requests.map((application) => {
                                    const employee = application.employee;
                                    const reviewUrl = `/leave/approvals/${application.id}`;

                                    return (
                                        <article key={application.id} className="space-y-4 p-4 sm:p-5">
                                            <div className="flex items-start gap-3">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3fb] text-[#205c86]">
                                                    <UserRound aria-hidden="true" className="h-5 w-5" />
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-wrap items-start justify-between gap-2">
                                                        <Link href={reviewUrl} className="break-words text-sm font-semibold text-[#205c86] hover:underline">
                                                            {application.application_no ?? `Application #${application.id}`}
                                                        </Link>
                                                        <StatusBadge status={application.status} />
                                                    </div>
                                                    <p className="mt-1.5 text-sm font-semibold text-slate-900">{employee?.name ?? 'Unknown employee'}</p>
                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {employee?.employee_number ?? 'No employee number'}
                                                        {employee?.organizational_unit?.name ? ` · ${employee.organizational_unit.name}` : ''}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-[#f8fafc] p-3.5">
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">Leave type</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-800">{application.leave_type?.name ?? 'Leave'}</p>
                                                    {application.leave_type?.code && <p className="mt-0.5 text-xs text-slate-500">{application.leave_type.code}</p>}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">Duration</p>
                                                    <p className="mt-1 text-sm font-medium text-slate-800">
                                                        {application.total_days != null
                                                            ? `${application.total_days} ${Number(application.total_days) === 1 ? 'day' : 'days'}`
                                                            : 'Not specified'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">From</p>
                                                    <p className="mt-1 text-sm text-slate-800">{formatDate(application.start_date)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">To</p>
                                                    <p className="mt-1 text-sm text-slate-800">{formatDate(application.end_date)}</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center justify-between gap-3">
                                                <p className="text-xs text-slate-500">Submitted {formatDate(application.submitted_at)}</p>
                                                <Link href={reviewUrl} className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-[#17366b] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#102950] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2">
                                                    <Eye aria-hidden="true" className="h-4 w-4" />
                                                    Review request
                                                </Link>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </section>

                {lastPage > 1 && (
                    <nav
                        aria-label="Leave approval pagination"
                        className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_1px_2px_rgba(16,42,76,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                    >
                        <p className="text-sm text-slate-600">
                            Showing <span className="font-semibold text-slate-900">{applications.from ?? 0}–{applications.to ?? 0}</span>
                            {' '}of <span className="font-semibold text-slate-900">{total}</span> requests
                        </p>
                        <div className="flex items-center justify-between gap-2 sm:justify-end">
                            <PaginationButton href={previousUrl} disabled={currentPage <= 1} label="Previous page">
                                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                                Previous
                            </PaginationButton>
                            <span aria-current="page" className="inline-flex h-10 min-w-10 items-center justify-center rounded-lg bg-[#17366b] px-3 text-sm font-semibold text-white">
                                {currentPage}
                                <span className="sr-only"> of {lastPage}</span>
                            </span>
                            <PaginationButton href={nextUrl} disabled={currentPage >= lastPage} label="Next page">
                                Next
                                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                            </PaginationButton>
                        </div>
                    </nav>
                )}

                <footer className="flex flex-col gap-1 px-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
                    <span>BHF Rural Bank</span>
                    <span>Review requests according to your assigned approval workflow.</span>
                </footer>
            </div>
        </div>
    );
}
