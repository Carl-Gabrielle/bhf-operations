import React, {
    FormEvent,
    useMemo,
    useState,
} from 'react';

import {
    Head,
    Link,
    useForm,
    usePage,
} from '@inertiajs/react';

import {
    Activity,
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    CircleUserRound,
    Clock3,
    Copy,
    Edit3,
    Eye,
    EyeOff,
    KeyRound,
    Mail,
    Phone,
    Save,
    Shield,
    ShieldCheck,
    User as UserIcon,
    UserRound,
    X,
} from 'lucide-react';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type OrganizationalUnit = {
    id: number;
    code: string;
    name: string;
};

type Position = {
    id: number;
    name: string;
};

type Role = {
    id: number;
    name: string;
};

type UserRole = {
    id: number;
    name: string;
};

type UserData = {
    id: number;

    username?: string | null;
    employee_number?: string | null;

    name?: string | null;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;

    contact_number?: string | null;
    email?: string | null;

    organizational_unit?: OrganizationalUnit | null;
    position?: Position | null;
    roles?: UserRole[] | null;

    account_status?: string | null;

    last_login_at?: string | null;
    password_changed_at?: string | null;

    created_at?: string | null;
    updated_at?: string | null;
};

type AuditLog = {
    id: number;
    action: string;
    description: string;

    changes?: Record<
        string,
        {
            old?: unknown;
            new?: unknown;
            changed?: boolean;
        }
    > | null;

    ip_address?: string | null;

    created_at?: string | null;

    actor?: {
        id: number;
        name?: string | null;
        username?: string | null;
    } | null;
};

type PageProps = {
    user: UserData | { data: UserData };

    organizationalUnits?: OrganizationalUnit[];
    positions?: Position[];
    roles?: Role[];

    auditLogs?: AuditLog[];

    flash?: {
        success?: string;
    };
};

type FormData = {
    username: string;
    employee_number: string;

    name: string;
    first_name: string;
    middle_name: string;
    last_name: string;

    contact_number: string;
    email: string;

    organizational_unit_id: string;
    position_id: string;

    account_status: string;
    role: string;

    password: string;
    password_confirmation: string;
};

/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function normalizeUser(
    user: UserData | { data: UserData },
): UserData {
    if (
        user &&
        typeof user === 'object' &&
        'data' in user &&
        user.data
    ) {
        return user.data;
    }

    return user as UserData;
}

function safeString(
    value: string | null | undefined,
): string {
    return typeof value === 'string'
        ? value
        : '';
}

function getDisplayName(
    user: UserData,
): string {
    const firstName = safeString(
        user.first_name,
    ).trim();

    const middleName = safeString(
        user.middle_name,
    ).trim();

    const lastName = safeString(
        user.last_name,
    ).trim();

    const fullName = [
        firstName,
        middleName,
        lastName,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        fullName ||
        safeString(user.name).trim() ||
        safeString(user.username).trim() ||
        'User'
    );
}

function getInitials(
    user: UserData,
): string {
    const name =
        getDisplayName(user).trim();

    if (!name) {
        return 'U';
    }

    const parts = name
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 1) {
        return parts[0]
            .slice(0, 2)
            .toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}

function getStatusLabel(
    status?: string | null,
): string {
    const value = safeString(status)
        .trim()
        .toLowerCase();

    if (!value) {
        return 'Unknown';
    }

    return value
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function getStatusClass(
    status?: string | null,
): string {
    const value = safeString(status)
        .trim()
        .toLowerCase();

    switch (value) {
        case 'active':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';

        case 'inactive':
        case 'disabled':
        case 'suspended':
            return 'border-red-200 bg-red-50 text-red-700';

        case 'locked':
            return 'border-amber-200 bg-amber-50 text-amber-700';

        default:
            return 'border-slate-200 bg-slate-50 text-slate-600';
    }
}

function getStatusDot(
    status?: string | null,
): string {
    const value = safeString(status)
        .trim()
        .toLowerCase();

    switch (value) {
        case 'active':
            return 'bg-emerald-500';

        case 'locked':
            return 'bg-amber-500';

        case 'inactive':
        case 'disabled':
        case 'suspended':
            return 'bg-red-500';

        default:
            return 'bg-slate-400';
    }
}

function formatDate(
    value?: string | null,
): string {
    if (!value) {
        return 'Never';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleString(
        undefined,
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        },
    );
}

function formatShortDate(
    value?: string | null,
): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString(
        undefined,
        {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        },
    );
}

function getAuditActorName(
    audit: AuditLog,
): string {
    return (
        safeString(
            audit.actor?.name,
        ).trim() ||
        safeString(
            audit.actor?.username,
        ).trim() ||
        'System'
    );
}

function getAuditActionLabel(
    action: string,
): string {
    switch (action) {
        case 'password_reset':
            return 'Password Reset';

        case 'password_changed':
            return 'Password Changed';

        case 'user_updated':
            return 'User Updated';

        case 'user_created':
            return 'User Created';

        case 'user_deleted':
            return 'User Deleted';

        default:
            return action
                .replace(/[_-]/g, ' ')
                .replace(/\b\w/g, (letter) =>
                    letter.toUpperCase(),
                );
    }
}

