import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
    Clock3,
    Download,
    FileText,
    Info,
    User,
    Users,
    XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

type LeaveStatus =
    | 'draft'
    | 'submitted'
    | 'pending_approval'
    | 'approved'
    | 'rejected'
    | 'returned'
    | 'processing'
    | 'completed'
    | 'cancelled'
    | string;

type Approval = {
    id: number;
    step_order: number;
    approver_id: number;
    action: string;
    remarks?: string | null;
    acted_at?: string | null;
    approver?: {
        id: number;
        name: string;
        employee_number?: string | null;
        position?: {
            id: number;
            name: string;
        } | null;
    } | null;
};

type LeaveApplication = {
    id: number;
    application_no: string;
    employee_id: number;
    leave_type_id: number;

    date_filed: string;
    start_date: string;
    end_date: string;

    total_days: string | number;
    schedule_type: string;
    reason: string;
    attachment_path?: string | null;

    status: LeaveStatus;

    current_step?: number | null;

    employee_confirmed?: boolean;
    employee_confirmed_at?: string | null;
    submitted_at?: string | null;

    approved_at?: string | null;
    rejected_at?: string | null;
    processed_at?: string | null;
    completed_at?: string | null;
    cancelled_at?: string | null;

    employee?: {
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

        reports_to?: {
            id: number;
            name: string;
        } | null;
    } | null;

    leave_type?: {
        id: number;
        name: string;
        code: string;
        description?: string | null;
        is_paid?: boolean;
        requires_attachment?: boolean;
    } | null;

    approvals?: Approval[];

    approval_workflow?: {
        id: number;
        name?: string | null;
    } | null;
};

type Props = {
    application: LeaveApplication;
};

/*
|--------------------------------------------------------------------------
| Formatting
|--------------------------------------------------------------------------
*/

