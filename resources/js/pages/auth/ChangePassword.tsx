import { Form, Head } from '@inertiajs/react';
import { LockKeyhole, ShieldCheck } from 'lucide-react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

export default function ChangePassword() {
    return (
        <>
            <Head title="Change Password | BHF Operations" />

            <div className="w-full">
                {/* Intro */}
                <div className="mb-6">
                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#303087]/10 text-[#303087]">
                        <LockKeyhole className="h-5 w-5" />
                    </div>

                    <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-slate-900">
                        Change your password
                    </h2>

                    <p className="mt-2 max-w-[500px] text-[13px] leading-6 text-slate-500">
                        Your administrator assigned you a temporary password.
                        Please create a new password before continuing to BHF
                        Operations.
                    </p>
                </div>

                {/* Main Card */}
                <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_40px_-24px_rgba(15,23,42,0.35)]">
                    {/* Security Notice */}
                    <div className="border-b border-slate-100 px-6 py-5">
                        <div className="flex gap-3 rounded-xl border border-amber-200/80 bg-amber-50/70 p-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                                <ShieldCheck className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                                <p className="text-[12px] font-semibold text-amber-900">
                                    Password change required
                                </p>

                                <p className="mt-1 text-[11px] leading-5 text-amber-800/90">
                                    For security, access to the system will
                                    remain restricted until your password is
                                    changed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <div className="px-6 py-6">
                        <Form
                            method="put"
                            action="/password/change"
                            resetOnSuccess={[
                                'current_password',
                                'password',
                                'password_confirmation',
                            ]}
                            className="space-y-5"
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Current Password */}
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="current_password"
                                            className="text-[12px] font-semibold text-slate-700"
                                        >
                                            Temporary / Current Password
                                        </Label>

                                        <PasswordInput
                                            id="current_password"
                                            name="current_password"
                                            required
                                            autoFocus
                                            autoComplete="current-password"
                                            placeholder="Enter your current password"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/60 px-4 text-[13px] shadow-none transition-all placeholder:text-slate-400 focus-visible:border-[#303087] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#303087]/8"
                                        />

                                        <InputError
                                            message={errors.current_password}
                                        />
                                    </div>

                                    {/* New Password */}
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password"
                                            className="text-[12px] font-semibold text-slate-700"
                                        >
                                            New Password
                                        </Label>

                                        <PasswordInput
                                            id="password"
                                            name="password"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Create a new password"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/60 px-4 text-[13px] shadow-none transition-all placeholder:text-slate-400 focus-visible:border-[#303087] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#303087]/8"
                                        />

                                        <InputError
                                            message={errors.password}
                                        />
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="grid gap-2">
                                        <Label
                                            htmlFor="password_confirmation"
                                            className="text-[12px] font-semibold text-slate-700"
                                        >
                                            Confirm New Password
                                        </Label>

                                        <PasswordInput
                                            id="password_confirmation"
                                            name="password_confirmation"
                                            required
                                            autoComplete="new-password"
                                            placeholder="Confirm your new password"
                                            className="h-11 rounded-xl border-slate-200 bg-slate-50/60 px-4 text-[13px] shadow-none transition-all placeholder:text-slate-400 focus-visible:border-[#303087] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#303087]/8"
                                        />

                                        <InputError
                                            message={
                                                errors.password_confirmation
                                            }
                                        />
                                    </div>

                                    {/* Submit */}
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="group mt-2 h-11 w-full cursor-pointer rounded-xl bg-[#303087] text-[13px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(48,48,135,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#292979] hover:shadow-[0_16px_32px_-12px_rgba(48,48,135,0.65)] active:translate-y-0"
                                    >
                                        {processing ? (
                                            <>
                                                <Spinner />
                                                <span>
                                                    Updating password...
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span>Change Password</span>

                                                <LockKeyhole className="h-4 w-4 transition-transform duration-200 group-hover:scale-105" />
                                            </>
                                        )}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>
                </div>

                {/* Footer Note */}
                <p className="mt-4 text-center text-[10px] leading-5 text-slate-400">
                    Your new password will be used for all future BHF
                    Operations sign-ins.
                </p>
            </div>
        </>
    );
}

ChangePassword.layout = {
    title: 'Welcome back',
};