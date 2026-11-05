
import { Head, Link, useForm } from '@inertiajs/react';
import type { ElementType, ReactNode } from 'react';
import {
    ArrowLeft, CalendarDays, Check, CheckCircle2, Clock3, FileText,
    GitBranch, MessageSquare, UserRound, X, XCircle,
} from 'lucide-react';

type Employee = {
    id: number | null;
    name: string | null;
    employee_number: string | null;
    email: string | null;
    department: string | null;
    position: string | null;
    manager: string | null;
};

type AssignedReviewer = {
    id: number;
    name: string;
    employee_number: string | null;
    department: string | null;
    position: string | null;
};

type Approval = {
    id: number;
    step_order: number;
    step_name: string | null;
    approver: string | null;
    approver_id: number | null;
    approver_department: string | null;
    approver_position: string | null;
    action: string;
    remarks: string | null;
    acted_at: string | null;
};

type CurrentApproval = {
    id: number;
    step_order: number;
    action: string;
    remarks: string | null;
};

type Application = {
    id: number;
    application_no: string | null;
    employee: Employee | null;
    assigned_reviewer: AssignedReviewer | null;
    date_filed: string | null;
    undertime_date: string | null;
    scheduled_start_time: string | null;
    scheduled_end_time: string | null;
    requested_departure_time: string | null;
    requested_minutes: number | null;
    reason: string | null;
    has_attachment: boolean;
    status: string;
    submitted_at: string | null;
    workflow: string | null;
    current_step: number | null;
    current_approval: CurrentApproval | null;
    approvals: Approval[];
};

type Props = {
    application: Application;
};

function formatDate(value?: string | null) {
    if (!value) return '—';

    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    const date = dateOnly
        ? new Date(Date.UTC(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])))
        : new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...(dateOnly ? { timeZone: 'UTC' } : {}),
    }).format(date);
}

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
}

