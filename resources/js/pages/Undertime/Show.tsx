
import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    CheckCircle2,
    Clock3,
    FileCheck2,
    FileText,
    Paperclip,
    ShieldCheck,
    Timer,
    UserRound,
    CalendarClock,
    Building2,
    ChevronRight,
    CircleDot,
} from 'lucide-react';

type Application = {
    id: number;
    application_no: string;
    employee: {
        id: number | null;
        name: string | null;
    };
    date_filed: string | null;
    undertime_date: string | null;
    scheduled_start_time: string | null;
    scheduled_end_time: string | null;
    requested_departure_time: string | null;
    requested_minutes: number;
    reason: string;
    has_attachment: boolean;
    status: string;
    employee_confirmed: boolean;
    submitted_at: string | null;
    created_at: string | null;
};

type Props = {
    application: Application;
};

const statusConfig: Record<
    string,
    {
        label: string;
        description: string;
        className: string;
        dotClass: string;
    }
> = {
    draft: {
        label: 'Draft',
        description: 'This application has not yet been submitted.',
        className: 'border-slate-200 bg-slate-50 text-slate-700',
        dotClass: 'bg-slate-400',
    },
    submitted: {
        label: 'Submitted',
        description: 'Your application has been submitted.',
        className: 'border-blue-200 bg-blue-50 text-blue-700',
        dotClass: 'bg-blue-500',
    },
    pending_approval: {
        label: 'Pending Approval',
        description: 'Your application is awaiting approval.',
        className: 'border-amber-200 bg-amber-50 text-amber-800',
        dotClass: 'bg-amber-500',
    },
    approved: {
        label: 'Approved',
        description: 'Your undertime request has been approved.',
        className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
        dotClass: 'bg-emerald-500',
    },
    rejected: {
        label: 'Rejected',
        description: 'Your application was not approved.',
        className: 'border-rose-200 bg-rose-50 text-rose-800',
        dotClass: 'bg-rose-500',
    },
    returned: {
        label: 'Returned for Revision',
        description: 'Your application requires further attention.',
        className: 'border-orange-200 bg-orange-50 text-orange-800',
        dotClass: 'bg-orange-500',
    },
    cancelled: {
        label: 'Cancelled',
        description: 'This application has been cancelled.',
        className: 'border-slate-200 bg-slate-50 text-slate-600',
        dotClass: 'bg-slate-400',
    },
};

function getStatus(value: string) {
    const key = (value || '').toLowerCase();

    return (
        statusConfig[key] ?? {
            label: key
                ? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
                : 'Unknown',
            description: 'Application status information.',
            className: 'border-slate-200 bg-slate-50 text-slate-700',
            dotClass: 'bg-slate-400',
        }
    );
}

function formatDate(value: string | null) {
    if (!value) return '—';

    const dateValue = value.slice(0, 10);
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateValue);

    const date = match
        ? new Date(
              Date.UTC(
                  Number(match[1]),
                  Number(match[2]) - 1,
                  Number(match[3]),
              ),
          )
        : new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: match ? 'UTC' : undefined,
    }).format(date);
}

function formatDateTime(value: string | null) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat('en-PH', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatTime(value: string | null) {
    if (!value) return '—';

    const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value);

    if (!match) return value;

    const date = new Date();
    date.setHours(Number(match[1]), Number(match[2]), 0, 0);

    return new Intl.DateTimeFormat('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
    }).format(date);
}

function formatDuration(minutes: number) {
    const total = Math.max(0, Number(minutes) || 0);
    const hours = Math.floor(total / 60);
    const remaining = total % 60;

    if (hours && remaining) return `${hours}h ${remaining}m`;
    if (hours) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;

    return `${remaining} ${remaining === 1 ? 'minute' : 'minutes'}`;
}

function getInitials(name: string | null) {
    if (!name?.trim()) return 'U';

    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part.charAt(0).toUpperCase())
        .join('');
}

function InfoItem({
    label,
    value,
    icon: Icon,
}: {
    label: string;
    value: string;
    icon: typeof CalendarDays;
}) {
    return (
        <div className="min-w-0">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon className="size-3.5 shrink-0" />
                <span className="text-[11px] font-semibold uppercase tracking-wider">
                    {label}
                </span>
            </div>

            <p className="mt-2 break-words text-sm font-semibold text-slate-800">
                {value}
            </p>
        </div>
    );
}

