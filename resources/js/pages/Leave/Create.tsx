import {
    type ChangeEvent,
    type FormEvent,
    type ReactNode,
    useMemo,
} from 'react';

import { Head, Link, useForm } from '@inertiajs/react';

import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    FileText,
    Info,
    Paperclip,
    Send,
    UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type LeaveType = {
    id: number;
    name: string;
    code: string;
    description?: string | null;
    is_paid: boolean;
    requires_attachment: boolean;
};

type Employee = {
    id: number;
    name: string;
    employee_number?: string | null;
    organizational_unit?: string | null;
    position?: string | null;
    manager?: string | null;
};

type Props = {
    leaveTypes: LeaveType[];
    employee: Employee;
};

type LeaveFormData = {
    leave_type_id: string;
    start_date: string;
    end_date: string;
    schedule_type: 'full_day' | 'half_day_am' | 'half_day_pm';
    reason: string;
    attachment: File | null;
};

export default function Create({
    leaveTypes,
    employee,
}: Props) {
    const form = useForm<LeaveFormData>({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        schedule_type: 'full_day',
        reason: '',
        attachment: null,
    });

    /*
    |--------------------------------------------------------------------------
    | Selected Leave Type
    |--------------------------------------------------------------------------
    */

    const selectedLeaveType = useMemo(() => {
        return leaveTypes.find(
            (leaveType) =>
                String(leaveType.id) === form.data.leave_type_id,
        );
    }, [
        leaveTypes,
        form.data.leave_type_id,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Calculate Leave Days
    |--------------------------------------------------------------------------
    */

    const totalDays = useMemo(() => {
        if (
            !form.data.start_date ||
            !form.data.end_date
        ) {
            return 0;
        }

        const start = new Date(
            `${form.data.start_date}T00:00:00`,
        );

        const end = new Date(
            `${form.data.end_date}T00:00:00`,
        );

        if (end < start) {
            return 0;
        }

        const difference =
            end.getTime() - start.getTime();

        const days =
            Math.floor(
                difference /
                    (1000 * 60 * 60 * 24),
            ) + 1;

        if (
            form.data.schedule_type ===
                'half_day_am' ||
            form.data.schedule_type ===
                'half_day_pm'
        ) {
            return days * 0.5;
        }

        return days;
    }, [
        form.data.start_date,
        form.data.end_date,
        form.data.schedule_type,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Display Date
    |--------------------------------------------------------------------------
    */

    const formatDisplayDate = (
        date: string,
    ): string => {
        if (!date) {
            return 'Not selected';
        }

        const parsedDate = new Date(
            `${date}T00:00:00`,
        );

        if (Number.isNaN(parsedDate.getTime())) {
            return 'Not selected';
        }

        return new Intl.DateTimeFormat(
            'en-US',
            {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            },
        )
            .format(parsedDate)
            .replace(
                /^([A-Za-z]{3}) /,
                '$1. ',
            );
    };

    /*
    |--------------------------------------------------------------------------
    | Duration Label
    |--------------------------------------------------------------------------
    */

    const durationUnit =
        totalDays === 0.5 || totalDays === 1
            ? 'day'
            : 'days';

    /*
    |--------------------------------------------------------------------------
    | Schedule Label
    |--------------------------------------------------------------------------
    */

    const scheduleLabel = useMemo(() => {
        switch (form.data.schedule_type) {
            case 'half_day_am':
                return 'Half Day AM';

            case 'half_day_pm':
                return 'Half Day PM';

            default:
                return 'Full Day';
        }
    }, [form.data.schedule_type]);

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const submit = (event: FormEvent) => {
        event.preventDefault();

        form.post('/leave/applications', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Attachment
    |--------------------------------------------------------------------------
    */

    const handleFileChange = (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file =
            event.target.files?.[0] ?? null;

        form.setData('attachment', file);
    };

    return (
        <>
            <Head title="Apply for Leave" />

            <div className="min-h-screen bg-[#f7f9fc]">
                <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                    {/* ======================================================
                        PAGE HEADER
                    ====================================================== */}

                    <div className="mb-7">
                        <Link
                            href="/leave/applications"
                            className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-[#28658F]"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                            Back to Leave Applications
                        </Link>

                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
                            {/* subtle brand accent */}
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#28658F] via-[#4389BC] to-[#75AFCF]" />

                            <div className="flex flex-col gap-6 p-6 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                                <div className="flex min-w-0 items-start gap-4">
                                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4389BC]/10 ring-1 ring-[#4389BC]/10">
                                        <CalendarDays className="h-5 w-5 text-[#4389BC]" />
                                    </div>

                                    <div className="min-w-0">
                                        <div className="mb-1 flex items-center gap-2">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4389BC]">
                                                Leave Management
                                            </span>

                                            <span className="h-1 w-1 rounded-full bg-slate-300" />

                                            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                                                Employee Services
                                            </span>
                                        </div>

                                        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                                            Apply for Leave
                                        </h1>

                                        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                                            Submit a leave request for review
                                            and approval by your assigned
                                            approver.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5">
                                    <Clock3 className="h-3.5 w-3.5 text-slate-400" />

                                    <span className="text-xs font-semibold text-slate-600">
                                        New Request
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ======================================================
                        FORM
                    ====================================================== */}

                    <form onSubmit={submit}>
                        <div className="space-y-5">

                            {/* ==================================================
                                EMPLOYEE INFORMATION
                            ================================================== */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)]">
                                <SectionHeader
                                    icon={
                                        <UserRound className="h-4 w-4 text-[#4389BC]" />
                                    }
                                    title="Employee Information"
                                    description="Information associated with your employee account"
                                />

                                <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
                                    <InfoField
                                        label="Employee Name"
                                        value={employee.name}
                                    />

                                    <InfoField
                                        label="Employee Number"
                                        value={
                                            employee.employee_number ??
                                            '—'
                                        }
                                    />

                                    <InfoField
                                        label="Department / Unit"
                                        value={
                                            employee.organizational_unit ??
                                            '—'
                                        }
                                    />

                                    <InfoField
                                        label="Position"
                                        value={
                                            employee.position ??
                                            '—'
                                        }
                                    />

                                    <div className="sm:col-span-2 lg:col-span-4">
                                        <InfoField
                                            label="Reporting Manager / Head"
                                            value={
                                                employee.manager ??
                                                'Not assigned'
                                            }
                                            emphasized={
                                                !!employee.manager
                                            }
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* ==================================================
                                LEAVE DETAILS
                            ================================================== */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)]">
                                <SectionHeader
                                    icon={
                                        <FileText className="h-4 w-4 text-[#4389BC]" />
                                    }
                                    title="Leave Request"
                                    description="Provide the details required to process your request"
                                />

                                <div className="space-y-7 p-5 sm:p-6 lg:p-7">

                                    {/* Leave Type */}

                                    <div className="space-y-2.5">
                                        <FieldLabel
                                            htmlFor="leave_type_id"
                                            required
                                        >
                                            Leave Type
                                        </FieldLabel>

                                        <select
                                            id="leave_type_id"
                                            value={
                                                form.data.leave_type_id
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'leave_type_id',
                                                    event.target.value,
                                                )
                                            }
                                            className={`
                                                flex h-11 w-full
                                                rounded-lg border
                                                bg-white px-3.5
                                                text-sm text-slate-900
                                                shadow-sm outline-none
                                                transition
                                                hover:border-slate-300
                                                focus:border-[#4389BC]
                                                focus:ring-4
                                                focus:ring-[#4389BC]/10
                                                ${
                                                    form.errors
                                                        .leave_type_id
                                                        ? 'border-red-300'
                                                        : 'border-slate-200'
                                                }
                                            `}
                                        >
                                            <option value="">
                                                Select a leave type
                                            </option>

                                            {leaveTypes.map(
                                                (leaveType) => (
                                                    <option
                                                        key={
                                                            leaveType.id
                                                        }
                                                        value={
                                                            leaveType.id
                                                        }
                                                    >
                                                        {leaveType.name}
                                                        {leaveType.is_paid
                                                            ? ' — Paid'
                                                            : ' — Unpaid'}
                                                    </option>
                                                ),
                                            )}
                                        </select>

                                        {form.errors.leave_type_id && (
                                            <ErrorMessage>
                                                {
                                                    form.errors
                                                        .leave_type_id
                                                }
                                            </ErrorMessage>
                                        )}

                                        {selectedLeaveType?.description && (
                                            <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/50 px-3.5 py-3 text-xs leading-5 text-slate-600">
                                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4389BC]" />

                                                <span>
                                                    {
                                                        selectedLeaveType.description
                                                    }
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Dates */}

                                    <div>
                                        <div className="mb-3.5 flex items-end justify-between">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800">
                                                    Leave Period
                                                </p>

                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    Select the dates covered by
                                                    this request
                                                </p>
                                            </div>

                                            <CalendarDays className="h-4 w-4 text-slate-300" />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <DateField
                                                id="start_date"
                                                label="Start Date"
                                                value={
                                                    form.data.start_date
                                                }
                                                error={
                                                    form.errors.start_date
                                                }
                                                onChange={(value) =>
                                                    form.setData(
                                                        'start_date',
                                                        value,
                                                    )
                                                }
                                            />

                                            <DateField
                                                id="end_date"
                                                label="End Date"
                                                value={
                                                    form.data.end_date
                                                }
                                                error={
                                                    form.errors.end_date
                                                }
                                                min={
                                                    form.data.start_date ||
                                                    undefined
                                                }
                                                onChange={(value) =>
                                                    form.setData(
                                                        'end_date',
                                                        value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    {/* Duration */}

                                    <div className="relative overflow-hidden rounded-xl border border-[#4389BC]/15 bg-gradient-to-br from-[#4389BC]/10 via-[#4389BC]/5 to-white px-5 py-4">
                                        <div className="absolute right-0 top-0 h-20 w-20 translate-x-8 -translate-y-8 rounded-full bg-[#4389BC]/10 blur-2xl" />

                                        <div className="relative flex items-center justify-between gap-4">
                                            <div>
                                                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#4389BC]">
                                                    Requested Duration
                                                </p>

                                                <p className="mt-1 text-xs text-slate-500">
                                                    Based on the selected
                                                    period and schedule
                                                </p>
                                            </div>

                                            <div className="text-right">
                                                <div className="flex items-baseline justify-end gap-1.5">
                                                    <span className="text-2xl font-bold tracking-tight text-slate-900">
                                                        {totalDays}
                                                    </span>

                                                    <span className="text-xs font-semibold text-slate-500">
                                                        {durationUnit}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule */}

                                    <div className="space-y-3">
                                        <div>
                                            <FieldLabel required>
                                                Schedule
                                            </FieldLabel>

                                            <p className="mt-0.5 text-xs text-slate-400">
                                                Select the portion of the
                                                working day
                                            </p>
                                        </div>

                                        <div className="grid gap-3 sm:grid-cols-3">
                                            <ScheduleOption
                                                value="full_day"
                                                label="Full Day"
                                                description="Whole working day"
                                                selected={
                                                    form.data
                                                        .schedule_type ===
                                                    'full_day'
                                                }
                                                onClick={() =>
                                                    form.setData(
                                                        'schedule_type',
                                                        'full_day',
                                                    )
                                                }
                                            />

                                            <ScheduleOption
                                                value="half_day_am"
                                                label="Half Day AM"
                                                description="Morning"
                                                selected={
                                                    form.data
                                                        .schedule_type ===
                                                    'half_day_am'
                                                }
                                                onClick={() =>
                                                    form.setData(
                                                        'schedule_type',
                                                        'half_day_am',
                                                    )
                                                }
                                            />

                                            <ScheduleOption
                                                value="half_day_pm"
                                                label="Half Day PM"
                                                description="Afternoon"
                                                selected={
                                                    form.data
                                                        .schedule_type ===
                                                    'half_day_pm'
                                                }
                                                onClick={() =>
                                                    form.setData(
                                                        'schedule_type',
                                                        'half_day_pm',
                                                    )
                                                }
                                            />
                                        </div>

                                        {form.errors.schedule_type && (
                                            <ErrorMessage>
                                                {
                                                    form.errors
                                                        .schedule_type
                                                }
                                            </ErrorMessage>
                                        )}
                                    </div>

                                    {/* Reason */}

                                    <div className="space-y-2.5">
                                        <div className="flex items-end justify-between gap-3">
                                            <FieldLabel
                                                htmlFor="reason"
                                                required
                                            >
                                                Reason
                                            </FieldLabel>

                                            <span className="text-[11px] tabular-nums text-slate-400">
                                                {
                                                    form.data.reason.length
                                                }
                                                /2000
                                            </span>
                                        </div>

                                        <Textarea
                                            id="reason"
                                            value={
                                                form.data.reason
                                            }
                                            onChange={(
                                                event: ChangeEvent<HTMLTextAreaElement>,
                                            ) =>
                                                form.setData(
                                                    'reason',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Provide a clear and concise explanation for your leave request..."
                                            maxLength={2000}
                                            rows={5}
                                            className={`
                                                resize-none rounded-lg
                                                bg-white leading-6 shadow-sm
                                                ${
                                                    form.errors.reason
                                                        ? 'border-red-300'
                                                        : ''
                                                }
                                            `}
                                        />

                                        {form.errors.reason && (
                                            <ErrorMessage>
                                                {
                                                    form.errors.reason
                                                }
                                            </ErrorMessage>
                                        )}
                                    </div>

                                    {/* Attachment */}

                                    <div className="space-y-2.5">
                                        <div className="flex items-center justify-between">
                                            <FieldLabel
                                                htmlFor="attachment"
                                                required={
                                                    !!selectedLeaveType?.requires_attachment
                                                }
                                            >
                                                Supporting Document
                                            </FieldLabel>

                                            <span className="text-[11px] text-slate-400">
                                                Maximum 5 MB
                                            </span>
                                        </div>

                                        <label
                                            htmlFor="attachment"
                                            className={`
                                                group flex cursor-pointer
                                                flex-col items-center
                                                justify-center rounded-xl
                                                border border-dashed
                                                px-5 py-8 text-center
                                                transition-all
                                                ${
                                                    form.data.attachment
                                                        ? 'border-[#4389BC]/40 bg-[#4389BC]/5'
                                                        : 'border-slate-300 bg-slate-50/40 hover:border-[#4389BC]/50 hover:bg-[#4389BC]/5'
                                                }
                                            `}
                                        >
                                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition-transform group-hover:scale-105">
                                                <Paperclip className="h-4 w-4 text-[#4389BC]" />
                                            </div>

                                            {form.data.attachment ? (
                                                <>
                                                    <p className="max-w-full truncate text-sm font-semibold text-slate-800">
                                                        {
                                                            form.data
                                                                .attachment
                                                                .name
                                                        }
                                                    </p>

                                                    <p className="mt-1 text-xs text-[#4389BC]">
                                                        Click to replace
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="text-sm font-semibold text-slate-700">
                                                        Upload supporting
                                                        document
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        PDF, JPG, JPEG, PNG
                                                        or supported file
                                                    </p>
                                                </>
                                            )}

                                            <input
                                                id="attachment"
                                                type="file"
                                                className="hidden"
                                                onChange={
                                                    handleFileChange
                                                }
                                            />
                                        </label>

                                        {form.errors.attachment && (
                                            <ErrorMessage>
                                                {
                                                    form.errors
                                                        .attachment
                                                }
                                            </ErrorMessage>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* ==================================================
                                SUMMARY
                            ================================================== */}

                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_3px_rgba(15,23,42,0.035)]">
                                <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-5 py-4 sm:px-6">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
                                            <FileText className="h-4 w-4 text-[#4389BC]" />
                                        </div>

                                        <div>
                                            <h2 className="text-sm font-semibold text-slate-900">
                                                Request Summary
                                            </h2>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Review the information before
                                                submitting
                                            </p>
                                        </div>
                                    </div>

                                    <div className="hidden items-center gap-1.5 text-xs font-medium text-slate-400 sm:flex">
                                        <Check className="h-3.5 w-3.5 text-[#4389BC]" />
                                        Ready for review
                                    </div>
                                </div>

                                <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                                    <SummaryItem
                                        label="Leave Type"
                                        value={
                                            selectedLeaveType?.name ??
                                            'Not selected'
                                        }
                                    />

                                    <SummaryItem
                                        label="Start Date"
                                        value={formatDisplayDate(
                                            form.data.start_date,
                                        )}
                                    />

                                    <SummaryItem
                                        label="End Date"
                                        value={formatDisplayDate(
                                            form.data.end_date,
                                        )}
                                    />

                                    <SummaryItem
                                        label="Schedule"
                                        value={scheduleLabel}
                                    />
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50/40 px-5 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                                Total Leave
                                            </p>

                                            <p className="mt-1 text-xs text-slate-500">
                                                Requested duration
                                            </p>
                                        </div>

                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-2xl font-bold text-slate-900">
                                                {totalDays}
                                            </span>

                                            <span className="text-xs font-semibold text-slate-500">
                                                {durationUnit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ==================================================
                                APPROVAL
                            ================================================== */}

                            <section className="overflow-hidden rounded-2xl border border-[#4389BC]/15 bg-[#4389BC]/5">
                                <div className="flex gap-3.5 p-5 sm:p-6">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
                                        <CheckCircle2 className="h-4 w-4 text-[#4389BC]" />
                                    </div>

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-900">
                                            Approval Process
                                        </h3>

                                        <p className="mt-1 text-xs leading-5 text-slate-600">
                                            Your request will be routed to
                                            your assigned manager or head
                                            after submission.
                                        </p>

                                        {employee.manager && (
                                            <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-lg border border-[#4389BC]/10 bg-white px-3 py-2 shadow-sm">
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                    First Approver
                                                </span>

                                                <span className="h-1 w-1 rounded-full bg-slate-300" />

                                                <span className="truncate text-xs font-semibold text-slate-700">
                                                    {employee.manager}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                            {/* ==================================================
                                BEFORE SUBMITTING
                            ================================================== */}

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.03)] sm:p-6">
                                <div className="flex gap-3">
                                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                                    <div className="min-w-0">
                                        <h3 className="text-sm font-semibold text-slate-800">
                                            Before submitting
                                        </h3>

                                        <div className="mt-3 grid gap-2 sm:grid-cols-2">
                                            <ReviewPoint>
                                                Confirm your leave dates are
                                                correct.
                                            </ReviewPoint>

                                            <ReviewPoint>
                                                Provide a clear reason for
                                                your request.
                                            </ReviewPoint>

                                            <ReviewPoint>
                                                Attach supporting documents
                                                when required.
                                            </ReviewPoint>

                                            <ReviewPoint>
                                                Requests may require approval
                                                before becoming effective.
                                            </ReviewPoint>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ==================================================
                                ACTIONS
                            ================================================== */}

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-end">
                                <Button
                                    type="button"
                                    variant="outline"
                                    asChild
                                    className="h-11 rounded-lg border-slate-300 bg-white px-6 font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                                >
                                    <Link href="/leave/applications">
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={form.processing}
                                    className="h-11 rounded-lg bg-[#28658F] px-7 font-semibold text-white shadow-sm transition-all hover:bg-[#1f5275] hover:shadow-md"
                                >
                                    {form.processing ? (
                                        <>
                                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="mr-2 h-4 w-4" />
                                            Submit Leave Request
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
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
    icon: ReactNode;
    title: string;
    description: string;
}) {
    return (
        <div className="border-b border-slate-100 bg-slate-50/40 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm">
                    {icon}
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
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Field Label
|--------------------------------------------------------------------------
*/

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
            className="text-sm font-medium text-slate-800"
        >
            {children}

            {required && (
                <span className="ml-1 text-red-500">
                    *
                </span>
            )}
        </label>
    );
}

/*
|--------------------------------------------------------------------------
| Date Field
|--------------------------------------------------------------------------
*/

function DateField({
    id,
    label,
    value,
    error,
    min,
    onChange,
}: {
    id: string;
    label: string;
    value: string;
    error?: string;
    min?: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="space-y-2">
            <FieldLabel
                htmlFor={id}
                required
            >
                {label}
            </FieldLabel>

            <Input
                id={id}
                type="date"
                value={value}
                min={min}
                onChange={(event) =>
                    onChange(event.target.value)
                }
                className={`
                    h-11 rounded-lg bg-white shadow-sm
                    ${
                        error
                            ? 'border-red-300'
                            : ''
                    }
                `}
            />

            {error && (
                <ErrorMessage>
                    {error}
                </ErrorMessage>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Information Field
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
                transition-colors
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
| Summary Item
|--------------------------------------------------------------------------
*/

function SummaryItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="px-5 py-4 sm:px-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-slate-400">
                {label}
            </p>

            <p className="mt-1.5 truncate text-sm font-semibold text-slate-800">
                {value}
            </p>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Review Point
|--------------------------------------------------------------------------
*/

function ReviewPoint({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <div className="flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#4389BC]" />

            <span className="text-xs leading-5 text-slate-500">
                {children}
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Error Message
|--------------------------------------------------------------------------
*/

function ErrorMessage({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <p className="text-xs font-medium text-red-600">
            {children}
        </p>
    );
}

/*
|--------------------------------------------------------------------------
| Schedule Option
|--------------------------------------------------------------------------
*/

function ScheduleOption({
    label,
    description,
    selected,
    onClick,
}: {
    value: string;
    label: string;
    description: string;
    selected: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={selected}
            className={`
                group relative rounded-xl border p-4
                text-left transition-all
                ${
                    selected
                        ? 'border-[#4389BC] bg-[#4389BC]/5 shadow-sm ring-2 ring-[#4389BC]/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm'
                }
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p
                        className={`
                            text-sm font-semibold
                            ${
                                selected
                                    ? 'text-[#28658F]'
                                    : 'text-slate-800'
                            }
                        `}
                    >
                        {label}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`
                        mt-0.5 flex h-5 w-5 shrink-0 items-center
                        justify-center rounded-full border
                        transition-all
                        ${
                            selected
                                ? 'border-[#4389BC] bg-[#4389BC]'
                                : 'border-slate-300 bg-white group-hover:border-slate-400'
                        }
                    `}
                >
                    {selected && (
                        <Check className="h-3 w-3 text-white" />
                    )}
                </div>
            </div>
        </button>
    );
}