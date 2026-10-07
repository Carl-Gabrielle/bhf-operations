import { useState, type FormEvent, type ReactNode } from 'react';

import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    Download,
    Edit3,
    FileText,
    Info,
    Save,
    ShieldCheck,
    User,
    Users,
    X,
    XCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type LeaveStatus = string;
type ScheduleType = 'full_day' | 'half_day_am' | 'half_day_pm';

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

type LeaveType = {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    is_paid?: boolean;
    requires_attachment?: boolean;
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
    schedule_type: ScheduleType | string;
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
    leave_type?: LeaveType | null;
    approvals?: Approval[];
    approval_workflow?: {
        id: number;
        name?: string | null;
    } | null;
};

type Props = {
    application: LeaveApplication;
    leaveTypes?: LeaveType[];
    editing?: boolean;
};

type FormData = {
    leave_type_id: string;
    start_date: string;
    end_date: string;
    schedule_type: ScheduleType;
    reason: string;
    attachment: File | null;
};

const statusMap: Record<
    string,
    {
        label: string;
        description: string;
        className: string;
        accent: string;
        icon: typeof FileText;
    }
> = {
    draft: {
        label: 'Draft',
        description: 'This application has not been submitted yet.',
        className: 'border-slate-200 bg-slate-100 text-slate-700',
        accent: 'bg-slate-400',
        icon: FileText,
    },
    submitted: {
        label: 'Submitted',
        description: 'Your application has been submitted for review.',
        className: 'border-blue-200 bg-blue-50 text-blue-800',
        accent: 'bg-blue-600',
        icon: FileText,
    },
    pending_approval: {
        label: 'Pending approval',
        description: 'Your application is waiting for the assigned approver.',
        className: 'border-amber-200 bg-amber-50 text-amber-800',
        accent: 'bg-amber-500',
        icon: Clock3,
    },
    approved: {
        label: 'Approved',
        description: 'Your leave application has been approved.',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        accent: 'bg-emerald-600',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Rejected',
        description: 'Your leave application has been rejected.',
        className: 'border-rose-200 bg-rose-50 text-rose-800',
        accent: 'bg-rose-600',
        icon: XCircle,
    },
    returned: {
        label: 'Returned',
        description: 'Your application needs an update before it can continue.',
        className: 'border-orange-200 bg-orange-50 text-orange-800',
        accent: 'bg-orange-500',
        icon: Clock3,
    },
    processing: {
        label: 'Processing',
        description: 'Your leave application is being processed.',
        className: 'border-indigo-200 bg-indigo-50 text-indigo-800',
        accent: 'bg-indigo-600',
        icon: Clock3,
    },
    completed: {
        label: 'Completed',
        description: 'Processing for this leave application is complete.',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        accent: 'bg-emerald-600',
        icon: CheckCircle2,
    },
    cancelled: {
        label: 'Cancelled',
        description: 'This leave application has been cancelled.',
        className: 'border-slate-200 bg-slate-100 text-slate-700',
        accent: 'bg-slate-400',
        icon: XCircle,
    },
};

const getStatus = (value: LeaveStatus) => {
    const key = value?.trim().toLowerCase() ?? '';
    if (Object.prototype.hasOwnProperty.call(statusMap, key)) {
        return statusMap[key];
    }

    const label = key
        ? key.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
        : 'Status unavailable';

    return {
        label,
        description: 'Current application status.',
        className: 'border-slate-200 bg-slate-100 text-slate-700',
        accent: 'bg-slate-400',
        icon: FileText,
    };
};

const approvalMap: Record<
    string,
    { label: string; className: string; iconClass: string; icon: typeof Clock3 }
> = {
    approved: {
        label: 'Approved',
        className: 'text-emerald-800',
        iconClass: 'border-emerald-200 bg-emerald-50',
        icon: CheckCircle2,
    },
    rejected: {
        label: 'Rejected',
        className: 'text-rose-800',
        iconClass: 'border-rose-200 bg-rose-50',
        icon: XCircle,
    },
    returned: {
        label: 'Returned',
        className: 'text-orange-800',
        iconClass: 'border-orange-200 bg-orange-50',
        icon: Clock3,
    },
};

const getApprovalStatus = (action?: string) =>
    approvalMap[action?.toLowerCase() ?? ''] ?? {
        label: 'Pending',
        className: 'text-amber-800',
        iconClass: 'border-amber-200 bg-amber-50',
        icon: Clock3,
    };

