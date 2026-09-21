import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import bhfLogo from '@/assets/images/bhflogo.png';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="BHF Operations" />

            <div className="min-h-screen overflow-hidden bg-white text-slate-900">
                {/* Background */}
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
        {/* Soft ambient glow */}
            <div className="absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[#eef2b8]/60 blur-3xl" />

            <div className="absolute -bottom-48 -left-40 h-[560px] w-[560px] rounded-full bg-[#e8f3ff] blur-3xl" />

            {/* Subtle center glow */}
            <div className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#f5f6dc]/40 blur-3xl" />
        </div>

                {/* Fixed Navigation */}
                <header className="fixed left-0 right-0 top-0 z-50 border-b border-slate-100/80 bg-white/90 backdrop-blur-md">
                    <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
                        {/* BHF Logo */}
                        <Link
                            href="/"
                            className="flex items-center"
                        >
                            <img
                                src={bhfLogo}
                                alt="BHF Rural Bank"
                                className="h-12 w-auto object-contain"
                            />
                        </Link>

                        {/* Navigation */}
                        <nav className="flex items-center gap-2 sm:gap-3">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-[#303087] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#25256f]"
                                >
                                    Dashboard
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-[#303087]"
                                    >
                                        Log in
                                    </Link>

                                    <Link
                                        href={register()}
                                        className="hidden rounded-lg bg-[#303087] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#25256f] sm:block"
                                    >
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Main */}
                <main className="relative z-10 pb-[60px] pt-[76px]">
                    <section className="mx-auto flex min-h-[calc(100vh-136px)] w-full max-w-7xl items-center justify-center px-5 py-10 sm:px-8 lg:px-10">
                        <div className="grid w-full max-w-6xl items-center justify-items-center gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
                            {/* Left Content */}
                            <div className="w-full max-w-2xl text-center lg:text-left">
                                {/* Eyebrow */}
                                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-2 shadow-sm">
                                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f2f4b8]">
                                        <ShieldCheck className="h-3 w-3 text-[#303087]" />
                                    </span>

                                    <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#303087]">
                                        BHF Operations
                                    </span>

                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                </div>

                                {/* Heading */}
                                <h1 className="mx-auto max-w-2xl text-4xl font-bold leading-[1.08] tracking-[-0.04em] text-[#24245f] sm:text-5xl lg:mx-0 lg:text-6xl xl:text-[4.5rem]">
                                    Better operations,
                                    <span className="block text-[#3d9be9]">
                                        better service.
                                    </span>
                                </h1>

                                {/* Description */}
                                <p className="mx-auto mt-6 max-w-xl text-base leading-7 text-slate-500 sm:text-lg lg:mx-0">
                                    A simple and secure workspace for managing
                                    employee requests, leave, overtime,
                                    travel, and everyday HR operations at BHF
                                    Rural Bank.
                                </p>

                                {/* CTA */}
                                <div className="mt-8 flex justify-center lg:justify-start">
                                    {auth.user ? (
                                        <Link
                                            href={dashboard()}
                                            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#303087] px-6 text-sm font-semibold text-white shadow-lg shadow-[#303087]/15 transition hover:-translate-y-0.5 hover:bg-[#25256f]"
                                        >
                                            Open dashboard

                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    ) : (
                                        <Link
                                            href={login()}
                                            className="group inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#303087] px-6 text-sm font-semibold text-white shadow-lg shadow-[#303087]/15 transition hover:-translate-y-0.5 hover:bg-[#25256f]"
                                        >
                                            Access operations

                                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    )}
                                </div>

                                {/* Small Information */}
                                <div className="mt-8 flex items-center justify-center gap-3 text-xs text-slate-400 lg:justify-start">
                                    <div className="h-px w-8 bg-[#e8ef25]" />

                                    <span>
                                        Human resources & operations
                                    </span>
                                </div>
                            </div>

                            {/* Right Visual */}
                            <div className="relative mx-auto w-full max-w-md">
                                {/* Decorative Shapes */}
                                <div className="absolute -right-5 -top-5 h-16 w-16 rounded-2xl bg-[#e8ef25] sm:-right-7 sm:-top-7 sm:h-20 sm:w-20" />

                                <div className="absolute -bottom-5 -left-5 h-20 w-20 rounded-full bg-blue-100 sm:-bottom-7 sm:-left-7 sm:h-24 sm:w-24" />

                                {/* Main Card */}
                                <div className="relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_25px_70px_-25px_rgba(30,58,138,0.25)]">
                                    {/* Blue Header */}
                                    <div className="relative overflow-hidden bg-[#303087] px-6 py-7 sm:px-8 sm:py-8">
                                        <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-[18px] border-white/5" />

                                        <div className="absolute -bottom-16 -right-5 h-40 w-40 rounded-full border-[20px] border-[#3d9be9]/20" />

                                        <div className="relative">
                                            <div className="mb-7 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-white/50">
                                                        BHF Rural Bank
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-white">
                                                        Operations Portal
                                                    </p>
                                                </div>

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10">
                                                    <ShieldCheck className="h-4 w-4 text-white" />
                                                </div>
                                            </div>

                                            <p className="text-xs text-white/60">
                                                Welcome back
                                            </p>

                                            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                                                Your work,
                                                <br />
                                                in one place.
                                            </h2>
                                        </div>
                                    </div>

                                    {/* Portal Items */}
                                    <div className="p-5 sm:p-6">
                                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                                            Operations
                                        </p>

                                        <div className="space-y-2.5">
                                            {[
                                                'Leave Applications',
                                                'Overtime & Undertime',
                                                'Travel Orders',
                                            ].map((item) => (
                                                <div
                                                    key={item}
                                                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3.5"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <span className="h-2 w-2 rounded-full bg-[#3d9be9]" />

                                                        <span className="text-sm font-medium text-slate-700">
                                                            {item}
                                                        </span>
                                                    </div>

                                                    <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
                                                </div>
                                            ))}
                                        </div>

                                        {/* Yellow Accent */}
                                        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f4f6c7] px-4 py-3">
                                            <div>
                                                <p className="text-xs font-semibold text-[#303087]">
                                                    Secure & centralized
                                                </p>

                                                <p className="mt-0.5 text-[10px] text-[#303087]/60">
                                                    Built for BHF operations
                                                </p>
                                            </div>

                                            <ShieldCheck className="h-5 w-5 text-[#303087]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>

                {/* Fixed Footer */}
                <footer className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200/80 bg-white/95 backdrop-blur-md">
                    <div className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-5 py-3 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
                        <p>
                            © {new Date().getFullYear()} BHF Rural Bank, Inc.
                        </p>

                        <p>HR Operations Management System</p>
                    </div>
                </footer>
            </div>
        </>
    );
}