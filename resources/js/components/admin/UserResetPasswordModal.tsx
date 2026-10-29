
import { useState } from 'react';
import {
    Check,
    CheckCircle2,
    Copy,
    Eye,
    EyeOff,
    KeyRound,
    ShieldCheck,
    X,
} from 'lucide-react';

import type { InertiaFormProps } from '@inertiajs/react';
import type { UserFormData } from '@/types/user';
import { generateTemporaryPassword } from '@/lib/password';

type Props = {
    open: boolean;
    userId: number;
    displayName: string;
    form: InertiaFormProps<UserFormData>;
    onClose: () => void;
};

export default function UserResetPasswordModal({
    open,
    userId,
    displayName,
    form,
    onClose,
}: Props) {
    const [temporaryPassword, setTemporaryPassword] = useState('');
    const [copied, setCopied] = useState(false);
    const [visible, setVisible] = useState(false);
    const [resetSucceeded, setResetSucceeded] = useState(false);

    if (!open) {
        return null;
    }

    const resetPassword = () => {
        // Generate one password and send that exact password to Laravel.
        const password = generateTemporaryPassword();

        setTemporaryPassword('');
        setCopied(false);
        setVisible(false);
        setResetSucceeded(false);

        form.transform((data) => ({
            ...data,
            password,
            password_confirmation: password,
        }));

        form.post(`/admin/users/${userId}/reset-password`, {
            preserveScroll: true,

            onSuccess: () => {
                // Display the password only after a successful response.
                setTemporaryPassword(password);
                setResetSucceeded(true);
            },

            onError: () => {
                setTemporaryPassword('');
                setCopied(false);
                setResetSucceeded(false);
            },

            onFinish: () => {
                // Do not retain the temporary password in the shared form.
                form.transform((data) => ({
                    ...data,
                    password: '',
                    password_confirmation: '',
                }));
            },
        });
    };

    const copyPassword = async () => {
        if (!temporaryPassword) {
            return;
        }

        try {
            await navigator.clipboard.writeText(temporaryPassword);
            setCopied(true);

            window.setTimeout(() => {
                setCopied(false);
            }, 1800);
        } catch {
            // Clipboard access may require HTTPS or browser permission.
            setCopied(false);
        }
    };

    const close = () => {
        if (form.processing) {
            return;
        }

        setTemporaryPassword('');
        setCopied(false);
        setVisible(false);
        setResetSucceeded(false);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reset-password-title"
        >
            <div className="w-full max-w-md overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.20)]">
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                            <KeyRound className="h-4 w-4" />
                        </div>

                        <div>
                            <h2
                                id="reset-password-title"
                                className="text-sm font-semibold text-slate-900"
                            >
                                Reset Password
                            </h2>

                            <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                Reset the password for{' '}
                                <span className="font-semibold text-slate-700">
                                    {displayName}
                                </span>
                                .
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={close}
                        disabled={form.processing}
                        aria-label="Close reset password dialog"
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 p-5">
                    {!resetSucceeded ? (
                        <>
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
                                            A new temporary password will be
                                            generated and assigned to this
                                            employee.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3">
                                <p className="text-[11px] leading-5 text-slate-500">
                                    The employee will be required to change
                                    this password after signing in.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
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
                                            Copy the password below and provide
                                            it to the employee securely.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Temporary password and copy button */}
                            <div>
                                <label
                                    htmlFor="temporary-password"
                                    className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500"
                                >
                                    Temporary Password
                                </label>

                                <div className="flex gap-2">
                                    <div className="flex min-w-0 flex-1 items-center rounded-lg border border-slate-200 bg-slate-50 px-3">
                                        <input
                                            id="temporary-password"
                                            type={visible ? 'text' : 'password'}
                                            value={temporaryPassword}
                                            readOnly
                                            autoComplete="off"
                                            className="min-w-0 flex-1 bg-transparent py-2.5 font-mono text-sm font-semibold tracking-wider text-slate-800 outline-none"
                                        />

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setVisible((value) => !value)
                                            }
                                            aria-label={
                                                visible
                                                    ? 'Hide temporary password'
                                                    : 'Show temporary password'
                                            }
                                            className="ml-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-slate-700"
                                        >
                                            {visible ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={copyPassword}
                                        className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                    >
                                        {copied ? (
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
                                    This password is shown for this reset
                                    operation only. Share it through your
                                    organization&apos;s approved secure channel.
                                </p>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
                    {!resetSucceeded ? (
                        <>
                            <button
                                type="button"
                                onClick={close}
                                disabled={form.processing}
                                className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={resetPassword}
                                disabled={form.processing}
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
                            onClick={close}
                            className="h-9 rounded-lg bg-[#173B67] px-4 text-xs font-semibold text-white transition hover:bg-[#123052]"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
