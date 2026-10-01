import { FormEvent, type ReactNode, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Check,
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserRound,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

interface OrganizationalUnit {
    id: number;
    code: string;
    name: string;
}

interface Position {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
}

interface UserForm {
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
}

interface CreateUserProps {
    organizationalUnits: OrganizationalUnit[];
    positions: Position[];
    roles: Role[];
}

/*
|--------------------------------------------------------------------------
| Reusable Components
|--------------------------------------------------------------------------
*/

function SectionHeader({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof UserRound;
    title: string;
    description: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#173B67]/[0.07] text-[#173B67]">
                <Icon className="h-[18px] w-[18px]" />
            </div>

            <div className="min-w-0">
                <h2 className="text-[15px] font-semibold tracking-tight text-slate-900">
                    {title}
                </h2>

                <p className="mt-1 text-[13px] leading-5 text-slate-500">
                    {description}
                </p>
            </div>
        </div>
    );
}

function Field({
    label,
    error,
    required = false,
    hint,
    children,
}: {
    label: string;
    error?: string;
    required?: boolean;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="min-w-0 space-y-1.5">
            <label className="block text-[13px] font-medium text-slate-700">
                {label}

                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            {children}

            {hint && !error && (
                <p className="text-[11px] leading-4 text-slate-400">
                    {hint}
                </p>
            )}

            {error && (
                <p className="text-[11px] font-medium leading-4 text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| Shared Styles
|--------------------------------------------------------------------------
*/

const inputClass = (hasError = false) =>
    [
        'h-10 w-full rounded-lg bg-white px-3 text-sm shadow-none',
        'placeholder:text-slate-400',
        'transition-colors',
        'focus-visible:ring-2 focus-visible:ring-[#173B67]/10',
        hasError
            ? 'border-red-300 focus-visible:border-red-500'
            : 'border-slate-200 focus-visible:border-[#173B67]',
    ].join(' ');

const selectClass = (hasError = false) =>
    [
        'h-10 w-full rounded-lg bg-white px-3 text-sm shadow-none',
        'transition-colors',
        'focus:ring-2 focus:ring-[#173B67]/10',
        hasError
            ? 'border-red-300 focus:border-red-500'
            : 'border-slate-200 focus:border-[#173B67]',
    ].join(' ');

/*
|--------------------------------------------------------------------------
| Create User
|--------------------------------------------------------------------------
*/

export default function CreateUser({
    organizationalUnits,
    positions,
    roles,
}: CreateUserProps) {
    const { data, setData, post, processing, errors } =
        useForm<UserForm>({
            username: '',
            employee_number: '',

            name: '',
            first_name: '',
            middle_name: '',
            last_name: '',

            contact_number: '',
            email: '',

            organizational_unit_id: '',
            position_id: '',

            account_status: 'active',
            role: '',

            password: '',
            password_confirmation: '',
        });

    const [showPassword, setShowPassword] =
        useState(false);

    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const updateName = (
        field:
            | 'first_name'
            | 'middle_name'
            | 'last_name',
        value: string,
    ) => {
        const nextData = {
            ...data,
            [field]: value,
        };

        const fullName = [
            nextData.first_name,
            nextData.middle_name,
            nextData.last_name,
        ]
            .map((item) => item.trim())
            .filter(Boolean)
            .join(' ');

        setData(field, value);
        setData('name', fullName);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const submit = (event: FormEvent) => {
        event.preventDefault();

        post('/admin/users');
    };

    return (
        <>
            <Head title="Add User" />

            <div className="min-h-full bg-slate-50 text-slate-900">
                <main className="mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">

                    {/* =====================================================
                        PAGE HEADER
                    ====================================================== */}

                    <header className="mb-7">
                        <Link
                            href="/admin/users"
                            className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-[#173B67]"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />

                            Back to User Management
                        </Link>

                        <div>
                            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-400">
                                <span>Administration</span>

                                <span className="text-slate-300">
                                    /
                                </span>

                                <span>User Management</span>

                                <span className="text-slate-300">
                                    /
                                </span>

                                <span className="text-slate-500">
                                    Add User
                                </span>
                            </div>

                            <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[26px]">
                                Create User Account
                            </h1>

                            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                                Create an employee account and assign
                                the appropriate organization, position,
                                role, and system access.
                            </p>
                        </div>
                    </header>

                    {/* =====================================================
                        FORM
                    ====================================================== */}

                    <form
                        onSubmit={submit}
                        className="space-y-5"
                    >

                        {/* =================================================
                            ACCOUNT INFORMATION
                        ================================================== */}

                        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6 lg:px-7">
                                <SectionHeader
                                    icon={UserRound}
                                    title="Account Information"
                                    description="Set the employee's login credentials and account identity."
                                />
                            </div>

                            <div className="grid w-full grid-cols-1 gap-x-8 gap-y-5 px-5 py-6 sm:px-6 lg:grid-cols-2 lg:px-7">

                                {/* Username */}

                                <Field
                                    label="Username"
                                    required
                                    error={errors.username}
                                    hint="Use a short, unique username for system login."
                                >
                                    <Input
                                        type="text"
                                        name="username"
                                        autoComplete="off"
                                        maxLength={30}
                                        value={data.username}
                                        onChange={(event) =>
                                            setData(
                                                'username',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="e.g. jdelacruz"
                                        className={inputClass(
                                            !!errors.username,
                                        )}
                                    />
                                </Field>

                                {/* Employee Number */}

                                <Field
                                    label="Employee Number"
                                    required
                                    error={errors.employee_number}
                                    hint="The employee's official identification number."
                                >
                                    <Input
                                        type="text"
                                        name="employee_number"
                                        value={data.employee_number}
                                        onChange={(event) =>
                                            setData(
                                                'employee_number',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="e.g. EMP-2026-001"
                                        className={inputClass(
                                            !!errors.employee_number,
                                        )}
                                    />
                                </Field>
                            </div>
                        </section>

                        {/* =================================================
                            PERSONAL INFORMATION
                        ================================================== */}

                        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6 lg:px-7">
                                <SectionHeader
                                    icon={UserRound}
                                    title="Personal Information"
                                    description="Enter the employee's basic contact and identity details."
                                />
                            </div>

                            <div className="space-y-5 px-5 py-6 sm:px-6 lg:px-7">

                                {/* Name */}

                                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                                    <Field
                                        label="First Name"
                                        required
                                        error={errors.first_name}
                                    >
                                        <Input
                                            type="text"
                                            name="first_name"
                                            value={data.first_name}
                                            onChange={(event) =>
                                                updateName(
                                                    'first_name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="First name"
                                            className={inputClass(
                                                !!errors.first_name,
                                            )}
                                        />
                                    </Field>

                                    <Field
                                        label="Middle Name"
                                        error={errors.middle_name}
                                    >
                                        <Input
                                            type="text"
                                            name="middle_name"
                                            value={data.middle_name}
                                            onChange={(event) =>
                                                updateName(
                                                    'middle_name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Middle name"
                                            className={inputClass(
                                                !!errors.middle_name,
                                            )}
                                        />
                                    </Field>

                                    <Field
                                        label="Last Name"
                                        required
                                        error={errors.last_name}
                                    >
                                        <Input
                                            type="text"
                                            name="last_name"
                                            value={data.last_name}
                                            onChange={(event) =>
                                                updateName(
                                                    'last_name',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Last name"
                                            className={inputClass(
                                                !!errors.last_name,
                                            )}
                                        />
                                    </Field>
                                </div>

                                {/* Contact */}

                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                                    {/* Email */}

                                    <Field
                                        label="Email Address"
                                        required
                                        error={errors.email}
                                        hint="Use the employee's official work email when available."
                                    >
                                        <div className="relative">
                                            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                            <Input
                                                type="email"
                                                name="email"
                                                value={data.email}
                                                onChange={(event) =>
                                                    setData(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="employee@company.com"
                                                className={`${inputClass(
                                                    !!errors.email,
                                                )} pl-9`}
                                            />
                                        </div>
                                    </Field>

                                    {/* Contact Number */}

                                    <Field
                                        label="Contact Number"
                                        error={errors.contact_number}
                                    >
                                        <Input
                                            type="text"
                                            name="contact_number"
                                            value={data.contact_number}
                                            onChange={(event) =>
                                                setData(
                                                    'contact_number',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="09XX XXX XXXX"
                                            className={inputClass(
                                                !!errors.contact_number,
                                            )}
                                        />
                                    </Field>
                                </div>
                            </div>
                        </section>

                        {/* =================================================
                            ORGANIZATION & ACCESS
                        ================================================== */}

                        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

                            {/* Header */}

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6 lg:px-7">
                                <SectionHeader
                                    icon={Building2}
                                    title="Organization & Access"
                                    description="Assign the employee to an organization, position, and system role."
                                />
                            </div>

                            {/* Content */}

                            <div className="grid w-full grid-cols-1 gap-x-8 gap-y-6 px-5 py-7 sm:px-6 lg:grid-cols-2 lg:px-7">

                                {/* Organization */}

                                <Field
                                    label="Organization"
                                    required
                                    error={
                                        errors.organizational_unit_id
                                    }
                                >
                                    <Select
                                        value={
                                            data.organizational_unit_id
                                        }
                                        onValueChange={(value) =>
                                            setData(
                                                'organizational_unit_id',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            className={selectClass(
                                                !!errors.organizational_unit_id,
                                            )}
                                        >
                                            <SelectValue placeholder="Select organization" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {organizationalUnits.map(
                                                (organization) => (
                                                    <SelectItem
                                                        key={
                                                            organization.id
                                                        }
                                                        value={String(
                                                            organization.id,
                                                        )}
                                                    >
                                                        {organization.code} —{' '}
                                                        {
                                                            organization.name
                                                        }
                                                    </SelectItem>
                                                ),
                                            )}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                {/* Position */}

                                <Field
                                    label="Position"
                                    required
                                    error={errors.position_id}
                                >
                                    <Select
                                        value={data.position_id}
                                        onValueChange={(value) =>
                                            setData(
                                                'position_id',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            className={selectClass(
                                                !!errors.position_id,
                                            )}
                                        >
                                            <SelectValue placeholder="Select position" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {positions.map((position) => (
                                                <SelectItem
                                                    key={position.id}
                                                    value={String(
                                                        position.id,
                                                    )}
                                                >
                                                    {position.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                {/* System Role */}

                                <Field
                                    label="System Role"
                                    required
                                    error={errors.role}
                                    hint="The role determines what the employee can access in the system."
                                >
                                    <Select
                                        value={data.role}
                                        onValueChange={(value) =>
                                            setData('role', value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={selectClass(
                                                !!errors.role,
                                            )}
                                        >
                                            <SelectValue placeholder="Select system role" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            {roles.map((role) => (
                                                <SelectItem
                                                    key={role.id}
                                                    value={role.name}
                                                >
                                                    {role.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </Field>

                                {/* Account Status */}

                                <Field
                                    label="Account Status"
                                    required
                                    error={errors.account_status}
                                >
                                    <Select
                                        value={data.account_status}
                                        onValueChange={(value) =>
                                            setData(
                                                'account_status',
                                                value,
                                            )
                                        }
                                    >
                                        <SelectTrigger
                                            className={selectClass(
                                                !!errors.account_status,
                                            )}
                                        >
                                            <SelectValue placeholder="Select account status" />
                                        </SelectTrigger>

                                        <SelectContent>
                                            <SelectItem value="active">
                                                Active
                                            </SelectItem>

                                            <SelectItem value="inactive">
                                                Inactive
                                            </SelectItem>

                                            <SelectItem value="pending">
                                                Pending
                                            </SelectItem>

                                            <SelectItem value="suspended">
                                                Suspended
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            </div>
                        </section>

                        {/* =================================================
                            PASSWORD & SECURITY
                        ================================================== */}

                        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6 lg:px-7">
                                <SectionHeader
                                    icon={LockKeyhole}
                                    title="Password & Security"
                                    description="Create the initial password for the employee account."
                                />
                            </div>

                            <div className="px-5 py-6 sm:px-6 lg:px-7">

                                <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                                    {/* Password */}

                                    <Field
                                        label="Password"
                                        required
                                        error={errors.password}
                                        hint="Choose a strong password that is difficult to guess."
                                    >
                                        <div className="relative">
                                            <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                            <Input
                                                type={
                                                    showPassword
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                name="password"
                                                value={data.password}
                                                onChange={(event) =>
                                                    setData(
                                                        'password',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Enter password"
                                                autoComplete="new-password"
                                                className={`${inputClass(
                                                    !!errors.password,
                                                )} pl-9 pr-10`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                                                aria-label={
                                                    showPassword
                                                        ? 'Hide password'
                                                        : 'Show password'
                                                }
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </Field>

                                    {/* Confirm Password */}

                                    <Field
                                        label="Confirm Password"
                                        required
                                        error={
                                            errors.password_confirmation
                                        }
                                    >
                                        <div className="relative">
                                            <ShieldCheck className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                            <Input
                                                type={
                                                    showPasswordConfirmation
                                                        ? 'text'
                                                        : 'password'
                                                }
                                                name="password_confirmation"
                                                value={
                                                    data.password_confirmation
                                                }
                                                onChange={(event) =>
                                                    setData(
                                                        'password_confirmation',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Re-enter password"
                                                autoComplete="new-password"
                                                className={`${inputClass(
                                                    !!errors.password_confirmation,
                                                )} pl-9 pr-10`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPasswordConfirmation(
                                                        !showPasswordConfirmation,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700"
                                                aria-label={
                                                    showPasswordConfirmation
                                                        ? 'Hide password confirmation'
                                                        : 'Show password confirmation'
                                                }
                                            >
                                                {showPasswordConfirmation ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </Field>
                                </div>

                                {/* Security Notice */}

                                <div className="mt-6 flex gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3.5">
                                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#173B67]" />

                                    <div>
                                        <p className="text-xs font-medium text-slate-700">
                                            Account security
                                        </p>

                                        <p className="mt-0.5 text-[11px] leading-5 text-slate-500">
                                            The password should not be shared
                                            with other employees. The user
                                            should update their credentials
                                            according to your organization's
                                            security policy.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* =================================================
                            ACTION BAR
                        ================================================== */}

                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="text-red-500">*</span>

                                <span>
                                    Required fields
                                </span>
                            </div>

                            <div className="flex flex-col-reverse gap-2 sm:flex-row">

                                <Button
                                    asChild
                                    type="button"
                                    variant="outline"
                                    className="h-10 rounded-lg border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 shadow-none hover:bg-slate-50 hover:text-slate-900"
                                >
                                    <Link href="/admin/users">
                                        Cancel
                                    </Link>
                                </Button>

                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="h-10 rounded-lg bg-[#173B67] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#123052] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {processing ? (
                                        <>
                                            <span className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                                            Creating account...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="mr-2 h-4 w-4" />

                                            Create User
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </main>
            </div>
        </>
    );
}