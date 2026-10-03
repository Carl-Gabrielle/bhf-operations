import type { FormEvent } from 'react';
import {
    Building2,
    CircleUserRound,
    Edit3,
    Mail,
    Save,
    UserRound,
    X,
} from 'lucide-react';

import type {
    OrganizationalUnit,
    Position,
    Role,
    UserFormData,
} from '@/types/user';

import {
    InputField,
    SectionHeading,
    SelectField,
} from '@/components/admin/UserPrimitives';

type Props = {
    form: any;
    errors: Record<string, string | undefined>;
    organizationalUnits: OrganizationalUnit[];
    positions: Position[];
    roles: Role[];
    onSubmit: (event: FormEvent) => void;
    onCancel: () => void;
};

export default function UserEditForm({
    form,
    errors,
    organizationalUnits,
    positions,
    roles,
    onSubmit,
    onCancel,
}: Props) {
    return (
        <form
            onSubmit={onSubmit}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_3px_16px_rgba(15,23,42,0.045)]"
        >
            <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                    <SectionHeading
                        icon={Edit3}
                        title="Edit User Account"
                        description="Update employee information, organizational placement, and system access."
                    />

                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                        aria-label="Close edit mode"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="space-y-8 p-5 sm:p-6">
                <section>
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
                            value={form.data.username}
                            onChange={(value) => form.setData('username', value)}
                            error={errors.username}
                        />
                        <InputField
                            label="Employee Number"
                            value={form.data.employee_number}
                            onChange={(value) =>
                                form.setData('employee_number', value)
                            }
                            error={errors.employee_number}
                        />
                    </div>
                </section>

                <section>
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
                            value={form.data.first_name}
                            onChange={(value) =>
                                form.setData('first_name', value)
                            }
                            error={errors.first_name}
                        />
                        <InputField
                            label="Middle Name"
                            value={form.data.middle_name}
                            onChange={(value) =>
                                form.setData('middle_name', value)
                            }
                            error={errors.middle_name}
                        />
                        <InputField
                            label="Last Name"
                            required
                            value={form.data.last_name}
                            onChange={(value) =>
                                form.setData('last_name', value)
                            }
                            error={errors.last_name}
                        />
                        <div className="sm:col-span-3">
                            <InputField
                                label="Display Name"
                                required
                                value={form.data.name}
                                onChange={(value) =>
                                    form.setData('name', value)
                                }
                                error={errors.name}
                            />
                        </div>
                    </div>
                </section>

                <section>
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
                            value={form.data.email}
                            onChange={(value) =>
                                form.setData('email', value)
                            }
                            error={errors.email}
                        />
                        <InputField
                            label="Contact Number"
                            value={form.data.contact_number}
                            onChange={(value) =>
                                form.setData('contact_number', value)
                            }
                            error={errors.contact_number}
                        />
                    </div>
                </section>

                <section>
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
                            value={form.data.organizational_unit_id}
                            onChange={(value) =>
                                form.setData(
                                    'organizational_unit_id',
                                    value,
                                )
                            }
                            error={errors.organizational_unit_id}
                            options={[
                                {
                                    value: '',
                                    label: 'Select organizational unit',
                                },
                                ...organizationalUnits.map((unit) => ({
                                    value: String(unit.id),
                                    label: `${unit.code} — ${unit.name}`,
                                })),
                            ]}
                        />

                        <SelectField
                            label="Position"
                            required
                            value={form.data.position_id}
                            onChange={(value) =>
                                form.setData('position_id', value)
                            }
                            error={errors.position_id}
                            options={[
                                {
                                    value: '',
                                    label: 'Select position',
                                },
                                ...positions.map((position) => ({
                                    value: String(position.id),
                                    label: position.name,
                                })),
                            ]}
                        />

                        <SelectField
                            label="System Role"
                            value={form.data.role}
                            onChange={(value) =>
                                form.setData('role', value)
                            }
                            error={errors.role}
                            options={[
                                {
                                    value: '',
                                    label: 'No role',
                                },
                                ...roles.map((role) => ({
                                    value: role.name,
                                    label: role.name,
                                })),
                            ]}
                        />

                        <SelectField
                            label="Account Status"
                            required
                            value={form.data.account_status}
                            onChange={(value) =>
                                form.setData('account_status', value)
                            }
                            error={errors.account_status}
                            options={[
                                { value: 'active', label: 'Active' },
                                { value: 'inactive', label: 'Inactive' },
                                { value: 'locked', label: 'Locked' },
                                { value: 'suspended', label: 'Suspended' },
                            ]}
                        />
                    </div>
                </section>
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-end sm:px-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-800"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={form.processing}
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
    );
}
