import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
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

type Props = {
    organizationalUnits: OrganizationalUnit[];
    positions: Position[];
    roles: Role[];
};

type UserForm = {
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

export default function Create({
    organizationalUnits,
    positions,
    roles,
}: Props) {
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

    const submit = (event: React.FormEvent) => {
        event.preventDefault();

        post('/admin/users');
    };

    return (
        <>
            <Head title="Add User" />

            <div className="min-h-screen bg-[#f7f8fa] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-6xl">

                    {/* ================================================== */}
                    {/* HEADER */}
                    {/* ================================================== */}

                    <div className="mb-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                            <div>
                                <div className="mb-2 flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#9fbe3c]" />

                                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/40">
                                        User Management
                                    </span>
                                </div>

                                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[#16170f]">
                                    Add User
                                </h1>

                                <p className="mt-2 max-w-xl text-sm leading-6 text-black/45">
                                    Create a new user account and assign their
                                    organizational information, role, and access
                                    credentials.
                                </p>
                            </div>

                            <Link
                                href="/admin/users"
                                className="
                                    inline-flex
                                    h-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-black/[0.08]
                                    bg-white
                                    px-4
                                    text-sm
                                    font-medium
                                    text-black/65
                                    shadow-sm
                                    transition
                                    hover:bg-black/[0.025]
                                "
                            >
                                ← Back to Users
                            </Link>
                        </div>
                    </div>

                    {/* ================================================== */}
                    {/* FORM */}
                    {/* ================================================== */}

                    <form
                        onSubmit={submit}
                        className="space-y-6"
                    >

                        {/* ================================================== */}
                        {/* ACCOUNT INFORMATION */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(40,50,20,0.025)]">

                            <SectionHeader
                                number="01"
                                title="Account Information"
                                description="Basic credentials used to identify the account."
                            />

                            <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-3">

                                <Field
                                    label="Username"
                                    required
                                    error={errors.username}
                                >
                                    <input
                                value={data.username}
                                onChange={(e) => setData('username', e.target.value)}
                                maxLength={30}
                                placeholder="e.g. jdelacruz"
                                className={inputClass(!!errors.username)}
                            />
                                    </Field>

                                <Field
                                    label="Employee Number"
                                    error={errors.employee_number}
                                >
                                    <input
                                        value={data.employee_number}
                                        onChange={(e) =>
                                            setData(
                                                'employee_number',
                                                e.target.value
                                            )
                                        }
                                        placeholder="e.g. EMP-0001"
                                        className={inputClass(
                                            !!errors.employee_number
                                        )}
                                    />
                                </Field>

                                <Field
                                    label="Email Address"
                                    error={errors.email}
                                >
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) =>
                                            setData(
                                                'email',
                                                e.target.value
                                            )
                                        }
                                        placeholder="name@example.com"
                                        className={inputClass(
                                            !!errors.email
                                        )}
                                    />
                                </Field>

                            </div>
                        </section>

                        {/* ================================================== */}
                        {/* PERSONAL INFORMATION */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(40,50,20,0.025)]">

                            <SectionHeader
                                number="02"
                                title="Personal Information"
                                description="Personal details associated with the user account."
                            />

                            <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">

                                <Field
                                    label="First Name"
                                    error={errors.first_name}
                                >
                                    <input
                                        value={data.first_name}
                                        onChange={(e) =>
                                            setData(
                                                'first_name',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Juan"
                                        className={inputClass(
                                            !!errors.first_name
                                        )}
                                    />
                                </Field>

                                <Field
                                    label="Middle Name"
                                    error={errors.middle_name}
                                >
                                    <input
                                        value={data.middle_name}
                                        onChange={(e) =>
                                            setData(
                                                'middle_name',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Santos"
                                        className={inputClass(
                                            !!errors.middle_name
                                        )}
                                    />
                                </Field>

                                <Field
                                    label="Last Name"
                                    error={errors.last_name}
                                >
                                    <input
                                        value={data.last_name}
                                        onChange={(e) =>
                                            setData(
                                                'last_name',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Dela Cruz"
                                        className={inputClass(
                                            !!errors.last_name
                                        )}
                                    />
                                </Field>

                                <Field
                                    label="Contact Number"
                                    error={errors.contact_number}
                                >
                                    <input
                                        value={data.contact_number}
                                        onChange={(e) =>
                                            setData(
                                                'contact_number',
                                                e.target.value
                                            )
                                        }
                                        placeholder="09XXXXXXXXX"
                                        className={inputClass(
                                            !!errors.contact_number
                                        )}
                                    />
                                </Field>

                                <div className="sm:col-span-2 lg:col-span-4">
                                    <Field
                                        label="Full Name"
                                        required
                                        error={errors.name}
                                        hint="This is the name displayed throughout the system."
                                    >
                                        <input
                                            value={data.name}
                                            onChange={(e) =>
                                                setData(
                                                    'name',
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Juan Santos Dela Cruz"
                                            className={inputClass(
                                                !!errors.name
                                            )}
                                        />
                                    </Field>
                                </div>

                            </div>
                        </section>

                        {/* ================================================== */}
                        {/* ORGANIZATION */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(40,50,20,0.025)]">

                            <SectionHeader
                                number="03"
                                title="Organization & Access"
                                description="Assign the user's organizational unit, position, role, and account status."
                            />

                            <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">

                                <Field
                                    label="Organizational Unit"
                                    error={
                                        errors.organizational_unit_id
                                    }
                                >
                                    <select
                                        value={
                                            data.organizational_unit_id
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'organizational_unit_id',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass(
                                            !!errors.organizational_unit_id
                                        )}
                                    >
                                        <option value="">
                                            Select unit
                                        </option>

                                        {organizationalUnits.map(
                                            (unit) => (
                                                <option
                                                    key={unit.id}
                                                    value={unit.id}
                                                >
                                                    {unit.code} — {unit.name}
                                                </option>
                                            )
                                        )}
                                    </select>
                                </Field>

                                <Field
                                    label="Position"
                                    error={errors.position_id}
                                >
                                    <select
                                        value={data.position_id}
                                        onChange={(e) =>
                                            setData(
                                                'position_id',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass(
                                            !!errors.position_id
                                        )}
                                    >
                                        <option value="">
                                            Select position
                                        </option>

                                        {positions.map((position) => (
                                            <option
                                                key={position.id}
                                                value={position.id}
                                            >
                                                {position.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field
                                    label="Role"
                                    error={errors.role}
                                >
                                    <select
                                        value={data.role}
                                        onChange={(e) =>
                                            setData(
                                                'role',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass(
                                            !!errors.role
                                        )}
                                    >
                                        <option value="">
                                            Select role
                                        </option>

                                        {roles.map((role) => (
                                            <option
                                                key={role.id}
                                                value={role.name}
                                            >
                                                {role.name}
                                            </option>
                                        ))}
                                    </select>
                                </Field>

                                <Field
                                    label="Account Status"
                                    required
                                    error={errors.account_status}
                                >
                                    <select
                                        value={data.account_status}
                                        onChange={(e) =>
                                            setData(
                                                'account_status',
                                                e.target.value
                                            )
                                        }
                                        className={inputClass(
                                            !!errors.account_status
                                        )}
                                    >
                                        <option value="active">
                                            Active
                                        </option>

                                        <option value="inactive">
                                            Inactive
                                        </option>
                                    </select>
                                </Field>

                            </div>
                        </section>

                        {/* ================================================== */}
                        {/* PASSWORD */}
                        {/* ================================================== */}

                        <section className="overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_8px_30px_rgba(40,50,20,0.025)]">

                            <SectionHeader
                                number="04"
                                title="Account Password"
                                description="Set the initial password for this account."
                            />

                            <div className="grid gap-5 p-5 sm:grid-cols-2">

                                <Field
                                    label="Password"
                                    required
                                    error={errors.password}
                                    hint="Minimum 8 characters."
                                >
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) =>
                                            setData(
                                                'password',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Enter password"
                                        className={inputClass(
                                            !!errors.password
                                        )}
                                    />
                                </Field>

                                <Field
                                    label="Confirm Password"
                                    required
                                    error={
                                        errors.password_confirmation
                                    }
                                >
                                    <input
                                        type="password"
                                        value={
                                            data.password_confirmation
                                        }
                                        onChange={(e) =>
                                            setData(
                                                'password_confirmation',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Repeat password"
                                        className={inputClass(
                                            !!errors.password_confirmation
                                        )}
                                    />
                                </Field>

                            </div>
                        </section>

                        {/* ================================================== */}
                        {/* ACTIONS */}
                        {/* ================================================== */}

                        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">

                            <Link
                                href="/admin/users"
                                className="
                                    inline-flex
                                    h-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    border
                                    border-black/[0.08]
                                    bg-white
                                    px-6
                                    text-sm
                                    font-medium
                                    text-black/60
                                    transition
                                    hover:bg-black/[0.025]
                                "
                            >
                                Cancel
                            </Link>

                            <button
                                type="submit"
                                disabled={processing}
                                className="
                                    inline-flex
                                    h-11
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#16170f]
                                    px-7
                                    text-sm
                                    font-semibold
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-[#292a21]
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {processing
                                    ? 'Creating account...'
                                    : 'Create User'}
                            </button>

                        </div>

                    </form>
                </div>
            </div>
        </>
    );
}

/* ================================================== */
/* SECTION HEADER */
/* ================================================== */

function SectionHeader({
    number,
    title,
    description,
}: {
    number: string;
    title: string;
    description: string;
}) {
    return (
        <div className="border-b border-black/[0.055] px-5 py-5">
            <div className="flex items-start gap-4">
                <span
                    className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-[#edf2df]
                        text-[10px]
                        font-bold
                        text-[#70833e]
                    "
                >
                    {number}
                </span>

                <div>
                    <h2 className="text-sm font-semibold text-[#16170f]">
                        {title}
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-black/40">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ================================================== */
/* FIELD */
/* ================================================== */

function Field({
    label,
    required = false,
    error,
    hint,
    children,
}: {
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="min-w-0">
            <label className="mb-2 block">
                <span className="text-[11px] font-semibold text-black/65">
                    {label}

                    {required && (
                        <span className="ml-1 text-[#8ca63b]">
                            *
                        </span>
                    )}
                </span>

                {hint && (
                    <span className="mt-0.5 block text-[10px] text-black/35">
                        {hint}
                    </span>
                )}
            </label>

            {children}

            {error && (
                <p className="mt-1.5 text-[11px] font-medium text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}

/* ================================================== */
/* INPUT STYLE */
/* ================================================== */

function inputClass(hasError: boolean = false) {
    return `
        h-11
        w-full
        rounded-xl
        border
        ${hasError
            ? 'border-red-300 bg-red-50/30'
            : 'border-black/[0.08] bg-[#fafafa]'
        }
        px-3.5
        text-sm
        text-[#16170f]
        outline-none
        transition
        placeholder:text-black/25
        focus:border-[#9fbe3c]
        focus:bg-white
        focus:ring-2
        focus:ring-[#d8ff63]/20
    `;
}