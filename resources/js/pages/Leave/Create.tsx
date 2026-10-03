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
    | File Change
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

            <div className="min-h-full bg-slate-50/70">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">

                    {/* ------------------------------------------------------ */}
                    {/* Header                                                   */}
                    {/* ------------------------------------------------------ */}

                    <div className="mb-6">
                        <Link
                            href="/leave/applications"
                            className="
                                mb-4
                                inline-flex
                                items-center
                                gap-2
                                text-sm
                                font-medium
                                text-slate-500
                                transition-colors
                                hover:text-[#28658F]
                            "
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Leave Applications
                        </Link>

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4389BC]/10">
                                        <CalendarDays className="h-5 w-5 text-[#4389BC]" />
                                    </div>

                                    <span className="text-sm font-semibold uppercase tracking-wider text-[#4389BC]">
                                        Leave Management
                                    </span>
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                    Apply for Leave
                                </h1>

                                <p className="mt-1 max-w-2xl text-sm text-slate-500">
                                    Submit your leave request for review and approval.
                                </p>
                            </div>

                            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 shadow-sm sm:flex">
                                <Clock3 className="h-3.5 w-3.5" />
                                Leave Request
                            </div>
                        </div>
                    </div>

                    {/* ------------------------------------------------------ */}
                    {/* Main Layout                                              */}
                    {/* ------------------------------------------------------ */}

                    <form onSubmit={submit}>
                        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">

                            {/* ================================================= */}
                            {/* LEFT - FORM                                       */}
                            {/* ================================================= */}

                            <div className="space-y-6">

                                {/* --------------------------------------------- */}
                                {/* Employee Information                          */}
                                {/* --------------------------------------------- */}

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                                <UserRound className="h-4 w-4 text-slate-600" />
                                            </div>

                                            <div>
                                                <h2 className="text-sm font-semibold text-slate-900">
                                                    Employee Information
                                                </h2>

                                                <p className="text-xs text-slate-500">
                                                    Your employee information
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
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

                                        <div className="sm:col-span-2">
                                            <InfoField
                                                label="Reporting Manager / Head"
                                                value={
                                                    employee.manager ??
                                                    'Not assigned'
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>

                                {/* --------------------------------------------- */}
                                {/* Leave Details                                 */}
                                {/* --------------------------------------------- */}

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                                                <FileText className="h-4 w-4 text-[#4389BC]" />
                                            </div>

                                            <div>
                                                <h2 className="text-sm font-semibold text-slate-900">
                                                    Leave Details
                                                </h2>

                                                <p className="text-xs text-slate-500">
                                                    Provide the details of your leave request
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 p-5 sm:p-6">

                                        {/* Leave Type */}

                                        <div className="space-y-2">
                                            <label
                                                htmlFor="leave_type_id"
                                                className="text-sm font-medium text-slate-800"
                                            >
                                                Leave Type
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

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
                                                    flex
                                                    h-11
                                                    w-full
                                                    rounded-lg
                                                    border
                                                    bg-white
                                                    px-3
                                                    text-sm
                                                    text-slate-900
                                                    outline-none
                                                    transition
                                                    focus:border-[#4389BC]
                                                    focus:ring-2
                                                    focus:ring-[#4389BC]/15
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
                                                <div className="flex gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs text-slate-500">
                                                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />

                                                    <span>
                                                        {
                                                            selectedLeaveType.description
                                                        }
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Dates */}

                                        <div className="grid gap-5 sm:grid-cols-2">

                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="start_date"
                                                    className="text-sm font-medium text-slate-800"
                                                >
                                                    Start Date
                                                    <span className="ml-1 text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <Input
                                                    id="start_date"
                                                    type="date"
                                                    value={
                                                        form.data.start_date
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'start_date',
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={`
                                                        h-11
                                                        ${
                                                            form.errors
                                                                .start_date
                                                                ? 'border-red-300'
                                                                : ''
                                                        }
                                                    `}
                                                />

                                                {form.errors.start_date && (
                                                    <ErrorMessage>
                                                        {
                                                            form.errors
                                                                .start_date
                                                        }
                                                    </ErrorMessage>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <label
                                                    htmlFor="end_date"
                                                    className="text-sm font-medium text-slate-800"
                                                >
                                                    End Date
                                                    <span className="ml-1 text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <Input
                                                    id="end_date"
                                                    type="date"
                                                    min={
                                                        form.data.start_date ||
                                                        undefined
                                                    }
                                                    value={
                                                        form.data.end_date
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            'end_date',
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={`
                                                        h-11
                                                        ${
                                                            form.errors
                                                                .end_date
                                                                ? 'border-red-300'
                                                                : ''
                                                        }
                                                    `}
                                                />

                                                {form.errors.end_date && (
                                                    <ErrorMessage>
                                                        {
                                                            form.errors
                                                                .end_date
                                                        }
                                                    </ErrorMessage>
                                                )}
                                            </div>
                                        </div>

                                        {/* Total Days */}

                                        <div className="rounded-xl border border-[#4389BC]/15 bg-[#4389BC]/5 p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#4389BC]">
                                                        Total Leave
                                                    </p>

                                                    <p className="mt-1 text-sm text-slate-600">
                                                        Based on your selected dates
                                                    </p>
                                                </div>

                                                <div className="text-right">
                                                    <span className="text-2xl font-bold text-slate-900">
                                                        {totalDays}
                                                    </span>

                                                    <span className="ml-1 text-sm text-slate-500">
                                                        day
                                                        {totalDays !== 1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Schedule */}

                                        <div className="space-y-3">
                                            <label className="text-sm font-medium text-slate-800">
                                                Schedule
                                                <span className="ml-1 text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <div className="grid gap-3 sm:grid-cols-3">

                                                <ScheduleOption
                                                    value="full_day"
                                                    label="Full Day"
                                                    description="Whole day"
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

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="reason"
                                                    className="text-sm font-medium text-slate-800"
                                                >
                                                    Reason
                                                    <span className="ml-1 text-red-500">
                                                        *
                                                    </span>
                                                </label>

                                                <span className="text-xs text-slate-400">
                                                    {form.data.reason.length}
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
                                                placeholder="Please provide a brief explanation for your leave request..."
                                                maxLength={2000}
                                                rows={5}
                                                className={`
                                                    resize-none
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

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label
                                                    htmlFor="attachment"
                                                    className="text-sm font-medium text-slate-800"
                                                >
                                                    Supporting Document

                                                    {selectedLeaveType?.requires_attachment && (
                                                        <span className="ml-1 text-red-500">
                                                            *
                                                        </span>
                                                    )}
                                                </label>

                                                <span className="text-xs text-slate-400">
                                                    Max 5 MB
                                                </span>
                                            </div>

                                            <label
                                                htmlFor="attachment"
                                                className={`
                                                    flex
                                                    cursor-pointer
                                                    flex-col
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-dashed
                                                    px-5
                                                    py-8
                                                    text-center
                                                    transition-colors
                                                    ${
                                                        form.data.attachment
                                                            ? 'border-[#4389BC]/40 bg-[#4389BC]/5'
                                                            : 'border-slate-300 bg-slate-50/50 hover:border-[#4389BC]/50 hover:bg-[#4389BC]/5'
                                                    }
                                                `}
                                            >
                                                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm">
                                                    <Paperclip className="h-4 w-4 text-slate-500" />
                                                </div>

                                                {form.data.attachment ? (
                                                    <>
                                                        <p className="text-sm font-medium text-slate-800">
                                                            {
                                                                form.data
                                                                    .attachment
                                                                    .name
                                                            }
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            Click to replace
                                                            the file
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-medium text-slate-700">
                                                            Upload a supporting document
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-500">
                                                            PDF, JPG, JPEG,
                                                            PNG or other
                                                            supported files
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

                                {/* --------------------------------------------- */}
                                {/* Submit Actions                                */}
                                {/* --------------------------------------------- */}

                                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                    <Button
                                        type="button"
                                        variant="outline"
                                        asChild
                                        className="h-11 rounded-lg"
                                    >
                                        <Link href="/leave/applications">
                                            Cancel
                                        </Link>
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="h-11 rounded-lg bg-[#4389BC] px-6 font-semibold hover:bg-[#3575A4]"
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

                            {/* ================================================= */}
                            {/* RIGHT - SUMMARY                                   */}
                            {/* ================================================= */}

                            <aside className="space-y-6">

                                {/* Request Summary */}

                                <div className="sticky top-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                    <div className="border-b border-slate-100 px-5 py-4">
                                        <h2 className="text-sm font-semibold text-slate-900">
                                            Request Summary
                                        </h2>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Review before submitting
                                        </p>
                                    </div>

                                    <div className="space-y-5 p-5">

                                        <SummaryRow
                                            label="Leave Type"
                                            value={
                                                selectedLeaveType?.name ??
                                                'Not selected'
                                            }
                                        />

                                        <SummaryRow
                                            label="Start Date"
                                            value={
                                                form.data.start_date ||
                                                'Not selected'
                                            }
                                        />

                                        <SummaryRow
                                            label="End Date"
                                            value={
                                                form.data.end_date ||
                                                'Not selected'
                                            }
                                        />

                                        <SummaryRow
                                            label="Schedule"
                                            value={
                                                form.data.schedule_type ===
                                                'full_day'
                                                    ? 'Full Day'
                                                    : form.data
                                                            .schedule_type ===
                                                        'half_day_am'
                                                      ? 'Half Day AM'
                                                      : 'Half Day PM'
                                            }
                                        />

                                        <div className="border-t border-slate-100 pt-5">
                                            <div className="flex items-end justify-between">
                                                <span className="text-sm font-medium text-slate-600">
                                                    Total
                                                </span>

                                                <div>
                                                    <span className="text-2xl font-bold text-slate-900">
                                                        {totalDays}
                                                    </span>

                                                    <span className="ml-1 text-xs text-slate-500">
                                                        day
                                                        {totalDays !== 1
                                                            ? 's'
                                                            : ''}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Approval Information */}

                                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                                    <div className="flex gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                                            <CheckCircle2 className="h-4 w-4 text-[#4389BC]" />
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Approval Process
                                            </h3>

                                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                                Your request will be sent to
                                                your assigned manager or head
                                                for review after submission.
                                            </p>
                                        </div>
                                    </div>

                                    {employee.manager && (
                                        <div className="mt-4 rounded-lg border border-blue-100 bg-white px-3 py-2.5">
                                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                                First Approver
                                            </p>

                                            <p className="mt-1 text-sm font-medium text-slate-800">
                                                {employee.manager}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Important Notice */}

                                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="flex gap-3">
                                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />

                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-800">
                                                Before submitting
                                            </h3>

                                            <ul className="mt-2 space-y-2 text-xs leading-5 text-slate-500">
                                                <li>
                                                    • Make sure your leave
                                                    dates are correct.
                                                </li>

                                                <li>
                                                    • Provide a clear reason
                                                    for your request.
                                                </li>

                                                <li>
                                                    • Attach supporting
                                                    documents when required.
                                                </li>

                                                <li>
                                                    • Submitted requests may
                                                    require approval before
                                                    they become effective.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

/*
|--------------------------------------------------------------------------
| Helper Components
|--------------------------------------------------------------------------
*/

function InfoField({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {label}
            </p>

            <p className="mt-1 truncate text-sm font-medium text-slate-800">
                {value}
            </p>
        </div>
    );
}

function SummaryRow({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-medium text-slate-400">
                {label}
            </span>

            <span className="max-w-[170px] text-right text-sm font-medium text-slate-700">
                {value}
            </span>
        </div>
    );
}

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

function ScheduleOption({
    value,
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
                relative
                rounded-xl
                border
                p-4
                text-left
                transition-all
                ${
                    selected
                        ? 'border-[#4389BC] bg-[#4389BC]/5 ring-2 ring-[#4389BC]/10'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }
            `}
        >
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p
                        className={`
                            text-sm
                            font-semibold
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
                        mt-0.5
                        flex
                        h-4
                        w-4
                        items-center
                        justify-center
                        rounded-full
                        border
                        ${
                            selected
                                ? 'border-[#4389BC] bg-[#4389BC]'
                                : 'border-slate-300'
                        }
                    `}
                >
                    {selected && (
                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                    )}
                </div>
            </div>
        </button>
    );
}