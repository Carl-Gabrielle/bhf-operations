import { Head, Link } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowRight,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Inbox,
    UserRound,
} from 'lucide-react';

type Employee = {
    id: number;
    name: string;
    employee_number?: string | null;
    organizational_unit?: {
        id: number;
        name: string;
    } | null;
    position?: {
        id: number;
        name: string;
    } | null;
};

type LeaveType = {
    id: number;
    name: string;
    code?: string | null;
};

type Approval = {
    id: number;
    status: string;
    approver_id?: number;
};

type LeaveApplication = {
    id: number;
    application_no?: string | null;

    status: string;

    start_date: string;
    end_date: string;

    total_days?: number | string | null;

    schedule_type?:
        | 'full_day'
        | 'half_day_am'
        | 'half_day_pm'
        | string
        | null;

    reason?: string | null;

    employee: Employee;
    leave_type: LeaveType;

    approvals?: Approval[];
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

    from: number | null;
    to: number | null;
    total: number;

    links: PaginationLink[];
};

type Approver = {
    id: number;
    name: string;
    employee_number?: string | null;
    can_be_reporting_manager: boolean;
};

type Props = {
    applications: PaginatedApplications;
    approver: Approver;
};

export default function Index({
    applications,
    approver,
}: Props) {
    const pendingCount = applications.total;

    const formatDate = (date: string) => {
        if (!date) {
            return '—';
        }

        const parsed = new Date(
            `${date}T00:00:00`,
        );

        if (Number.isNaN(parsed.getTime())) {
            return date;
        }

        return new Intl.DateTimeFormat(
            'en-US',
            {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            },
        )
            .format(parsed)
            .replace(
                /^([A-Za-z]{3}) /,
                '$1. ',
            );
    };

    const formatDateRange = (
        start: string,
        end: string,
    ) => {
        const startFormatted =
            formatDate(start);

        const endFormatted =
            formatDate(end);

        if (start === end) {
            return startFormatted;
        }

        return `${startFormatted} – ${endFormatted}`;
    };

    const formatDuration = (
        days?: number | string | null,
    ) => {
        const numericDays = Number(days ?? 0);

        const unit =
            numericDays === 0.5 ||
            numericDays === 1
                ? 'day'
                : 'days';

        return `${numericDays} ${unit}`;
    };

    const getEmployeeDepartment = (
        application: LeaveApplication,
    ) => {
        return (
            application.employee
                ?.organizational_unit?.name ?? '—'
        );
    };

    const getEmployeePosition = (
        application: LeaveApplication,
    ) => {
        return (
            application.employee
                ?.position?.name ?? '—'
        );
    };

    return (
        <>
            <Head title="Leave Approvals" />

            <div className="min-h-screen bg-[#f7f9fc]">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="mb-6">
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">

                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#28658F] via-[#4389BC] to-[#75AFCF]" />

                            <div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4389BC]/10 ring-1 ring-[#4389BC]/10">
                                        <Inbox className="h-5 w-5 text-[#4389BC]" />
                                    </div>

                                    <div>
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4389BC]">
                                                Leave Management
                                            </span>

                                            <span className="h-1 w-1 rounded-full bg-slate-300" />

                                            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                                                Approvals
                                            </span>
                                        </div>

                                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                            Leave Approvals
                                        </h1>

                                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                                            Review and process leave requests
                                            submitted by employees assigned
                                            to you.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                                        <UserRound className="h-4 w-4 text-[#4389BC]" />
                                    </div>

                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                                            Approver
                                        </p>

                                        <p className="mt-0.5 max-w-[180px] truncate text-sm font-semibold text-slate-700">
                                            {approver.name}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* =====================================================
                        SUMMARY CARDS
                    ====================================================== */}

                    <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                        <SummaryCard
                            icon={
                                <Clock3 className="h-4 w-4" />
                            }
                            label="Pending Requests"
                            value={pendingCount}
                            description="Awaiting your action"
                            highlighted
                        />

                        <SummaryCard
                            icon={
                                <FileText className="h-4 w-4" />
                            }
                            label="Current Page"
                            value={
                                applications.data.length
                            }
                            description="Requests displayed"
                        />

                        <SummaryCard
                            icon={
                                <CheckCircle2 className="h-4 w-4" />
                            }
                            label="Approval Access"
                            value={
                                approver.can_be_reporting_manager
                                    ? 'Enabled'
                                    : 'Restricted'
                            }
                            description="Reporting manager eligibility"
                        />
                    </div>

                    {/* =====================================================
                        APPROVAL TABLE
                    ====================================================== */}

                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)]">

                        <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Requests Awaiting Approval
                                </h2>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Review each request before making an
                                    approval decision.
                                </p>
                            </div>

                            <div className="inline-flex w-fit items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm">
                                <Clock3 className="h-3.5 w-3.5" />
                                {pendingCount}{' '}
                                pending
                            </div>
                        </div>

                        {applications.data.length === 0 ? (
                            <EmptyState />
                        ) : (
                            <>
                                {/* Desktop */}

                                <div className="hidden overflow-x-auto md:block">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-slate-100 bg-slate-50/50 text-left">
                                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                    Employee
                                                </th>

                                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                    Leave Type
                                                </th>

                                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                    Period
                                                </th>

                                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                    Duration
                                                </th>

                                                <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                    Status
                                                </th>

                                                <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                                                    Action
                                                </th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-slate-100">
                                            {applications.data.map(
                                                (
                                                    application,
                                                ) => (
                                                    <tr
                                                        key={
                                                            application.id
                                                        }
                                                        className="group transition-colors hover:bg-slate-50/70"
                                                    >
                                                        {/* Employee */}

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#4389BC]/10 text-xs font-bold text-[#28658F]">
                                                                    {getInitials(
                                                                        application
                                                                            .employee
                                                                            ?.name,
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                                        {
                                                                            application
                                                                                .employee
                                                                                ?.name
                                                                        }
                                                                    </p>

                                                                    <p className="mt-0.5 truncate text-xs text-slate-400">
                                                                        {application
                                                                            .employee
                                                                            ?.employee_number ??
                                                                            'No employee number'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Leave Type */}

                                                        <td className="px-6 py-4">
                                                            <p className="text-sm font-medium text-slate-700">
                                                                {
                                                                    application
                                                                        .leave_type
                                                                        ?.name
                                                                }
                                                            </p>

                                                            {application
                                                                .leave_type
                                                                ?.code && (
                                                                <p className="mt-0.5 text-xs text-slate-400">
                                                                    {
                                                                        application
                                                                            .leave_type
                                                                            .code
                                                                    }
                                                                </p>
                                                            )}
                                                        </td>

                                                        {/* Period */}

                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                                                <span className="whitespace-nowrap text-sm text-slate-700">
                                                                    {formatDateRange(
                                                                        application.start_date,
                                                                        application.end_date,
                                                                    )}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Duration */}

                                                        <td className="px-6 py-4">
                                                            <span className="text-sm font-semibold text-slate-700">
                                                                {formatDuration(
                                                                    application.total_days,
                                                                )}
                                                            </span>
                                                        </td>

                                                        {/* Status */}

                                                        <td className="px-6 py-4">
                                                            <StatusBadge
                                                                status={
                                                                    application.status
                                                                }
                                                            />
                                                        </td>

                                                        {/* Action */}

                                                        <td className="px-6 py-4 text-right">
                                                            <Link
                                                                href={`/leave/approvals/${application.id}`}
                                                                className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-[#4389BC]/30 hover:bg-[#4389BC]/5 hover:text-[#28658F]"
                                                            >
                                                                Review
                                                                <ArrowRight className="h-3.5 w-3.5" />
                                                            </Link>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Mobile */}

                                <div className="divide-y divide-slate-100 md:hidden">
                                    {applications.data.map(
                                        (
                                            application,
                                        ) => (
                                            <Link
                                                key={
                                                    application.id
                                                }
                                                href={`/leave/approvals/${application.id}`}
                                                className="block p-5 transition-colors hover:bg-slate-50"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex min-w-0 items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#4389BC]/10 text-xs font-bold text-[#28658F]">
                                                            {getInitials(
                                                                application
                                                                    .employee
                                                                    ?.name,
                                                            )}
                                                        </div>

                                                        <div className="min-w-0">
                                                            <p className="truncate text-sm font-semibold text-slate-800">
                                                                {
                                                                    application
                                                                        .employee
                                                                        ?.name
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 truncate text-xs text-slate-400">
                                                                {application
                                                                    .employee
                                                                    ?.employee_number ??
                                                                    'No employee number'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <StatusBadge
                                                        status={
                                                            application.status
                                                        }
                                                    />
                                                </div>

                                                <div className="mt-4 grid grid-cols-2 gap-3">
                                                    <MobileInfo
                                                        label="Leave Type"
                                                        value={
                                                            application
                                                                .leave_type
                                                                ?.name ??
                                                            '—'
                                                        }
                                                    />

                                                    <MobileInfo
                                                        label="Duration"
                                                        value={formatDuration(
                                                            application.total_days,
                                                        )}
                                                    />

                                                    <div className="col-span-2">
                                                        <MobileInfo
                                                            label="Period"
                                                            value={formatDateRange(
                                                                application.start_date,
                                                                application.end_date,
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-center justify-end gap-1.5 text-xs font-semibold text-[#28658F]">
                                                    Review Request
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </div>
                                            </Link>
                                        ),
                                    )}
                                </div>
                            </>
                        )}

                        {/* Pagination */}

                        {applications.last_page > 1 && (
                            <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                                <p className="text-xs text-slate-500">
                                    Showing{' '}
                                    <span className="font-semibold text-slate-700">
                                        {applications.from ??
                                            0}
                                    </span>{' '}
                                    to{' '}
                                    <span className="font-semibold text-slate-700">
                                        {applications.to ??
                                            0}
                                    </span>{' '}
                                    of{' '}
                                    <span className="font-semibold text-slate-700">
                                        {applications.total}
                                    </span>{' '}
                                    requests
                                </p>

                                <div className="flex items-center gap-1">
                                    {applications.links.map(
                                        (
                                            link,
                                            index,
                                        ) => {
                                            if (
                                                index ===
                                                    0 ||
                                                index ===
                                                    applications
                                                        .links
                                                        .length -
                                                        1
                                            ) {
                                                return null;
                                            }

                                            return (
                                                <PaginationButton
                                                    key={`${link.label}-${index}`}
                                                    link={
                                                        link
                                                    }
                                                />
                                            );
                                        },
                                    )}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Summary Card
|--------------------------------------------------------------------------
*/

function SummaryCard({
    icon,
    label,
    value,
    description,
    highlighted = false,
}: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    description: string;
    highlighted?: boolean;
}) {
    return (
        <div
            className={`
                rounded-2xl border bg-white p-5
                shadow-[0_1px_3px_rgba(15,23,42,0.035)]
                ${
                    highlighted
                        ? 'border-[#4389BC]/20'
                        : 'border-slate-200'
                }
            `}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`
                        flex h-9 w-9 items-center justify-center
                        rounded-lg
                        ${
                            highlighted
                                ? 'bg-[#4389BC]/10 text-[#4389BC]'
                                : 'bg-slate-50 text-slate-400'
                        }
                    `}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Status Badge
|--------------------------------------------------------------------------
*/

function StatusBadge({
    status,
}: {
    status: string;
}) {
    const normalized =
        status?.toLowerCase();

    const isApproved =
        normalized === 'approved';

    const isRejected =
        normalized === 'rejected' ||
        normalized === 'disapproved';

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full border px-2.5 py-1
                text-[10px] font-bold uppercase
                tracking-wide
                ${
                    isApproved
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : isRejected
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                }
            `}
        >
            <span
                className={`
                    h-1.5 w-1.5 rounded-full
                    ${
                        isApproved
                            ? 'bg-emerald-500'
                            : isRejected
                              ? 'bg-red-500'
                              : 'bg-amber-500'
                    }
                `}
            />

            {status || 'Pending'}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| Empty State
|--------------------------------------------------------------------------
*/

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                <CheckCircle2 className="h-6 w-6 text-slate-400" />
            </div>

            <h3 className="mt-5 text-sm font-semibold text-slate-800">
                No pending requests
            </h3>

            <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
                There are currently no leave requests
                assigned to you for approval.
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Mobile Info
|--------------------------------------------------------------------------
*/

function MobileInfo({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                {value}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Pagination Button
|--------------------------------------------------------------------------
*/

function PaginationButton({
    link,
}: {
    link: PaginationLink;
}) {
    if (!link.url) {
        return (
            <span
                className="flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-xs text-slate-300"
                dangerouslySetInnerHTML={{
                    __html: link.label,
                }}
            />
        );
    }

    return (
        <Link
            href={link.url}
            preserveScroll
            className={`
                flex h-8 min-w-8 items-center
                justify-center rounded-md px-2
                text-xs font-medium transition
                ${
                    link.active
                        ? 'bg-[#28658F] text-white shadow-sm'
                        : 'text-slate-500 hover:bg-white hover:text-slate-800'
                }
            `}
            dangerouslySetInnerHTML={{
                __html: link.label,
            }}
        />
    );
}

/*
|--------------------------------------------------------------------------
| Initials
|--------------------------------------------------------------------------
*/

function getInitials(
    name?: string | null,
) {
    if (!name) {
        return '—';
    }

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map(
            (part) =>
                part.charAt(0).toUpperCase(),
        )
        .join('');
}