function formatTime(value?: string | null) {
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

function humanize(value?: string | null) {
    if (!value) return 'Status unavailable';
    return value.replace(/[_-]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function actionLabel(action: string) {
    const labels: Record<string, string> = {
        approved: 'Approved',
        rejected: 'Rejected',
        pending: 'Awaiting decision',
        waiting: 'Waiting',
        cancelled: 'Cancelled',
    };

    return labels[action] ?? humanize(action);
}

function actionStyle(action: string) {
    switch (action) {
        case 'approved':
            return 'border-emerald-200 bg-emerald-50 text-emerald-800';
        case 'rejected':
            return 'border-rose-200 bg-rose-50 text-rose-800';
        case 'pending':
            return 'border-amber-200 bg-amber-50 text-amber-800';
        default:
            return 'border-slate-200 bg-slate-50 text-slate-600';
    }
}

function StatusBadge({ status }: { status: string }) {
    const normalized = status?.toLowerCase() ?? 'unknown';
    const pending = ['pending_approval', 'submitted', 'processing'].includes(normalized);
    const approved = ['approved', 'completed'].includes(normalized);
    const rejected = ['rejected', 'cancelled'].includes(normalized);

    const Icon = pending ? Clock3 : approved ? CheckCircle2 : rejected ? XCircle : FileText;
    const style = pending
        ? 'border-amber-200 bg-amber-50 text-amber-800'
        : approved
          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
          : rejected
            ? 'border-rose-200 bg-rose-50 text-rose-800'
            : 'border-slate-200 bg-slate-50 text-slate-700';

    return (
        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${style}`}>
            <Icon className="h-3.5 w-3.5" />
            {humanize(normalized)}
        </span>
    );
}

function Panel({
    title,
    description,
    icon: Icon,
    children,
}: {
    title: string;
    description?: string;
    icon?: ElementType;
    children: ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                {Icon && (
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf4fa] text-[#205c86]">
                        <Icon className="h-5 w-5" />
                    </span>
                )}
                <div>
                    <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
                    {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="min-w-0 space-y-1.5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
            <div className="break-words text-sm font-medium leading-6 text-slate-800">{children || '—'}</div>
        </div>
    );
}

export default function Show({ application }: Props) {
    const employee = application.employee;
    const assignedReviewer = application.assigned_reviewer;
    const approvals = [...(application.approvals ?? [])].sort(
        (a, b) => a.step_order - b.step_order,
    );

    // The controller only renders this page after verifying that the current
    // authenticated user owns a pending approval assignment.
    const activeApproval = application.current_approval?.action === 'pending'
        ? application.current_approval
        : null;

    const approveForm = useForm({ remarks: '' });
    const rejectForm = useForm({ remarks: '' });
    const isSubmitting = approveForm.processing || rejectForm.processing;

    function approve() {
        approveForm.post(`/undertime/approvals/${application.id}/approve`, {
            preserveScroll: true,
        });
    }

    function reject() {
        if (!rejectForm.data.remarks.trim()) {
            rejectForm.setError('remarks', 'Please provide a reason for rejecting this request.');
            return;
        }

        rejectForm.post(`/undertime/approvals/${application.id}/reject`, {
            preserveScroll: true,
        });
    }

    return (
        <>
            <Head title={`Review ${application.application_no || 'Undertime Application'}`} />

            <main className="min-h-full bg-[#f4f7fb] text-slate-900">
                <div className="mx-auto w-full max-w-[1440px] space-y-6 px-4 py-5 sm:px-6 sm:py-7 xl:px-8">

                    <Link
                        href="/undertime/approvals"
                        className="inline-flex min-h-9 items-center gap-2 rounded-lg px-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-[#205c86]"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to approvals
                    </Link>

                    <header className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="h-1.5 bg-[#17366b]" />
                        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex min-w-0 items-start gap-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17366b] text-white">
                                    <FileText className="h-5 w-5" />
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#4389bc]">
                                        Undertime management / Approvals
                                    </p>
                                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#17366b] sm:text-3xl">
                                        Review undertime application
                                    </h1>
                                    <p className="mt-2 break-all text-sm text-slate-500">
                                        Reference: {application.application_no || `Application #${application.id}`}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
                                <StatusBadge status={application.status} />
                                <p className="text-xs text-slate-500">Submitted {formatDateTime(application.submitted_at)}</p>
                            </div>
                        </div>
                    </header>

                    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="min-w-0 space-y-6">

                            <Panel
                                title="Application details"
                                description="Review the employee's scheduled hours and requested departure time."
                                icon={FileText}
                            >
                                <div className="grid gap-x-8 gap-y-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                                    <Detail label="Employee name">{employee?.name}</Detail>
                                    <Detail label="Employee number">{employee?.employee_number}</Detail>
                                    <Detail label="Department / section">{employee?.department}</Detail>
                                    <Detail label="Position">{employee?.position}</Detail>
                                    <Detail label="Undertime date">{formatDate(application.undertime_date)}</Detail>
                                    <Detail label="Scheduled start">{formatTime(application.scheduled_start_time)}</Detail>
                                    <Detail label="Scheduled end">{formatTime(application.scheduled_end_time)}</Detail>
                                    <Detail label="Requested departure">{formatTime(application.requested_departure_time)}</Detail>
                                    <Detail label="Requested duration">
                                        {application.requested_minutes != null ? `${application.requested_minutes} minutes` : '—'}
                                    </Detail>
                                    <Detail label="Assigned reviewer">{assignedReviewer?.name}</Detail>
                                    <Detail label="Reviewer department / section">{assignedReviewer?.department}</Detail>
                                    <Detail label="Reviewer position">{assignedReviewer?.position}</Detail>
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:p-6">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reason / justification</p>
                                    <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-700">
                                        {application.reason || 'No reason provided.'}
                                    </p>
                                </div>

                                {application.has_attachment && (
                                    <div className="border-t border-slate-100 px-5 py-4 sm:px-6">
                                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Supporting attachment</p>
                                        <p className="mt-1 text-sm text-slate-600">
                                            An attachment was submitted with this application.
                                        </p>
                                    </div>
                                )}
                            </Panel>

                            <Panel
                                title="Approval progress"
                                description="Track each workflow step and the decision recorded by each reviewer."
                                icon={GitBranch}
                            >
                                {application.workflow && (
                                    <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6">
                                        <p className="text-xs text-slate-500">Workflow</p>
                                        <p className="mt-1 text-sm font-semibold text-slate-800">{application.workflow}</p>
                                    </div>
                                )}

                                <div className="p-5 sm:p-6">
                                    {approvals.length === 0 ? (
                                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                                            <GitBranch className="mx-auto h-6 w-6 text-slate-400" />
                                            <p className="mt-3 text-sm font-semibold text-slate-800">No approval steps recorded</p>
                                        </div>
                                    ) : (
                                        <ol className="space-y-0">
                                            {approvals.map((approval, index) => {
                                                const completed = approval.action === 'approved';
                                                const rejected = approval.action === 'rejected';
                                                const pending = approval.action === 'pending';
                                                const StepIcon = completed ? Check : rejected ? X : pending ? Clock3 : GitBranch;

                                                const stepStyle = completed
                                                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                                                    : rejected
                                                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                                                      : pending
                                                        ? 'border-amber-200 bg-amber-50 text-amber-700'
                                                        : 'border-slate-200 bg-slate-50 text-slate-500';

                                                return (
                                                    <li key={approval.id} className="relative flex gap-4 pb-7 last:pb-0">
                                                        {index < approvals.length - 1 && (
                                                            <span className="absolute bottom-0 left-4 top-9 w-px bg-slate-200" />
                                                        )}
                                                        <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border ${stepStyle}`}>
                                                            <StepIcon className="h-4 w-4" />
                                                        </span>
                                                        <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-white p-4">
                                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                                <div>
                                                                    <p className="text-sm font-semibold text-slate-900">
                                                                        {approval.step_name || `Approval step ${approval.step_order}`}
                                                                    </p>
                                                                    <p className="mt-1 text-sm text-slate-600">
                                                                        {approval.approver || 'Approver not assigned'}
                                                                    </p>
                                                                    {approval.approver_department && (
                                                                        <p className="mt-0.5 text-xs text-slate-500">{approval.approver_department}</p>
                                                                    )}
                                                                    {approval.approver_position && (
                                                                        <p className="mt-0.5 text-xs text-slate-500">{approval.approver_position}</p>
                                                                    )}
                                                                </div>
                                                                <span className={`inline-flex w-fit items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${actionStyle(approval.action)}`}>
                                                                    {actionLabel(approval.action)}
                                                                </span>
                                                            </div>

                                                            {approval.acted_at && (
                                                                <p className="mt-3 text-xs text-slate-500">Recorded {formatDateTime(approval.acted_at)}</p>
                                                            )}

                                                            {approval.remarks && (
                                                                <div className="mt-3 rounded-lg bg-slate-50 p-3">
                                                                    <p className="mb-1 flex items-center gap-2 text-xs font-semibold text-slate-500">
                                                                        <MessageSquare className="h-3.5 w-3.5" /> Reviewer remarks
                                                                    </p>
                                                                    <p className="whitespace-pre-wrap text-sm leading-5 text-slate-700">{approval.remarks}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </li>
                                                );
                                            })}
                                        </ol>
                                    )}
                                </div>
                            </Panel>
                        </div>

                        <aside className="min-w-0 space-y-6 xl:sticky xl:top-6">
                            <Panel
                                title="Your decision"
                                description="Record your decision for this application."
                                icon={CheckCircle2}
                            >
                                {activeApproval ? (
                                    <div className="space-y-5 p-5 sm:p-6">
                                        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                            <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
                                            <div>
                                                <p className="text-sm font-semibold text-amber-900">Action required</p>
                                                <p className="mt-1 text-sm leading-5 text-amber-800">
                                                    Review the details carefully before approving or rejecting this request.
                                                </p>
                                            </div>
                                        </div>

                                        <form
                                            onSubmit={(event) => {
                                                event.preventDefault();
                                                approve();
                                            }}
                                            className="space-y-3"
                                        >
                                            <label htmlFor="approve-remarks" className="block text-sm font-semibold text-slate-800">
                                                Approval remarks <span className="font-normal text-slate-500">(optional)</span>
                                            </label>
                                            <textarea
                                                id="approve-remarks"
                                                value={approveForm.data.remarks}
                                                onChange={(event) => approveForm.setData('remarks', event.target.value)}
                                                rows={3}
                                                maxLength={2000}
                                                placeholder="Add a note for the approval record..."
                                                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-[#4389bc] focus:ring-4 focus:ring-[#4389bc]/10"
                                            />
                                            {approveForm.errors.remarks && <p className="text-sm text-rose-600">{approveForm.errors.remarks}</p>}
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <CheckCircle2 className="h-4 w-4" />
                                                {approveForm.processing ? 'Approving…' : 'Approve application'}
                                            </button>
                                        </form>

                                        <div className="border-t border-slate-100" />

                                        <form
                                            onSubmit={(event) => {
                                                event.preventDefault();
                                                reject();
                                            }}
                                            className="space-y-3"
                                        >
                                            <label htmlFor="reject-remarks" className="block text-sm font-semibold text-slate-800">
                                                Reason for rejection <span className="text-rose-600">*</span>
                                            </label>
                                            <textarea
                                                id="reject-remarks"
                                                required
                                                value={rejectForm.data.remarks}
                                                onChange={(event) => {
                                                    rejectForm.setData('remarks', event.target.value);
                                                    if (event.target.value.trim()) rejectForm.clearErrors('remarks');
                                                }}
                                                rows={3}
                                                maxLength={2000}
                                                placeholder="Explain why this request is being rejected..."
                                                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm outline-none focus:border-rose-400 focus:ring-4 focus:ring-rose-500/10"
                                            />
                                            {rejectForm.errors.remarks && <p className="text-sm text-rose-600">{rejectForm.errors.remarks}</p>}
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <XCircle className="h-4 w-4" />
                                                {rejectForm.processing ? 'Rejecting…' : 'Reject application'}
                                            </button>
                                        </form>
                                    </div>
                                ) : (
                                    <div className="p-5 sm:p-6">
                                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                                            <p className="text-sm font-semibold text-slate-800">No action available</p>
                                            <p className="mt-1 text-sm leading-5 text-slate-600">
                                                This application is not currently assigned to you for a pending decision.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Panel>

                            <Panel
                                title="Employee information"
                                description="Quick reference for the applicant."
                                icon={UserRound}
                            >
                                <div className="p-5 sm:p-6">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#eaf3fb] text-sm font-bold text-[#205c86]">
                                            {(employee?.name || 'U')
                                                .split(/\s+/)
                                                .filter(Boolean)
                                                .slice(0, 2)
                                                .map((part) => part[0])
                                                .join('')
                                                .toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold text-slate-900">{employee?.name || 'Unknown employee'}</p>
                                            <p className="mt-0.5 text-xs text-slate-500">{employee?.employee_number || 'No employee number'}</p>
                                        </div>
                                    </div>
                                    <div className="my-5 border-t border-slate-100" />
                                    <div className="space-y-4">
                                        <Detail label="Department">{employee?.department}</Detail>
                                        <Detail label="Position">{employee?.position}</Detail>
                                        <Detail label="Application reference">{application.application_no || `#${application.id}`}</Detail>
                                        <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
                                            <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" />
                                            <span>Submitted {formatDateTime(application.submitted_at)}</span>
                                        </div>
                                    </div>
                                </div>
                            </Panel>
                        </aside>
                    </div>
                </div>
            </main>
        </>
    );
}
