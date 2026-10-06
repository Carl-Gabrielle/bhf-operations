import {
    FormEvent,
    useState,
} from 'react';

import {
    Head,
    Link,
    useForm,
} from '@inertiajs/react';

import {
    AlertTriangle,
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    Download,
    FileText,
    Info,
    MessageSquare,
    Paperclip,
    UserRound,
    X,
    XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

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

    reports_to?: {
        id: number;
        name: string;
    } | null;
};

type LeaveType = {
    id: number;
    name: string;
    code?: string | null;
    description?: string | null;
    is_paid?: boolean;
};

type Approval = {
    id: number;
    status: string;
    remarks?: string | null;
    approved_at?: string | null;

    approver?: {
        id: number;
        name: string;
    } | null;
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

    attachment_path?: string | null;
    attachment_name?: string | null;

    created_at?: string | null;

    employee: Employee;
    leave_type: LeaveType;

    approval_workflow?: {
        id: number;
        name: string;
    } | null;

    approvals?: Approval[];
};

type Approver = {
    id: number;
    name: string;
};

type Props = {
    application: LeaveApplication;
    approver: Approver;
};

export default function Show({
    application,
    approver,
}: Props) {
    const [showRejectDialog, setShowRejectDialog] =
        useState(false);

    const approveForm = useForm({
        remarks: '',
    });

    const rejectForm = useForm({
        remarks: '',
    });

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

    const formatDateRange = () => {
        const start =
            formatDate(
                application.start_date,
            );

        const end =
            formatDate(
                application.end_date,
            );

        if (
            application.start_date ===
            application.end_date
        ) {
            return start;
        }

        return `${start} – ${end}`;
    };

    const formatDuration = () => {
        const days = Number(
            application.total_days ?? 0,
        );

        const unit =
            days === 0.5 || days === 1
                ? 'day'
                : 'days';

        return `${days} ${unit}`;
    };

    const scheduleLabel =
        getScheduleLabel(
            application.schedule_type,
        );

    const canTakeAction =
        application.status === 'pending' ||
        application.status ===
            'for_approval';

    const submitApprove = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        approveForm.post(
            `/leave/approvals/${application.id}/approve`,
            {
                preserveScroll: true,
            },
        );
    };

    const submitReject = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        rejectForm.post(
            `/leave/approvals/${application.id}/reject`,
            {
                preserveScroll: true,
                onSuccess: () => {
                    setShowRejectDialog(false);
                },
            },
        );
    };

    return (
        <>
            <Head
                title={`Leave Approval - ${
                    application.employee?.name ??
                    'Request'
                }`}
            />

            <div className="min-h-screen bg-[#f7f9fc]">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                    {/* =====================================================
                        BACK
                    ====================================================== */}

                    <Link
                        href="/leave/approvals"
                        className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#28658F]"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                        Back to Leave Approvals
                    </Link>

                    {/* =====================================================
                        HEADER
                    ====================================================== */}

                    <div className="relative mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">

                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#28658F] via-[#4389BC] to-[#75AFCF]" />

                        <div className="p-6 sm:p-7">
                            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                                <div className="flex items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4389BC]/10">
                                        <FileText className="h-5 w-5 text-[#4389BC]" />
                                    </div>

                                    <div>
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#4389BC]">
                                                Leave Approval
                                            </span>

                                            {application.application_no && (
                                                <>
                                                    <span className="h-1 w-1 rounded-full bg-slate-300" />

                                                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                                        {
                                                            application.application_no
                                                        }
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                            Review Leave Request
                                        </h1>

                                        <p className="mt-1.5 text-sm text-slate-500">
                                            Review the employee's request
                                            before approving or rejecting it.
                                        </p>
                                    </div>
                                </div>

                                <StatusBadge
                                    status={
                                        application.status
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">

                        {/* =================================================
                            MAIN CONTENT
                        ================================================= */}

                        <div className="space-y-5">

                            {/* Employee */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)]">
                                <SectionHeader
                                    icon={
                                        <UserRound className="h-4 w-4 text-[#4389BC]" />
                                    }
                                    title="Employee Information"
                                    description="Employee associated with this request"
                                />

                                <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3 lg:p-6">
                                    <InfoField
                                        label="Employee"
                                        value={
                                            application
                                                .employee
                                                ?.name ??
                                            '—'
                                        }
                                        emphasized
                                    />

                                    <InfoField
                                        label="Employee Number"
                                        value={
                                            application
                                                .employee
                                                ?.employee_number ??
                                            '—'
                                        }
                                    />

                                    <InfoField
                                        label="Department"
                                        value={
                                            application
                                                .employee
                                                ?.organizational_unit
                                                ?.name ??
                                            '—'
                                        }
                                    />

                                    <InfoField
                                        label="Position"
                                        value={
                                            application
                                                .employee
                                                ?.position
                                                ?.name ??
                                            '—'
                                        }
                                    />

                                    <InfoField
                                        label="Reporting Manager"
                                        value={
                                            application
                                                .employee
                                                ?.reports_to
                                                ?.name ??
                                            approver.name
                                        }
                                    />
                                </div>
                            </section>

                            {/* Leave Details */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)]">
                                <SectionHeader
                                    icon={
                                        <CalendarDays className="h-4 w-4 text-[#4389BC]" />
                                    }
                                    title="Leave Request"
                                    description="Details submitted by the employee"
                                />

                                <div className="space-y-6 p-5 sm:p-6 lg:p-7">

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <InfoField
                                            label="Leave Type"
                                            value={
                                                application
                                                    .leave_type
                                                    ?.name ??
                                                '—'
                                            }
                                            emphasized
                                        />

                                        <InfoField
                                            label="Schedule"
                                            value={
                                                scheduleLabel
                                            }
                                        />

                                        <InfoField
                                            label="Start Date"
                                            value={formatDate(
                                                application.start_date,
                                            )}
                                        />

                                        <InfoField
                                            label="End Date"
                                            value={formatDate(
                                                application.end_date,
                                            )}
                                        />
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-[#4389BC]/15 bg-[#4389BC]/5 px-5 py-4">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#4389BC]">
                                                Requested Duration
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Total leave requested
                                            </p>
                                        </div>

                                        <p className="text-xl font-bold tracking-tight text-slate-900">
                                            {formatDuration()}
                                        </p>
                                    </div>

                                    {/* Reason */}

                                    <div>
                                        <div className="mb-2.5 flex items-center gap-2">
                                            <MessageSquare className="h-4 w-4 text-slate-400" />

                                            <p className="text-sm font-semibold text-slate-800">
                                                Reason
                                            </p>
                                        </div>

                                        <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                                            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                                                {
                                                    application.reason
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    {/* Attachment */}

                                    {application.attachment_path && (
                                        <div>
                                            <div className="mb-2.5 flex items-center gap-2">
                                                <Paperclip className="h-4 w-4 text-slate-400" />

                                                <p className="text-sm font-semibold text-slate-800">
                                                    Supporting Document
                                                </p>
                                            </div>

                                            <a
                                                href={`/leave/applications/${application.id}/download`}
                                                className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-[#4389BC]/30 hover:bg-[#4389BC]/5"
                                            >
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                                                        <FileText className="h-4 w-4 text-[#4389BC]" />
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-slate-700">
                                                            {
                                                                application.attachment_name ??
                                                                'Supporting document'
                                                            }
                                                        </p>

                                                        <p className="mt-0.5 text-xs text-slate-400">
                                                            Supporting document
                                                        </p>
                                                    </div>
                                                </div>

                                                <Download className="h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-[#4389BC]" />
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Previous Approvals */}

                            {application.approvals &&
                                application.approvals
                                    .length > 0 && (
                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)]">
                                        <SectionHeader
                                            icon={
                                                <CheckCircle2 className="h-4 w-4 text-[#4389BC]" />
                                            }
                                            title="Approval History"
                                            description="Actions recorded for this request"
                                        />

                                        <div className="divide-y divide-slate-100">
                                            {application.approvals.map(
                                                (
                                                    approval,
                                                ) => (
                                                    <div
                                                        key={
                                                            approval.id
                                                        }
                                                        className="p-5 sm:px-6"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">
                                                                    {approval
                                                                        .approver
                                                                        ?.name ??
                                                                        'Approver'}
                                                                </p>

                                                                <p className="mt-1 text-xs text-slate-400">
                                                                    {approval.approved_at ??
                                                                        'Pending action'}
                                                                </p>
                                                            </div>

                                                            <StatusBadge
                                                                status={
                                                                    approval.status
                                                                }
                                                            />
                                                        </div>

                                                        {approval.remarks && (
                                                            <div className="mt-3 rounded-lg bg-slate-50 px-3.5 py-3">
                                                                <p className="text-xs leading-5 text-slate-600">
                                                                    {
                                                                        approval.remarks
                                                                    }
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </section>
                                )}
                        </div>

                        {/* =================================================
                            RIGHT SIDEBAR
                        ================================================= */}

                        <div className="space-y-5">

                            {/* Approval Action */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)]">
                                <div className="border-b border-slate-100 bg-slate-50/40 px-5 py-4">
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Approval Decision
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Your decision will be recorded
                                        against this request.
                                    </p>
                                </div>

                                <div className="p-5">

                                    {!canTakeAction ? (
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                                            <CheckCircle2 className="mx-auto h-5 w-5 text-slate-400" />

                                            <p className="mt-2 text-sm font-semibold text-slate-700">
                                                No action required
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                This request has already
                                                been processed.
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Approve */}

                                            <form
                                                onSubmit={
                                                    submitApprove
                                                }
                                            >
                                                <label className="mb-2 block text-xs font-semibold text-slate-700">
                                                    Approval Remarks
                                                    <span className="ml-1 font-normal text-slate-400">
                                                        Optional
                                                    </span>
                                                </label>

                                                <Textarea
                                                    value={
                                                        approveForm
                                                            .data
                                                            .remarks
                                                    }
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        approveForm.setData(
                                                            'remarks',
                                                            event
                                                                .target
                                                                .value,
                                                        )
                                                    }
                                                    rows={4}
                                                    placeholder="Add a note for the employee..."
                                                    className="resize-none rounded-lg"
                                                />

                                                <Button
                                                    type="submit"
                                                    disabled={
                                                        approveForm.processing ||
                                                        rejectForm.processing
                                                    }
                                                    className="mt-4 h-11 w-full rounded-lg bg-[#28658F] font-semibold text-white shadow-sm hover:bg-[#1f5275]"
                                                >
                                                    {approveForm.processing ? (
                                                        <>
                                                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                                            Approving...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Check className="mr-2 h-4 w-4" />
                                                            Approve Request
                                                        </>
                                                    )}
                                                </Button>
                                            </form>

                                            <div className="my-5 flex items-center gap-3">
                                                <div className="h-px flex-1 bg-slate-100" />

                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                    or
                                                </span>

                                                <div className="h-px flex-1 bg-slate-100" />
                                            </div>

                                            {/* Reject */}

                                            <Button
                                                type="button"
                                                variant="outline"
                                                disabled={
                                                    approveForm.processing ||
                                                    rejectForm.processing
                                                }
                                                onClick={() =>
                                                    setShowRejectDialog(
                                                        true,
                                                    )
                                                }
                                                className="h-11 w-full rounded-lg border-red-200 bg-white font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
                                            >
                                                <X className="mr-2 h-4 w-4" />
                                                Reject Request
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </section>

                            {/* Workflow */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)]">
                                <div className="border-b border-slate-100 bg-slate-50/40 px-5 py-4">
                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Approval Workflow
                                    </h2>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4389BC] text-white">
                                            <Check className="h-4 w-4" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {application
                                                    .employee
                                                    ?.name ??
                                                    'Employee'}
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Leave request submitted
                                            </p>
                                        </div>
                                    </div>

                                    <div className="ml-4 h-7 border-l border-dashed border-slate-200" />

                                    <div className="flex items-start gap-3">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#4389BC] bg-white">
                                            <UserRound className="h-3.5 w-3.5 text-[#4389BC]" />
                                        </div>

                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">
                                                {approver.name}
                                            </p>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Current approver
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Information */}

                            <div className="rounded-2xl border border-[#4389BC]/15 bg-[#4389BC]/5 p-5">
                                <div className="flex items-start gap-3">
                                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#4389BC]" />

                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">
                                            Approval responsibility
                                        </p>

                                        <p className="mt-1.5 text-xs leading-5 text-slate-600">
                                            Only the employee's assigned
                                            reporting manager or an
                                            authorized approver should
                                            process this request.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* =============================================================
                REJECT DIALOG
            ============================================================= */}

            {showRejectDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[2px]">
                    <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                        <div className="border-b border-slate-100 px-5 py-4">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                                        <AlertTriangle className="h-4 w-4 text-red-500" />
                                    </div>

                                    <div>
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Reject Leave Request
                                        </h2>

                                        <p className="mt-0.5 text-xs text-slate-500">
                                            A reason is required when
                                            rejecting a request.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowRejectDialog(
                                            false,
                                        )
                                    }
                                    className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <form
                            onSubmit={submitReject}
                        >
                            <div className="p-5">
                                <label className="mb-2 block text-xs font-semibold text-slate-700">
                                    Rejection Reason
                                    <span className="ml-1 text-red-500">
                                        *
                                    </span>
                                </label>

                                <Textarea
                                    value={
                                        rejectForm.data
                                            .remarks
                                    }
                                    onChange={(
                                        event,
                                    ) =>
                                        rejectForm.setData(
                                            'remarks',
                                            event
                                                .target
                                                .value,
                                        )
                                    }
                                    rows={5}
                                    autoFocus
                                    placeholder="Explain why this leave request cannot be approved..."
                                    className="resize-none rounded-lg"
                                />

                                {rejectForm.errors.remarks && (
                                    <p className="mt-2 text-xs font-medium text-red-600">
                                        {
                                            rejectForm.errors
                                                .remarks
                                        }
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setShowRejectDialog(
                                            false,
                                        )
                                    }
                                    className="rounded-lg"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        rejectForm.processing
                                    }
                                    className="rounded-lg bg-red-600 font-semibold text-white hover:bg-red-700"
                                >
                                    {rejectForm.processing ? (
                                        <>
                                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Rejecting...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject Request
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Section Header
|--------------------------------------------------------------------------
*/

function SectionHeader({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="border-b border-slate-100 bg-slate-50/40 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                    {icon}
                </div>

                <div>
                    <h2 className="text-sm font-semibold text-slate-900">
                        {title}
                    </h2>

                    <p className="mt-0.5 text-xs text-slate-500">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Info Field
|--------------------------------------------------------------------------
*/

function InfoField({
    label,
    value,
    emphasized = false,
}: {
    label: string;
    value: string;
    emphasized?: boolean;
}) {
    return (
        <div
            className={`
                rounded-xl border px-4 py-3
                ${
                    emphasized
                        ? 'border-[#4389BC]/20 bg-[#4389BC]/5'
                        : 'border-slate-100 bg-slate-50/70'
                }
            `}
        >
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                {label}
            </p>

            <p
                className={`
                    mt-1.5 truncate text-sm
                    ${
                        emphasized
                            ? 'font-semibold text-slate-800'
                            : 'font-medium text-slate-700'
                    }
                `}
            >
                {value}
            </p>
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

    const approved =
        normalized === 'approved';

    const rejected =
        normalized === 'rejected' ||
        normalized === 'disapproved';

    return (
        <span
            className={`
                inline-flex items-center gap-1.5
                rounded-full border px-3 py-1.5
                text-[10px] font-bold uppercase
                tracking-wide
                ${
                    approved
                        ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                        : rejected
                          ? 'border-red-200 bg-red-50 text-red-700'
                          : 'border-amber-200 bg-amber-50 text-amber-700'
                }
            `}
        >
            <span
                className={`
                    h-1.5 w-1.5 rounded-full
                    ${
                        approved
                            ? 'bg-emerald-500'
                            : rejected
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
| Schedule
|--------------------------------------------------------------------------
*/

function getScheduleLabel(
    schedule?: string | null,
) {
    switch (schedule) {
        case 'half_day_am':
            return 'Half Day AM';

        case 'half_day_pm':
            return 'Half Day PM';

        case 'full_day':
            return 'Full Day';

        default:
            return schedule || 'Full Day';
    }
}