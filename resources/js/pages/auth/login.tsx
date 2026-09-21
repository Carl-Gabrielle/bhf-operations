import { Form, Head } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <>
            <Head title="Sign in | BHF Operations" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        {/* Email */}
                        <div className="grid gap-2.5">
                            <Label
                                htmlFor="email"
                                className="text-[12px] font-semibold text-slate-700"
                            >
                                Username
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autoFocus
                                tabIndex={1}
                                autoComplete="email"
                                placeholder="you@example.com"
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm shadow-none transition-all placeholder:text-slate-400 focus-visible:border-[#303087] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#303087]/8"
                            />

                            <InputError message={errors.email} />
                        </div>


                        {/* Password */}
                        <div className="grid gap-2.5">
                            <div className="flex items-center justify-between">
                                <Label
                                    htmlFor="password"
                                    className="text-[12px] font-semibold text-slate-700"
                                >
                                    Password
                                </Label>

                            </div>

                            <PasswordInput
                                id="password"
                                name="password"
                                required
                                tabIndex={2}
                                autoComplete="current-password"
                                placeholder="Enter your password"
                                className="h-12 rounded-xl border-slate-200 bg-slate-50/70 px-4 text-sm shadow-none transition-all placeholder:text-slate-400 focus-visible:border-[#303087] focus-visible:bg-white focus-visible:ring-4 focus-visible:ring-[#303087]/8"
                            />

                            <InputError message={errors.password} />
                        </div>


                        {/* Remember */}
                        <label
                            htmlFor="remember"
                            className="flex cursor-pointer items-center gap-2.5"
                        >
                            <Checkbox
                                id="remember"
                                name="remember"
                                tabIndex={3}
                                className="h-4 w-4 rounded-[5px] border-slate-300 data-[state=checked]:border-[#303087] data-[state=checked]:bg-[#303087]"
                            />

                            <span className="text-[11px] text-slate-500">
                                Keep me signed in
                            </span>
                        </label>


                        {/* Status */}
                        {status && (
                            <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-center text-[11px] font-medium text-emerald-700">
                                {status}
                            </div>
                        )}


                        {/* Sign in */}
                        <Button
                            type="submit"
                            tabIndex={4}
                            disabled={processing}
                            data-test="login-button"
                            className="cursor-pointer group mt-1 h-12 w-full rounded-xl bg-[#303087] text-[13px] font-semibold text-white shadow-[0_12px_28px_-12px_rgba(48,48,135,0.55)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#292979] hover:shadow-[0_16px_32px_-12px_rgba(48,48,135,0.65)] active:translate-y-0"
                        >
                            {processing ? (
                                <>
                                    <Spinner />
                                    <span>Signing in...</span>
                                </>
                            ) : (
                                <>
                                    <span>Sign in</span>

                                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                                </>
                            )}
                        </Button>
                    </>
                )}
            </Form>
        </>
    );
}

Login.layout = {
    title: 'Welcome back',
};