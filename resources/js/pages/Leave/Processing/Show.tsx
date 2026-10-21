import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    CalendarCheck2,
    FileCheck2,
    CheckCircle2,
    CircleUserRound,
    ClipboardCheck,
    Clock3,
    FileText,
    LoaderCircle,
    Play,
    ShieldCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type UserSummary = {
    id: number;
    name: string;
    employee_number?: string | null;
    email?: string | null;
    department?: string | null;
    organizational_unit?: { name?: string | null } | null;
    position?: { name?: string | null } | null;
    reports_to?: { name?: string | null } | null;
};

type LeaveType = {
    name: string;
    code?: string | null;
};

type Approver = {
    id?: number;
    name?: string | null;
};

type Approval = {
    id: number;
    action: string;
    step_order: number;
    remarks?: string | null;
    acted_at?: string | null;
    approver?: Approver | null;
    workflow_step?: { name?: string | null; description?: string | null } | null;
};

type LeaveApplication = {
    id: number;
    application_no?: string | null;
    status: string;
    submitted_at?: string | null;
    created_at?: string | null;
    rejected_at?: string | null;
    returned_at?: string | null;
    start_date?: string | null;
    end_date?: string | null;
    period_start?: string | null;
    period_end?: string | null;
    total_days?: number | string | null;
    reason?: string | null;
    remarks?: string | null;
    approved_at?: string | null;
    processing_started_at?: string | null;
    processing_remarks?: string | null;
    processed_at?: string | null;
    completed_at?: string | null;
    employee?: UserSummary | null;
    leave_type?: LeaveType | null;
    leaveType?: LeaveType | null;
    approval_workflow?: { name?: string | null; description?: string | null } | null;
    approvals?: Approval[];
    processing_started_by?: UserSummary | null;
    processed_by?: UserSummary | null;
};

type Props = {
    application: LeaveApplication;
};