function SectionHeader({
    title,
    description,
    icon: Icon,
}: {
    title: string;
    description: string;
    icon: typeof FileText;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#17366b]">
                <Icon className="size-[17px]" />
            </div>

            <div className="min-w-0">
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

export default function Show({ application }: Props) {
    const status = getStatus(application.status);

    return (
        <>
            <Head
                title={`${application.application_no} | BHF Operations`}
            />

            <div className="min-h-full bg-[#f4f6fa] text-slate-900">
                <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">

                    {/* Breadcrumb */}
                    <nav className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                        <Link
                            href="/dashboard"
                            className="transition hover:text-[#17366b]"
                        >
                            Dashboard
                        </Link>

                        <ChevronRight className="size-3.5" />

                        <Link
                            href="/undertime/applications"
                            className="transition hover:text-[#17366b]"
                        >
                            Undertime Applications
                        </Link>

                        <ChevronRight className="size-3.5" />

                        <span className="font-semibold text-slate-800">
                            Application Details
                        </span>
                    </nav>

                    {/* Page heading */}
                    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                        <div className="flex items-start gap-3">
                            <Link
                                href="/undertime/applications"
                                aria-label="Back to applications"
                                className="mt-1 flex size-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                            >
                                <ArrowLeft className="size-4" />
                            </Link>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-700">
                                        Employee Services
                                    </span>

                                    <span className="size-1 rounded-full bg-slate-300" />

                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                        Undertime
                                    </span>
                                </div>

                                <h1 className="mt-1.5 text-xl font-bold tracking-tight text-[#17366b] sm:text-2xl">
                                    Application Details
                                </h1>

                                <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                                    Review your undertime request and its current status.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
                            <ShieldCheck className="size-4 text-emerald-600" />

                            <span className="text-xs font-semibold text-slate-600">
                                Secure Application Record
                            </span>
                        </div>
                    </header>

                    {/* Application overview */}
                    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <div className="h-1 bg-[#17366b]" />

                        <div className="p-5 sm:p-7">
                            <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                        Application Reference Number
                                    </p>

                                    <h2 className="mt-2 break-all text-xl font-bold tracking-tight text-[#17366b] sm:text-2xl">
                                        {application.application_no}
                                    </h2>

                                    <p className="mt-2 text-xs text-slate-500">
                                        Filed on {formatDate(application.date_filed)}
                                    </p>
                                </div>

                                <div className="flex flex-col items-start gap-2 lg:items-end">
                                    <span
                                        className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-bold ${status.className}`}
                                    >
                                        <span className={`size-2 rounded-full ${status.dotClass}`} />
                                        {status.label}
                                    </span>

                                    <p className="text-xs text-slate-500 lg:text-right">
                                        {status.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Main content */}
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">

                        {/* Left column */}
                        <div className="min-w-0 space-y-6">

                            {/* Employee information */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 p-5 sm:px-6 sm:py-5">
                                    <SectionHeader
                                        icon={UserRound}
                                        title="Employee Information"
                                        description="Details of the employee who filed this request."
                                    />
                                </div>

                                <div className="p-5 sm:p-6">
                                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-lg font-bold text-[#17366b]">
                                            {getInitials(application.employee?.name)}
                                        </div>

                                        <div className="min-w-0">
                                            <p className="break-words text-base font-bold text-slate-900">
                                                {application.employee?.name ?? 'Unknown Employee'}
                                            </p>

                                            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                <Building2 className="size-3.5" />
                                                <span>Employee Account</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Schedule information */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 p-5 sm:px-6 sm:py-5">
                                    <SectionHeader
                                        icon={CalendarDays}
                                        title="Undertime Schedule"
                                        description="Your scheduled working hours and requested departure."
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-6 p-5 sm:grid-cols-2 sm:p-6">
                                    <InfoItem
                                        label="Date of Undertime"
                                        value={formatDate(application.undertime_date)}
                                        icon={CalendarDays}
                                    />

                                    <InfoItem
                                        label="Scheduled Start"
                                        value={formatTime(application.scheduled_start_time)}
                                        icon={Clock3}
                                    />

                                    <InfoItem
                                        label="Scheduled End"
                                        value={formatTime(application.scheduled_end_time)}
                                        icon={CalendarClock}
                                    />

                                    <InfoItem
                                        label="Requested Departure"
                                        value={formatTime(application.requested_departure_time)}
                                        icon={Timer}
                                    />
                                </div>

                                <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:px-6">
                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-600">
                                                Requested Undertime Duration
                                            </p>

                                            <p className="mt-1 text-[11px] text-slate-400">
                                                Calculated from the requested departure until scheduled end time.
                                            </p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <div className="flex size-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                                                <Clock3 className="size-[18px]" />
                                            </div>

                                            <p className="text-xl font-bold tracking-tight text-[#17366b]">
                                                {formatDuration(application.requested_minutes)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Request justification */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 p-5 sm:px-6 sm:py-5">
                                    <SectionHeader
                                        icon={FileText}
                                        title="Request Justification"
                                        description="Reason and supporting information provided by the employee."
                                    />
                                </div>

                                <div className="space-y-5 p-5 sm:p-6">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Reason for Undertime
                                        </p>

                                        <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                                            {application.reason || 'No reason provided.'}
                                        </p>
                                    </div>

                                    <div className="border-t border-slate-100 pt-5">
                                        <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                            Supporting Documents
                                        </p>

                                        {application.has_attachment ? (
                                            <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/50 p-3.5">
                                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700">
                                                    <Paperclip className="size-5" />
                                                </div>

                                                <div className="min-w-0">
                                                    <p className="text-sm font-semibold text-slate-800">
                                                        Supporting document attached
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        A file was included with this application.
                                                    </p>
                                                </div>

                                                <CheckCircle2 className="ml-auto size-5 shrink-0 text-emerald-600" />
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
                                                <FileText className="size-5 shrink-0 text-slate-400" />

                                                <p className="text-xs text-slate-500">
                                                    No supporting document was attached.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Right sidebar */}
                        <aside className="min-w-0 space-y-6 lg:sticky lg:top-6">

                            {/* Status card */}
                            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                                <div className="border-b border-slate-100 p-5">
                                    <h2 className="text-sm font-bold text-slate-900">
                                        Application Status
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Current application state.
                                    </p>
                                </div>

                                <div className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${status.className}`}>
                                            <CircleDot className="size-5" />
                                        </div>

                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-900">
                                                {status.label}
                                            </p>

                                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                                {status.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 rounded-xl bg-slate-50 p-4">
                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                                            <FileCheck2 className="size-4 text-blue-700" />
                                            Submission Information
                                        </div>

                                        <div className="mt-4 space-y-4">
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                    Submitted At
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                                    {formatDateTime(application.submitted_at)}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                                    Record Created
                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-slate-700">
                                                    {formatDateTime(application.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Declaration card */}
                            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="size-4 text-[#17366b]" />

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Employee Declaration
                                    </h2>
                                </div>

                                <div className="mt-4 flex items-start gap-3">
                                    <div
                                        className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${
                                            application.employee_confirmed
                                                ? 'bg-emerald-50 text-emerald-600'
                                                : 'bg-amber-50 text-amber-600'
                                        }`}
                                    >
                                        {application.employee_confirmed ? (
                                            <Check className="size-4" />
                                        ) : (
                                            <Clock3 className="size-4" />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-800">
                                            {application.employee_confirmed
                                                ? 'Declaration Confirmed'
                                                : 'Not Yet Confirmed'}
                                        </p>

                                        <p className="mt-1 text-xs leading-5 text-slate-500">
                                            {application.employee_confirmed
                                                ? 'The employee confirmed the accuracy of the submitted information.'
                                                : 'No employee confirmation has been recorded.'}
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Application summary */}
                            <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                                <div className="flex items-center gap-2">
                                    <CalendarClock className="size-4 text-blue-800" />

                                    <h2 className="text-sm font-bold text-blue-950">
                                        Request Summary
                                    </h2>
                                </div>

                                <p className="mt-3 text-xs leading-6 text-blue-900/80">
                                    This page displays the details recorded for your undertime application. Its current status reflects the latest recorded application state.
                                </p>
                            </section>

                        </aside>
                    </div>

                    {/* Footer actions */}
                    <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-[11px] leading-5 text-slate-400">
                            BHF Rural Bank · Operations Management
                        </p>

                        <Link
                            href="/undertime/applications"
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                        >
                            <ArrowLeft className="size-4" />
                            Back to Applications
                        </Link>
                    </div>

                </div>
            </div>
        </>
    );
}
