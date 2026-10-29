import { type FormEvent, useMemo } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    AlertCircle,
    ArrowLeft,
    CalendarDays,
    CheckCircle2,
    Clock3,
    FileText,
    Info,
    Paperclip,
    Send,
    ShieldCheck,
    Timer,
    Upload,
    UserRound,
    X,
} from 'lucide-react';

import { type BreadcrumbItem } from '@/types';

type AuthUser = {
    id: number;
    name: string;
    email?: string | null;
};

type PageProps = {
    auth: {
        user: AuthUser;
    };
};

type UndertimeFormData = {
    undertime_date: string;
    scheduled_start_time: string;
    scheduled_end_time: string;
    requested_departure_time: string;
    reason: string;
    attachment: File | null;
    employee_confirmed: boolean;
};

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Undertime Applications',
        href: '/undertime/applications',
    },
    {
        title: 'File Request',
        href: '/undertime/applications/create',
    },
];

function getToday(): string {
    const now = new Date();
    const localDate = new Date(
        now.getTime() - now.getTimezoneOffset() * 60_000,
    );

    return localDate.toISOString().slice(0, 10);
}

function timeToMinutes(value: string): number | null {
    if (!value || !/^\d{2}:\d{2}$/.test(value)) {
        return null;
    }

    const [hours, minutes] = value.split(':').map(Number);

    if (
        !Number.isFinite(hours) ||
        !Number.isFinite(minutes) ||
        hours < 0 ||
        hours > 23 ||
        minutes < 0 ||
        minutes > 59
    ) {
        return null;
    }

    return hours * 60 + minutes;
}

function formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours === 0) {
        return `${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`;
    }

    if (remainingMinutes === 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
    }

    return `${hours}h ${remainingMinutes}m`;
}

function formatTime(value: string): string {
    if (!value) return '—';

    const [hours, minutes] = value.split(':').map(Number);

    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) {
        return value;
    }

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
    });
}

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <p className="mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            <span>{message}</span>
        </p>
    );
}

function SectionHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof CalendarDays;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700">
                <Icon className="size-[18px]" />
            </div>

            <div>
                <h2 className="text-sm font-bold tracking-tight text-slate-900">
                    {title}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default function CreateUndertimeApplication() {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user;

    const { data, setData, post, processing, errors } =
        useForm<UndertimeFormData>({
            undertime_date: getToday(),
            scheduled_start_time: '08:00',
            scheduled_end_time: '17:00',
            requested_departure_time: '',
            reason: '',
            attachment: null,
            employee_confirmed: false,
        });

    const calculatedMinutes = useMemo(() => {
        const end = timeToMinutes(data.scheduled_end_time);
        const departure = timeToMinutes(data.requested_departure_time);

        if (end === null || departure === null || departure >= end) {
            return null;
        }

        return end - departure;
    }, [data.scheduled_end_time, data.requested_departure_time]);

    const hasValidDuration =
        calculatedMinutes !== null && calculatedMinutes > 0;

    const selectedFile = data.attachment;

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post('/undertime/applications', {
            forceFormData: true,
            preserveScroll: true,
        });
    }

    const checklist = [
        {
            label: 'Undertime date selected',
            done: Boolean(data.undertime_date),
        },
        {
            label: 'Valid departure time selected',
            done: hasValidDuration,
        },
        {
            label: 'Reason provided',
            done: data.reason.trim().length >= 10,
        },
        {
            label: 'Employee declaration confirmed',
            done: data.employee_confirmed,
        },
    ];

    return (
        <>
            <Head title="File Undertime Request | BHF Operations" />

            <div className="min-h-full bg-slate-50/70">
                <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                    {/* Header */}
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3">
                            <Link
                                href="/undertime/applications"
                                aria-label="Back to undertime applications"
                                className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
                            >
                                <ArrowLeft className="size-4" />
                            </Link>

                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-800">
                                        <Clock3 className="size-3" />
                                        Undertime
                                    </span>
                                    <span className="text-xs text-slate-400">
                                        Employee Services
                                    </span>
                                </div>

                                <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                                    File an Undertime Request
                                </h1>

                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    Request authorization to leave before your
                                    scheduled end time. Complete the details
                                    below for review.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                            <ShieldCheck className="size-4 text-emerald-600" />
                            <span className="text-xs font-semibold text-slate-700">
                                Secure employee filing
                            </span>
                        </div>
                    </div>

                    {/* Information banner */}
                    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 sm:p-5">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                            <Info className="size-[18px]" />
                        </div>

                        <div>
                            <h2 className="text-sm font-bold text-blue-950">
                                Before submitting
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-blue-900/80 sm:text-sm">
                                Check the requested departure time and provide
                                a clear justification. Submitting this form
                                records a request; it does not guarantee
                                approval.
                            </p>
                        </div>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        encType="multipart/form-data"
                        className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_320px]"
                    >
                        <div className="min-w-0 space-y-6">
                            {/* Employee information */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                                    <SectionHeading
                                        icon={UserRound}
                                        title="Employee Information"
                                        description="Your account is used to identify the employee filing this request."
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Employee Name
                                        </label>

                                        <div className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5">
                                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-xs font-bold text-blue-800">
                                                {(user?.name || 'U')
                                                    .trim()
                                                    .split(/\s+/)
                                                    .slice(0, 2)
                                                    .map((part: string) =>
                                                        part
                                                            .charAt(0)
                                                            .toUpperCase(),
                                                    )
                                                    .join('')}
                                            </div>

                                            <span className="truncate text-sm font-semibold text-slate-800">
                                                {user?.name || 'Authenticated employee'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Filing Date
                                        </label>

                                        <div className="flex min-h-11 items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5">
                                            <CalendarDays className="size-4 text-slate-400" />
                                            <span className="text-sm font-medium text-slate-700">
                                                {new Date(
                                                    `${getToday()}T12:00:00`,
                                                ).toLocaleDateString(
                                                    undefined,
                                                    {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    },
                                                )}
                                            </span>
                                        </div>
                                        <p className="mt-1.5 text-[11px] text-slate-400">
                                            Recorded by the server at submission.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Schedule */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                                    <SectionHeading
                                        icon={CalendarDays}
                                        title="Undertime Schedule"
                                        description="Specify the date and scheduled hours covered by the request."
                                    />
                                </div>

                                <div className="space-y-5 p-5 sm:p-6">
                                    <div>
                                        <label
                                            htmlFor="undertime_date"
                                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                                        >
                                            Date of Undertime *
                                        </label>

                                        <input
                                            id="undertime_date"
                                            type="date"
                                            required
                                            min={getToday()}
                                            value={data.undertime_date}
                                            onChange={(event) =>
                                                setData(
                                                    'undertime_date',
                                                    event.target.value,
                                                )
                                            }
                                            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                        />
                                        <FieldError
                                            message={errors.undertime_date}
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                        <div>
                                            <label
                                                htmlFor="scheduled_start_time"
                                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                                            >
                                                Scheduled Start Time
                                            </label>

                                            <input
                                                id="scheduled_start_time"
                                                type="time"
                                                value={data.scheduled_start_time}
                                                onChange={(event) =>
                                                    setData(
                                                        'scheduled_start_time',
                                                        event.target.value,
                                                    )
                                                }
                                                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            />
                                            <FieldError
                                                message={
                                                    errors.scheduled_start_time
                                                }
                                            />
                                        </div>

                                        <div>
                                            <label
                                                htmlFor="scheduled_end_time"
                                                className="mb-1.5 block text-xs font-semibold text-slate-700"
                                            >
                                                Scheduled End Time *
                                            </label>

                                            <input
                                                id="scheduled_end_time"
                                                type="time"
                                                required
                                                value={data.scheduled_end_time}
                                                onChange={(event) =>
                                                    setData(
                                                        'scheduled_end_time',
                                                        event.target.value,
                                                    )
                                                }
                                                className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                            />
                                            <FieldError
                                                message={
                                                    errors.scheduled_end_time
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="requested_departure_time"
                                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                                        >
                                            Requested Departure Time *
                                        </label>

                                        <input
                                            id="requested_departure_time"
                                            type="time"
                                            required
                                            value={data.requested_departure_time}
                                            onChange={(event) =>
                                                setData(
                                                    'requested_departure_time',
                                                    event.target.value,
                                                )
                                            }
                                            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                        />

                                        <p className="mt-1.5 text-[11px] text-slate-400">
                                            Select the time you are requesting
                                            permission to leave.
                                        </p>
                                        <FieldError
                                            message={
                                                errors.requested_departure_time
                                            }
                                        />
                                    </div>

                                    {/* Live duration */}
                                    <div
                                        className={`rounded-2xl border p-4 ${
                                            hasValidDuration
                                                ? 'border-blue-100 bg-blue-50/70'
                                                : 'border-amber-100 bg-amber-50/70'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                                                <Timer className="size-5" />
                                            </div>

                                            <div>
                                                <p className="text-xs font-semibold text-slate-700">
                                                    Estimated Undertime Duration
                                                </p>

                                                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                                                    {hasValidDuration
                                                        ? formatDuration(
                                                              calculatedMinutes,
                                                          )
                                                        : 'Not calculated'}
                                                </p>

                                                {hasValidDuration ? (
                                                    <p className="mt-1 text-xs leading-5 text-slate-600">
                                                        From{' '}
                                                        <strong>
                                                            {formatTime(
                                                                data.requested_departure_time,
                                                            )}
                                                        </strong>{' '}
                                                        until{' '}
                                                        <strong>
                                                            {formatTime(
                                                                data.scheduled_end_time,
                                                            )}
                                                        </strong>
                                                        .
                                                    </p>
                                                ) : (
                                                    <p className="mt-1 text-xs leading-5 text-amber-800">
                                                        Choose a departure time
                                                        earlier than the
                                                        scheduled end time.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Reason and attachment */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                                    <SectionHeading
                                        icon={FileText}
                                        title="Request Justification"
                                        description="Explain why you need to leave before the end of your scheduled workday."
                                    />
                                </div>

                                <div className="space-y-5 p-5 sm:p-6">
                                    <div>
                                        <label
                                            htmlFor="reason"
                                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                                        >
                                            Reason for Undertime *
                                        </label>

                                        <textarea
                                            id="reason"
                                            required
                                            minLength={10}
                                            maxLength={2000}
                                            rows={5}
                                            value={data.reason}
                                            onChange={(event) =>
                                                setData(
                                                    'reason',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Provide a clear explanation for your undertime request..."
                                            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                                        />

                                        <div className="mt-1.5 flex items-start justify-between gap-3">
                                            <FieldError
                                                message={errors.reason}
                                            />
                                            <span className="ml-auto shrink-0 text-[11px] text-slate-400">
                                                {data.reason.length}/2000
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="attachment"
                                            className="mb-1.5 block text-xs font-semibold text-slate-700"
                                        >
                                            Supporting Document{' '}
                                            <span className="font-normal text-slate-400">
                                                (Optional)
                                            </span>
                                        </label>

                                        <label
                                            htmlFor="attachment"
                                            className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-7 text-center transition ${
                                                selectedFile
                                                    ? 'border-blue-300 bg-blue-50/50'
                                                    : 'border-slate-300 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/40'
                                            }`}
                                        >
                                            <div className="flex size-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm">
                                                {selectedFile ? (
                                                    <Paperclip className="size-5 text-blue-700" />
                                                ) : (
                                                    <Upload className="size-5" />
                                                )}
                                            </div>

                                            <span className="mt-3 break-all text-sm font-semibold text-slate-800">
                                                {selectedFile
                                                    ? selectedFile.name
                                                    : 'Choose a file to upload'}
                                            </span>

                                            <span className="mt-1 text-xs text-slate-500">
                                                PDF, JPG, JPEG, or PNG
                                            </span>
                                            <span className="mt-1 text-[11px] text-slate-400">
                                                Maximum file size: 5 MB
                                            </span>

                                            {selectedFile && (
                                                <span className="mt-2 text-xs font-medium text-blue-700">
                                                    {(
                                                        selectedFile.size /
                                                        1024 /
                                                        1024
                                                    ).toFixed(2)}{' '}
                                                    MB selected
                                                </span>
                                            )}
                                        </label>

                                        <input
                                            id="attachment"
                                            type="file"
                                            accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                                            className="sr-only"
                                            onChange={(event) => {
                                                const file =
                                                    event.target.files?.[0] ??
                                                    null;

                                                if (
                                                    file &&
                                                    file.size >
                                                        5 * 1024 * 1024
                                                ) {
                                                    setData('attachment', null);
                                                    event.target.value = '';
                                                    window.alert(
                                                        'The selected file exceeds 5 MB. Please choose a smaller file.',
                                                    );
                                                    return;
                                                }

                                                setData('attachment', file);
                                            }}
                                        />

                                        {selectedFile && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setData('attachment', null);

                                                    const input =
                                                        document.getElementById(
                                                            'attachment',
                                                        ) as HTMLInputElement | null;

                                                    if (input) {
                                                        input.value = '';
                                                    }
                                                }}
                                                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700"
                                            >
                                                <X className="size-3.5" />
                                                Remove attachment
                                            </button>
                                        )}

                                        <FieldError
                                            message={errors.attachment}
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Declaration */}
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                                <label className="flex cursor-pointer items-start gap-3">
                                    <input
                                        type="checkbox"
                                        checked={data.employee_confirmed}
                                        onChange={(event) =>
                                            setData(
                                                'employee_confirmed',
                                                event.target.checked,
                                            )
                                        }
                                        className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-blue-700 focus:ring-blue-600"
                                    />

                                    <span>
                                        <span className="block text-sm font-semibold text-slate-800">
                                            Employee Declaration
                                        </span>
                                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                                            I confirm that the information
                                            provided is accurate and that I am
                                            requesting authorization to leave
                                            before my scheduled end time.
                                        </span>
                                    </span>
                                </label>

                                <FieldError
                                    message={errors.employee_confirmed}
                                />
                            </section>

                            {/* Actions */}
                            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <Link
                                    href="/undertime/applications"
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                                >
                                    <ArrowLeft className="size-4" />
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={
                                        processing ||
                                        !hasValidDuration ||
                                        !data.employee_confirmed ||
                                        data.reason.trim().length < 10
                                    }
                                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-800 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-800/20 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {processing ? (
                                        <>
                                            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                            Submitting Request...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="size-4" />
                                            Submit Undertime Request
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Summary sidebar */}
                        <aside className="space-y-5 xl:sticky xl:top-6">
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 px-5 py-4">
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Request Summary
                                    </h2>
                                    <p className="mt-1 text-xs text-slate-500">
                                        Review your details before submission.
                                    </p>
                                </div>

                                <div className="space-y-4 p-5">
                                    <div className="flex items-start justify-between gap-4">
                                        <span className="text-xs text-slate-500">
                                            Request type
                                        </span>
                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-800">
                                            Undertime
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between gap-4">
                                        <span className="text-xs text-slate-500">
                                            Date
                                        </span>
                                        <span className="text-right text-xs font-semibold text-slate-800">
                                            {data.undertime_date
                                                ? new Date(
                                                      `${data.undertime_date}T12:00:00`,
                                                  ).toLocaleDateString(
                                                      undefined,
                                                      {
                                                          month: 'short',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      },
                                                  )
                                                : 'Not selected'}
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between gap-4">
                                        <span className="text-xs text-slate-500">
                                            Scheduled hours
                                        </span>
                                        <span className="text-right text-xs font-semibold text-slate-800">
                                            {formatTime(
                                                data.scheduled_start_time,
                                            )}{' '}
                                            –{' '}
                                            {formatTime(
                                                data.scheduled_end_time,
                                            )}
                                        </span>
                                    </div>

                                    <div className="flex items-start justify-between gap-4">
                                        <span className="text-xs text-slate-500">
                                            Departure
                                        </span>
                                        <span className="text-right text-xs font-semibold text-slate-800">
                                            {formatTime(
                                                data.requested_departure_time,
                                            )}
                                        </span>
                                    </div>

                                    <div className="border-t border-dashed border-slate-200 pt-4">
                                        <div className="rounded-xl bg-slate-50 p-3.5">
                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                Estimated Duration
                                            </p>
                                            <p className="mt-1.5 text-xl font-bold text-slate-950">
                                                {hasValidDuration
                                                    ? formatDuration(
                                                          calculatedMinutes,
                                                      )
                                                    : 'Not calculated'}
                                            </p>
                                            {hasValidDuration && (
                                                <p className="mt-1 text-[11px] text-slate-500">
                                                    {calculatedMinutes} minutes
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3">
                                        <AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-700" />
                                        <p className="text-[11px] leading-5 text-amber-900">
                                            This is a request, not an approval.
                                            Wait for the authorized approver's
                                            decision.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                                        <CheckCircle2 className="size-[18px]" />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-xs font-bold text-slate-900">
                                            Submission Checklist
                                        </h3>

                                        <ul className="mt-3 space-y-2.5">
                                            {checklist.map((item) => (
                                                <li
                                                    key={item.label}
                                                    className="flex items-center gap-2"
                                                >
                                                    <span
                                                        className={`flex size-4 shrink-0 items-center justify-center rounded-full ${
                                                            item.done
                                                                ? 'bg-emerald-100 text-emerald-700'
                                                                : 'bg-slate-100 text-slate-400'
                                                        }`}
                                                    >
                                                        <CheckCircle2 className="size-3" />
                                                    </span>

                                                    <span
                                                        className={`text-[11px] ${
                                                            item.done
                                                                ? 'text-slate-700'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {item.label}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </section>
                        </aside>
                    </form>
                </div>
            </div>
            </>
    );
}