const parseDateOnly = (value?: string | null) => {
    if (!value) return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!match) return null;

    const year = Number(match[1]);
    const month = Number(match[2]) - 1;
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month, day));

    return date.getUTCFullYear() === year &&
        date.getUTCMonth() === month &&
        date.getUTCDate() === day
        ? date
        : null;
};

function formatDate(value?: string | null) {
    if (!value) return '—';
    const date = parseDateOnly(value);
    if (date) {
        return new Intl.DateTimeFormat('en-PH', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(date);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? value
        : new Intl.DateTimeFormat('en-PH', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
          }).format(parsed);
}

function formatShortDate(value?: string | null) {
    if (!value) return '—';
    const date = parseDateOnly(value);
    if (date) {
        return new Intl.DateTimeFormat('en-PH', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            timeZone: 'UTC',
        }).format(date);
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? value
        : new Intl.DateTimeFormat('en-PH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
          }).format(parsed);
}

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
        ? value
        : new Intl.DateTimeFormat('en-PH', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          }).format(parsed);
}

function formatSchedule(value?: string | null) {
    const labels: Record<string, string> = {
        full_day: 'Full day',
        half_day_am: 'Half day · Morning',
        half_day_pm: 'Half day · Afternoon',
    };

    return value ? labels[value] ?? value : '—';
}

function getInitials(value?: string | null) {
    const parts = value?.trim().split(/\s+/).filter(Boolean) ?? [];
    if (!parts.length) return '—';
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function normalizeSchedule(value?: string): ScheduleType {
    return value === 'half_day_am' || value === 'half_day_pm'
        ? value
        : 'full_day';
}

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
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf3fb] text-[#28658f]">
                <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[#17366b]">
                    {title}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

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
        <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {label}
            </p>
            <p
                className={
                    'mt-1.5 break-words text-slate-800 ' +
                    (mono
                        ? 'font-mono text-xs'
                        : emphasis
                          ? 'text-sm font-semibold'
                          : 'text-sm font-medium')
                }
            >
                {value}
            </p>
        </div>
    );
}

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
        <div className="py-3.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {label}
            </p>
            <div className="mt-1.5 flex items-start gap-2">
                {Icon && (
                    <Icon
                        aria-hidden="true"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                    />
                )}
                <p className="break-words text-sm font-medium text-slate-700">
                    {value}
                </p>
            </div>
        </div>
    );
}

function MetricCard({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: typeof CalendarDays;
}) {
    return (
        <div className="flex min-w-0 items-center gap-3 px-4 py-4 sm:px-5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eaf3fb] text-[#28658f]">
                <Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    {label}
                </p>
                <p className="mt-1 truncate text-sm font-semibold text-[#17366b]">
                    {value}
                </p>
            </div>
        </div>
    );
}

function FieldLabel({
    children,
    htmlFor,
    required = false,
}: {
    children: ReactNode;
    htmlFor?: string;
    required?: boolean;
}) {
    return (
        <label
            htmlFor={htmlFor}
            className="mb-1.5 block text-sm font-medium text-slate-800"
        >
            {children}
            {required && (
                <>
                    <span aria-hidden="true" className="ml-1 text-rose-600">
                        *
                    </span>
                    <span className="sr-only"> required</span>
                </>
            )}
        </label>
    );
}

function FieldError({ message }: { message?: string }) {
    return message ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-700">
            {message}
        </p>
    ) : null;
}

function StatusBadge({ status }: { status: ReturnType<typeof getStatus> }) {
    const StatusIcon = status.icon;
    return (
        <span
            className={
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ' +
                status.className
            }
        >
            <StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />
            {status.label}
        </span>
    );
}

