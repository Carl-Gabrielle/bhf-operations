import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';

import {
    Head,
    Link,
    useForm,
    usePage,
} from '@inertiajs/react';

import {
    ArrowLeft,
    Building2,
    CalendarDays,
    Check,
    CheckCircle2,
    ChevronsUpDown,
    Clock3,
    Edit3,
    KeyRound,
    Mail,
    Phone,
    Shield,
    ShieldCheck,
    User as UserIcon,
    UserRound,
    UsersRound,
} from 'lucide-react';

import type {
    UserFormData,
    UserPageProps,
} from '@/types/user';

import {
    getDisplayName,
    getInitials,
    normalizeUser,
    safeString,
} from '@/utils/user';

import {
    formatDate,
    formatShortDate,
} from '@/utils/formatting';

import {
    getStatusDot,
} from '@/utils/user-status';

import {
    DetailItem,
    SectionHeading,
    StatusBadge,
} from '@/components/admin/UserPrimitives';

import UserAuditTrail from '@/components/admin/UserAuditTrail';
import UserEditForm from '@/components/admin/UserEditForm';
import UserResetPasswordModal from '@/components/admin/UserResetPasswordModal';

import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';


/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export default function ViewUser() {
    const page = usePage<UserPageProps>();

    /*
    |--------------------------------------------------------------------------
    | Normalize User
    |--------------------------------------------------------------------------
    */

    const user = useMemo(
        () => normalizeUser(page.props.user),
        [page.props.user],
    );


    /*
    |--------------------------------------------------------------------------
    | Page Data
    |--------------------------------------------------------------------------
    */

    const organizationalUnits =
        page.props.organizationalUnits ?? [];

    const positions =
        page.props.positions ?? [];

    const roles =
        page.props.roles ?? [];

    const managers =
        page.props.managers ?? [];

    const auditLogs =
        page.props.auditLogs ?? [];


    /*
    |--------------------------------------------------------------------------
    | UI State
    |--------------------------------------------------------------------------
    */

    const [
        editing,
        setEditing,
    ] = useState(false);

    const [
        showResetModal,
        setShowResetModal,
    ] = useState(false);

    const [localSuccess, setLocalSuccess] = useState<string | null>(null);
    const [localError, setLocalError] = useState<string | null>(null);
    const [flashVisible, setFlashVisible] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | Flash Messages
    |--------------------------------------------------------------------------
    |
    | The server flash is the primary source. Local messages are only used
    | as a fallback so the user still gets immediate feedback after an edit.
    |--------------------------------------------------------------------------
    */

    const successMessage =
        page.props.flash?.success || localSuccess;

    const errorMessage =
        page.props.flash?.error || localError;

    useEffect(() => {
        if (!successMessage && !errorMessage) {
            setFlashVisible(false);
            return;
        }

        setFlashVisible(true);

        const timer = window.setTimeout(() => {
            setFlashVisible(false);
        }, 4000);

        return () => window.clearTimeout(timer);
    }, [successMessage, errorMessage]);

    /*
    |--------------------------------------------------------------------------
    | Reporting Manager Selector
    |--------------------------------------------------------------------------
    */

    const [
        managerSelectorOpen,
        setManagerSelectorOpen,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | User Form
    |--------------------------------------------------------------------------
    */

    const form =
        useForm<UserFormData>({
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
                user.organizational_unit?.id
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

            /*
            |--------------------------------------------------------------------------
            | Reporting Manager / Head
            |--------------------------------------------------------------------------
            */

            reports_to_user_id:
                user.reports_to_user_id !==
                    null &&
                user.reports_to_user_id !==
                    undefined
                    ? String(
                          user.reports_to_user_id,
                      )
                    : user.reportsTo?.id
                      ? String(
                            user.reportsTo.id,
                        )
                      : '',

            account_status:
                safeString(
                    user.account_status,
                ),

            role:
                user.roles?.[0]?.name ??
                '',

            password: '',

            password_confirmation:
                '',
        });


    /*
    |--------------------------------------------------------------------------
    | Form Errors
    |--------------------------------------------------------------------------
    */

    const errors =
        form.errors as Record<
            string,
            string | undefined
        >;


    /*
    |--------------------------------------------------------------------------
    | Display Information
    |--------------------------------------------------------------------------
    */

    const displayName =
        getDisplayName(user);

    const initials =
        getInitials(user);


    /*
    |--------------------------------------------------------------------------
    | Current Reporting Manager
    |--------------------------------------------------------------------------
    |
    | Prefer the fully-loaded relationship.
    |
    | If reportsTo is not included in UserResource,
    | fallback to the managers collection using
    | reports_to_user_id.
    |
    |--------------------------------------------------------------------------
    */

    const currentManager = useMemo(() => {
        if (user.reportsTo) {
            return user.reportsTo;
        }

        if (
            user.reports_to_user_id ===
                null ||
            user.reports_to_user_id ===
                undefined
        ) {
            return null;
        }

        return (
            managers.find(
                (manager) =>
                    manager.id ===
                    user.reports_to_user_id,
            ) ?? null
        );
    }, [
        user.reportsTo,
        user.reports_to_user_id,
        managers,
    ]);


    /*
    |--------------------------------------------------------------------------
    | Selected Manager
    |--------------------------------------------------------------------------
    */

    const selectedManager =
        useMemo(() => {
            const managerId =
                form.data
                    .reports_to_user_id;

            if (!managerId) {
                return null;
            }

            return (
                managers.find(
                    (manager) =>
                        String(
                            manager.id,
                        ) === managerId,
                ) ?? null
            );
        }, [
            managers,
            form.data
                .reports_to_user_id,
        ]);


    /*
    |--------------------------------------------------------------------------
    | Manager Search Metadata
    |--------------------------------------------------------------------------
    |
    | The shadcn Command component performs the actual search. We expose
    | multiple searchable values through the item's value so administrators
    | can find a manager by name, employee number, position, or unit.
    |
    |--------------------------------------------------------------------------
    */

    const getManagerSearchValue = (
        manager: (typeof managers)[number],
    ): string => {
        return [
            safeString(manager.name),
            safeString(manager.employee_number),
            safeString(manager.position?.name),
            safeString(manager.organizational_unit?.name),
        ]
            .filter(Boolean)
            .join(' ');
    };


    /*
    |--------------------------------------------------------------------------
    | Manager Initials
    |--------------------------------------------------------------------------
    */

    const getManagerInitials = (
        name?: string | null,
    ): string => {
        const value =
            safeString(name).trim();

        if (!value) {
            return 'U';
        }

        const parts =
            value
                .split(/\s+/)
                .filter(Boolean);

        if (parts.length === 1) {
            return parts[0]
                .slice(0, 2)
                .toUpperCase();
        }

        return (
            parts[0].charAt(0) +
            parts[
                parts.length - 1
            ].charAt(0)
        ).toUpperCase();
    };


    /*
    |--------------------------------------------------------------------------
    | Submit Edit
    |--------------------------------------------------------------------------
    */

    const submitEdit = (
        event: FormEvent,
    ) => {
        event.preventDefault();

        if (form.processing) {
            return;
        }

        setLocalSuccess(null);
        setLocalError(null);
        setFlashVisible(false);

        form.put(
            `/admin/users/${user.id}`,
            {
                preserveScroll: true,

                onSuccess: () => {
                    setEditing(false);
                    setManagerSelectorOpen(false);
                    form.clearErrors();
                    setLocalSuccess('User account updated successfully.');
                    setFlashVisible(true);
                    setFlashVisible(true);
                },

                onError: () => {
                    setLocalError('Unable to update the user account. Please review the highlighted fields.');
                    setFlashVisible(true);
                    setFlashVisible(true);
                },
            },
        );
    };


    /*
    |--------------------------------------------------------------------------
    | Cancel Edit
    |--------------------------------------------------------------------------
    */

    const cancelEdit = () => {
        form.setData({
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
                user.organizational_unit?.id
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

            reports_to_user_id:
                user.reports_to_user_id !==
                    null &&
                user.reports_to_user_id !==
                    undefined
                    ? String(
                          user.reports_to_user_id,
                      )
                    : user.reportsTo?.id
                      ? String(
                            user.reportsTo.id,
                        )
                      : '',

            account_status:
                safeString(
                    user.account_status,
                ),

            role:
                user.roles?.[0]?.name ??
                '',

            password: '',

            password_confirmation:
                '',
        });

        form.clearErrors();

        setEditing(false);
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

                    {/* =========================================================
                        PAGE HEADER
                    ========================================================== */}

                    <header className="mb-5">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-3">

                                <Link
                                    href="/admin/users"
                                    className="group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:text-[#173B67]"
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
                                        className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3.5 text-xs font-semibold text-amber-800 transition hover:border-amber-300 hover:bg-amber-100"
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
                                        className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#173B67] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[#123052]"
                                    >
                                        <Edit3 className="h-3.5 w-3.5" />

                                        Edit User
                                    </button>

                                </div>
                            )}

                        </div>
                    </header>


                    {/* =========================================================
                        FLASH NOTIFICATION
                    ========================================================== */}

                    {flashVisible && (successMessage || errorMessage) && (
                        <div
                            className="fixed right-4 top-4 z-[100] w-[calc(100%-2rem)] max-w-sm sm:right-6 sm:top-6"
                            role={successMessage ? 'status' : 'alert'}
                            aria-live="polite"
                        >
                            {successMessage ? (
                                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-lg shadow-slate-900/10">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                        <CheckCircle2 className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold">Success</p>
                                        <p className="mt-0.5 text-xs text-emerald-700">{successMessage}</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg shadow-slate-900/10">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                                        !
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold">Unable to update</p>
                                        <p className="mt-0.5 text-xs text-red-700">{errorMessage}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}


                    {/* =========================================================
                        USER SUMMARY
                    ========================================================== */}

                    <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_16px_rgba(15,23,42,0.045)]">

                        <div className="absolute inset-y-0 left-0 w-1 bg-[#173B67]" />

                        <div className="px-5 py-6 sm:px-7">

                            <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

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
                                                {
                                                    displayName
                                                }
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
                                                ) || '—'}
                                            </span>

                                            <span className="hidden text-slate-300 sm:inline">
                                                •
                                            </span>

                                            <span>
                                                Employee No.{' '}
                                                <strong className="font-semibold text-slate-700">
                                                    {safeString(
                                                        user.employee_number,
                                                    ) || '—'}
                                                </strong>
                                            </span>

                                            <span className="hidden text-slate-300 sm:inline">
                                                •
                                            </span>

                                            <span>
                                                ID #{user.id}
                                            </span>

                                        </div>


                                        <div className="mt-3 flex flex-wrap gap-2">

                                            {user.position?.name && (
                                                <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
                                                    <UserRound className="h-3 w-3 text-slate-400" />

                                                    {
                                                        user.position
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


                                            {currentManager && (
                                                <span className="inline-flex items-center gap-1.5 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-[10px] font-semibold text-[#173B67]">
                                                    <UsersRound className="h-3 w-3" />

                                                    Reports to:{' '}

                                                    {
                                                        currentManager.name
                                                    }
                                                </span>
                                            )}

                                        </div>

                                    </div>

                                </div>


                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 xl:min-w-[520px]">

                                    {[
                                        {
                                            icon: Clock3,
                                            label: 'Last Login',
                                            value: formatDate(
                                                user.last_login_at,
                                            ),
                                        },
                                        {
                                            icon: KeyRound,
                                            label: 'Password',
                                            value: formatShortDate(
                                                user.password_changed_at,
                                            ),
                                        },
                                        {
                                            icon: CalendarDays,
                                            label: 'Created',
                                            value: formatShortDate(
                                                user.created_at,
                                            ),
                                        },
                                    ].map(
                                        (
                                            metric,
                                        ) => (
                                            <div
                                                key={
                                                    metric.label
                                                }
                                                className="rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3"
                                            >
                                                <div className="flex items-center gap-2">

                                                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white text-slate-500 ring-1 ring-slate-200">
                                                        <metric.icon className="h-3.5 w-3.5" />
                                                    </div>

                                                    <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                                        {
                                                            metric.label
                                                        }
                                                    </span>

                                                </div>

                                                <p className="mt-2 truncate text-[11px] font-semibold text-slate-700">
                                                    {
                                                        metric.value
                                                    }
                                                </p>
                                            </div>
                                        ),
                                    )}

                                </div>

                            </div>

                        </div>

                    </section>


                    {/* =========================================================
                        CONTENT
                    ========================================================== */}

                    <div className="mt-5">

                        {editing ? (

                            <div className="space-y-5">

                                {/* =================================================
                                    REPORTING STRUCTURE
                                ================================================== */}

                                <section className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">

                                    <div className="border-b border-blue-100 bg-blue-50/40 px-5 py-4">

                                        <div className="flex items-start gap-3">

                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-[#173B67]">
                                                <UsersRound className="h-[18px] w-[18px]" />
                                            </div>

                                            <div className="min-w-0">

                                                <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
                                                    Reporting Structure
                                                </h2>

                                                <p className="mt-1 text-[13px] leading-5 text-slate-500">
                                                    Assign the employee's direct manager or department head for leave approval routing.
                                                </p>

                                            </div>

                                        </div>

                                    </div>


                                    <div className="p-5">

                                        <div className="max-w-2xl">

                                            <label
                                                htmlFor="reports_to_user_id"
                                                className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500"
                                            >
                                                Reporting Manager / Head
                                            </label>


                                            <Popover
                                                open={
                                                    managerSelectorOpen
                                                }
                                                onOpenChange={
                                                    setManagerSelectorOpen
                                                }
                                            >
                                                <PopoverTrigger asChild>
                                                    <button
                                                        id="reports_to_user_id"
                                                        type="button"
                                                        role="combobox"
                                                        aria-expanded={
                                                            managerSelectorOpen
                                                        }
                                                        aria-controls="reporting-manager-list"
                                                        disabled={
                                                            form.processing
                                                        }
                                                        className={`group flex h-12 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left shadow-sm outline-none transition-all ${
                                                            errors.reports_to_user_id
                                                                ? 'border-red-300 ring-2 ring-red-500/10'
                                                                : managerSelectorOpen
                                                                  ? 'border-[#173B67] ring-2 ring-[#173B67]/10'
                                                                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                                                        } disabled:cursor-not-allowed disabled:bg-slate-50`}
                                                    >
                                                        {selectedManager ? (
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#173B67] text-[10px] font-bold text-white">
                                                                    {getManagerInitials(
                                                                        selectedManager.name,
                                                                    )}
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="truncate text-[13px] font-semibold text-slate-800">
                                                                        {
                                                                            selectedManager.name
                                                                        }
                                                                    </p>

                                                                    <p className="truncate text-[11px] text-slate-500">
                                                                        {selectedManager.position?.name ||
                                                                            'Manager / Head'}

                                                                        {selectedManager.organizational_unit?.name
                                                                            ? ` · ${selectedManager.organizational_unit.name}`
                                                                            : ''}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                                                                    <UsersRound className="h-3.5 w-3.5" />
                                                                </div>

                                                                <div className="min-w-0">
                                                                    <p className="text-[13px] font-medium text-slate-500">
                                                                        Select a reporting manager
                                                                    </p>

                                                                    <p className="text-[10px] text-slate-400">
                                                                        Search by name, position, or department
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <ChevronsUpDown className="ml-3 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-slate-600" />
                                                    </button>
                                                </PopoverTrigger>

                                                <PopoverContent
                                                    align="start"
                                                    sideOffset={6}
                                                    className="w-[var(--radix-popover-trigger-width)] min-w-[420px] overflow-hidden rounded-xl border border-slate-200 bg-white p-0 shadow-[0_12px_40px_rgba(15,23,42,0.12)]"
                                                >
                                                    <Command
                                                        id="reporting-manager-list"
                                                        className="bg-white"
                                                    >
                                                        <div className="border-b border-slate-100 p-2">
                                                            <CommandInput
                                                                placeholder="Search name, employee no., position, or department..."
                                                                className="h-10 text-xs"
                                                            />
                                                        </div>

                                                        <CommandList className="max-h-[320px]">
                                                            <CommandEmpty className="py-8 text-center">
                                                                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                                                                    <UsersRound className="h-4 w-4 text-slate-400" />
                                                                </div>

                                                                <p className="text-xs font-semibold text-slate-700">
                                                                    No manager found
                                                                </p>

                                                                <p className="mt-1 text-[11px] text-slate-400">
                                                                    Try another name, position, or department.
                                                                </p>
                                                            </CommandEmpty>

                                                            <CommandGroup
                                                                heading="Reporting Managers & Heads"
                                                                className="px-2 pb-2 pt-2"
                                                            >
                                                                <CommandItem
                                                                    value="no reporting manager"
                                                                    onSelect={() => {
                                                                        form.setData(
                                                                            'reports_to_user_id',
                                                                            '',
                                                                        );

                                                                        setManagerSelectorOpen(
                                                                            false,
                                                                        );
                                                                    }}
                                                                    className="mb-1 rounded-lg px-3 py-2.5"
                                                                >
                                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-slate-400">
                                                                        <UsersRound className="h-3.5 w-3.5" />
                                                                    </div>

                                                                    <div className="ml-3 min-w-0 flex-1">
                                                                        <p className="text-xs font-semibold text-slate-700">
                                                                            No reporting manager
                                                                        </p>

                                                                        <p className="text-[10px] text-slate-400">
                                                                            Remove the current reporting assignment
                                                                        </p>
                                                                    </div>

                                                                    <Check
                                                                        className={`ml-3 h-4 w-4 shrink-0 ${
                                                                            !form.data.reports_to_user_id
                                                                                ? 'opacity-100 text-[#173B67]'
                                                                                : 'opacity-0'
                                                                        }`}
                                                                    />
                                                                </CommandItem>

                                                                {managers.map(
                                                                    (
                                                                        manager,
                                                                    ) => {
                                                                        const managerId =
                                                                            String(
                                                                                manager.id,
                                                                            );

                                                                        const isSelected =
                                                                            form
                                                                                .data
                                                                                .reports_to_user_id ===
                                                                            managerId;

                                                                        const position =
                                                                            safeString(
                                                                                manager.position?.name,
                                                                            ) ||
                                                                            'Manager / Head';

                                                                        const unit =
                                                                            safeString(
                                                                                manager.organizational_unit?.name,
                                                                            );

                                                                        const employeeNumber =
                                                                            safeString(
                                                                                manager.employee_number,
                                                                            );

                                                                        return (
                                                                            <CommandItem
                                                                                key={
                                                                                    manager.id
                                                                                }
                                                                                value={getManagerSearchValue(
                                                                                    manager,
                                                                                )}
                                                                                onSelect={() => {
                                                                                    form.setData(
                                                                                        'reports_to_user_id',
                                                                                        managerId,
                                                                                    );

                                                                                    setManagerSelectorOpen(
                                                                                        false,
                                                                                    );
                                                                                }}
                                                                                className="rounded-lg px-3 py-2.5 data-[selected=true]:bg-slate-50"
                                                                            >
                                                                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#173B67] text-[10px] font-bold text-white">
                                                                                    {getManagerInitials(
                                                                                        manager.name,
                                                                                    )}
                                                                                </div>

                                                                                <div className="ml-3 min-w-0 flex-1">
                                                                                    <div className="flex min-w-0 items-center gap-2">
                                                                                        <p className="truncate text-xs font-semibold text-slate-800">
                                                                                            {
                                                                                                manager.name
                                                                                            }
                                                                                        </p>

                                                                                        {isSelected && (
                                                                                            <span className="shrink-0 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-700">
                                                                                                Selected
                                                                                            </span>
                                                                                        )}
                                                                                    </div>

                                                                                    <p className="mt-0.5 truncate text-[10px] text-slate-500">
                                                                                        {
                                                                                            position
                                                                                        }

                                                                                        {unit
                                                                                            ? ` · ${unit}`
                                                                                            : ''}
                                                                                    </p>

                                                                                    {employeeNumber && (
                                                                                        <p className="mt-0.5 truncate font-mono text-[9px] text-slate-400">
                                                                                            Employee No.{' '}
                                                                                            {
                                                                                                employeeNumber
                                                                                            }
                                                                                        </p>
                                                                                    )}
                                                                                </div>

                                                                                <Check
                                                                                    className={`ml-3 h-4 w-4 shrink-0 text-[#173B67] ${
                                                                                        isSelected
                                                                                            ? 'opacity-100'
                                                                                            : 'opacity-0'
                                                                                    }`}
                                                                                />
                                                                            </CommandItem>
                                                                        );
                                                                    },
                                                                )}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>


                                            {errors.reports_to_user_id && (
                                                <p className="mt-1.5 text-[11px] font-medium text-red-600">
                                                    {
                                                        errors.reports_to_user_id
                                                    }
                                                </p>
                                            )}


                                            {selectedManager ? (

                                                <div className="mt-3 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">

                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#173B67] text-xs font-bold text-white">
                                                        {getManagerInitials(
                                                            selectedManager.name,
                                                        )}
                                                    </div>


                                                    <div className="min-w-0">

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <p className="text-sm font-semibold text-slate-800">
                                                                {
                                                                    selectedManager.name
                                                                }
                                                            </p>

                                                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                                                                <CheckCircle2 className="h-3 w-3" />
                                                                Assigned
                                                            </span>

                                                        </div>


                                                        <p className="mt-0.5 text-xs text-slate-500">
                                                            {
                                                                selectedManager.position?.name ||
                                                                'Manager / Head'
                                                            }
                                                        </p>


                                                        {selectedManager.organizational_unit?.name && (
                                                            <p className="mt-0.5 text-[11px] text-slate-400">
                                                                {
                                                                    selectedManager
                                                                        .organizational_unit
                                                                        .name
                                                                }
                                                            </p>
                                                        )}

                                                    </div>

                                                </div>

                                            ) : (

                                                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">

                                                    <p className="text-xs font-semibold text-amber-800">
                                                        No reporting manager assigned
                                                    </p>

                                                    <p className="mt-1 text-[11px] leading-5 text-amber-700">
                                                        This employee currently has no manager/head configured for leave approval routing.
                                                    </p>

                                                </div>

                                            )}

                                        </div>

                                    </div>

                                </section>


                                {/* =================================================
                                    USER EDIT FORM
                                ================================================== */}

                                <UserEditForm
                                    form={form}
                                    errors={errors}
                                    organizationalUnits={
                                        organizationalUnits
                                    }
                                    positions={
                                        positions
                                    }
                                    roles={
                                        roles
                                    }
                                    onSubmit={
                                        submitEdit
                                    }
                                    onCancel={
                                        cancelEdit
                                    }
                                />

                            </div>

                        ) : (

                            <div className="space-y-5">

                                <div className="grid gap-5 lg:grid-cols-[1.45fr_1fr]">

                                    {/* =================================================
                                        PERSONAL INFORMATION
                                    ================================================== */}

                                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">

                                        <div className="border-b border-slate-100 px-5 py-4">

                                            <SectionHeading
                                                icon={
                                                    UserIcon
                                                }
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


                                    {/* =================================================
                                        ORGANIZATION & ACCESS
                                    ================================================== */}

                                    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">

                                        <div className="border-b border-slate-100 px-5 py-4">

                                            <SectionHeading
                                                icon={
                                                    Building2
                                                }
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
                                                        user.position?.name,
                                                    ) ||
                                                    '—'
                                                }
                                            />


                                            {/* =================================================
                                                REPORTING MANAGER
                                            ================================================== */}

                                            <div>

                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                    Reporting Manager / Head
                                                </p>


                                                {currentManager ? (

                                                    <div className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3">

                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#173B67] text-xs font-bold text-white">
                                                            {getManagerInitials(
                                                                currentManager.name,
                                                            )}
                                                        </div>


                                                        <div className="min-w-0 flex-1">

                                                            <div className="flex flex-wrap items-center gap-2">

                                                                <p className="truncate text-sm font-semibold text-slate-800">
                                                                    {
                                                                        currentManager.name
                                                                    }
                                                                </p>

                                                                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                                                                    <CheckCircle2 className="h-3 w-3" />
                                                                    Assigned
                                                                </span>

                                                            </div>


                                                            <p className="mt-0.5 text-[11px] text-slate-500">
                                                                {
                                                                    currentManager
                                                                        .position
                                                                        ?.name ||
                                                                    'Manager / Head'
                                                                }
                                                            </p>

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">

                                                        <p className="text-xs font-semibold text-amber-800">
                                                            No reporting manager assigned
                                                        </p>

                                                        <p className="mt-1 text-[11px] leading-5 text-amber-700">
                                                            This employee currently has no manager/head configured for leave approval routing.
                                                        </p>

                                                    </div>

                                                )}

                                            </div>


                                            {/* =================================================
                                                SYSTEM ROLE
                                            ================================================== */}

                                            <div>

                                                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                                                    System Role
                                                </p>


                                                {user.roles?.length ? (

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


                                            {/* =================================================
                                                ACCOUNT STATUS
                                            ================================================== */}

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
                                    ACCOUNT SECURITY
                                ================================================== */}

                                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.035)]">

                                    <div className="border-b border-slate-100 px-5 py-4">

                                        <SectionHeading
                                            icon={
                                                ShieldCheck
                                            }
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

                                <UserAuditTrail
                                    logs={
                                        auditLogs
                                    }
                                />

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* ================================================================
                RESET PASSWORD MODAL
            ================================================================= */}

            <UserResetPasswordModal
                open={
                    showResetModal
                }
                userId={
                    user.id
                }
                displayName={
                    displayName
                }
                form={
                    form
                }
                onClose={() =>
                    setShowResetModal(
                        false,
                    )
                }
            />
        </>
    );
}