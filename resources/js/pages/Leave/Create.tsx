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

type ScheduleType = 'full_day' | 'half_day_am' | 'half_day_pm';

type LeaveFormData = {
    leave_type_id: string;
    start_date: string;
    end_date: string;
    schedule_type: ScheduleType;
    reason: string;
    attachment: File | null;
};

const scheduleLabels: Record<ScheduleType, string> = {
    full_day: 'Full day',
    half_day_am: 'Half day · AM',
    half_day_pm: 'Half day · PM',
};

const scheduleOptions: {
    value: ScheduleType;
    label: string;
    description: string;
}[] = [
    {
        value: 'full_day',
        label: 'Full day',
        description: 'The full working day',
    },
    {
        value: 'half_day_am',
        label: 'Half day · AM',
        description: 'Morning schedule',
    },
    {
        value: 'half_day_pm',
        label: 'Half day · PM',
        description: 'Afternoon schedule',
    },
];

const parseDateOnly = (value: string) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
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

const formatDisplayDate = (value: string) => {
    const date = parseDateOnly(value);
    if (!date) return 'Not selected';

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
    }).format(date);
};

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
        <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eaf3fb] text-[#28658f]">
                {icon}
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
            className="block text-sm font-medium text-slate-800"
        >
            {children}
            {required && (
                <span aria-hidden="true" className="ml-1 text-rose-600">
                    *
                </span>
            )}
            {required && <span className="sr-only"> required</span>}
        </label>
    );
}

function ErrorMessage({ children }: { children: ReactNode }) {
    return (
        <p role="alert" className="mt-1.5 text-xs font-medium text-rose-700">
            {children}
        </p>
    );
}

function InfoField({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50/70 px-3.5 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {label}
            </p>
            <p className="mt-1.5 truncate text-sm font-medium text-slate-800">
                {value}
            </p>
        </div>
    );
}

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
    const errorId = id + '-error';

    return (
        <div className="space-y-2">
            <FieldLabel htmlFor={id} required>
                {label}
            </FieldLabel>
            <Input
                id={id}
                type="date"
                required
                value={value}
                min={min}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => onChange(event.target.value)}
                className={
                    'h-11 rounded-lg bg-white shadow-none focus-visible:ring-[#4389bc] ' +
                    (error ? 'border-rose-400' : 'border-slate-300')
                }
            />
            {error && (
                <div id={errorId}>
                    <ErrorMessage>{error}</ErrorMessage>
                </div>
            )}
        </div>
    );
}

function SummaryItem({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-start justify-between gap-4 py-2.5">
            <span className="text-xs text-slate-500">{label}</span>
            <span className="max-w-[65%] break-words text-right text-xs font-semibold text-slate-800">
                {value}
            </span>
        </div>
    );
}

