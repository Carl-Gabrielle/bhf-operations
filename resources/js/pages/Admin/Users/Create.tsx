import { FormEvent, type ReactNode, useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Check,
    ChevronRight,
    Eye,
    EyeOff,
    KeyRound,
    LockKeyhole,
    Mail,
    ShieldCheck,
    UserRound,
    UsersRound,
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
    accent = 'blue',
    badge,
}: {
    icon: typeof UserRound;
    title: string;
    description: string;
    accent?: 'blue' | 'indigo' | 'emerald' | 'amber';
    badge?: string;
}) {
    const accentStyles = {
        blue: {
            wrapper: 'bg-blue-50 text-[#173B67] ring-blue-100',
            bar: 'bg-[#173B67]',
        },
        indigo: {
            wrapper: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
            bar: 'bg-indigo-600',
        },
        emerald: {
            wrapper: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
            bar: 'bg-emerald-600',
        },
        amber: {
            wrapper: 'bg-amber-50 text-amber-700 ring-amber-100',
            bar: 'bg-amber-500',
        },
    };

    const styles = accentStyles[accent];

    return (
        <div className="relative flex items-start gap-4">
            <div
                className={`absolute -left-6 top-0 h-full w-1 rounded-r-full sm:-left-7 ${styles.bar}`}
            />

            <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${styles.wrapper}`}
            >
                <Icon className="h-[19px] w-[19px]" strokeWidth={1.9} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-semibold tracking-tight text-slate-950">
                        {title}
                    </h2>

                    {badge && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
                            {badge}
                        </span>
                    )}
                </div>

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
            <div className="flex items-center justify-between gap-3">
                <label className="block text-[12px] font-semibold tracking-[0.01em] text-slate-700">
                    {label}

                    {required && (
                        <span className="ml-1 text-red-500">*</span>
                    )}
                </label>
            </div>

            {children}

            {hint && !error && (
                <p className="text-[11px] leading-4 text-slate-400">
                    {hint}
                </p>
            )}

            {error && (
                <div className="flex items-start gap-1.5">
                    <span className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-red-500" />

                    <p className="text-[11px] font-medium leading-4 text-red-600">
                        {error}
                    </p>
                </div>
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
        'h-11 w-full rounded-xl bg-white px-3.5 text-sm shadow-none',
        'border transition-all duration-150',
        'placeholder:text-slate-400',
        'focus-visible:ring-4',
        'focus-visible:ring-offset-0',
        hasError
            ? [
                  'border-red-300',
                  'focus-visible:border-red-500',
                  'focus-visible:ring-red-500/10',
              ].join(' ')
            : [
                  'border-slate-200',
                  'hover:border-slate-300',
                  'focus-visible:border-[#173B67]',
                  'focus-visible:ring-[#173B67]/10',
              ].join(' '),
    ].join(' ');

const selectClass = (hasError = false) =>
    [
        'h-11 w-full rounded-xl bg-white px-3.5 text-sm shadow-none',
        'border transition-all duration-150',
        'focus:ring-4 focus:ring-offset-0',
        hasError
            ? [
                  'border-red-300',
                  'focus:border-red-500',
                  'focus:ring-red-500/10',
              ].join(' ')
            : [
                  'border-slate-200',
                  'hover:border-slate-300',
                  'focus:border-[#173B67]',
                  'focus:ring-[#173B67]/10',
              ].join(' '),
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

    const [showPassword, setShowPassword] = useState(false);

    const [showPasswordConfirmation, setShowPasswordConfirmation] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    const updateName = (
        field: 'first_name' | 'middle_name' | 'last_name',
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

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <>
            <Head title="Add User" />

            <div className="min-h-full bg-[#f4f7fb] text-slate-900">
                <main className="mx-auto w-full max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">

                    {/* =====================================================
                        PAGE HEADER
                    ====================================================== */}

                    <header className="mb-6">

                        <Link
                            href="/admin/users"
                            className="group mb-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors hover:text-[#173B67]"
                        >
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white shadow-sm transition-all group-hover:border-blue-200 group-hover:bg-blue-50">
                                <ArrowLeft className="h-3.5 w-3.5" />
                            </span>

                            <span>
                                Back to User Management
                            </span>
                        </Link>

                        {/* Header Card */}

                        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.04)]">

                            {/* Corporate accent */}

                            <div className="absolute inset-y-0 left-0 w-1.5 bg-[#173B67]" />

                            <div className="relative px-5 py-5 sm:px-7 sm:py-6 lg:px-8">

                                <div className="min-w-0">

                                    {/* Breadcrumb */}

                                    <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium text-slate-400">

                                        <span>
                                            Administration
                                        </span>

                                        <ChevronRight className="h-3 w-3 text-slate-300" />

                                        <span>
                                            User Management
                                        </span>

                                        <ChevronRight className="h-3 w-3 text-slate-300" />

                                        <span className="text-[#173B67]">
                                            Add User
                                        </span>

                                    </div>

                                    {/* Title */}

                                    <div className="flex items-start gap-3.5">

                                        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#173B67] shadow-[0_5px_14px_rgba(23,59,103,0.18)] sm:flex">

                                            <UsersRound
                                                className="h-5 w-5 text-white"
                                                strokeWidth={1.8}
                                            />

                                        </div>

                                        <div>

                                            <div className="flex flex-wrap items-center gap-2">

                                                <h1 className="text-[23px] font-bold tracking-tight text-slate-950 sm:text-[26px]">
                                                    Create User Account
                                                </h1>

                                                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#173B67] ring-1 ring-blue-100">
                                                    Administration
                                                </span>

                                            </div>

                                            <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">
                                                Create an employee account
                                                and assign the appropriate
                                                organization, position,
                                                role, and system access.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

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

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.035)]">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6 lg:px-7">

                                <SectionHeader
                                    icon={UserRound}
                                    title="Account Information"
                                    description="Set the employee's login credentials and account identity."
                                    accent="blue"
                                    badge="Login"
                                />

                            </div>

                            <div className="grid grid-cols-1 gap-5 px-5 py-6 sm:px-6 lg:grid-cols-2 lg:gap-x-8 lg:px-7">

                                {/* Username */}

                                <Field
                                    label="Username"
                                    required
                                    error={errors.username}
                                    hint="Use a short, unique username for system login."
                                >
                                    <div className="relative">

                                        <UserRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                                            className={`${inputClass(
                                                !!errors.username,
                                            )} pl-10`}
                                        />

                                    </div>
                                </Field>

                                {/* Employee Number */}

                                <Field
                                    label="Employee Number"
                                    required
                                    error={errors.employee_number}
                                    hint="The employee's official identification number."
                                >
                                    <div className="relative">

                                        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                                            ID
                                        </span>

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
                                            className={`${inputClass(
                                                !!errors.employee_number,
                                            )} pl-10`}
                                        />

                                    </div>
                                </Field>

                            </div>

                        </section>

                        {/* =================================================
                            PERSONAL INFORMATION
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.035)]">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6 lg:px-7">

                                <SectionHeader
                                    icon={UserRound}
                                    title="Personal Information"
                                    description="Enter the employee's basic contact and identity details."
                                    accent="indigo"
                                    badge="Employee"
                                />

                            </div>

                            <div className="space-y-6 px-5 py-6 sm:px-6 lg:px-7">

                                {/* Legal Name */}

                                <div>

                                    <div className="mb-3 flex items-center gap-2">

                                        <div className="h-1 w-1 rounded-full bg-indigo-500" />

                                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                            Legal Name
                                        </p>

                                    </div>

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

                                </div>

                                {/* Contact */}

                                <div className="border-t border-slate-100 pt-6">

                                    <div className="mb-3 flex items-center gap-2">

                                        <div className="h-1 w-1 rounded-full bg-indigo-500" />

                                        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                                            Contact Details
                                        </p>

                                    </div>

                                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                                        {/* Email */}

                                        <Field
                                            label="Email Address"
                                            required
                                            error={errors.email}
                                            hint="Use the employee's official work email when available."
                                        >
                                            <div className="relative">

                                                <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                                                    )} pl-10`}
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

                            </div>

                        </section>

                        {/* =================================================
                            ORGANIZATION & ACCESS
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.035)]">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6 lg:px-7">

                                <SectionHeader
                                    icon={Building2}
                                    title="Organization & Access"
                                    description="Assign the employee to an organization, position, and system role."
                                    accent="emerald"
                                    badge="Access Control"
                                />

                            </div>

                            <div className="grid grid-cols-1 gap-5 px-5 py-6 sm:px-6 lg:grid-cols-2 lg:gap-x-8 lg:px-7">

                                {/* Organization */}

                                <Field
                                    label="Organization"
                                    required
                                    error={errors.organizational_unit_id}
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
                                            {positions.map(
                                                (position) => (
                                                    <SelectItem
                                                        key={
                                                            position.id
                                                        }
                                                        value={String(
                                                            position.id,
                                                        )}
                                                    >
                                                        {position.name}
                                                    </SelectItem>
                                                ),
                                            )}
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
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    Active
                                                </div>
                                            </SelectItem>

                                            <SelectItem value="inactive">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-slate-400" />
                                                    Inactive
                                                </div>
                                            </SelectItem>

                                            <SelectItem value="pending">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                                                    Pending
                                                </div>
                                            </SelectItem>

                                            <SelectItem value="suspended">
                                                <div className="flex items-center gap-2">
                                                    <span className="h-2 w-2 rounded-full bg-red-500" />
                                                    Suspended
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>

                            </div>

                            {/* Access Notice */}

                            <div className="mx-5 mb-6 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3.5 sm:mx-6 lg:mx-7">

                                <div className="flex gap-3">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>

                                    <div>

                                        <p className="text-xs font-semibold text-emerald-900">
                                            Access is role-based
                                        </p>

                                        <p className="mt-0.5 text-[11px] leading-5 text-emerald-800/70">
                                            Assign only the system role required
                                            for the employee's responsibilities.
                                            Permissions should follow the
                                            principle of least privilege.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </section>

                        {/* =================================================
                            PASSWORD & SECURITY
                        ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_3px_14px_rgba(15,23,42,0.035)]">

                            <div className="border-b border-slate-100 px-5 py-5 sm:px-6 lg:px-7">

                                <SectionHeader
                                    icon={LockKeyhole}
                                    title="Password & Security"
                                    description="Create the initial password for the employee account."
                                    accent="amber"
                                    badge="Security"
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

                                            <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                                                )} pl-10 pr-11`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPassword(
                                                        !showPassword,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
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

                                            <ShieldCheck className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

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
                                                )} pl-10 pr-11`}
                                            />

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowPasswordConfirmation(
                                                        !showPasswordConfirmation,
                                                    )
                                                }
                                                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
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

                                <div className="mt-6 overflow-hidden rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/80 to-slate-50">

                                    <div className="flex gap-3 px-4 py-4">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm ring-1 ring-amber-100">
                                            <LockKeyhole className="h-4 w-4" />
                                        </div>

                                        <div>

                                            <p className="text-xs font-semibold text-slate-800">
                                                Account security
                                            </p>

                                            <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                                The password should not be shared
                                                with other employees. The user
                                                should update their credentials
                                                according to your organization's
                                                security policy.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </section>

                        {/* =================================================
                            ACTION BAR
                        ================================================== */}

                        <div className="sticky bottom-3 z-20">

                            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.10)] backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:px-5">

                                <div className="flex items-start gap-3">

                                    <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 sm:flex">
                                        <ShieldCheck className="h-4 w-4" />
                                    </div>

                                    <div>

                                        <p className="text-xs font-semibold text-slate-700">
                                            Ready to create this account?
                                        </p>

                                        <p className="mt-0.5 text-[11px] text-slate-400">
                                            <span className="text-red-500">
                                                *
                                            </span>{' '}
                                            Required fields must be completed.
                                        </p>

                                    </div>

                                </div>

                                <div className="flex flex-col-reverse gap-2 sm:flex-row">

                                    <Button
                                        asChild
                                        type="button"
                                        variant="outline"
                                        className="h-10 rounded-xl border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-none transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        <Link href="/admin/users">
                                            Cancel
                                        </Link>
                                    </Button>

                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="h-10 rounded-xl bg-[#173B67] px-5 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(23,59,103,0.18)] transition-all hover:bg-[#123052] hover:shadow-[0_5px_15px_rgba(23,59,103,0.24)] disabled:cursor-not-allowed disabled:opacity-60"
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

                        </div>

                    </form>

                </main>
            </div>
        </>
    );
}