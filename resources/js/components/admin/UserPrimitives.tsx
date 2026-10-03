import type { ReactNode } from 'react';
import { UserRound } from 'lucide-react';

import {
    getStatusClass,
    getStatusDot,
    getStatusLabel,
} from '@/utils/user-status';

export function StatusBadge({
    status,
}: {
    status?: string | null;
}) {
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] ${getStatusClass(status)}`}
        >
            <span
                className={`h-1.5 w-1.5 rounded-full ${getStatusDot(status)}`}
            />
            {getStatusLabel(status)}
        </span>
    );
}

export function SectionHeading({
    icon: Icon,
    title,
    description,
    action,
}: {
    icon: typeof UserRound;
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#173B67] ring-1 ring-blue-100">
                    <Icon className="h-4 w-4" strokeWidth={1.8} />
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

export function DetailItem({
    label,
    value,
    icon,
    mono = false,
}: {
    label: string;
    value: string;
    icon?: ReactNode;
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
                        mono ? 'font-mono' : ''
                    }`}
                >
                    {value || '—'}
                </span>
            </div>
        </div>
    );
}

export function InputField({
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
    onChange: (value: string) => void;
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
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <input
                type={type}
                value={value}
                onChange={(event) => onChange(event.target.value)}
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

export function SelectField({
    label,
    value,
    onChange,
    options,
    error,
    required = false,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
    error?: string;
    required?: boolean;
}) {
    return (
        <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.07em] text-slate-500">
                {label}
                {required && (
                    <span className="ml-1 text-red-500">*</span>
                )}
            </label>

            <select
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-[#173B67] focus:ring-2 focus:ring-[#173B67]/10 ${
                    error
                        ? 'border-red-300'
                        : 'border-slate-200 hover:border-slate-300'
                }`}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="mt-1 text-[11px] font-medium text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