function getAuditActionClass(
    action: string,
): string {
    switch (action) {
        case 'password_reset':
            return 'border-amber-200 bg-amber-50 text-amber-700';

        case 'password_changed':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';

        case 'user_updated':
            return 'border-blue-200 bg-blue-50 text-blue-700';

        case 'user_created':
            return 'border-violet-200 bg-violet-50 text-violet-700';

        case 'user_deleted':
            return 'border-red-200 bg-red-50 text-red-700';

        default:
            return 'border-slate-200 bg-slate-50 text-slate-600';
    }
}

function formatAuditField(
    field: string,
): string {
    return field
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
}

function formatAuditValue(
    value: unknown,
): string {
    if (
        value === null ||
        value === undefined ||
        value === ''
    ) {
        return 'Empty';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
}

function generateTemporaryPassword(
    length = 14,
): string {
    const uppercase =
        'ABCDEFGHJKLMNPQRSTUVWXYZ';

    const lowercase =
        'abcdefghijkmnopqrstuvwxyz';

    const numbers =
        '23456789';

    const symbols =
        '!@#$%^&*_-+=';

    const all =
        uppercase +
        lowercase +
        numbers +
        symbols;

    const values =
        new Uint32Array(length);

    window.crypto.getRandomValues(
        values,
    );

    const password = Array.from(
        values,
        (value) =>
            all[value % all.length],
    );

    password[0] =
        uppercase[
            values[0] %
                uppercase.length
        ];

    password[1] =
        lowercase[
            values[1] %
                lowercase.length
        ];

    password[2] =
        numbers[
            values[2] %
                numbers.length
        ];

    password[3] =
        symbols[
            values[3] %
                symbols.length
        ];

    return password.join('');
}

/*
|--------------------------------------------------------------------------
| Reusable UI
|--------------------------------------------------------------------------
*/

function StatusBadge({
    status,
}: {
    status?: string | null;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] ${getStatusClass(
                status,
            )}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${getStatusDot(
                    status,
                )}`}
            />

            {getStatusLabel(status)}
        </span>
    );
}

function SectionHeading({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: typeof UserRound;
    title: string;
    description?: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#173B67] ring-1 ring-blue-100">
                    <Icon
                        className="h-4 w-4"
                        strokeWidth={1.8}
                    />
                </div>

                <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-slate-900">
                        {title}
                    </h2>

                    {description && (
                        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                            {description}
                        </p>
                    )}
                </div>
            </div>

            {action}
        </div>
    );
}

function DetailItem({
    label,
    value,
    icon,
    mono = false,
}: {
    label: string;
    value: string;
    icon?: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div className="min-w-0">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                {label}
            </p>

            <div className="flex min-h-9 min-w-0 items-center gap-2">
                {icon && (
                    <span className="shrink-0 text-slate-400">
                        {icon}
                    </span>
                )}

                <span
                    className={`min-w-0 truncate text-[13px] font-medium text-slate-700 ${
                        mono
                            ? 'font-mono'
                            : ''
                    }`}
                >
                    {value || '—'}
                </span>
            </div>
        </div>
    );
}

function InputField({
    label,
    value,
    onChange,
    error,
    type = 'text',
    required = false,
    placeholder,
}: {
    label: string;
    value: string;
    onChange: (
        value: string,
    ) => void;
    error?: string;
    type?: string;
    required?: boolean;
    placeholder?: string;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                placeholder={placeholder}
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#173B67] focus:ring-2 focus:ring-[#173B67]/10 ${
                    error
                        ? 'border-red-300'
                        : 'border-slate-200 hover:border-slate-300'
                }`}
            />

            {error && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

function SelectField({
    label,
    value,
    onChange,
    options,
    error,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (
        value: string,
    ) => void;
    options: {
        value: string;
        label: string;
    }[];
    error?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">
                        *
                    </span>
                )}
            </label>

            <select
                value={value}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#173B67] focus:ring-2 focus:ring-[#173B67]/10 ${
                    error
                        ? 'border-red-300'
                        : 'border-slate-200 hover:border-slate-300'
                }`}
            >
                {options.map(
                    (option) => (
                        <option
                            key={
                                option.value
                            }
                            value={
                                option.value
                            }
                        >
                            {
                                option.label
                            }
                        </option>
                    ),
                )}
            </select>

            {error && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export default function ViewUser() {
    const page =
        usePage<PageProps>();

    const user = useMemo(
        () =>
            normalizeUser(
                page.props.user,
            ),
        [page.props.user],
    );

    const organizationalUnits =
        page.props.organizationalUnits ??
        [];

    const positions =
        page.props.positions ?? [];

    const roles =
        page.props.roles ?? [];

    const auditLogs =
        page.props.auditLogs ?? [];

    const [editing, setEditing] =
        useState(false);

    const [
        showResetModal,
        setShowResetModal,
    ] = useState(false);

    const [
        temporaryPassword,
        setTemporaryPassword,
    ] = useState('');

    const [
        copiedPassword,
        setCopiedPassword,
    ] = useState(false);

    const [
        showTemporaryPassword,
        setShowTemporaryPassword,
    ] = useState(false);

    const form =
        useForm<FormData>({
            username:
                safeString(
                    user.username,
                ),

            employee_number:
                safeString(
                    user.employee_number,
                ),

            name:
                safeString(
                    user.name,
                ),

            first_name:
                safeString(
                    user.first_name,
                ),

            middle_name:
                safeString(
                    user.middle_name,
                ),

            last_name:
                safeString(
                    user.last_name,
                ),

            contact_number:
                safeString(
                    user.contact_number,
                ),

            email:
                safeString(
                    user.email,
                ),

            organizational_unit_id:
                user.organizational_unit
                    ?.id
                    ? String(
                          user
                              .organizational_unit
                              .id,
                      )
                    : '',

            position_id:
                user.position?.id
                    ? String(
                          user.position.id,
                      )
                    : '',

            account_status:
                safeString(
                    user.account_status,
                ),

            role:
                user.roles?.[0]
                    ?.name ?? '',

            password: '',
            password_confirmation:
                '',
        });

    const errors =
        form.errors as Record<
            string,
            string | undefined
        >;

    const displayName =
        getDisplayName(user);

    const initials =
        getInitials(user);

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    const submitEdit = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        form.put(
            `/admin/users/${user.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setEditing(false);
                },
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Reset Password
    |--------------------------------------------------------------------------
    */

    const resetPassword = () => {
        const password =
            generateTemporaryPassword();

        setTemporaryPassword(
            password,
        );

        setCopiedPassword(false);

        setShowTemporaryPassword(
            false,
        );

        form.transform((data) => ({
            ...data,
            password,
            password_confirmation:
                password,
        }));

        form.put(
            `/admin/users/${user.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setShowTemporaryPassword(
                        true,
                    );
                },

                onError: () => {
                    setTemporaryPassword(
                        '',
                    );
                },

                onFinish: () => {
                    form.transform(
                        (data) => ({
                            ...data,
                            password: '',
                            password_confirmation:
                                '',
                        }),
                    );
                },
            },
        );
    };

    const copyTemporaryPassword =
        async () => {
            if (
                !temporaryPassword
            ) {
                return;
            }

            try {
                await navigator.clipboard.writeText(
                    temporaryPassword,
                );

                setCopiedPassword(
                    true,
                );

                window.setTimeout(
                    () =>
                        setCopiedPassword(
                            false,
                        ),
                    1800,
                );
            } catch {
                setCopiedPassword(
                    false,
                );
            }
        };

    const closeResetModal =
        () => {
            if (
                form.processing
            ) {
                return;
            }

            setShowResetModal(
                false,
            );

            setTemporaryPassword(
                '',
            );

            setCopiedPassword(
                false,
            );

            setShowTemporaryPassword(
                false,
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
                title={`${displayName} · User`}
            />

            <div className="min-h-screen bg-[#f5f7fa] text-slate-900">

                <div className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

                    {/* =====================================================
                        PAGE HEADER
                    ====================================================== */}

                    <header className="mb-5">

                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-3">

                                <Link
                                    href="/admin/users"
                                    className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#173B67]"
                                >
                                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                                </Link>

                                <div>
                                    <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                                        <span>
                                            Administration
                                        </span>

                                        <span className="text-slate-300">
                                            /
                                        </span>

                                        <span>
                                            User Management
                                        </span>
                                    </div>

                                    <h1 className="mt-1 text-[21px] font-bold tracking-tight text-slate-950">
                                        User Account
                                    </h1>
                                </div>

                            </div>

                            {!editing && (
                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowResetModal(
                                                true,
                                            )
                                        }
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 text-xs font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
                                    >
                                        <KeyRound className="h-3.5 w-3.5" />

                                        Reset Password
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditing(
                                                true,
                                            )
                                        }
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#173B67] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123052]"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />

                                        Edit User
                                    </button>

                                </div>
                            )}

                        </div>

                    </header>

                    {/* =====================================================
                        PROFILE HERO
                    ====================================================== */}

                    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_16px_rgba(15,23,42,0.045)]">

                        {/* Corporate accent */}

                        <div className="absolute inset-y-0 left-0 w-1 bg-[#173B67]" />

                        <div className="px-5 py-6 sm:px-7">

                            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

                                {/* Identity */}

                                <div className="flex min-w-0 items-center gap-4 sm:gap-5">

                                    <div className="relative shrink-0">

                                        <div className="flex h-[68px] w-[68px] items-center justify-center rounded-2xl bg-[#173B67] text-xl font-bold tracking-tight text-white shadow-[0_5px_14px_rgba(23,59,103,0.18)]">
                                            {initials}
                                        </div>

                                        <span
                                            className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-[3px] border-white ${getStatusDot(
                                                user.account_status,
                                            )}`}
                                        />

                                    </div>

                                    <div className="min-w-0">

                                        <div className="flex flex-wrap items-center gap-2">

                                            <h2 className="truncate text-xl font-bold tracking-tight text-slate-950 sm:text-[22px]">
                                                {displayName}
                                            </h2>

                                            <StatusBadge
                                                status={
                                                    user.account_status
                                                }
                                            />

                                        </div>

                                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">

                                            <span className="font-medium text-slate-600">
                                                @
                                                {safeString(
                                                    user.username,
                                                ) ||
                                                    '—'}
                                            </span>

                                            <span className="hidden text-slate-300 sm:inline">
                                                •
                                            </span>

                                            <span>
                                                Employee No.{' '}
                                                <strong className="font-semibold text-slate-700">
                                                    {safeString(
                                                        user.employee_number,
                                                    ) ||
                                                        '—'}
                                                </strong>
                                            </span>

                                            <span className="hidden text-slate-300 sm:inline">
                                                •
                                            </span>

                                            <span>
                                                ID #
                                                {user.id}
                                            </span>

                                        </div>

                                        <div className="mt-3 flex flex-wrap gap-2">

                                            {user.position?.name && (
                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                                    <UserRound className="h-3 w-3 text-slate-400" />

                                                    {
                                                        user
                                                            .position
                                                            .name
                                                    }
                                                </span>
                                            )}

                                            {user.organizational_unit?.name && (
                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                                    <Building2 className="h-3 w-3 text-slate-400" />

                                                    {
                                                        user
                                                            .organizational_unit
                                                            .name
                                                    }
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                </div>

                                {/* Account metrics */}

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:min-w-[520px]">

                                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">

                                        <div className="flex items-center gap-2">

                                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200">
                                                <Clock3 className="h-3.5 w-3.5" />
                                            </div>

                                            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                                Last Login
                                            </span>

                                        </div>

                                        <p className="mt-2 truncate text-[11px] font-semibold text-slate-700">
                                            {formatDate(
                                                user.last_login_at,
                                            )}
                                        </p>

                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">

                                        <div className="flex items-center gap-2">

                                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200">
                                                <KeyRound className="h-3.5 w-3.5" />
                                            </div>

                                            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                                Password
                                            </span>

                                        </div>

                                        <p className="mt-2 truncate text-[11px] font-semibold text-slate-700">
                                            {formatShortDate(
                                                user.password_changed_at,
                                            )}
                                        </p>

                                    </div>

                                    <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3">

                                        <div className="flex items-center gap-2">

                                            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200">
                                                <CalendarDays className="h-3.5 w-3.5" />
                                            </div>

                                            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                                Created
                                            </span>

                                        </div>

                                        <p className="mt-2 truncate text-[11px] font-semibold text-slate-700">
                                            {formatShortDate(
                                                user.created_at,
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </section>

                    {/* =====================================================
                        MAIN CONTENT
                    ====================================================== */}

                    <div className="mt-5">

                        {!editing ? (

                            <div className="space-y-5">

                                {/* =================================================
                                    INFORMATION GRID
                                ================================================== */}

                                <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">

                                    {/* Personal Information */}

                                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">

                                        <div className="border-b border-slate-100 px-5 py-4">

                                            <SectionHeading
                                                icon={UserIcon}
                                                title="Personal Information"
                                                description="Employee identity and contact details."
                                            />

                                        </div>

                                        <div className="grid gap-x-7 gap-y-6 p-5 sm:grid-cols-2">

                                            <DetailItem
                                                label="First Name"
                                                value={
                                                    safeString(
                                                        user.first_name,
                                                    ) ||
                                                    '—'
                                                }
                                            />

                                            <DetailItem
                                                label="Middle Name"
                                                value={
                                                    safeString(
                                                        user.middle_name,
                                                    ) ||
                                                    '—'
                                                }
                                            />

                                            <DetailItem
                                                label="Last Name"
                                                value={
                                                    safeString(
                                                        user.last_name,
                                                    ) ||
                                                    '—'
                                                }
                                            />

                                            <DetailItem
                                                label="Username"
                                                value={
                                                    safeString(
                                                        user.username,
                                                    ) ||
                                                    '—'
                                                }
                                                mono
                                            />

                                            <DetailItem
                                                label="Email Address"
                                                value={
                                                    safeString(
                                                        user.email,
                                                    ) ||
                                                    '—'
                                                }
                                                icon={
                                                    <Mail className="h-3.5 w-3.5" />
                                                }
                                            />

                                            <DetailItem
                                                label="Contact Number"
                                                value={
                                                    safeString(
                                                        user.contact_number,
                                                    ) ||
                                                    '—'
                                                }
                                                icon={
                                                    <Phone className="h-3.5 w-3.5" />
                                                }
                                            />

                                        </div>

                                    </section>

                                    {/* Organization */}

                                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">

                                        <div className="border-b border-slate-100 px-5 py-4">

                                            <SectionHeading
                                                icon={Building2}
                                                title="Organization & Access"
                                                description="Organizational placement and system access."
                                            />

                                        </div>

                                        <div className="space-y-6 p-5">

                                            <DetailItem
                                                label="Organizational Unit"
                                                value={
                                                    user.organizational_unit
                                                        ? `${safeString(
                                                              user
                                                                  .organizational_unit
                                                                  .code,
                                                          )} — ${safeString(
                                                              user
                                                                  .organizational_unit
                                                                  .name,
                                                          )}`
                                                        : '—'
                                                }
                                            />

                                            <DetailItem
                                                label="Position"
                                                value={
                                                    safeString(
                                                        user.position
                                                            ?.name,
                                                    ) ||
                                                    '—'
                                                }
                                            />

                                            <div>

                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                    System Role
                                                </p>

                                                {user.roles &&
                                                user.roles.length >
                                                    0 ? (

                                                    <div className="flex flex-wrap gap-2">

                                                        {user.roles.map(
                                                            (
                                                                role,
                                                            ) => (
                                                                <span
                                                                    key={
                                                                        role.id
                                                                    }
                                                                    className="inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2.5 py-1.5 text-[10px] font-semibold text-[#173B67]"
                                                                >
                                                                    <Shield className="h-3 w-3" />

                                                                    {
                                                                        role.name
                                                                    }
                                                                </span>
                                                            ),
                                                        )}

                                                    </div>

                                                ) : (

                                                    <span className="text-xs text-slate-400">
                                                        No role assigned
                                                    </span>

                                                )}

                                            </div>

                                            <div>

                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                    Account Status
                                                </p>

                                                <StatusBadge
                                                    status={
                                                        user.account_status
                                                    }
                                                />

                                            </div>

                                        </div>

                                    </section>

                                </div>

                                {/* =================================================
                                    SECURITY
                                ================================================== */}

                                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">

                                    <div className="border-b border-slate-100 px-5 py-4">

                                        <SectionHeading
                                            icon={ShieldCheck}
                                            title="Account Security"
                                            description="Password and account activity information."
                                        />

                                    </div>

                                    <div className="grid gap-5 p-5 sm:grid-cols-3">

                                        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">

                                            <div className="flex items-center gap-2 text-slate-400">

                                                <Clock3 className="h-3.5 w-3.5" />

                                                <span className="text-[10px] font-semibold uppercase tracking-[0.07em]">
                                                    Last Login
                                                </span>

                                            </div>

                                            <p className="mt-2 text-xs font-semibold text-slate-700">
                                                {formatDate(
                                                    user.last_login_at,
                                                )}
                                            </p>

                                        </div>

                                        <div className="rounded-lg border border-slate-100 bg-slate-50/70 p-4">

                                            <div className="flex items-center gap-2 text-slate-400">

                                                <KeyRound className="h-3.5 w-3.5" />

                                                <span className="text-[10px] font-semibold uppercase tracking-[0.07em]">
                                                    Password Changed
                                                </span>

                                            </div>

                                            <p className="mt-2 text-xs font-semibold text-slate-700">
                                                {formatDate(
                                                    user.password_changed_at,
                                                )}
                                            </p>

                                        </div>

                                        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4">

                                            <div className="flex items-center gap-2 text-emerald-600">

                                                <ShieldCheck className="h-3.5 w-3.5" />

                                                <span className="text-[10px] font-semibold uppercase tracking-[0.07em]">
                                                    Security Status
                                                </span>

                                            </div>

                                            <p className="mt-2 text-xs font-semibold text-emerald-800">
                                                Account protected
                                            </p>

                                        </div>

                                    </div>

                                </section>

                                {/* =================================================
                                    AUDIT TRAIL
                                ================================================== */}

                                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">

                                    <div className="border-b border-slate-100 px-5 py-4">

                                        <SectionHeading
                                            icon={Activity}
                                            title="Audit Trail"
                                            description="Administrative activity and account changes for this user."
                                            action={
                                                <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-500 ring-1 ring-slate-200">
                                                    {
                                                        auditLogs.length
                                                    }{' '}
                                                    {auditLogs.length ===
                                                    1
                                                        ? 'Event'
                                                        : 'Events'}
                                                </span>
                                            }
                                        />

                                    </div>

                                    <div className="p-5">

                                        {auditLogs.length ===
                                        0 ? (

                                            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center">

                                                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-300 ring-1 ring-slate-200">
                                                    <Activity className="h-4 w-4" />
                                                </div>

                                                <p className="mt-3 text-xs font-semibold text-slate-600">
                                                    No audit activity recorded
                                                </p>

                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    Changes and administrative
                                                    actions will appear here.
                                                </p>

                                            </div>

                                        ) : (

                                            <div className="relative">

                                                {/* Timeline */}

                                                <div className="absolute bottom-5 left-[15px] top-5 w-px bg-slate-200" />

                                                <div className="space-y-5">

                                                    {auditLogs.map(
                                                        (
                                                            audit,
                                                        ) => (

                                                            <div
                                                                key={
                                                                    audit.id
                                                                }
                                                                className="relative pl-9"
                                                            >

                                                                <div className="absolute left-0 top-4 flex h-8 w-8 items-center justify-center rounded-full border-4 border-white bg-[#173B67] shadow-sm ring-1 ring-slate-200">

                                                                    <Activity className="h-3 w-3 text-white" />

                                                                </div>

                                                                <div className="rounded-lg border border-slate-100 bg-slate-50/50 p-4">

                                                                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">

                                                                        <div className="min-w-0">

                                                                            <div className="flex flex-wrap items-center gap-2">

                                                                                <span
                                                                                    className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-semibold ${getAuditActionClass(
                                                                                        audit.action,
                                                                                    )}`}
                                                                                >
                                                                                    {
                                                                                        getAuditActionLabel(
                                                                                            audit.action,
                                                                                        )
                                                                                    }
                                                                                </span>

                                                                                <span className="text-[10px] text-slate-400">
                                                                                    {formatDate(
                                                                                        audit.created_at,
                                                                                    )}
                                                                                </span>

                                                                            </div>

                                                                            <p className="mt-2 text-xs font-medium leading-5 text-slate-700">
                                                                                {
                                                                                    audit.description
                                                                                }
                                                                            </p>

                                                                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-400">

                                                                                <span>
                                                                                    Performed by:{' '}
                                                                                    <strong className="font-semibold text-slate-600">
                                                                                        {getAuditActorName(
                                                                                            audit,
                                                                                        )}
                                                                                    </strong>
                                                                                </span>

                                                                                {audit.actor
                                                                                    ?.username && (
                                                                                    <span>
                                                                                        Username:{' '}
                                                                                        <strong className="font-medium text-slate-600">
                                                                                            {
                                                                                                audit
                                                                                                    .actor
                                                                                                    .username
                                                                                            }
                                                                                        </strong>
                                                                                    </span>
                                                                                )}

                                                                                {audit.ip_address && (
                                                                                    <span>
                                                                                        IP:{' '}
                                                                                        <strong className="font-medium text-slate-600">
                                                                                            {
                                                                                                audit.ip_address
                                                                                            }
                                                                                        </strong>
                                                                                    </span>
                                                                                )}

                                                                            </div>

                                                                        </div>

                                                                        {audit.changes &&
                                                                            Object.keys(
                                                                                audit.changes,
                                                                            ).length >
                                                                                0 && (

                                                                                <div className="w-full lg:max-w-md">

                                                                                    <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                                                                        Changes
                                                                                    </p>

                                                                                    <div className="space-y-1.5">

                                                                                        {Object.entries(
                                                                                            audit.changes,
                                                                                        ).map(
                                                                                            ([
                                                                                                field,
                                                                                                change,
                                                                                            ]) => (

                                                                                                <div
                                                                                                    key={
                                                                                                        field
                                                                                                    }
                                                                                                    className="rounded-md border border-slate-200 bg-white px-3 py-2"
                                                                                                >

                                                                                                    <p className="text-[10px] font-semibold text-slate-600">
                                                                                                        {formatAuditField(
                                                                                                            field,
                                                                                                        )}
                                                                                                    </p>

                                                                                                    {change.changed ? (

                                                                                                        <p className="mt-1 text-[10px] text-slate-500">
                                                                                                            Value changed
                                                                                                        </p>

                                                                                                    ) : (

                                                                                                        <div className="mt-2 grid gap-2 sm:grid-cols-2">

                                                                                                            <div className="min-w-0">

                                                                                                                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                                                                                                    Before
                                                                                                                </span>

                                                                                                                <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                                                                                                    {formatAuditValue(
                                                                                                                        change.old,
                                                                                                                    )}
                                                                                                                </p>

                                                                                                            </div>

                                                                                                            <div className="min-w-0">

                                                                                                                <span className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                                                                                                                    After
                                                                                                                </span>

                                                                                                                <p className="mt-0.5 truncate text-[10px] font-medium text-slate-700">
                                                                                                                    {formatAuditValue(
                                                                                                                        change.new,
                                                                                                                    )}
                                                                                                                </p>

                                                                                                            </div>

                                                                                                        </div>

                                                                                                    )}

                                                                                                </div>

                                                                                            ),
                                                                                        )}

                                                                                    </div>

                                                                                </div>

                                                                            )}

                                                                    </div>

                                                                </div>

                                                            </div>

                                                        ),
                                                    )}

                                                </div>

                                            </div>

                                        )}

                                    </div>

                                </section>

                            </div>

                        ) : (

                            /* =================================================
                               EDIT MODE
                            ================================================== */

                            <form
                                onSubmit={
                                    submitEdit
                                }
                                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_3px_16px_rgba(15,23,42,0.045)]"
                            >

                                {/* Edit Header */}

                                <div className="border-b border-slate-100 px-5 py-5 sm:px-6">

                                    <div className="flex items-start justify-between gap-4">

                                        <SectionHeading
                                            icon={Edit3}
                                            title="Edit User Account"
                                            description="Update employee information, organizational placement, and system access."
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setEditing(
                                                    false,
                                                )
                                            }
                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                            aria-label="Close edit mode"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>

                                    </div>

                                </div>

                                <div className="space-y-8 p-5 sm:p-6">

                                    {/* Account */}

                                    <div>

                                        <div className="mb-4 border-b border-slate-100 pb-3">

                                            <div className="flex items-center gap-2">

                                                <CircleUserRound className="h-4 w-4 text-[#173B67]" />

                                                <h3 className="text-xs font-bold text-slate-900">
                                                    Account Information
                                                </h3>

                                            </div>

                                            <p className="mt-1 text-[11px] text-slate-500">
                                                Login credentials and employee identification.
                                            </p>

                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">

                                            <InputField
                                                label="Username"
                                                required
                                                value={
                                                    form
                                                        .data
                                                        .username
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'username',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.username
                                                }
                                            />

                                            <InputField
                                                label="Employee Number"
                                                value={
                                                    form
                                                        .data
                                                        .employee_number
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'employee_number',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.employee_number
                                                }
                                            />

                                        </div>

                                    </div>

                                    {/* Personal */}

                                    <div>

                                        <div className="mb-4 border-b border-slate-100 pb-3">

                                            <div className="flex items-center gap-2">

                                                <UserRound className="h-4 w-4 text-[#173B67]" />

                                                <h3 className="text-xs font-bold text-slate-900">
                                                    Personal Information
                                                </h3>

                                            </div>

                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-3">

                                            <InputField
                                                label="First Name"
                                                required
                                                value={
                                                    form
                                                        .data
                                                        .first_name
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'first_name',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.first_name
                                                }
                                            />

                                            <InputField
                                                label="Middle Name"
                                                value={
                                                    form
                                                        .data
                                                        .middle_name
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'middle_name',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.middle_name
                                                }
                                            />

                                            <InputField
                                                label="Last Name"
                                                required
                                                value={
                                                    form
                                                        .data
                                                        .last_name
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'last_name',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.last_name
                                                }
                                            />

                                            <div className="sm:col-span-3">

                                                <InputField
                                                    label="Display Name"
                                                    required
                                                    value={
                                                        form
                                                            .data
                                                            .name
                                                    }
                                                    onChange={(
                                                        value,
                                                    ) =>
                                                        form.setData(
                                                            'name',
                                                            value,
                                                        )
                                                    }
                                                    error={
                                                        errors.name
                                                    }
                                                />

                                            </div>

                                        </div>

                                    </div>

                                    {/* Contact */}

                                    <div>

                                        <div className="mb-4 border-b border-slate-100 pb-3">

                                            <div className="flex items-center gap-2">

                                                <Mail className="h-4 w-4 text-[#173B67]" />

                                                <h3 className="text-xs font-bold text-slate-900">
                                                    Contact Information
                                                </h3>

                                            </div>

                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">

                                            <InputField
                                                label="Email Address"
                                                type="email"
                                                value={
                                                    form
                                                        .data
                                                        .email
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'email',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.email
                                                }
                                            />

                                            <InputField
                                                label="Contact Number"
                                                value={
                                                    form
                                                        .data
                                                        .contact_number
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'contact_number',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.contact_number
                                                }
                                            />

                                        </div>

                                    </div>

                                    {/* Organization */}

                                    <div>

                                        <div className="mb-4 border-b border-slate-100 pb-3">

                                            <div className="flex items-center gap-2">

                                                <Building2 className="h-4 w-4 text-[#173B67]" />

                                                <h3 className="text-xs font-bold text-slate-900">
                                                    Organization & Access
                                                </h3>

                                            </div>

                                            <p className="mt-1 text-[11px] text-slate-500">
                                                Assign the employee to the appropriate organizational unit, position, and system role.
                                            </p>

                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">

                                            <SelectField
                                                label="Organizational Unit"
                                                required
                                                value={
                                                    form
                                                        .data
                                                        .organizational_unit_id
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'organizational_unit_id',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.organizational_unit_id
                                                }
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select organizational unit',
                                                    },
                                                    ...organizationalUnits.map(
                                                        (
                                                            unit,
                                                        ) => ({
                                                            value: String(
                                                                unit.id,
                                                            ),
                                                            label: `${unit.code} — ${unit.name}`,
                                                        }),
                                                    ),
                                                ]}
                                            />

                                            <SelectField
                                                label="Position"
                                                required
                                                value={
                                                    form
                                                        .data
                                                        .position_id
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'position_id',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.position_id
                                                }
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'Select position',
                                                    },
                                                    ...positions.map(
                                                        (
                                                            position,
                                                        ) => ({
                                                            value: String(
                                                                position.id,
                                                            ),
                                                            label: position.name,
                                                        }),
                                                    ),
                                                ]}
                                            />

                                            <SelectField
                                                label="System Role"
                                                value={
                                                    form
                                                        .data
                                                        .role
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'role',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.role
                                                }
                                                options={[
                                                    {
                                                        value: '',
                                                        label: 'No role',
                                                    },
                                                    ...roles.map(
                                                        (
                                                            role,
                                                        ) => ({
                                                            value: role.name,
                                                            label: role.name,
                                                        }),
                                                    ),
                                                ]}
                                            />

                                            <SelectField
                                                label="Account Status"
                                                required
                                                value={
                                                    form
                                                        .data
                                                        .account_status
                                                }
                                                onChange={(
                                                    value,
                                                ) =>
                                                    form.setData(
                                                        'account_status',
                                                        value,
                                                    )
                                                }
                                                error={
                                                    errors.account_status
                                                }
                                                options={[
                                                    {
                                                        value: 'active',
                                                        label: 'Active',
                                                    },
                                                    {
                                                        value: 'inactive',
                                                        label: 'Inactive',
                                                    },
                                                    {
                                                        value: 'locked',
                                                        label: 'Locked',
                                                    },
                                                    {
                                                        value: 'suspended',
                                                        label: 'Suspended',
                                                    },
                                                ]}
                                            />

                                        </div>

                                    </div>

                                </div>

                                {/* Edit Footer */}

                                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setEditing(
                                                false,
                                            )
                                        }
                                        className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            form.processing
                                        }
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-[#173B67] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123052] disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        {form.processing ? (

                                            <>
                                                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                                Saving...
                                            </>

                                        ) : (

                                            <>
                                                <Save className="h-3.5 w-3.5" />

                                                Save Changes
                                            </>

                                        )}

                                    </button>

                                </div>

                            </form>

                        )}

                    </div>

                </div>

            </div>

            {/* =============================================================
                RESET PASSWORD MODAL
            ============================================================= */}

            {showResetModal && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]">

                    <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.20)]">

                        {/* Modal Header */}

                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">

                            <div className="flex items-start gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                                    <KeyRound className="h-4 w-4" />
                                </div>

                                <div>

                                    <h2 className="text-sm font-semibold text-slate-900">
                                        Reset Password
                                    </h2>

                                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                        Reset the password for{' '}
                                        <span className="font-semibold text-slate-700">
                                            {
                                                displayName
                                            }
                                        </span>
                                        .
                                    </p>

                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={
                                    closeResetModal
                                }
                                disabled={
                                    form.processing
                                }
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                            >
                                <X className="h-4 w-4" />
                            </button>

                        </div>

                        {/* Modal Body */}

                        <div className="p-5">

                            {!temporaryPassword ? (

                                <div className="space-y-4">

                                    <div className="rounded-lg border border-amber-200 bg-amber-50/70 p-4">

                                        <div className="flex gap-3">

                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-amber-700 ring-1 ring-amber-100">
                                                <ShieldCheck className="h-4 w-4" />
                                            </div>

                                            <div>

                                                <p className="text-xs font-semibold text-amber-900">
                                                    Temporary password
                                                </p>

                                                <p className="mt-1 text-[11px] leading-5 text-amber-800/80">
                                                    A secure temporary password will be generated and assigned to this account.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">

                                        <p className="text-[11px] leading-5 text-slate-500">
                                            The employee should change the temporary password after signing in.
                                        </p>

                                    </div>

                                </div>

                            ) : (

                                <div className="space-y-4">

                                    <div className="rounded-lg border border-emerald-200 bg-emerald-50/70 p-4">

                                        <div className="flex gap-3">

                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-white text-emerald-700 ring-1 ring-emerald-100">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>

                                            <div>

                                                <p className="text-xs font-semibold text-emerald-900">
                                                    Password reset successfully
                                                </p>

                                                <p className="mt-1 text-[11px] leading-5 text-emerald-800/80">
                                                    Provide the temporary password to the employee through your approved secure process.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <div>

                                        <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                                            Temporary Password
                                        </label>

                                        <div className="flex gap-2">

                                            <div className="flex min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">

                                                <input
                                                    type={
                                                        showTemporaryPassword
                                                            ? 'text'
                                                            : 'password'
                                                    }
                                                    readOnly
                                                    value={
                                                        temporaryPassword
                                                    }
                                                    className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-sm font-semibold tracking-wider text-slate-800 outline-none"
                                                />

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setShowTemporaryPassword(
                                                            (
                                                                value,
                                                            ) =>
                                                                !value,
                                                        )
                                                    }
                                                    className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700"
                                                >
                                                    {showTemporaryPassword ? (
                                                        <EyeOff className="h-4 w-4" />
                                                    ) : (
                                                        <Eye className="h-4 w-4" />
                                                    )}
                                                </button>

                                            </div>

                                            <button
                                                type="button"
                                                onClick={
                                                    copyTemporaryPassword
                                                }
                                                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                            >

                                                {copiedPassword ? (

                                                    <>
                                                        <Check className="h-3.5 w-3.5 text-emerald-600" />

                                                        Copied
                                                    </>

                                                ) : (

                                                    <>
                                                        <Copy className="h-3.5 w-3.5" />

                                                        Copy
                                                    </>

                                                )}

                                            </button>

                                        </div>

                                        <p className="mt-2 text-[10px] leading-4 text-slate-400">
                                            This password is displayed only for this reset operation. Store or communicate it according to your organization's security procedures.
                                        </p>

                                    </div>

                                </div>

                            )}

                        </div>

                        {/* Modal Footer */}

                        <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">

                            {!temporaryPassword ? (

                                <>
                                    <button
                                        type="button"
                                        onClick={
                                            closeResetModal
                                        }
                                        disabled={
                                            form.processing
                                        }
                                        className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="button"
                                        onClick={
                                            resetPassword
                                        }
                                        disabled={
                                            form.processing
                                        }
                                        className="inline-flex h-9 items-center rounded-lg bg-[#173B67] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123052] disabled:cursor-not-allowed disabled:opacity-60"
                                    >

                                        {form.processing ? (

                                            <>
                                                <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                                Resetting...
                                            </>

                                        ) : (

                                            <>
                                                <KeyRound className="mr-2 h-3.5 w-3.5" />

                                                Reset Password
                                            </>

                                        )}

                                    </button>
                                </>

                            ) : (

                                <button
                                    type="button"
                                    onClick={
                                        closeResetModal
                                    }
                                    className="h-9 rounded-lg bg-[#173B67] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123052]"
                                >
                                    Done
                                </button>

                            )}

                        </div>

                    </div>

                </div>

            )}

        </>
    );
}