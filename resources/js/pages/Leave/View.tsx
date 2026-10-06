import { Head, Link, useForm } from '@inertiajs/react';

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronRight,
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

import {
    FormEvent,
    ReactNode,
    useState,
} from 'react';

import { Button } from '@/components/ui/button';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

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

    schedule_type:
        | 'full_day'
        | 'half_day_am'
        | 'half_day_pm'
        | string;

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

/*
|--------------------------------------------------------------------------
| Formatting Helpers
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
| Status Helpers
|--------------------------------------------------------------------------
*/

function getStatus(status: LeaveStatus) {
    switch (status) {
        case 'submitted':
            return {
                label: 'Submitted',
                description:
                    'Application has been submitted.',
                className:
                    'border-blue-200 bg-blue-50 text-blue-700',
                icon: FileText,
                accent: 'bg-blue-600',
            };

        case 'pending_approval':
            return {
                label: 'Pending Approval',
                description:
                    'Waiting for the assigned approver.',
                className:
                    'border-amber-200 bg-amber-50 text-amber-700',
                icon: Clock3,
                accent: 'bg-amber-500',
            };

        case 'approved':
            return {
                label: 'Approved',
                description:
                    'Application has been approved.',
                className:
                    'border-emerald-200 bg-emerald-50 text-emerald-700',
                icon: CheckCircle2,
                accent: 'bg-emerald-600',
            };

        case 'rejected':
            return {
                label: 'Rejected',
                description:
                    'Application has been rejected.',
                className:
                    'border-red-200 bg-red-50 text-red-700',
                icon: XCircle,
                accent: 'bg-red-600',
            };

        case 'returned':
            return {
                label: 'Returned',
                description:
                    'Application requires employee attention.',
                className:
                    'border-orange-200 bg-orange-50 text-orange-700',
                icon: Clock3,
                accent: 'bg-orange-500',
            };

        case 'processing':
            return {
                label: 'Processing',
                description:
                    'Application is being processed.',
                className:
                    'border-indigo-200 bg-indigo-50 text-indigo-700',
                icon: Clock3,
                accent: 'bg-indigo-600',
            };

        case 'completed':
            return {
                label: 'Completed',
                description:
                    'Leave application is completed.',
                className:
                    'border-emerald-200 bg-emerald-50 text-emerald-700',
                icon: CheckCircle2,
                accent: 'bg-emerald-600',
            };

        case 'cancelled':
            return {
                label: 'Cancelled',
                description:
                    'Application has been cancelled.',
                className:
                    'border-slate-200 bg-slate-100 text-slate-600',
                icon: XCircle,
                accent: 'bg-slate-500',
            };

        default:
            return {
                label: 'Draft',
                description:
                    'Application is still in draft.',
                className:
                    'border-slate-200 bg-slate-100 text-slate-600',
                icon: FileText,
                accent: 'bg-slate-500',
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
                iconClass:
                    'border-emerald-200 bg-emerald-50',
            };

        case 'rejected':
            return {
                label: 'Rejected',
                className: 'text-red-700',
                icon: XCircle,
                iconClass:
                    'border-red-200 bg-red-50',
            };

        case 'returned':
            return {
                label: 'Returned',
                className: 'text-orange-700',
                icon: Clock3,
                iconClass:
                    'border-orange-200 bg-orange-50',
            };

        default:
            return {
                label: 'Pending',
                className: 'text-amber-700',
                icon: Clock3,
                iconClass:
                    'border-amber-200 bg-amber-50',
            };
    }
}

/*
|--------------------------------------------------------------------------
| Initials
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

    if (parts.length === 0) {
        return '—';
    }

    if (parts.length === 1) {
        return parts[0]
            .substring(0, 2)
            .toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`
        .toUpperCase();
}

/*
|--------------------------------------------------------------------------
| Reusable UI Components
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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

function FieldLabel({
    children,
    required = false,
}: {
    children: ReactNode;
    required?: boolean;
}) {
    return (
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            {children}

            {required && (
                <span className="ml-1 text-red-500">
                    *
                </span>
            )}
        </label>
    );
}

function FieldError({
    message,
}: {
    message?: string;
}) {
    if (!message) {
        return null;
    }

    return (
        <p className="mt-1.5 text-xs font-medium text-red-600">
            {message}
        </p>
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
        <div className="flex items-center gap-3 px-5 py-4 sm:px-6">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <Icon className="h-4 w-4 text-slate-500" />
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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
| Main Component
|--------------------------------------------------------------------------
*/