function formatDate(date?: string | null) {
    if (!date) {
        return '—';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function formatShortDate(date?: string | null) {
    if (!date) {
        return '—';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatDateTime(date?: string | null) {
    if (!date) {
        return '—';
    }

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
        return date;
    }

    return parsed.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function formatSchedule(schedule?: string | null) {
    switch (schedule) {
        case 'full_day':
            return 'Full Day';

        case 'half_day_am':
            return 'Half Day — Morning';

        case 'half_day_pm':
            return 'Half Day — Afternoon';

        default:
            return schedule || '—';
    }
}

/*
|--------------------------------------------------------------------------
| Status
|--------------------------------------------------------------------------
*/

function getStatus(status: LeaveStatus) {
    switch (status) {
        case 'submitted':
            return {
                label: 'Submitted',
                description: 'Application has been submitted.',
                className:
                    'border-blue-200 bg-blue-50 text-blue-700',
                icon: FileText,
            };

        case 'pending_approval':
            return {
                label: 'Pending Approval',
                description: 'Waiting for approval.',
                className:
                    'border-amber-200 bg-amber-50 text-amber-700',
                icon: Clock3,
            };

        case 'approved':
            return {
                label: 'Approved',
                description: 'Application has been approved.',
                className:
                    'border-emerald-200 bg-emerald-50 text-emerald-700',
                icon: CheckCircle2,
            };

        case 'rejected':
            return {
                label: 'Rejected',
                description: 'Application has been rejected.',
                className:
                    'border-red-200 bg-red-50 text-red-700',
                icon: XCircle,
            };

        case 'returned':
            return {
                label: 'Returned',
                description: 'Application requires attention.',
                className:
                    'border-orange-200 bg-orange-50 text-orange-700',
                icon: Clock3,
            };

        case 'processing':
            return {
                label: 'Processing',
                description: 'Application is being processed.',
                className:
                    'border-indigo-200 bg-indigo-50 text-indigo-700',
                icon: Clock3,
            };

        case 'completed':
            return {
                label: 'Completed',
                description: 'Leave application is completed.',
                className:
                    'border-emerald-200 bg-emerald-50 text-emerald-700',
                icon: CheckCircle2,
            };

        case 'cancelled':
            return {
                label: 'Cancelled',
                description: 'Application has been cancelled.',
                className:
                    'border-slate-200 bg-slate-100 text-slate-600',
                icon: XCircle,
            };

        default:
            return {
                label: 'Draft',
                description: 'Application is still in draft.',
                className:
                    'border-slate-200 bg-slate-100 text-slate-600',
                icon: FileText,
            };
    }
}

function getApprovalStatus(action?: string) {
    switch (action) {
        case 'approved':
            return {
                label: 'Approved',
                className: 'text-emerald-700',
                icon: CheckCircle2,
                iconClass: 'border-emerald-200 bg-emerald-50',
            };

        case 'rejected':
            return {
                label: 'Rejected',
                className: 'text-red-700',
                icon: XCircle,
                iconClass: 'border-red-200 bg-red-50',
            };

        case 'returned':
            return {
                label: 'Returned',
                className: 'text-orange-700',
                icon: Clock3,
                iconClass: 'border-orange-200 bg-orange-50',
            };

        default:
            return {
                label: 'Pending',
                className: 'text-amber-700',
                icon: Clock3,
                iconClass: 'border-amber-200 bg-amber-50',
            };
    }
}

/*
|--------------------------------------------------------------------------
| Page
|--------------------------------------------------------------------------
*/

export default function Show({ application }: Props) {
    const status = getStatus(application.status);
    const StatusIcon = status.icon;

    const approvals = Array.isArray(application.approvals)
        ? application.approvals
        : [];

    const employee = application.employee;
    const leaveType = application.leave_type;

    return (
        <>
            <Head title={`Leave ${application.application_no}`} />

            <div className="min-h-screen bg-[#f6f8fa]">
                <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

                    {/* ==========================================================
                        PAGE HEADER
                    =========================================================== */}

                    <header className="mb-6">
                        <div className="mb-4">
                            <Link
                                href="/leave/applications"
                                className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Leave Applications
                            </Link>
                        </div>

                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-3">
                                    <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-400">
                                        Leave Application
                                    </span>

                                    <span className="text-slate-300">
                                        /
                                    </span>

                                    <span className="font-mono text-xs font-medium text-slate-500">
                                        {application.application_no}
                                    </span>
                                </div>

                                <div className="flex flex-wrap items-center gap-3">
                                    <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                        {leaveType?.name ?? 'Leave Application'}
                                    </h1>

                                    <span
                                        className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${status.className}`}
                                    >
                                        <StatusIcon className="h-3.5 w-3.5" />
                                        {status.label}
                                    </span>
                                </div>

                                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                                    Review the leave request, employee information,
                                    and approval workflow for this application.
                                </p>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                {application.attachment_path && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="border-slate-200 bg-white shadow-none"
                                    >
                                        <a
                                            href={`/storage/${application.attachment_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Download className="mr-2 h-4 w-4" />
                                            Attachment
                                        </a>
                                    </Button>
                                )}

                                <Button
                                    asChild
                                    className="bg-slate-900 shadow-sm hover:bg-slate-800"
                                >
                                    <Link href="/leave/applications">
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Applications
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </header>

                    {/* ==========================================================
                        STATUS SUMMARY
                    =========================================================== */}

                    <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                        <div className="grid divide-y divide-slate-100 md:grid-cols-4 md:divide-x md:divide-y-0">

                            <SummaryMetric
                                label="Application Status"
                                value={status.label}
                                icon={StatusIcon}
                                accent="blue"
                            />

                            <SummaryMetric
                                label="Leave Duration"
                                value={`${application.total_days} day${Number(application.total_days) === 1 ? '' : 's'}`}
                                icon={CalendarDays}
                            />

                            <SummaryMetric
                                label="Leave Period"
                                value={`${formatShortDate(application.start_date)} – ${formatShortDate(application.end_date)}`}
                                icon={CalendarDays}
                            />

                            <SummaryMetric
                                label="Current Workflow Step"
                                value={
                                    application.current_step
                                        ? `Step ${application.current_step}`
                                        : 'Not assigned'
                                }
                                icon={Users}
                            />

                        </div>
                    </section>

                    {/* ==========================================================
                        MAIN CONTENT
                    =========================================================== */}

                    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

                        {/* ======================================================
                            LEFT
                        ======================================================= */}

                        <main className="min-w-0 space-y-6">

                            {/* Leave Details */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">

                                <SectionHeader
                                    icon={CalendarDays}
                                    title="Leave Details"
                                    description="Core information associated with this leave request."
                                />

                                <div className="grid gap-x-8 gap-y-7 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">

                                    <DetailItem
                                        label="Leave Type"
                                        value={leaveType?.name ?? '—'}
                                    />

                                    <DetailItem
                                        label="Leave Code"
                                        value={leaveType?.code ?? '—'}
                                        mono
                                    />

                                    <DetailItem
                                        label="Schedule"
                                        value={formatSchedule(
                                            application.schedule_type,
                                        )}
                                    />

                                    <DetailItem
                                        label="Start Date"
                                        value={formatDate(application.start_date)}
                                    />

                                    <DetailItem
                                        label="End Date"
                                        value={formatDate(application.end_date)}
                                    />

                                    <DetailItem
                                        label="Total Leave"
                                        value={`${application.total_days} day${Number(application.total_days) === 1 ? '' : 's'}`}
                                        emphasis
                                    />

                                    <DetailItem
                                        label="Date Filed"
                                        value={formatDate(application.date_filed)}
                                    />

                                    <DetailItem
                                        label="Submitted"
                                        value={formatDateTime(
                                            application.submitted_at,
                                        )}
                                    />

                                    <DetailItem
                                        label="Application No."
                                        value={application.application_no}
                                        mono
                                    />

                                </div>
                            </section>

                            {/* Reason */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">

                                <SectionHeader
                                    icon={FileText}
                                    title="Reason for Leave"
                                    description="Employee-provided justification for the request."
                                />

                                <div className="p-5 sm:p-6">
                                    <div className="rounded-lg border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                                        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                                            {application.reason ||
                                                'No reason provided.'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Approval Workflow */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">

                                <SectionHeader
                                    icon={Users}
                                    title="Approval Workflow"
                                    description={
                                        application.approval_workflow?.name
                                            ? application.approval_workflow.name
                                            : 'Review the approval history and current workflow status.'
                                    }
                                />

                                <div className="p-5 sm:p-6">

                                    {approvals.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-6 py-12 text-center">
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white">
                                                <Clock3 className="h-5 w-5 text-slate-400" />
                                            </div>

                                            <p className="mt-4 text-sm font-semibold text-slate-800">
                                                No approval records yet
                                            </p>

                                            <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                                The approval workflow has not
                                                generated any action records
                                                for this application.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-0">
                                            {approvals.map(
                                                (approval, index) => {
                                                    const approvalStatus =
                                                        getApprovalStatus(
                                                            approval.action,
                                                        );

                                                    const ApprovalIcon =
                                                        approvalStatus.icon;

                                                    const isLast =
                                                        index ===
                                                        approvals.length - 1;

                                                    return (
                                                        <div
                                                            key={approval.id}
                                                            className="relative flex gap-4"
                                                        >
                                                            {!isLast && (
                                                                <div className="absolute left-[18px] top-10 h-[calc(100%-12px)] w-px bg-slate-200" />
                                                            )}

                                                            <div
                                                                className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${approvalStatus.iconClass}`}
                                                            >
                                                                <ApprovalIcon
                                                                    className={`h-4 w-4 ${approvalStatus.className}`}
                                                                />
                                                            </div>

                                                            <div
                                                                className={`min-w-0 flex-1 ${
                                                                    !isLast
                                                                        ? 'pb-8'
                                                                        : ''
                                                                }`}
                                                            >
                                                                <div className="rounded-lg border border-slate-200 bg-white p-4">

                                                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                                                                        <div className="min-w-0">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                                                                    Step{' '}
                                                                                    {
                                                                                        approval.step_order
                                                                                    }
                                                                                </span>

                                                                                <ChevronRight className="h-3 w-3 text-slate-300" />

                                                                                <span
                                                                                    className={`text-xs font-semibold ${approvalStatus.className}`}
                                                                                >
                                                                                    {
                                                                                        approvalStatus.label
                                                                                    }
                                                                                </span>
                                                                            </div>

                                                                            <p className="mt-2 font-semibold text-slate-900">
                                                                                {approval
                                                                                    .approver
                                                                                    ?.name ??
                                                                                    'Assigned Approver'}
                                                                            </p>

                                                                            <p className="mt-0.5 text-sm text-slate-500">
                                                                                {approval
                                                                                    .approver
                                                                                    ?.position
                                                                                    ?.name ??
                                                                                    'Approver'}
                                                                            </p>

                                                                            {approval
                                                                                .approver
                                                                                ?.employee_number && (
                                                                                <p className="mt-1 font-mono text-xs text-slate-400">
                                                                                    {
                                                                                        approval
                                                                                            .approver
                                                                                            .employee_number
                                                                                    }
                                                                                </p>
                                                                            )}
                                                                        </div>

                                                                        <div className="shrink-0 text-left sm:text-right">
                                                                            <p className="text-xs font-medium text-slate-400">
                                                                                Action Date
                                                                            </p>

                                                                            <p className="mt-1 text-xs font-medium text-slate-600">
                                                                                {formatDateTime(
                                                                                    approval.acted_at,
                                                                                )}
                                                                            </p>
                                                                        </div>
                                                                    </div>

                                                                    {approval.remarks && (
                                                                        <div className="mt-4 border-t border-slate-100 pt-3">
                                                                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                                                                Remarks
                                                                            </p>

                                                                            <p className="text-sm leading-6 text-slate-600">
                                                                                {
                                                                                    approval.remarks
                                                                                }
                                                                            </p>
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
                            </section>
                        </main>

                        {/* ======================================================
                            RIGHT SIDEBAR
                        ======================================================= */}

                        <aside className="space-y-6 xl:sticky xl:top-6">

                            {/* Employee */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">

                                <div className="border-b border-slate-100 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                            <User className="h-4 w-4 text-slate-600" />
                                        </div>

                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900">
                                                Employee Information
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Applicant details
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5">

                                    <div className="mb-5 flex items-center gap-3">
                                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                                            {getInitials(employee?.name)}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="truncate font-semibold text-slate-900">
                                                {employee?.name ?? '—'}
                                            </p>

                                            <p className="mt-0.5 font-mono text-xs text-slate-400">
                                                {employee?.employee_number ??
                                                    'No employee number'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="divide-y divide-slate-100 border-t border-slate-100">
                                        <SidebarDetail
                                            label="Position"
                                            value={
                                                employee?.position?.name ?? '—'
                                            }
                                        />

                                        <SidebarDetail
                                            label="Organizational Unit"
                                            value={
                                                employee
                                                    ?.organizational_unit
                                                    ?.name ?? '—'
                                            }
                                            icon={Building2}
                                        />

                                        <SidebarDetail
                                            label="Reporting Manager"
                                            value={
                                                employee?.reports_to?.name ??
                                                '—'
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Submission */}

                            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">

                                <div className="border-b border-slate-100 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                            <Info className="h-4 w-4 text-slate-600" />
                                        </div>

                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900">
                                                Submission
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Application metadata
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="divide-y divide-slate-100 px-5">
                                    <SidebarDetail
                                        label="Submitted"
                                        value={formatDateTime(
                                            application.submitted_at,
                                        )}
                                    />

                                    <div className="py-4">
                                        <p className="text-xs font-medium text-slate-400">
                                            Employee Confirmation
                                        </p>

                                        <div className="mt-2 flex items-center gap-2">
                                            {application.employee_confirmed ? (
                                                <>
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50">
                                                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                    </div>

                                                    <span className="text-sm font-medium text-emerald-700">
                                                        Confirmed
                                                    </span>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50">
                                                        <Clock3 className="h-3.5 w-3.5 text-amber-600" />
                                                    </div>

                                                    <span className="text-sm font-medium text-amber-700">
                                                        Pending
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        {application.employee_confirmed_at && (
                                            <p className="mt-2 text-xs text-slate-400">
                                                {formatDateTime(
                                                    application.employee_confirmed_at,
                                                )}
                                            </p>
                                        )}
                                    </div>

                                    <SidebarDetail
                                        label="Application Status"
                                        value={status.label}
                                    />
                                </div>
                            </section>

                            {/* Attachment */}

                            {application.attachment_path && (
                                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">

                                    <div className="border-b border-slate-100 px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                                <FileText className="h-4 w-4 text-slate-600" />
                                            </div>

                                            <div>
                                                <h2 className="text-sm font-semibold text-slate-900">
                                                    Supporting Document
                                                </h2>

                                                <p className="mt-0.5 text-xs text-slate-500">
                                                    Attached to this application
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4">
                                        <a
                                            href={`/storage/${application.attachment_path}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="group flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 transition-colors hover:border-slate-300 hover:bg-slate-50"
                                        >
                                            <div className="flex min-w-0 items-center gap-3">
                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white">
                                                    <FileText className="h-4 w-4 text-slate-500" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-medium text-slate-700">
                                                        View attachment
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-400">
                                                        Open document
                                                    </p>
                                                </div>
                                            </div>

                                            <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
                                        </a>
                                    </div>
                                </section>
                            )}
                        </aside>
                    </div>
                </div>
            </div>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Summary Metric
|--------------------------------------------------------------------------
*/

function SummaryMetric({
    label,
    value,
    icon: Icon,
    accent,
}: {
    label: string;
    value: string;
    icon: typeof CalendarDays;
    accent?: 'blue';
}) {
    return (
        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    accent === 'blue'
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-slate-100 text-slate-500'
                }`}
            >
                <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {label}
                </p>

                <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {value}
                </p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Section Header
|--------------------------------------------------------------------------
*/

function SectionHeader({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof CalendarDays;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-4 w-4 text-slate-600" />
            </div>

            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-slate-900">
                    {title}
                </h2>

                <p className="mt-0.5 text-xs text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Detail Item
|--------------------------------------------------------------------------
*/

function DetailItem({
    label,
    value,
    mono = false,
    emphasis = false,
}: {
    label: string;
    value: string;
    mono?: boolean;
    emphasis?: boolean;
}) {
    return (
        <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p
                className={`mt-1.5 ${
                    mono
                        ? 'font-mono text-xs'
                        : emphasis
                          ? 'text-sm font-semibold'
                          : 'text-sm font-medium'
                } text-slate-800`}
            >
                {value}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Sidebar Detail
|--------------------------------------------------------------------------
*/

function SidebarDetail({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon?: typeof Building2;
}) {
    return (
        <div className="py-4">
            <p className="text-xs font-medium text-slate-400">
                {label}
            </p>

            <div className="mt-1.5 flex items-center gap-2">
                {Icon && (
                    <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                )}

                <p className="text-sm font-medium text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Employee Initials
|--------------------------------------------------------------------------
*/

function getInitials(name?: string | null) {
    if (!name) {
        return '—';
    }

    const parts = name
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}