export default function Create({ leaveTypes, employee }: Props) {
    const form = useForm<LeaveFormData>({
        leave_type_id: '',
        start_date: '',
        end_date: '',
        schedule_type: 'full_day',
        reason: '',
        attachment: null,
    });

    const selectedLeaveType = useMemo(
        () =>
            leaveTypes.find(
                (leaveType) =>
                    String(leaveType.id) === form.data.leave_type_id,
            ),
        [leaveTypes, form.data.leave_type_id],
    );

    const totalDays = useMemo(() => {
        const start = parseDateOnly(form.data.start_date);
        const end = parseDateOnly(form.data.end_date);

        if (!start || !end || end.getTime() < start.getTime()) return 0;

        const calendarDays =
            Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
        const isHalfDay = form.data.schedule_type !== 'full_day';

        return isHalfDay ? calendarDays * 0.5 : calendarDays;
    }, [
        form.data.start_date,
        form.data.end_date,
        form.data.schedule_type,
    ]);

    const dateRangeInvalid =
        Boolean(form.data.start_date) &&
        Boolean(form.data.end_date) &&
        totalDays === 0;

    const durationUnit =
        totalDays === 0.5 || totalDays === 1 ? 'day' : 'days';

    const scheduleLabel = scheduleLabels[form.data.schedule_type];

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.post('/leave/applications', {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        form.setData('attachment', event.target.files?.[0] ?? null);
    };

    return (
        <>
            <Head title="Apply for Leave" />

            <main className="min-h-screen bg-[#f4f7fb] text-slate-900">
                <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                    <Link
                        href="/leave/applications"
                        className="group mb-5 inline-flex min-h-10 items-center gap-2 rounded-md text-sm font-medium text-slate-600 transition-colors hover:text-[#17366b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389bc] focus-visible:ring-offset-2"
                    >
                        <ArrowLeft
                            aria-hidden="true"
                            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
                        />
                        Back to leave applications
                    </Link>

                    <header className="mb-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                        <div className="h-1 bg-gradient-to-r from-[#17366b] via-[#4389bc] to-[#f2bd39]" />
                        <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
                            <div className="flex min-w-0 items-start gap-4">
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#17366b] text-sm font-extrabold tracking-wide text-white">
                                    BHF
                                </span>
                                <div className="min-w-0">
                                    <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#17366b] sm:text-3xl">
                                        Apply for leave
                                    </h1>
                                    <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-600">
                                        Complete the details below to send your
                                        leave request to your assigned approver.
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#dce8f2] bg-[#f7fbff] px-3.5 py-2 text-xs font-semibold text-[#17366b]">
                                <Clock3
                                    aria-hidden="true"
                                    className="h-4 w-4 text-[#4389bc]"
                                />
                                New request
                            </div>
                        </div>
                    </header>

                    <form onSubmit={submit} encType="multipart/form-data">
                        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
                            <div className="space-y-5">
                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                    <SectionHeader
                                        icon={
                                            <UserRound
                                                aria-hidden="true"
                                                className="h-4 w-4"
                                            />
                                        }
                                        title="Employee information"
                                        description="Your account details are filled in automatically."
                                    />
                                    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5 xl:grid-cols-4">
                                        <InfoField
                                            label="Employee name"
                                            value={employee.name || '—'}
                                        />
                                        <InfoField
                                            label="Employee number"
                                            value={employee.employee_number || '—'}
                                        />
                                        <InfoField
                                            label="Department / unit"
                                            value={employee.organizational_unit || '—'}
                                        />
                                        <InfoField
                                            label="Position"
                                            value={employee.position || '—'}
                                        />
                                        <div className="sm:col-span-2 xl:col-span-4">
                                            <InfoField
                                                label="Reporting manager / head"
                                                value={employee.manager || 'Not assigned'}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]">
                                    <SectionHeader
                                        icon={
                                            <FileText
                                                aria-hidden="true"
                                                className="h-4 w-4"
                                            />
                                        }
                                        title="Leave request"
                                        description="Add the leave type, dates, schedule, and supporting details."
                                    />

                                    <div className="space-y-6 p-4 sm:p-6">
                                        <div className="space-y-2">
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
                                                disabled={leaveTypes.length === 0}
                                                aria-invalid={Boolean(
                                                    form.errors.leave_type_id,
                                                )}
                                                aria-describedby={
                                                    form.errors.leave_type_id
                                                        ? 'leave_type_id-error'
                                                        : undefined
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'leave_type_id',
                                                        event.target.value,
                                                    )
                                                }
                                                className={
                                                    'h-11 w-full rounded-lg border bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#4389bc] focus:ring-4 focus:ring-[#4389bc]/10 disabled:cursor-not-allowed disabled:bg-slate-100 ' +
                                                    (form.errors.leave_type_id
                                                        ? 'border-rose-400'
                                                        : 'border-slate-300')
                                                }
                                            >
                                                <option value="">
                                                    Select a leave type
                                                </option>
                                                {leaveTypes.map((leaveType) => (
                                                    <option
                                                        key={leaveType.id}
                                                        value={leaveType.id}
                                                    >
                                                        {leaveType.name}
                                                        {leaveType.is_paid
                                                            ? ' · Paid'
                                                            : ' · Unpaid'}
                                                    </option>
                                                ))}
                                            </select>
                                            {form.errors.leave_type_id && (
                                                <div id="leave_type_id-error">
                                                    <ErrorMessage>
                                                        {form.errors.leave_type_id}
                                                    </ErrorMessage>
                                                </div>
                                            )}
                                            {leaveTypes.length === 0 && (
                                                <p className="text-xs text-amber-700">
                                                    No leave types are currently
                                                    available. Please contact HR.
                                                </p>
                                            )}
                                            {selectedLeaveType?.description && (
                                                <div className="flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50/60 px-3.5 py-3 text-xs leading-5 text-slate-600">
                                                    <Info
                                                        aria-hidden="true"
                                                        className="mt-0.5 h-4 w-4 shrink-0 text-[#4389bc]"
                                                    />
                                                    <span>
                                                        {selectedLeaveType.description}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        <div>
                                            <div className="mb-3">
                                                <h3 className="text-sm font-semibold text-slate-800">
                                                    Leave period
                                                </h3>
                                                <p className="mt-1 text-xs text-slate-500">
                                                    Choose the first and last
                                                    day of your request.
                                                </p>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <DateField
                                                    id="start_date"
                                                    label="Start date"
                                                    value={form.data.start_date}
                                                    error={form.errors.start_date}
                                                    onChange={(value) =>
                                                        form.setData(
                                                            'start_date',
                                                            value,
                                                        )
                                                    }
                                                />
                                                <DateField
                                                    id="end_date"
                                                    label="End date"
                                                    value={form.data.end_date}
                                                    error={form.errors.end_date}
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
                                            {dateRangeInvalid && (
                                                <p
                                                    role="alert"
                                                    className="mt-3 text-xs font-medium text-rose-700"
                                                >
                                                    End date must be the same
                                                    as or later than the start
                                                    date.
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#dce8f2] bg-[#f7fbff] px-4 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-[#28658f] shadow-sm">
                                                    <CalendarDays
                                                        aria-hidden="true"
                                                        className="h-4 w-4"
                                                    />
                                                </span>
                                                <div>
                                                    <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#28658f]">
                                                        Requested duration
                                                    </p>
                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        Based on dates and
                                                        schedule
                                                    </p>
                                                </div>
                                            </div>
                                            <p
                                                aria-live="polite"
                                                className="shrink-0 text-right"
                                            >
                                                <span className="text-2xl font-semibold tracking-tight text-[#17366b]">
                                                    {totalDays || '—'}
                                                </span>
                                                <span className="ml-1 text-xs font-medium text-slate-500">
                                                    {totalDays
                                                        ? durationUnit
                                                        : 'days'}
                                                </span>
                                            </p>
                                        </div>

                                        <fieldset className="space-y-3">
                                            <legend className="text-sm font-medium text-slate-800">
                                                Schedule
                                                <span
                                                    aria-hidden="true"
                                                    className="ml-1 text-rose-600"
                                                >
                                                    *
                                                </span>
                                            </legend>
                                            <p className="-mt-2 text-xs text-slate-500">
                                                Select the portion of each
                                                working day.
                                            </p>
                                            <div className="grid gap-3 sm:grid-cols-3">
                                                {scheduleOptions.map((option) => {
                                                    const selected =
                                                        form.data.schedule_type ===
                                                        option.value;

                                                    return (
                                                        <label
                                                            key={option.value}
                                                            className={
                                                                'flex min-h-20 cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors focus-within:ring-2 focus-within:ring-[#4389bc] focus-within:ring-offset-2 ' +
                                                                (selected
                                                                    ? 'border-[#4389bc] bg-[#f2f8fc]'
                                                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50')
                                                            }
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="schedule_type"
                                                                value={option.value}
                                                                checked={selected}
                                                                onChange={() =>
                                                                    form.setData(
                                                                        'schedule_type',
                                                                        option.value,
                                                                    )
                                                                }
                                                                className="mt-0.5 h-4 w-4 shrink-0 accent-[#17366b]"
                                                            />
                                                            <span className="min-w-0">
                                                                <span className="block text-sm font-semibold text-slate-800">
                                                                    {option.label}
                                                                </span>
                                                                <span className="mt-1 block text-xs text-slate-500">
                                                                    {option.description}
                                                                </span>
                                                            </span>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                            {form.errors.schedule_type && (
                                                <ErrorMessage>
                                                    {form.errors.schedule_type}
                                                </ErrorMessage>
                                            )}
                                        </fieldset>

                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between gap-3">
                                                <FieldLabel
                                                    htmlFor="reason"
                                                    required
                                                >
                                                    Reason for leave
                                                </FieldLabel>
                                                <span
                                                    aria-live="polite"
                                                    className="shrink-0 text-xs tabular-nums text-slate-500"
                                                >
                                                    {form.data.reason.length}/2000
                                                </span>
                                            </div>
                                            <Textarea
                                                id="reason"
                                                required
                                                value={form.data.reason}
                                                onChange={(
                                                    event: ChangeEvent<HTMLTextAreaElement>,
                                                ) =>
                                                    form.setData(
                                                        'reason',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Briefly explain the reason for your leave request."
                                                maxLength={2000}
                                                rows={4}
                                                aria-invalid={Boolean(
                                                    form.errors.reason,
                                                )}
                                                aria-describedby={
                                                    form.errors.reason
                                                        ? 'reason-error'
                                                        : undefined
                                                }
                                                className={
                                                    'min-h-28 resize-y rounded-lg leading-6 shadow-none focus-visible:ring-[#4389bc] ' +
                                                    (form.errors.reason
                                                        ? 'border-rose-400'
                                                        : 'border-slate-300')
                                                }
                                            />
                                            {form.errors.reason && (
                                                <div id="reason-error">
                                                    <ErrorMessage>
                                                        {form.errors.reason}
                                                    </ErrorMessage>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex flex-wrap items-end justify-between gap-2">
                                                <FieldLabel
                                                    htmlFor="attachment"
                                                    required={
                                                        !!selectedLeaveType?.requires_attachment
                                                    }
                                                >
                                                    Supporting document
                                                </FieldLabel>
                                                <span className="text-xs text-slate-500">
                                                    PDF, JPG or PNG · Up to 5 MB
                                                </span>
                                            </div>
                                            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 p-4 transition-colors focus-within:border-[#4389bc] focus-within:ring-2 focus-within:ring-[#4389bc]/20 sm:p-5">
                                                <div className="flex items-start gap-3">
                                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[#28658f] shadow-sm ring-1 ring-slate-200">
                                                        <Paperclip
                                                            aria-hidden="true"
                                                            className="h-4 w-4"
                                                        />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-semibold text-slate-800">
                                                            {form.data.attachment
                                                                ? 'Document selected'
                                                                : 'Attach a supporting document'}
                                                        </p>
                                                        <p className="mt-1 break-all text-xs text-slate-500">
                                                            {form.data.attachment
                                                                ? form.data
                                                                      .attachment
                                                                      .name
                                                                : 'Choose a file from your device. You can replace it before submitting.'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Input
                                                    id="attachment"
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={handleFileChange}
                                                    aria-describedby={
                                                        form.errors.attachment
                                                            ? 'attachment-error'
                                                            : undefined
                                                    }
                                                    className="mt-4 h-auto cursor-pointer border-0 bg-transparent p-0 text-xs shadow-none file:mr-3 file:rounded-md file:border-0 file:bg-[#eaf3fb] file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[#17366b] hover:file:bg-[#dcebf7] focus-visible:ring-[#4389bc]"
                                                />
                                            </div>
                                            {form.errors.attachment && (
                                                <div id="attachment-error">
                                                    <ErrorMessage>
                                                        {form.errors.attachment}
                                                    </ErrorMessage>
                                                </div>
                                            )}
                                            {selectedLeaveType?.requires_attachment && (
                                                <p className="text-xs text-amber-700">
                                                    This leave type requires a
                                                    supporting document.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside className="space-y-5 lg:sticky lg:top-6">
                                <section
                                    aria-labelledby="summary-heading"
                                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(16,42,76,0.04)]"
                                >
                                    <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-4">
                                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#eaf3fb] text-[#28658f]">
                                            <FileText
                                                aria-hidden="true"
                                                className="h-4 w-4"
                                            />
                                        </span>
                                        <div>
                                            <h2
                                                id="summary-heading"
                                                className="text-sm font-semibold text-[#17366b]"
                                            >
                                                Request summary
                                            </h2>
                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Updates as you complete the form
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        aria-live="polite"
                                        className="divide-y divide-slate-100 px-5 py-1"
                                    >
                                        <SummaryItem
                                            label="Leave type"
                                            value={
                                                selectedLeaveType?.name ??
                                                'Not selected'
                                            }
                                        />
                                        <SummaryItem
                                            label="Start date"
                                            value={formatDisplayDate(
                                                form.data.start_date,
                                            )}
                                        />
                                        <SummaryItem
                                            label="End date"
                                            value={formatDisplayDate(
                                                form.data.end_date,
                                            )}
                                        />
                                        <SummaryItem
                                            label="Schedule"
                                            value={scheduleLabel}
                                        />
                                        <SummaryItem
                                            label="Supporting file"
                                            value={
                                                form.data.attachment
                                                    ? 'Attached'
                                                    : selectedLeaveType?.requires_attachment
                                                      ? 'Required'
                                                      : 'Optional'
                                            }
                                        />
                                    </div>
                                    <div className="flex items-end justify-between border-t border-slate-100 bg-[#f8fafc] px-5 py-4">
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
                                                Total leave
                                            </p>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Requested duration
                                            </p>
                                        </div>
                                        <p className="text-right">
                                            <span className="text-2xl font-semibold tracking-tight text-[#17366b]">
                                                {totalDays || '—'}
                                            </span>
                                            <span className="ml-1 text-xs font-medium text-slate-500">
                                                {totalDays
                                                    ? durationUnit
                                                    : 'days'}
                                            </span>
                                        </p>
                                    </div>
                                </section>

                                <section className="rounded-2xl border border-[#dce8f2] bg-[#f7fbff] p-5">
                                    <div className="flex items-start gap-3">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-[#28658f] shadow-sm">
                                            <CheckCircle2
                                                aria-hidden="true"
                                                className="h-4 w-4"
                                            />
                                        </span>
                                        <div className="min-w-0">
                                            <h2 className="text-sm font-semibold text-[#17366b]">
                                                Approval process
                                            </h2>
                                            <p className="mt-1 text-xs leading-5 text-slate-600">
                                                After submission, your request
                                                will be routed to your assigned
                                                manager or head.
                                            </p>
                                        </div>
                                    </div>
                                    {employee.manager && (
                                        <div className="mt-4 rounded-lg border border-[#dce8f2] bg-white px-3.5 py-3">
                                            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                                                First approver
                                            </p>
                                            <p className="mt-1 truncate text-sm font-semibold text-slate-800">
                                                {employee.manager}
                                            </p>
                                        </div>
                                    )}
                                </section>

                                <section className="rounded-2xl border border-slate-200 bg-white p-5">
                                    <div className="flex items-start gap-3">
                                        <Info
                                            aria-hidden="true"
                                            className="mt-0.5 h-4 w-4 shrink-0 text-[#4389bc]"
                                        />
                                        <div>
                                            <h2 className="text-sm font-semibold text-[#17366b]">
                                                Before you submit
                                            </h2>
                                            <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-600">
                                                <li className="flex gap-2">
                                                    <Check
                                                        aria-hidden="true"
                                                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700"
                                                    />
                                                    Confirm your dates and
                                                    schedule.
                                                </li>
                                                <li className="flex gap-2">
                                                    <Check
                                                        aria-hidden="true"
                                                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700"
                                                    />
                                                    Add a clear reason.
                                                </li>
                                                <li className="flex gap-2">
                                                    <Check
                                                        aria-hidden="true"
                                                        className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-700"
                                                    />
                                                    Attach documents when
                                                    required.
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </section>
                            </aside>
                        </div>

                        <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                asChild
                                className="min-h-11 rounded-lg border-slate-300 bg-white px-6 font-medium text-slate-700 shadow-sm hover:bg-slate-50"
                            >
                                <Link href="/leave/applications">Cancel</Link>
                            </Button>
                            <Button
                                type="submit"
                                disabled={form.processing || dateRangeInvalid}
                                className="min-h-11 rounded-lg bg-[#17366b] px-6 font-semibold text-white shadow-sm hover:bg-[#102950] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {form.processing ? (
                                    <>
                                        <span
                                            aria-hidden="true"
                                            className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/35 border-t-white"
                                        />
                                        Submitting…
                                    </>
                                ) : (
                                    <>
                                        <Send
                                            aria-hidden="true"
                                            className="mr-2 h-4 w-4"
                                        />
                                        Submit leave request
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </main>
        </>
    );
}