export default function View({
    application,
    leaveTypes = [],
    editing: initialEditing = false,
}: Props) {
    const [editing, setEditing] =
        useState(initialEditing);

    const status = getStatus(
        application.status,
    );

    const StatusIcon = status.icon;

    const approvals = Array.isArray(
        application.approvals,
    )
        ? application.approvals
        : [];

    const employee =
        application.employee;

    const leaveType =
        application.leave_type;

    /*
    |--------------------------------------------------------------------------
    | Edit Permission
    |--------------------------------------------------------------------------
    |
    | Only draft and returned applications can
    | be modified.
    |
    */

    const canEdit =
        application.status === 'draft' ||
        application.status === 'returned';

    /*
    |--------------------------------------------------------------------------
    | Form
    |--------------------------------------------------------------------------
    */

    const form = useForm({
        leave_type_id: application.leave_type_id
            ? String(application.leave_type_id)
            : '',

        start_date: application.start_date
            ? application.start_date.substring(0, 10)
            : '',

        end_date: application.end_date
            ? application.end_date.substring(0, 10)
            : '',

        schedule_type:
            application.schedule_type ||
            'full_day',

        reason:
            application.reason || '',

        attachment: null as File | null,
    });

    /*
    |--------------------------------------------------------------------------
    | Submit Edit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        form.transform((data) => ({
            ...data,
            leave_type_id:
                Number(data.leave_type_id),
        }));

        form.put(
            `/leave/applications/${application.id}`,
            {
                forceFormData: true,

                onSuccess: () => {
                    setEditing(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head
                title={`Leave ${application.application_no}`}
            />

            <div className="min-h-screen bg-[#f7f9fb]">
                <div className="mx-auto w-full max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

                    {/* Breadcrumb */}

                    <div className="mb-5">
                        <Link
                            href="/leave/applications"
                            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                        >
                            <ArrowLeft className="h-4 w-4" />

                            Leave Applications
                        </Link>
                    </div>

                    {/* Header */}

                    <section className="relative mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

                        <div
                            className={`absolute inset-x-0 top-0 h-1 ${status.accent}`}
                        />

                        <div className="px-5 py-6 sm:px-7 sm:py-7">
                            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                                <div className="min-w-0">

                                    <div className="mb-3 flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
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
                                            {leaveType?.name ??
                                                'Leave Application'}
                                        </h1>

                                        <span
                                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${status.className}`}
                                        >
                                            <StatusIcon className="h-3.5 w-3.5" />

                                            {status.label}
                                        </span>
                                    </div>

                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                        {status.description}
                                    </p>
                                </div>

                                {/* Actions */}

                                <div className="flex shrink-0 flex-wrap items-center gap-2">

                                    {application.attachment_path && (
                                        <Button
                                            asChild
                                            variant="outline"
                                            className="border-slate-200 bg-white shadow-none"
                                        >
                                            <a
                                                href={`/leave/applications/${application.id}/download`}
                                            >
                                                <Download className="mr-2 h-4 w-4" />

                                                Download
                                            </a>
                                        </Button>
                                    )}

                                    {canEdit &&
                                        !editing && (
                                            <Button
                                                type="button"
                                                onClick={() =>
                                                    setEditing(
                                                        true,
                                                    )
                                                }
                                                className="bg-[#4389BC] shadow-sm hover:bg-[#3575A4]"
                                            >
                                                <Edit3 className="mr-2 h-4 w-4" />

                                                Edit Application
                                            </Button>
                                        )}

                                    <Button
                                        asChild
                                        variant="outline"
                                        className="border-slate-200 bg-white shadow-none"
                                    >
                                        <Link href="/leave/applications">
                                            <ArrowLeft className="mr-2 h-4 w-4" />

                                            Applications
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ==========================================================
                        EDIT MODE
                    =========================================================== */}

                    {editing && canEdit ? (
                        <form
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >

                            {/* Edit Notice */}

                            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3.5">
                                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white">
                                    <Info className="h-4 w-4 text-blue-600" />
                                </div>

                                <div>
                                    <p className="text-sm font-semibold text-blue-900">
                                        Editing application
                                    </p>

                                    <p className="mt-0.5 text-xs leading-5 text-blue-700">
                                        Update the required details
                                        below. Saving your changes
                                        does not automatically approve
                                        the application.
                                    </p>
                                </div>
                            </div>

                            {/* Edit Card */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

                                <div className="border-b border-slate-100 px-5 py-5 sm:px-7">

                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                                        <div>
                                            <div className="flex items-center gap-2">

                                                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4389BC]/10">
                                                    <Edit3 className="h-4 w-4 text-[#4389BC]" />
                                                </div>

                                                <h2 className="text-sm font-semibold text-slate-900">
                                                    Application Details
                                                </h2>
                                            </div>

                                            <p className="mt-2 text-xs text-slate-500">
                                                Modify the leave request
                                                information below.
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">

                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    setEditing(
                                                        false,
                                                    )
                                                }
                                                disabled={
                                                    form.processing
                                                }
                                                className="border-slate-200 bg-white"
                                            >
                                                <X className="mr-2 h-4 w-4" />

                                                Cancel
                                            </Button>

                                            <Button
                                                type="submit"
                                                disabled={
                                                    form.processing
                                                }
                                                className="bg-[#4389BC] hover:bg-[#3575A4]"
                                            >
                                                <Save className="mr-2 h-4 w-4" />

                                                {form.processing
                                                    ? 'Saving...'
                                                    : 'Save Changes'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-5 sm:p-7">

                                    <div className="grid gap-6 lg:grid-cols-2">

                                        {/* Leave Type */}

                                        <div>
                                            <FieldLabel required>
                                                Leave Type
                                            </FieldLabel>

                                            <select
                                                value={
                                                    form
                                                        .data
                                                        .leave_type_id
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'leave_type_id',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                disabled={
                                                    form.processing
                                                }
                                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#4389BC] focus:ring-4 focus:ring-[#4389BC]/10 disabled:bg-slate-50"
                                            >
                                                <option value="">
                                                    Select leave type
                                                </option>

                                                {leaveTypes.map(
                                                    (
                                                        type,
                                                    ) => (
                                                        <option
                                                            key={
                                                                type.id
                                                            }
                                                            value={
                                                                type.id
                                                            }
                                                        >
                                                            {
                                                                type.name
                                                            }

                                                            {type.code
                                                                ? ` (${type.code})`
                                                                : ''}
                                                        </option>
                                                    ),
                                                )}
                                            </select>

                                            <FieldError
                                                message={
                                                    form
                                                        .errors
                                                        .leave_type_id
                                                }
                                            />
                                        </div>

                                        {/* Schedule */}

                                        <div>
                                            <FieldLabel required>
                                                Schedule
                                            </FieldLabel>

                                            <select
                                                value={
                                                    form
                                                        .data
                                                        .schedule_type
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'schedule_type',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                disabled={
                                                    form.processing
                                                }
                                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#4389BC] focus:ring-4 focus:ring-[#4389BC]/10 disabled:bg-slate-50"
                                            >
                                                <option value="full_day">
                                                    Full Day
                                                </option>

                                                <option value="half_day_am">
                                                    Half Day — Morning
                                                </option>

                                                <option value="half_day_pm">
                                                    Half Day — Afternoon
                                                </option>
                                            </select>

                                            <FieldError
                                                message={
                                                    form
                                                        .errors
                                                        .schedule_type
                                                }
                                            />
                                        </div>

                                        {/* Start Date */}

                                        <div>
                                            <FieldLabel required>
                                                Start Date
                                            </FieldLabel>

                                            <input
                                                type="date"
                                                value={
                                                    form
                                                        .data
                                                        .start_date
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'start_date',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                disabled={
                                                    form.processing
                                                }
                                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#4389BC] focus:ring-4 focus:ring-[#4389BC]/10 disabled:bg-slate-50"
                                            />

                                            <FieldError
                                                message={
                                                    form
                                                        .errors
                                                        .start_date
                                                }
                                            />
                                        </div>

                                        {/* End Date */}

                                        <div>
                                            <FieldLabel required>
                                                End Date
                                            </FieldLabel>

                                            <input
                                                type="date"
                                                value={
                                                    form
                                                        .data
                                                        .end_date
                                                }
                                                min={
                                                    form
                                                        .data
                                                        .start_date ||
                                                    undefined
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'end_date',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                disabled={
                                                    form.processing
                                                }
                                                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#4389BC] focus:ring-4 focus:ring-[#4389BC]/10 disabled:bg-slate-50"
                                            />

                                            <FieldError
                                                message={
                                                    form
                                                        .errors
                                                        .end_date
                                                }
                                            />
                                        </div>

                                        {/* Reason */}

                                        <div className="lg:col-span-2">

                                            <div className="flex items-center justify-between">

                                                <FieldLabel required>
                                                    Reason for Leave
                                                </FieldLabel>

                                                <span className="text-[11px] text-slate-400">
                                                    {
                                                        form
                                                            .data
                                                            .reason
                                                            .length
                                                    }
                                                    /2000
                                                </span>
                                            </div>

                                            <textarea
                                                value={
                                                    form
                                                        .data
                                                        .reason
                                                }
                                                onChange={(
                                                    event,
                                                ) =>
                                                    form.setData(
                                                        'reason',
                                                        event
                                                            .target
                                                            .value,
                                                    )
                                                }
                                                rows={6}
                                                maxLength={2000}
                                                placeholder="Enter the reason for this leave request..."
                                                disabled={
                                                    form.processing
                                                }
                                                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#4389BC] focus:ring-4 focus:ring-[#4389BC]/10 disabled:bg-slate-50"
                                            />

                                            <FieldError
                                                message={
                                                    form
                                                        .errors
                                                        .reason
                                                }
                                            />
                                        </div>

                                        {/* Attachment */}

                                        <div className="lg:col-span-2">

                                            <FieldLabel>
                                                Supporting Document
                                            </FieldLabel>

                                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/60 p-4">

                                                {application.attachment_path && (
                                                    <div className="mb-4 flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-3.5">

                                                        <div className="flex min-w-0 items-center gap-3">

                                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                                                <FileText className="h-4 w-4 text-slate-500" />
                                                            </div>

                                                            <div className="min-w-0">

                                                                <p className="text-sm font-medium text-slate-800">
                                                                    Current attachment
                                                                </p>

                                                                <a
                                                                    href={`/leave/applications/${application.id}/download`}
                                                                    className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-[#4389BC] hover:underline"
                                                                >
                                                                    <Download className="h-3.5 w-3.5" />

                                                                    Download current document
                                                                </a>

                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <input
                                                    type="file"
                                                    onChange={(
                                                        event,
                                                    ) =>
                                                        form.setData(
                                                            'attachment',
                                                            event
                                                                .target
                                                                .files?.[0] ??
                                                            null,
                                                        )
                                                    }
                                                    disabled={
                                                        form.processing
                                                    }
                                                    className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                                                />

                                                <p className="mt-2 text-xs text-slate-400">
                                                    Maximum file size:
                                                    5 MB.
                                                </p>

                                                <FieldError
                                                    message={
                                                        form
                                                            .errors
                                                            .attachment
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Edit Footer */}

                            <div className="flex justify-end gap-2">

                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        setEditing(
                                            false,
                                        )
                                    }
                                    disabled={
                                        form.processing
                                    }
                                    className="border-slate-200 bg-white"
                                >
                                    Cancel
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={
                                        form.processing
                                    }
                                    className="bg-[#4389BC] hover:bg-[#3575A4]"
                                >
                                    <Save className="mr-2 h-4 w-4" />

                                    {form.processing
                                        ? 'Saving Changes...'
                                        : 'Save Changes'}
                                </Button>
                            </div>
                        </form>
                    ) : (
                        <>
                            {/* Summary */}

                            <section className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

                                <div className="grid divide-y divide-slate-100 md:grid-cols-4 md:divide-x md:divide-y-0">

                                    <MetricCard
                                        label="Application Status"
                                        value={status.label}
                                        icon={StatusIcon}
                                    />

                                    <MetricCard
                                        label="Leave Duration"
                                        value={`${application.total_days} day${
                                            Number(
                                                application.total_days,
                                            ) === 1
                                                ? ''
                                                : 's'
                                        }`}
                                        icon={CalendarDays}
                                    />

                                    <MetricCard
                                        label="Leave Period"
                                        value={`${formatShortDate(
                                            application.start_date,
                                        )} – ${formatShortDate(
                                            application.end_date,
                                        )}`}
                                        icon={CalendarDays}
                                    />

                                    <MetricCard
                                        label="Workflow Step"
                                        value={
                                            application.current_step
                                                ? `Step ${application.current_step}`
                                                : 'Not assigned'
                                        }
                                        icon={ShieldCheck}
                                    />
                                </div>
                            </section>

                            {/* Content */}

                            <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">

                                {/* Left */}

                                <main className="min-w-0 space-y-6">

                                    {/* Leave Details */}

                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

                                        <SectionHeader
                                            icon={CalendarDays}
                                            title="Leave Details"
                                            description="Core information associated with this leave request."
                                        />

                                        <div className="grid gap-x-8 gap-y-7 p-5 sm:grid-cols-2 sm:p-7 lg:grid-cols-3">

                                            <DetailItem
                                                label="Leave Type"
                                                value={
                                                    leaveType?.name ??
                                                    '—'
                                                }
                                            />

                                            <DetailItem
                                                label="Leave Code"
                                                value={
                                                    leaveType?.code ??
                                                    '—'
                                                }
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
                                                value={formatDate(
                                                    application.start_date,
                                                )}
                                            />

                                            <DetailItem
                                                label="End Date"
                                                value={formatDate(
                                                    application.end_date,
                                                )}
                                            />

                                            <DetailItem
                                                label="Total Leave"
                                                value={`${application.total_days} day${
                                                    Number(
                                                        application.total_days,
                                                    ) === 1
                                                        ? ''
                                                        : 's'
                                                }`}
                                                emphasis
                                            />

                                            <DetailItem
                                                label="Date Filed"
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
                                                label="Application No."
                                                value={
                                                    application.application_no
                                                }
                                                mono
                                            />
                                        </div>
                                    </section>

                                    {/* Reason */}

                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

                                        <SectionHeader
                                            icon={FileText}
                                            title="Reason for Leave"
                                            description="Employee-provided justification for the request."
                                        />

                                        <div className="p-5 sm:p-7">

                                            <div className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-5">

                                                <div className="absolute bottom-4 left-0 top-4 w-0.5 rounded-full bg-[#4389BC]" />

                                                <p className="whitespace-pre-wrap pl-3 text-sm leading-7 text-slate-700">
                                                    {application.reason ||
                                                        'No reason provided.'}
                                                </p>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Approval Workflow */}

                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23-42,0.05)]">

                                        <SectionHeader
                                            icon={Users}
                                            title="Approval Workflow"
                                            description={
                                                application
                                                    .approval_workflow
                                                    ?.name ??
                                                'Approval history and workflow activity.'
                                            }
                                        />

                                        <div className="p-5 sm:p-7">

                                            {approvals.length === 0 ? (
                                                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-14 text-center">

                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white">
                                                        <Clock3 className="h-5 w-5 text-slate-400" />
                                                    </div>

                                                    <p className="mt-4 text-sm font-semibold text-slate-800">
                                                        No approval activity
                                                    </p>

                                                    <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500">
                                                        No approval action
                                                        records have been
                                                        generated for this
                                                        application yet.
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="space-y-0">

                                                    {approvals.map(
                                                        (
                                                            approval,
                                                            index,
                                                        ) => {
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
                                                                <div
                                                                    key={
                                                                        approval.id
                                                                    }
                                                                    className="relative flex gap-4"
                                                                >

                                                                    {!isLast && (
                                                                        <div className="absolute left-[19px] top-10 h-[calc(100%-8px)] w-px bg-slate-200" />
                                                                    )}

                                                                    <div
                                                                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${approvalStatus.iconClass}`}
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

                                                                        <div className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm">

                                                                            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                                                                                <div className="min-w-0">

                                                                                    <div className="flex flex-wrap items-center gap-2">

                                                                                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                                                                            Step{' '}
                                                                                            {
                                                                                                approval.step_order
                                                                                            }
                                                                                        </span>

                                                                                        <span
                                                                                            className={`text-xs font-semibold ${approvalStatus.className}`}
                                                                                        >
                                                                                            {
                                                                                                approvalStatus.label
                                                                                            }
                                                                                        </span>
                                                                                    </div>

                                                                                    <p className="mt-3 text-sm font-semibold text-slate-900">
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
                                                                                        <p className="mt-1 font-mono text-[11px] text-slate-400">
                                                                                            {
                                                                                                approval
                                                                                                    .approver
                                                                                                    .employee_number
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>

                                                                                <div className="shrink-0 sm:text-right">

                                                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
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
                                                                                <div className="mt-4 border-t border-slate-100 pt-4">

                                                                                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">
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

                                {/* Right Sidebar */}

                                <aside className="space-y-6 xl:sticky xl:top-6">

                                    {/* Employee Information */}

                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

                                        <div className="border-b border-slate-100 px-5 py-4">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4389BC]/10">
                                                    <User className="h-4 w-4 text-[#4389BC]" />
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

                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-600">
                                                    {getInitials(
                                                        employee?.name,
                                                    )}
                                                </div>

                                                <div className="min-w-0">

                                                    <p className="truncate text-sm font-semibold text-slate-900">
                                                        {employee?.name ??
                                                            '—'}
                                                    </p>

                                                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                                                        {employee?.employee_number ??
                                                            'No employee number'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="divide-y divide-slate-100 border-t border-slate-100">

                                                <SidebarDetail
                                                    label="Position"
                                                    value={
                                                        employee
                                                            ?.position
                                                            ?.name ??
                                                        '—'
                                                    }
                                                />

                                                <SidebarDetail
                                                    label="Organizational Unit"
                                                    value={
                                                        employee
                                                            ?.organizational_unit
                                                            ?.name ??
                                                        '—'
                                                    }
                                                    icon={
                                                        Building2
                                                    }
                                                />

                                                <SidebarDetail
                                                    label="Reporting Manager"
                                                    value={
                                                        employee
                                                            ?.reports_to
                                                            ?.name ??
                                                        '—'
                                                    }
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Submission */}

                                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

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
                                                label="Date Filed"
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

                                            <div className="py-4">

                                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
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
                                                value={
                                                    status.label
                                                }
                                            />
                                        </div>
                                    </section>

                                    {/* Supporting Document */}

                                    {application.attachment_path && (
                                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.05)]">

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
                                                    href={`/leave/applications/${application.id}/download`}
                                                    className="group flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 transition-all hover:border-[#4389BC]/30 hover:bg-[#4389BC]/5"
                                                >

                                                    <div className="flex min-w-0 items-center gap-3">

                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white">
                                                            <FileText className="h-4 w-4 text-slate-500" />
                                                        </div>

                                                        <div className="min-w-0">

                                                            <p className="truncate text-sm font-medium text-slate-700">
                                                                Download attachment
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                Secure document download
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <Download className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-hover:translate-y-0.5" />
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