function formatDate(value?: string | null) {
    if (!value) return '—';

    const date = new Date(`${value.slice(0, 10)}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
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

function statusLabel(status: string) {
    return status.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'default';
        case 'processing':
            return 'secondary';
        case 'rejected':
            return 'destructive';
        case 'completed':
            return 'secondary';
        default:
            return 'outline';
    }
}

function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <div className="grid gap-1 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[minmax(130px,0.8fr)_1.2fr] sm:gap-5">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="break-words text-sm font-medium text-foreground sm:text-right">
                {value == null || value === '' ? '—' : value}
            </dd>
        </div>
    );
}

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof CircleUserRound;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-muted/50 text-muted-foreground">
                <Icon className="size-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <h2 className="font-semibold tracking-tight">{title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}

export default function Show({ application }: Props) {
    const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
    const form = useForm({
        processing_remarks: application.processing_remarks ?? '',
    });

    const leaveType =
        application.leaveType?.name ?? application.leave_type?.name ?? 'Leave';
    const startDate = application.start_date ?? application.period_start;
    const endDate = application.end_date ?? application.period_end;
    const reference = application.application_no ?? `LA-${application.id}`;
    const employee = application.employee;
    const department =
        employee?.organizational_unit?.name ??
        employee?.department ??
        'Department not set';

    const isApproved = application.status.toLowerCase() === 'approved';
    const isProcessing = application.status.toLowerCase() === 'processing';
    const isCompleted = application.status.toLowerCase() === 'completed';
    const submittedAt = application.submitted_at ?? application.created_at;
    const completedAt = application.completed_at ?? application.processed_at;

    function startProcessing() {
        form.post(`/leave/processing/${application.id}/start`, {
            preserveScroll: true,
        });
    }

    function completeProcessing() {
        form.post(`/leave/processing/${application.id}/complete`, {
            preserveScroll: true,
            onSuccess: () => setCompleteDialogOpen(false),
        });
    }

    return (
        <>
            <Head title={`Process ${reference}`} />

            <main className="min-h-full bg-muted/20 text-foreground">
                <div className="mx-auto w-full max-w-[1440px] space-y-5 px-4 py-5 sm:px-6 sm:py-7 xl:px-8">
                    <header className="rounded-2xl border bg-card p-5 shadow-sm sm:p-7">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 space-y-3">
                                <Link
                                    href="/leave/processing"
                                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    <ArrowLeft className="size-4" />
                                    Back to processing queue
                                </Link>
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                    <ClipboardCheck className="size-4" />
                                    HR operations / leave processing
                                </div>
                                <div>
                                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                        Leave application
                                    </h1>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                        Review the request, verify the approval sequence, and inspect the recorded HR processing history.
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-1 text-sm">
                                    <span className="text-muted-foreground">Reference</span>
                                    <span className="rounded-md border bg-muted/40 px-2 py-1 font-mono text-xs font-semibold text-foreground">
                                        {reference}
                                    </span>
                                    {application.approval_workflow?.name && (
                                        <span className="text-muted-foreground">· {application.approval_workflow.name}</span>
                                    )}
                                </div>
                            </div>

                            <Badge
                                variant={statusVariant(application.status)}
                                className={[
                                    'inline-flex w-fit shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold',
                                    isCompleted
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-50'
                                        : isProcessing
                                          ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-50'
                                          : isApproved
                                            ? 'border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-50'
                                            : '',
                                ].join(' ')}
                            >
                                {isCompleted ? <CheckCircle2 className="size-3.5" /> : isProcessing ? <Play className="size-3.5" /> : isApproved ? <Clock3 className="size-3.5" /> : null}
                                {statusLabel(application.status)}
                            </Badge>
                        </div>
                    </header>

                    <section aria-label="Application summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <Card className="rounded-2xl shadow-sm">
                            <CardContent className="flex items-start gap-3 p-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                                    <CircleUserRound className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">Applicant</p>
                                    <p className="mt-1 truncate text-sm font-semibold">{employee?.name ?? 'Employee not available'}</p>
                                    <p className="mt-1 truncate text-xs text-muted-foreground">{employee?.employee_number ?? 'No employee number'}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-2xl shadow-sm">
                            <CardContent className="flex items-start gap-3 p-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                                    <CalendarDays className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">Leave period</p>
                                    <p className="mt-1 text-sm font-semibold">{startDate ? formatDate(startDate) : 'Dates not set'}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{endDate ? `Through ${formatDate(endDate)}` : 'End date not set'}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-2xl shadow-sm">
                            <CardContent className="flex items-start gap-3 p-4">
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-700">
                                    <FileCheck2 className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">Leave type</p>
                                    <p className="mt-1 truncate text-sm font-semibold">{leaveType}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{application.total_days ?? '—'} day(s) requested</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-2xl shadow-sm">
                            <CardContent className="flex items-start gap-3 p-4">
                                <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                    {isCompleted ? <CheckCircle2 className="size-5" /> : <CalendarCheck2 className="size-5" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground">{isCompleted ? 'Completed on' : 'Submitted on'}</p>
                                    <p className="mt-1 text-sm font-semibold">{formatDate(isCompleted ? completedAt : submittedAt)}</p>
                                    <p className="mt-1 text-xs text-muted-foreground">{isCompleted ? 'HR processing finished' : 'Application record'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>

                    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                        <div className="min-w-0 space-y-6">
                            <Card className="rounded-2xl shadow-sm">
                                <CardHeader className="pb-3">
                                    <SectionHeading
                                        icon={CircleUserRound}
                                        title="Employee information"
                                        description="Employee identity and organizational details"
                                    />
                                </CardHeader>
                                <CardContent>
                                    <dl>
                                        <InfoRow label="Employee name" value={employee?.name} />
                                        <InfoRow label="Employee number" value={employee?.employee_number} />
                                        <InfoRow label="Email address" value={employee?.email} />
                                        <InfoRow label="Department / section" value={department} />
                                        <InfoRow label="Position" value={employee?.position?.name} />
                                        <InfoRow label="Reporting manager / head" value={employee?.reports_to?.name} />
                                    </dl>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl shadow-sm">
                                <CardHeader className="pb-3">
                                    <SectionHeading
                                        icon={CalendarDays}
                                        title="Leave details"
                                        description="Information submitted with the leave application"
                                    />
                                </CardHeader>
                                <CardContent>
                                    <dl>
                                        <InfoRow label="Leave type" value={leaveType} />
                                        <InfoRow label="Date submitted" value={formatDate(application.submitted_at)} />
                                        <InfoRow
                                            label="Period covered"
                                            value={
                                                startDate || endDate
                                                    ? `${formatDate(startDate)} – ${formatDate(endDate)}`
                                                    : '—'
                                            }
                                        />
                                        <InfoRow
                                            label="Total days"
                                            value={
                                                application.total_days == null
                                                    ? '—'
                                                    : `${application.total_days} day${Number(application.total_days) === 1 ? '' : 's'}`
                                            }
                                        />
                                        <InfoRow label="Final approval date" value={formatDateTime(application.approved_at)} />
                                        <InfoRow label="Approval workflow" value={application.approval_workflow?.name} />
                                    </dl>

                                    <div className="mt-5 rounded-xl border bg-muted/30 p-4">
                                        <p className="flex items-center gap-2 text-sm font-semibold">
                                            <FileText className="size-4 text-muted-foreground" />
                                            Employee reason / remarks
                                        </p>
                                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                                            {application.reason ?? application.remarks ?? 'No reason or remarks provided.'}
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl shadow-sm">
                                <CardHeader className="pb-3">
                                    <SectionHeading
                                        icon={ShieldCheck}
                                        title="Application audit trail"
                                        description="Reviewable timeline of submission, approval decisions, and HR actions"
                                    />
                                </CardHeader>
                                <CardContent>
                                    {(() => {
                                        type AuditEvent = {
                                            id: string;
                                            title: string;
                                            description: string;
                                            actor?: string | null;
                                            timestamp?: string | null;
                                            remarks?: string | null;
                                            tone: 'blue' | 'green' | 'amber' | 'red' | 'slate';
                                        };

                                        const events: AuditEvent[] = [];
                                        const submittedAt = application.submitted_at ?? application.created_at;

                                        if (submittedAt) {
                                            events.push({
                                                id: 'submitted',
                                                title: 'Leave application submitted',
                                                description: 'The application entered the leave management workflow.',
                                                actor: employee?.name ?? 'Applicant',
                                                timestamp: submittedAt,
                                                remarks: application.reason ?? application.remarks,
                                                tone: 'blue',
                                            });
                                        }

                                        (application.approvals ?? []).forEach((approval) => {
                                            const action = String(approval.action ?? 'pending').toLowerCase();
                                            const isRejected = action.includes('reject');
                                            const isReturned = action.includes('return');
                                            const isApprovedAction = action.includes('approv');
                                            const title = isRejected
                                                ? 'Approval rejected'
                                                : isReturned
                                                  ? 'Application returned'
                                                  : isApprovedAction
                                                    ? 'Approval granted'
                                                    : `Approval action: ${statusLabel(action)}`;

                                            events.push({
                                                id: `approval-${approval.id}`,
                                                title,
                                                description:
                                                    approval.workflow_step?.name ??
                                                    `Approval step ${approval.step_order}`,
                                                actor: approval.approver?.name ?? 'Assigned approver',
                                                timestamp: approval.acted_at,
                                                remarks: approval.remarks,
                                                tone: isRejected ? 'red' : isReturned ? 'amber' : isApprovedAction ? 'green' : 'slate',
                                            });
                                        });

                                        if (
                                            application.approved_at &&
                                            !(application.approvals ?? []).some((approval) =>
                                                String(approval.action ?? '').toLowerCase().includes('approv') &&
                                                approval.acted_at === application.approved_at,
                                            )
                                        ) {
                                            events.push({
                                                id: 'final-approved',
                                                title: 'Application fully approved',
                                                description: 'All required approval steps were completed.',
                                                timestamp: application.approved_at,
                                                tone: 'green',
                                            });
                                        }

                                        if (application.rejected_at) {
                                            events.push({
                                                id: 'application-rejected',
                                                title: 'Application rejected',
                                                description: 'The application reached a rejected outcome.',
                                                timestamp: application.rejected_at,
                                                tone: 'red',
                                            });
                                        }

                                        if (application.returned_at) {
                                            events.push({
                                                id: 'application-returned',
                                                title: 'Application returned',
                                                description: 'The application was returned for follow-up or correction.',
                                                timestamp: application.returned_at,
                                                tone: 'amber',
                                            });
                                        }

                                        if (application.processing_started_at) {
                                            events.push({
                                                id: 'hr-processing-started',
                                                title: 'HR processing started',
                                                description: 'The application entered the post-approval HR processing stage.',
                                                actor: application.processing_started_by?.name ?? 'HR processor',
                                                timestamp: application.processing_started_at,
                                                remarks: application.processing_remarks,
                                                tone: 'amber',
                                            });
                                        }

                                        const completedAt = application.completed_at ?? application.processed_at;
                                        if (completedAt) {
                                            events.push({
                                                id: 'hr-processing-completed',
                                                title: 'HR processing completed',
                                                description: 'HR marked the processing stage as complete.',
                                                actor: application.processed_by?.name ?? 'HR processor',
                                                timestamp: completedAt,
                                                remarks: application.processing_remarks,
                                                tone: 'green',
                                            });
                                        }

                                        const toneClasses: Record<AuditEvent['tone'], string> = {
                                            blue: 'border-sky-200 bg-sky-50 text-sky-700',
                                            green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
                                            amber: 'border-amber-200 bg-amber-50 text-amber-800',
                                            red: 'border-rose-200 bg-rose-50 text-rose-700',
                                            slate: 'border-slate-200 bg-slate-50 text-slate-600',
                                        };

                                        const sortedEvents = events
                                            .filter((event) => Boolean(event.timestamp))
                                            .sort((a, b) => {
                                                const aTime = new Date(a.timestamp ?? '').getTime();
                                                const bTime = new Date(b.timestamp ?? '').getTime();
                                                return aTime - bTime;
                                            });

                                        if (sortedEvents.length === 0) {
                                            return (
                                                <div className="rounded-xl border border-dashed p-6 text-center">
                                                    <Clock3 className="mx-auto size-6 text-muted-foreground" />
                                                    <p className="mt-2 text-sm font-medium">No timestamped audit events available</p>
                                                    <p className="mt-1 text-sm text-muted-foreground">
                                                        Events will appear here when submission, approval, and processing timestamps are recorded.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-0">
                                                {sortedEvents.map((event, index) => (
                                                    <div key={event.id} className="relative flex gap-3 pb-6 last:pb-0">
                                                        {index < sortedEvents.length - 1 && (
                                                            <span className="absolute left-[15px] top-8 h-[calc(100%-24px)] w-px bg-border" aria-hidden="true" />
                                                        )}
                                                        <div className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border ${toneClasses[event.tone]}`}>
                                                            {event.tone === 'green' ? (
                                                                <CheckCircle2 className="size-4" />
                                                            ) : event.tone === 'amber' ? (
                                                                <Clock3 className="size-4" />
                                                            ) : event.tone === 'red' ? (
                                                                <ShieldCheck className="size-4" />
                                                            ) : event.id === 'submitted' ? (
                                                                <FileText className="size-4" />
                                                            ) : (
                                                                <ClipboardCheck className="size-4" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1 rounded-xl border bg-card p-3.5">
                                                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                                                                <div className="min-w-0">
                                                                    <p className="text-sm font-semibold">{event.title}</p>
                                                                    <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                                                                </div>
                                                                <time className="shrink-0 text-xs text-muted-foreground">
                                                                    {formatDateTime(event.timestamp)}
                                                                </time>
                                                            </div>
                                                            {event.actor && (
                                                                <p className="mt-2 text-xs text-muted-foreground">
                                                                    Performed by: <span className="font-medium text-foreground">{event.actor}</span>
                                                                </p>
                                                            )}
                                                            {event.remarks && (
                                                                <div className="mt-3 rounded-lg bg-muted/40 p-3">
                                                                    <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Remarks recorded</p>
                                                                    <p className="mt-1 whitespace-pre-wrap text-sm leading-5 text-foreground">{event.remarks}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    })()}
                                </CardContent>
                            </Card>
                        </div>

                        <aside className="space-y-6 xl:sticky xl:top-6">
                            <Card className="rounded-2xl shadow-sm">
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base">HR processing</CardTitle>
                                    <CardDescription>
                                        {isApproved
                                            ? 'The application has been approved and is ready for HR processing.'
                                            : isProcessing
                                              ? 'Complete the required checks before finalizing this application.'
                                              : isCompleted
                                                ? 'This application has completed the HR processing stage.'
                                                : 'This application is not currently eligible for HR processing.'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex gap-3 rounded-xl border p-3">
                                        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                                            {isCompleted ? (
                                                <CheckCircle2 className="size-4 text-emerald-600" />
                                            ) : isProcessing ? (
                                                <Play className="size-4 text-amber-600" />
                                            ) : (
                                                <Clock3 className="size-4 text-sky-700" />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold">
                                                {isApproved
                                                    ? 'Ready to start'
                                                    : isProcessing
                                                      ? 'Processing in progress'
                                                      : isCompleted
                                                        ? 'Processing completed'
                                                        : 'Processing unavailable'}
                                            </p>
                                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                                {isApproved
                                                    ? 'Start the HR checks to record who is handling this request.'
                                                    : isProcessing
                                                      ? 'Save any final remarks and confirm completion when all checks are finished.'
                                                      : isCompleted
                                                        ? 'The processing record is read-only.'
                                                        : 'Check the application status and approval history.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="processing_remarks">HR processing remarks</Label>
                                        <Textarea
                                            id="processing_remarks"
                                            value={form.data.processing_remarks}
                                            onChange={(event) =>
                                                form.setData('processing_remarks', event.target.value)
                                            }
                                            rows={5}
                                            maxLength={5000}
                                            disabled={isCompleted || form.processing}
                                            placeholder="Record verification notes or the processing outcome..."
                                            className="min-h-28 resize-y rounded-xl"
                                        />
                                        <div className="flex items-center justify-between gap-3">
                                            {form.errors.processing_remarks ? (
                                                <p className="text-xs text-destructive">
                                                    {form.errors.processing_remarks}
                                                </p>
                                            ) : (
                                                <p className="text-xs text-muted-foreground">
                                                    Internal note · included in the processing record
                                                </p>
                                            )}
                                            <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                                {form.data.processing_remarks.length}/5000
                                            </span>
                                        </div>
                                    </div>

                                    {isApproved && (
                                        <Button
                                            type="button"
                                            className="w-full rounded-xl"
                                            disabled={form.processing}
                                            onClick={startProcessing}
                                        >
                                            {form.processing ? (
                                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                                            ) : (
                                                <Play className="mr-2 size-4" />
                                            )}
                                            {form.processing ? 'Starting processing…' : 'Start processing'}
                                        </Button>
                                    )}

                                    {isProcessing && (
                                        <Button
                                            type="button"
                                            className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800"
                                            disabled={form.processing}
                                            onClick={() => setCompleteDialogOpen(true)}
                                        >
                                            <CheckCircle2 className="mr-2 size-4" />
                                            Complete processing
                                        </Button>
                                    )}

                                    {isCompleted && (
                                        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                                            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                                            <div>
                                                <p className="font-semibold">Completed successfully</p>
                                                <p className="mt-1 text-xs leading-5">
                                                    This application can be reviewed, but processing actions are no longer available.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="rounded-2xl shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Processing record</CardTitle>
                                    <CardDescription>Audit details for the HR processing stage</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <dl>
                                        <InfoRow label="Started by" value={application.processing_started_by?.name} />
                                        <InfoRow label="Started at" value={formatDateTime(application.processing_started_at)} />
                                        <InfoRow label="Completed by" value={application.processed_by?.name} />
                                        <InfoRow
                                            label="Completed at"
                                            value={formatDateTime(application.completed_at ?? application.processed_at)}
                                        />
                                    </dl>
                                </CardContent>
                            </Card>

                            <Button variant="outline" asChild className="w-full rounded-xl">
                                <Link href="/leave/processing">Return to processing queue</Link>
                            </Button>
                        </aside>
                    </div>
                </div>
            </main>

            <Dialog open={completeDialogOpen} onOpenChange={setCompleteDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <span className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                <ClipboardCheck className="size-5" />
                            </span>
                            Complete HR processing?
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            You are about to mark application <span className="font-semibold text-foreground">{reference}</span> as completed. Confirm that all required HR checks have been finished.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl border bg-muted/30 p-3">
                        <p className="text-sm font-medium">{employee?.name ?? 'Employee'}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {leaveType} · {startDate ? formatDate(startDate) : 'Dates not provided'}
                            {endDate ? ` – ${formatDate(endDate)}` : ''}
                        </p>
                        {form.data.processing_remarks.trim() ? (
                            <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
                                {form.data.processing_remarks}
                            </p>
                        ) : (
                            <p className="mt-3 text-xs text-muted-foreground">
                                No HR processing remarks added.
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={form.processing}
                            onClick={() => setCompleteDialogOpen(false)}
                        >
                            Go back
                        </Button>
                        <Button
                            type="button"
                            className="bg-emerald-700 hover:bg-emerald-800"
                            disabled={form.processing}
                            onClick={completeProcessing}
                        >
                            {form.processing ? (
                                <LoaderCircle className="mr-2 size-4 animate-spin" />
                            ) : (
                                <CheckCircle2 className="mr-2 size-4" />
                            )}
                            {form.processing ? 'Completing…' : 'Confirm completion'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
