import { Link } from '@inertiajs/react';

import {
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

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Status Configuration
|--------------------------------------------------------------------------
*/

const getStatus = (status: string) => {
    switch (status) {
        case 'pending_approval':
            return {
                label: 'Pending Approval',

                className:
                    'border-amber-200 bg-amber-50 text-amber-700',

                icon: Clock3,
            };

        case 'approved':
            return {
                label: 'Approved',

                className:
                    'border-emerald-200 bg-emerald-50 text-emerald-700',

                icon: CheckCircle2,
            };

        case 'rejected':
            return {
                label: 'Rejected',

                className:
                    'border-red-200 bg-red-50 text-red-700',

                icon: XCircle,
            };

        case 'returned':
            return {
                label: 'Returned',

                className:
                    'border-orange-200 bg-orange-50 text-orange-700',

                icon: FileText,
            };

        case 'processing':
            return {
                label: 'Processing',

                className:
                    'border-blue-200 bg-blue-50 text-blue-700',

                icon: Clock3,
            };

        case 'completed':
            return {
                label: 'Completed',

                className:
                    'border-green-200 bg-green-50 text-green-700',

                icon: CheckCircle2,
            };

        case 'cancelled':
            return {
                label: 'Cancelled',

                className:
                    'border-slate-200 bg-slate-100 text-slate-600',

                icon: XCircle,
            };

        case 'submitted':
            return {
                label: 'Submitted',

                className:
                    'border-blue-200 bg-blue-50 text-blue-700',

                icon: FileText,
            };

        case 'draft':
        default:
            return {
                label: 'Draft',

                className:
                    'border-slate-200 bg-slate-100 text-slate-600',

                icon: FileText,
            };
    }
};

/*
|--------------------------------------------------------------------------
| Date Formatter
|--------------------------------------------------------------------------
*/

const formatDate = (date: string) => {
    if (!date) {
        return '—';
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
        return date;
    }

    return parsedDate.toLocaleDateString('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

/*
|--------------------------------------------------------------------------
| Schedule Formatter
|--------------------------------------------------------------------------
*/

const formatSchedule = (schedule?: string) => {
    switch (schedule) {
        case 'full_day':
            return 'Full Day';

        case 'half_day_am':
            return 'Half Day AM';

        case 'half_day_pm':
            return 'Half Day PM';

        default:
            return '—';
    }
};

/*
|--------------------------------------------------------------------------
| Index Page
|--------------------------------------------------------------------------
*/

export default function Index({
    applications,
}: Props) {
    const hasApplications =
        applications.data.length > 0;

    return (
        <div className="min-h-full bg-slate-50/50">
            <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

                {/* =========================================================
                    HEADER
                ========================================================== */}

                <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

                    <div className="flex items-start gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#4389BC]/10">
                            <CalendarDays className="h-5 w-5 text-[#4389BC]" />
                        </div>

                        <div>
                            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                                Leave Applications
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                View and track your leave applications.
                            </p>
                        </div>
                    </div>

                    <Button
                        asChild
                        className="w-full rounded-lg bg-[#4389BC] px-4 shadow-sm hover:bg-[#3575A4] sm:w-auto"
                    >
                        <Link href="/leave/applications/create">
                            <Plus className="mr-2 h-4 w-4" />

                            Apply for Leave
                        </Link>
                    </Button>
                </div>

                {/* =========================================================
                    SUMMARY
                ========================================================== */}

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                    {/* Total */}

                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Total Applications
                                </p>

                                <p className="mt-1 text-2xl font-semibold text-slate-900">
                                    {applications.total}
                                </p>
                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                <FileText className="h-4 w-4 text-slate-500" />
                            </div>
                        </div>
                    </div>

                    {/* Current Page */}

                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Current Page
                                </p>

                                <p className="mt-1 text-2xl font-semibold text-slate-900">
                                    {applications.current_page}
                                </p>
                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                                <CalendarDays className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* Showing */}

                    <div className="rounded-xl border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between">

                            <div>
                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Showing
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-900">
                                    {applications.from ?? 0}
                                    {' – '}
                                    {applications.to ?? 0}
                                </p>
                            </div>

                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                    APPLICATION LIST
                ========================================================== */}

                <div className="overflow-hidden rounded-xl border bg-white shadow-sm">

                    {/* Table Header */}

                    {hasApplications && (
                        <div className="hidden border-b bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 md:grid md:grid-cols-[1.4fr_1fr_1.1fr_1fr_auto] md:gap-4">

                            <div>
                                Application
                            </div>

                            <div>
                                Leave Type
                            </div>

                            <div>
                                Leave Period
                            </div>

                            <div>
                                Status
                            </div>

                            <div className="text-right">
                                Actions
                            </div>
                        </div>
                    )}

                    {/* =====================================================
                        EMPTY STATE
                    ====================================================== */}

                    {!hasApplications ? (
                        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">

                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                <CalendarDays className="h-7 w-7 text-slate-400" />
                            </div>

                            <h2 className="text-base font-semibold text-slate-900">
                                No leave applications yet
                            </h2>

                            <p className="mt-1 max-w-md text-sm leading-6 text-slate-500">
                                You have not submitted a leave application.
                                When you apply for leave, your applications
                                will appear here.
                            </p>

                            <Button
                                asChild
                                className="mt-6 bg-[#4389BC] hover:bg-[#3575A4]"
                            >
                                <Link href="/leave/applications/create">
                                    <Plus className="mr-2 h-4 w-4" />

                                    Apply for Leave
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <div className="divide-y">

                            {applications.data.map(
                                (application) => {
                                    const status =
                                        getStatus(
                                            application.status,
                                        );

                                    const StatusIcon =
                                        status.icon;

                                    const canEdit =
                                        application.status ===
                                            'draft' ||
                                        application.status ===
                                            'returned';

                                    return (
                                        <div
                                            key={application.id}
                                            className="group transition-colors hover:bg-slate-50"
                                        >

                                            {/* =================================================
                                                MOBILE / TABLET
                                            ================================================== */}

                                            <div className="space-y-4 p-5 md:hidden">

                                                <div className="flex items-start justify-between gap-4">

                                                    <div className="min-w-0">

                                                        <p className="truncate text-sm font-semibold text-slate-900">
                                                            {
                                                                application.application_no
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-sm text-slate-500">
                                                            {application
                                                                .leave_type
                                                                ?.name ??
                                                                'Leave'}
                                                        </p>
                                                    </div>

                                                    <span
                                                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                                                    >
                                                        <StatusIcon className="h-3.5 w-3.5" />

                                                        {
                                                            status.label
                                                        }
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">

                                                    <div>
                                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                            Start Date
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                                            {formatDate(
                                                                application.start_date,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div>
                                                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                            End Date
                                                        </p>

                                                        <p className="mt-1 text-sm font-medium text-slate-700">
                                                            {formatDate(
                                                                application.end_date,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between border-t pt-3">

                                                    <div>
                                                        <p className="text-sm text-slate-500">
                                                            {
                                                                application.total_days
                                                            }{' '}
                                                            day(s)
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            {formatSchedule(
                                                                application.schedule_type,
                                                            )}
                                                        </p>
                                                    </div>

                                                    <div className="flex items-center gap-2">

                                                        {/* View */}

                                                        <Link
                                                            href={`/leave/applications/${application.id}`}
                                                            aria-label={`View ${application.application_no}`}
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#4389BC]/30 hover:bg-[#4389BC]/10 hover:text-[#4389BC]"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                        </Link>

                                                        {/* Edit */}

                                                        {canEdit && (
                                                            <Link
                                                                href={`/leave/applications/${application.id}/edit`}
                                                                aria-label={`Edit ${application.application_no}`}
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                                            >
                                                                <Edit3 className="h-4 w-4" />
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* =================================================
                                                DESKTOP
                                            ================================================== */}

                                            <div className="hidden p-5 md:grid md:grid-cols-[1.4fr_1fr_1.1fr_1fr_auto] md:items-center md:gap-4">

                                                {/* Application */}

                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-semibold text-slate-900">
                                                        {
                                                            application.application_no
                                                        }
                                                    </p>

                                                    <p className="mt-1 truncate text-xs text-slate-500">
                                                        Filed leave application
                                                    </p>
                                                </div>

                                                {/* Leave Type */}

                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-medium text-slate-700">
                                                        {application
                                                            .leave_type
                                                            ?.name ??
                                                            'Leave'}
                                                    </p>

                                                    {application
                                                        .leave_type
                                                        ?.code && (
                                                        <p className="mt-1 text-xs text-slate-400">
                                                            {
                                                                application
                                                                    .leave_type
                                                                    .code
                                                            }
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Leave Period */}

                                                <div>

                                                    <p className="text-sm font-medium text-slate-700">
                                                        {formatDate(
                                                            application.start_date,
                                                        )}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        to{' '}
                                                        {formatDate(
                                                            application.end_date,
                                                        )}{' '}
                                                        ·{' '}
                                                        {
                                                            application.total_days
                                                        }{' '}
                                                        day(s)
                                                    </p>
                                                </div>

                                                {/* Status */}

                                                <div>

                                                    <span
                                                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${status.className}`}
                                                    >
                                                        <StatusIcon className="h-3.5 w-3.5" />

                                                        {
                                                            status.label
                                                        }
                                                    </span>
                                                </div>

                                                {/* Actions */}

                                                <div className="flex items-center justify-end gap-2">

                                                    {/* View */}

                                                    <Link
                                                        href={`/leave/applications/${application.id}`}
                                                        aria-label={`View ${application.application_no}`}
                                                        title="View application"
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-[#4389BC]/30 hover:bg-[#4389BC]/10 hover:text-[#4389BC]"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Link>

                                                    {/* Edit */}

                                                    {canEdit ? (
                                                        <Link
                                                            href={`/leave/applications/${application.id}/edit`}
                                                            aria-label={`Edit ${application.application_no}`}
                                                            title="Edit application"
                                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </Link>
                                                    ) : (
                                                        <div
                                                            title="Only draft or returned applications can be edited"
                                                            className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-lg border border-slate-100 bg-slate-50 text-slate-300"
                                                        >
                                                            <Edit3 className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                },
                            )}
                        </div>
                    )}
                </div>

                {/* =========================================================
                    PAGINATION
                ========================================================== */}

                {applications.last_page > 1 && (
                    <div className="flex flex-col gap-3 rounded-xl border bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-sm text-slate-500">
                            Showing{' '}

                            <span className="font-medium text-slate-700">
                                {applications.from ?? 0}
                            </span>{' '}

                            to{' '}

                            <span className="font-medium text-slate-700">
                                {applications.to ?? 0}
                            </span>{' '}

                            of{' '}

                            <span className="font-medium text-slate-700">
                                {applications.total}
                            </span>{' '}

                            applications
                        </p>

                        <div className="flex items-center gap-2">

                            {/* Previous */}

                            {applications.current_page > 1 ? (
                                <Link
                                    href={`/leave/applications?page=${
                                        applications.current_page - 1
                                    }`}
                                    preserveScroll
                                    className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    Previous
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border bg-slate-50 px-3 py-2 text-sm font-medium text-slate-300">
                                    Previous
                                </span>
                            )}

                            {/* Current */}

                            <div className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-[#4389BC] px-3 text-sm font-semibold text-white">
                                {applications.current_page}
                            </div>

                            {/* Next */}

                            {applications.current_page <
                            applications.last_page ? (
                                <Link
                                    href={`/leave/applications?page=${
                                        applications.current_page + 1
                                    }`}
                                    preserveScroll
                                    className="rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                >
                                    Next
                                </Link>
                            ) : (
                                <span className="cursor-not-allowed rounded-lg border bg-slate-50 px-3 py-2 text-sm font-medium text-slate-300">
                                    Next
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}