export default function View({
    application,
    leaveTypes = [],
    editing: initialEditing = false,
}: Props) {
    const [editing, setEditing] = useState(initialEditing);
    const status = getStatus(application.status);
    const StatusIcon = status.icon;
    const approvals = [...(application.approvals ?? [])].sort(
        (a, b) => a.step_order - b.step_order,
    );
    const employee = application.employee;
    const leaveType = application.leave_type;
    const canEdit =
        application.status === 'draft' || application.status === 'returned';

    const form = useForm<FormData>({
        leave_type_id: application.leave_type_id
            ? String(application.leave_type_id)
            : '',
        start_date: application.start_date?.substring(0, 10) ?? '',
        end_date: application.end_date?.substring(0, 10) ?? '',
        schedule_type: normalizeSchedule(application.schedule_type),
        reason: application.reason ?? '',
        attachment: null,
    });

    const cancelEdit = () => {
        form.reset();
        form.clearErrors();
        setEditing(false);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.transform((data) => ({
            ...data,
            leave_type_id: Number(data.leave_type_id),
        }));
        form.put('/leave/applications/' + application.id, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setEditing(false),
        });
    };

    const downloadUrl =
        '/leave/applications/' + application.id + '/download';
    const canShowEditForm = editing && canEdit;

    return (
        <>
            <Head title={'Leave ' + application.application_no} />

            <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
                <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                    <Link
                        href="/leave/applications"
                        className="mb-5 inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-[#17366b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2"
                    >
                        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                        Leave applications
                    </Link>

                    <header className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                        <div
                            aria-hidden="true"
                            className={'absolute inset-x-0 top-0 h-1 ' + status.accent}
                        />
                        <div className="flex flex-col gap-5 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-md bg-[#f1f5f9] px-2 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-600">
                                        Leave application
                                    </span>
                                    <span aria-hidden="true" className="text-slate-300">
                                        /
                                    </span>
                                    <span className="break-all font-mono text-xs font-medium text-slate-600">
                                        {application.application_no}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#eaf3fb] text-[#28658f]">
                                        <CalendarDays
                                            aria-hidden="true"
                                            className="h-5 w-5"
                                        />
                                    </span>
                                    <h1 className="min-w-0 text-2xl font-semibold tracking-tight text-[#17366b] sm:text-3xl">
                                        {leaveType?.name ?? 'Leave application'}
                                    </h1>
                                    <StatusBadge status={status} />
                                </div>
                                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                                    {status.description}
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {application.attachment_path && (
                                    <Button
                                        asChild
                                        variant="outline"
                                        className="min-h-10 rounded-lg border-slate-300 bg-white"
                                    >
                                        <a href={downloadUrl}>
                                            <Download
                                                aria-hidden="true"
                                                className="mr-2 h-4 w-4"
                                            />
                                            Download file
                                        </a>
                                    </Button>
                                )}
                                {canEdit && !editing && (
                                    <Button
                                        type="button"
                                        onClick={() => setEditing(true)}
                                        className="min-h-10 rounded-lg bg-[#17366b] text-white hover:bg-[#102950]"
                                    >
                                        <Edit3
                                            aria-hidden="true"
                                            className="mr-2 h-4 w-4"
                                        />
                                        Edit application
                                    </Button>
                                )}
                                {canShowEditForm && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={cancelEdit}
                                        disabled={form.processing}
                                        className="min-h-10 rounded-lg border-slate-300 bg-white"
                                    >
                                        <X
                                            aria-hidden="true"
                                            className="mr-2 h-4 w-4"
                                        />
                                        Cancel editing
                                    </Button>
                                )}
                                <Button
                                    asChild
                                    variant="outline"
                                    className="min-h-10 rounded-lg border-slate-300 bg-white"
                                >
                                    <Link href="/leave/applications">
                                        Applications
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </header>

                    {canShowEditForm ? (
                        <form
                            onSubmit={handleSubmit}
                            encType="multipart/form-data"
                            className="space-y-6"
                        >
                            <div className="flex items-start gap-3 rounded-xl border border-[#dce8f2] bg-[#f7fbff] p-4">
                                <Info
                                    aria-hidden="true"
                                    className="mt-0.5 h-4 w-4 shrink-0 text-[#28658f]"
                                />
                                <div>
                                    <p className="text-sm font-semibold text-[#17366b]">
                                        Editing application
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                        Save your updated details when ready.
                                        Editing does not approve the request.
                                    </p>
                                </div>
                            </div>

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                <SectionHeader
                                    icon={Edit3}
                                    title="Application details"
                                    description="Update the leave request information and save your changes."
                                />
                                <div className="grid gap-x-5 gap-y-5 p-4 sm:grid-cols-2 sm:p-6">
                                    <div className="space-y-1.5">
                                        <FieldLabel
                                            htmlFor="leave_type_id"
                                            required
                                        >
                                            Leave type
                                        </FieldLabel>
                                        <select
                                            id="leave_type_id"
                                            required
                                            value={form.data.leave_type_id}
                                            onChange={(event) =>
                                                form.setData(
                                                    'leave_type_id',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={form.processing}
                                            aria-invalid={Boolean(
                                                form.errors.leave_type_id,
                                            )}
                                            className={
                                                'h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#4389bc] focus:ring-4 focus:ring-[#4389bc]/10 disabled:bg-slate-50 ' +
                                                (form.errors.leave_type_id
                                                    ? 'border-rose-400'
                                                    : 'border-slate-300')
                                            }
                                        >
                                            <option value="">
                                                Select leave type
                                            </option>
                                            {leaveTypes.map((type) => (
                                                <option
                                                    key={type.id}
                                                    value={type.id}
                                                >
                                                    {type.name}
                                                    {type.code
                                                        ? ' (' + type.code + ')'
                                                        : ''}
                                                </option>
                                            ))}
                                        </select>
                                        <FieldError
                                            message={form.errors.leave_type_id}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <FieldLabel
                                            htmlFor="schedule_type"
                                            required
                                        >
                                            Schedule
                                        </FieldLabel>
                                        <select
                                            id="schedule_type"
                                            required
                                            value={form.data.schedule_type}
                                            onChange={(event) =>
                                                form.setData(
                                                    'schedule_type',
                                                    normalizeSchedule(
                                                        event.target.value,
                                                    ),
                                                )
                                            }
                                            disabled={form.processing}
                                            aria-invalid={Boolean(
                                                form.errors.schedule_type,
                                            )}
                                            className={
                                                'h-11 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#4389bc] focus:ring-4 focus:ring-[#4389bc]/10 disabled:bg-slate-50 ' +
                                                (form.errors.schedule_type
                                                    ? 'border-rose-400'
                                                    : 'border-slate-300')
                                            }
                                        >
                                            <option value="full_day">
                                                Full day
                                            </option>
                                            <option value="half_day_am">
                                                Half day · Morning
                                            </option>
                                            <option value="half_day_pm">
                                                Half day · Afternoon
                                            </option>
                                        </select>
                                        <FieldError
                                            message={form.errors.schedule_type}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <FieldLabel
                                            htmlFor="start_date"
                                            required
                                        >
                                            Start date
                                        </FieldLabel>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            required
                                            value={form.data.start_date}
                                            onChange={(event) =>
                                                form.setData(
                                                    'start_date',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={form.processing}
                                            aria-invalid={Boolean(
                                                form.errors.start_date,
                                            )}
                                            className={
                                                'h-11 rounded-lg shadow-none focus-visible:ring-[#4389bc] ' +
                                                (form.errors.start_date
                                                    ? 'border-rose-400'
                                                    : 'border-slate-300')
                                            }
                                        />
                                        <FieldError
                                            message={form.errors.start_date}
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <FieldLabel
                                            htmlFor="end_date"
                                            required
                                        >
                                            End date
                                        </FieldLabel>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            required
                                            min={form.data.start_date || undefined}
                                            value={form.data.end_date}
                                            onChange={(event) =>
                                                form.setData(
                                                    'end_date',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={form.processing}
                                            aria-invalid={Boolean(
                                                form.errors.end_date,
                                            )}
                                            className={
                                                'h-11 rounded-lg shadow-none focus-visible:ring-[#4389bc] ' +
                                                (form.errors.end_date
                                                    ? 'border-rose-400'
                                                    : 'border-slate-300')
                                            }
                                        />
                                        <FieldError
                                            message={form.errors.end_date}
                                        />
                                    </div>

                                    <div className="space-y-1.5 sm:col-span-2">
                                        <div className="flex items-end justify-between gap-3">
                                            <FieldLabel
                                                htmlFor="reason"
                                                required
                                            >
                                                Reason for leave
                                            </FieldLabel>
                                            <span className="shrink-0 text-xs tabular-nums text-slate-500">
                                                {form.data.reason.length}/2000
                                            </span>
                                        </div>
                                        <Textarea
                                            id="reason"
                                            required
                                            rows={5}
                                            maxLength={2000}
                                            value={form.data.reason}
                                            onChange={(event) =>
                                                form.setData(
                                                    'reason',
                                                    event.target.value,
                                                )
                                            }
                                            disabled={form.processing}
                                            placeholder="Enter the reason for this leave request."
                                            aria-invalid={Boolean(
                                                form.errors.reason,
                                            )}
                                            className={
                                                'min-h-28 resize-y rounded-lg leading-6 shadow-none focus-visible:ring-[#4389bc] ' +
                                                (form.errors.reason
                                                    ? 'border-rose-400'
                                                    : 'border-slate-300')
                                            }
                                        />
                                        <FieldError
                                            message={form.errors.reason}
                                        />
                                    </div>

                                    <div className="space-y-2 sm:col-span-2">
                                        <div className="flex flex-wrap items-end justify-between gap-2">
                                            <FieldLabel htmlFor="attachment">
                                                Supporting document
                                            </FieldLabel>
                                            <span className="text-xs text-slate-500">
                                                Maximum file size: 5 MB
                                            </span>
                                        </div>
                                        {application.attachment_path && (
                                            <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:flex-row sm:items-center sm:justify-between">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#28658f] ring-1 ring-slate-200">
                                                        <FileText
                                                            aria-hidden="true"
                                                            className="h-4 w-4"
                                                        />
                                                    </span>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-slate-800">
                                                            Current document
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            Download it or select
                                                            a replacement below.
                                                        </p>
                                                    </div>
                                                </div>
                                                <a
                                                    href={downloadUrl}
                                                    className="inline-flex min-h-9 items-center gap-2 text-xs font-semibold text-[#28658f] hover:underline"
                                                >
                                                    <Download
                                                        aria-hidden="true"
                                                        className="h-4 w-4"
                                                    />
                                                    Download current file
                                                </a>
                                            </div>
                                        )}
                                        {form.data.attachment && (
                                            <p className="break-all text-xs font-medium text-[#28658f]">
                                                New file: {form.data.attachment.name}
                                            </p>
                                        )}
                                        <Input
                                            id="attachment"
                                            type="file"
                                            onChange={(event) =>
                                                form.setData(
                                                    'attachment',
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                            disabled={form.processing}
                                            aria-invalid={Boolean(
                                                form.errors.attachment,
                                            )}
                                            className="h-auto cursor-pointer rounded-lg border-slate-300 py-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-[#eaf3fb] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#17366b] hover:file:bg-[#dcebf7] focus-visible:ring-[#4389bc]"
                                        />
                                        <FieldError
                                            message={form.errors.attachment}
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={cancelEdit}
                                    disabled={form.processing}
                                    className="min-h-11 rounded-lg border-slate-300 bg-white px-5"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="min-h-11 rounded-lg bg-[#17366b] px-5 text-white hover:bg-[#102950]"
                                >
                                    <Save
                                        aria-hidden="true"
                                        className="mr-2 h-4 w-4"
                                    />
                                    {form.processing
                                        ? 'Saving changes…'
                                        : 'Save changes'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <>
                            <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 xl:grid-cols-4">
                                    <MetricCard
                                        label="Application status"
                                        value={status.label}
                                        icon={StatusIcon}
                                    />
                                    <MetricCard
                                        label="Leave duration"
                                        value={
                                            String(application.total_days) +
                                            ' day' +
                                            (Number(application.total_days) === 1
                                                ? ''
                                                : 's')
                                        }
                                        icon={CalendarDays}
                                    />
                                    <MetricCard
                                        label="Leave period"
                                        value={
                                            formatShortDate(
                                                application.start_date,
                                            ) +
                                            ' – ' +
                                            formatShortDate(
                                                application.end_date,
                                            )
                                        }
                                        icon={CalendarDays}
                                    />
                                    <MetricCard
                                        label="Workflow step"
                                        value={
                                            application.current_step
                                                ? 'Step ' +
                                                  application.current_step
                                                : 'Not assigned'
                                        }
                                        icon={ShieldCheck}
                                    />
                                </div>
                            </section>

                            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                                <main className="min-w-0 space-y-5">
                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                        <SectionHeader
                                            icon={CalendarDays}
                                            title="Leave details"
                                            description="Key dates and information for this request."
                                        />
                                        <div className="grid gap-x-6 gap-y-6 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-3">
                                            <DetailItem
                                                label="Leave type"
                                                value={leaveType?.name ?? '—'}
                                            />
                                            <DetailItem
                                                label="Leave code"
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
                                                label="Start date"
                                                value={formatDate(
                                                    application.start_date,
                                                )}
                                            />
                                            <DetailItem
                                                label="End date"
                                                value={formatDate(
                                                    application.end_date,
                                                )}
                                            />
                                            <DetailItem
                                                label="Total leave"
                                                value={
                                                    String(
                                                        application.total_days,
                                                    ) +
                                                    ' day' +
                                                    (Number(
                                                        application.total_days,
                                                    ) === 1
                                                        ? ''
                                                        : 's')
                                                }
                                                emphasis
                                            />
                                            <DetailItem
                                                label="Date filed"
                                                value={formatDate(
                                                    application.date_filed,
                                                )}
                                            />
                                            <DetailItem
                                                label="Submitted"
                                                value={formatDateTime(
                                                    application.submitted_at,
                                                )}
                                            />
                                            <DetailItem
                                                label="Application number"
                                                value={application.application_no}
                                                mono
                                            />
                                        </div>
                                    </section>

                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                        <SectionHeader
                                            icon={FileText}
                                            title="Reason for leave"
                                            description="Reason provided with this application."
                                        />
                                        <div className="p-5 sm:p-6">
                                            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
                                                <p className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                                    {application.reason ||
                                                        'No reason provided.'}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                        <SectionHeader
                                            icon={Users}
                                            title="Approval workflow"
                                            description={
                                                application.approval_workflow
                                                    ?.name ??
                                                'Review the recorded approval activity.'
                                            }
                                        />
                                        <div className="p-5 sm:p-6">
                                            {approvals.length === 0 ? (
                                                <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">
                                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200">
                                                        <Clock3
                                                            aria-hidden="true"
                                                            className="h-5 w-5"
                                                        />
                                                    </span>
                                                    <h3 className="mt-3 text-sm font-semibold text-slate-800">
                                                        No approval activity yet
                                                    </h3>
                                                    <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                                        Approval updates will
                                                        appear here when they
                                                        are recorded.
                                                    </p>
                                                </div>
                                            ) : (
                                                <ol className="space-y-0">
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
                                                                approvals.length -
                                                                    1;

                                                            return (
                                                                <li
                                                                    key={
                                                                        approval.id
                                                                    }
                                                                    className="relative flex gap-3.5"
                                                                >
                                                                    {!isLast && (
                                                                        <span
                                                                            aria-hidden="true"
                                                                            className="absolute bottom-0 left-[17px] top-9 w-px bg-slate-200"
                                                                        />
                                                                    )}
                                                                    <span
                                                                        className={
                                                                            'relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ' +
                                                                            approvalStatus.iconClass
                                                                        }
                                                                    >
                                                                        <ApprovalIcon
                                                                            aria-hidden="true"
                                                                            className={
                                                                                'h-4 w-4 ' +
                                                                                approvalStatus.className
                                                                            }
                                                                        />
                                                                    </span>
                                                                    <div
                                                                        className={
                                                                            'min-w-0 flex-1 ' +
                                                                            (isLast
                                                                                ? ''
                                                                                : 'pb-5')
                                                                        }
                                                                    >
                                                                        <article className="rounded-xl border border-slate-200 bg-white p-4">
                                                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                                                <div className="min-w-0">
                                                                                    <div className="flex flex-wrap items-center gap-2">
                                                                                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-600">
                                                                                            Step{' '}
                                                                                            {
                                                                                                approval.step_order
                                                                                            }
                                                                                        </span>
                                                                                        <span
                                                                                            className={
                                                                                                'text-xs font-semibold ' +
                                                                                                approvalStatus.className
                                                                                            }
                                                                                        >
                                                                                            {
                                                                                                approvalStatus.label
                                                                                            }
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="mt-3 text-sm font-semibold text-slate-800">
                                                                                        {approval.approver
                                                                                            ?.name ??
                                                                                            'Assigned approver'}
                                                                                    </p>
                                                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                                                        {approval.approver
                                                                                            ?.position
                                                                                            ?.name ??
                                                                                            'Approver'}
                                                                                    </p>
                                                                                    {approval.approver
                                                                                        ?.employee_number && (
                                                                                        <p className="mt-1 font-mono text-[11px] text-slate-500">
                                                                                            {
                                                                                                approval
                                                                                                    .approver
                                                                                                    .employee_number
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <div className="shrink-0 sm:text-right">
                                                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                                                        Action date
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
                                                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                                                        Remarks
                                                                                    </p>
                                                                                    <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                                                                        {
                                                                                            approval.remarks
                                                                                        }
                                                                                    </p>
                                                                                </div>
                                                                            )}
                                                                        </article>
                                                                    </div>
                                                                </li>
                                                            );
                                                        },
                                                    )}
                                                </ol>
                                            )}
                                        </div>
                                    </section>
                                </main>

                                <aside className="space-y-5 xl:sticky xl:top-6">
                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                        <SectionHeader
                                            icon={User}
                                            title="Employee information"
                                            description="Applicant details."
                                        />
                                        <div className="p-5">
                                            <div className="mb-4 flex min-w-0 items-center gap-3">
                                                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#eaf3fb] text-sm font-semibold text-[#17366b]">
                                                    {getInitials(employee?.name)}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-slate-800">
                                                        {employee?.name ?? '—'}
                                                    </p>
                                                    <p className="mt-0.5 truncate font-mono text-[11px] text-slate-500">
                                                        {employee?.employee_number ??
                                                            'No employee number'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="divide-y divide-slate-100 border-t border-slate-100">
                                                <SidebarDetail
                                                    label="Position"
                                                    value={
                                                        employee?.position?.name ??
                                                        '—'
                                                    }
                                                />
                                                <SidebarDetail
                                                    label="Organizational unit"
                                                    value={
                                                        employee
                                                            ?.organizational_unit
                                                            ?.name ?? '—'
                                                    }
                                                    icon={Building2}
                                                />
                                                <SidebarDetail
                                                    label="Reporting manager"
                                                    value={
                                                        employee?.reports_to
                                                            ?.name ?? '—'
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                        <SectionHeader
                                            icon={Info}
                                            title="Submission"
                                            description="Application record details."
                                        />
                                        <div className="divide-y divide-slate-100 px-5">
                                            <SidebarDetail
                                                label="Date filed"
                                                value={formatDate(
                                                    application.date_filed,
                                                )}
                                            />
                                            <SidebarDetail
                                                label="Submitted"
                                                value={formatDateTime(
                                                    application.submitted_at,
                                                )}
                                            />
                                            <div className="py-3.5">
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                                    Employee confirmation
                                                </p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    {application.employee_confirmed ? (
                                                        <>
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                                                                <Check
                                                                    aria-hidden="true"
                                                                    className="h-3.5 w-3.5"
                                                                />
                                                            </span>
                                                            <span className="text-sm font-medium text-emerald-800">
                                                                Confirmed
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-50 text-amber-800">
                                                                <Clock3
                                                                    aria-hidden="true"
                                                                    className="h-3.5 w-3.5"
                                                                />
                                                            </span>
                                                            <span className="text-sm font-medium text-amber-800">
                                                                Pending
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                                {application.employee_confirmed_at && (
                                                    <p className="mt-2 text-xs text-slate-500">
                                                        {formatDateTime(
                                                            application.employee_confirmed_at,
                                                        )}
                                                    </p>
                                                )}
                                            </div>
                                            <SidebarDetail
                                                label="Application status"
                                                value={status.label}
                                            />
                                        </div>
                                    </section>

                                    {application.attachment_path && (
                                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                            <SectionHeader
                                                icon={FileText}
                                                title="Supporting document"
                                                description="Attached to this application."
                                            />
                                            <div className="p-4">
                                                <a
                                                    href={downloadUrl}
                                                    className="group flex min-h-16 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-colors hover:border-[#4389bc] hover:bg-[#f2f8fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2"
                                                >
                                                    <span className="flex min-w-0 items-center gap-3">
                                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#28658f] ring-1 ring-slate-200">
                                                            <FileText
                                                                aria-hidden="true"
                                                                className="h-4 w-4"
                                                            />
                                                        </span>
                                                        <span className="min-w-0">
                                                            <span className="block truncate text-sm font-semibold text-slate-800">
                                                                Download attachment
                                                            </span>
                                                            <span className="mt-0.5 block text-xs text-slate-500">
                                                                Secure document download
                                                            </span>
                                                        </span>
                                                    </span>
                                                    <Download
                                                        aria-hidden="true"
                                                        className="h-4 w-4 shrink-0 text-slate-500 transition-transform group-hover:translate-y-0.5"
                                                    />
                                                </a>
                                            </div>
                                        </section>
                                    )}
                                </aside>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
