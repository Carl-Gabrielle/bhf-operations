import { Link } from '@inertiajs/react';

import type { AuthLayoutProps } from '@/types';
import bhfLogo from '@/assets/images/bhflogo.png';

export default function AuthSimpleLayout({
    children,
    title,
}: AuthLayoutProps) {
    return (
        <div className="min-h-dvh bg-[#edf1f7] text-slate-900 lg:h-dvh lg:overflow-hidden">
            <div className="mx-auto flex min-h-dvh w-full max-w-[1800px] lg:h-dvh">

                {/* =====================================================
                    LOGIN PANEL
                ===================================================== */}
                <section className="relative z-20 flex min-h-dvh w-full flex-col bg-white lg:min-h-0 lg:w-[44%] lg:rounded-r-[32px]">

                    {/* subtle top accent */}
                    <div className="absolute left-0 top-0 h-1 w-full bg-[#303087]" />

                    {/* Login */}
                    <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:px-12 xl:px-16">
                        <div className="w-full max-w-[410px]">

                            {/* Brand */}
                            <div className="mb-10 flex justify-center">
                                <Link
                                    href="/"
                                    aria-label="BHF Rural Bank"
                                    className="group flex h-[88px] w-[158px] items-center justify-center rounded-[22px] border border-slate-100 bg-[#f8fafc] px-5 shadow-[0_18px_45px_-30px_rgba(41,41,111,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_50px_-28px_rgba(41,41,111,0.4)]"
                                >
                                    <img
                                        src={bhfLogo}
                                        alt="BHF Rural Bank"
                                        className="h-[62px] w-auto object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                                    />
                                </Link>
                            </div>


                            {/* Heading */}
                            <div className="mb-8">
                                <h1 className="text-[32px] font-semibold leading-[1.05] tracking-[-0.05em] text-[#29296f] sm:text-[35px]">
                                    {title || 'Welcome back'}
                                </h1>

                                <div className="mt-3 h-1 w-10 rounded-full bg-[#e8ef25]" />
                            </div>


                            {/* Form */}
                            {children}

                        </div>
                    </main>


                    {/* Footer */}
                    <footer className="shrink-0 px-6 pb-6 sm:px-10 lg:px-12 xl:px-16">
                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                            <p className="text-[10px] font-medium text-slate-400">
                                © {new Date().getFullYear()} BHF Rural Bank, Inc.
                            </p>

                            <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-slate-300">
                                Operations
                            </span>
                        </div>
                    </footer>
                </section>


                {/* =====================================================
                    PRODUCT HERO
                ===================================================== */}
                <section className="relative hidden min-h-0 flex-1 overflow-hidden lg:flex">

                    {/* Background */}
                    <div className="absolute inset-0 bg-[#edf1f7]" />

                    {/* Large soft glow */}
                    <div className="pointer-events-none absolute left-[52%] top-[50%] h-[650px] w-[650px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-[80px]" />


                    {/* Decorative ring */}
                    <div className="pointer-events-none absolute left-[53%] top-1/2 h-[610px] w-[610px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#d7b84b]/20" />

                    <div className="pointer-events-none absolute left-[53%] top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/90" />


                    {/* Lime accent */}
                    <div className="pointer-events-none absolute right-[7%] top-[7%] h-[72px] w-[72px] rounded-[22px] bg-[#e8ef25] shadow-[0_20px_50px_-20px_rgba(232,239,37,0.7)] xl:h-[88px] xl:w-[88px]" />

                    {/* Small accent */}
                    <div className="pointer-events-none absolute bottom-[10%] left-[8%] h-2 w-14 rounded-full bg-[#303087]/10" />


                    {/* Content */}
                    <div className="relative z-10 flex h-full w-full items-center justify-center px-8 xl:px-12">

                        <div className="w-full max-w-[650px]">

                            {/* Hero heading */}
                            <div className="mb-8 text-center">

                                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#303087]/10 bg-white/70 px-3 py-1.5 shadow-sm backdrop-blur-sm">
                                    <span className="h-1.5 w-1.5 rounded-full bg-[#8aaa2c]" />

                                    <span className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#6873a8]">
                                        BHF Operations
                                    </span>
                                </div>

                                <h2 className="text-[38px] font-semibold leading-[0.95] tracking-[-0.055em] text-[#29296f] xl:text-[46px]">
                                    Everything you need,
                                    <br />
                                    <span className="text-[#3d9be9]">
                                        in one place.
                                    </span>
                                </h2>
                            </div>


                            {/* Dashboard Preview */}
                            <div className="relative mx-auto max-w-[590px]">

                                {/* Shadow layer */}
                                <div className="absolute inset-x-8 bottom-[-18px] h-20 rounded-full bg-[#29296f]/20 blur-3xl" />

                                {/* Main application */}
                                <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-[#35358f] p-5 shadow-[0_40px_90px_-35px_rgba(41,41,111,0.6)] xl:p-6">

                                    {/* Decorative orb */}
                                    <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[22px] border-white/[0.045]" />

                                    <div className="pointer-events-none absolute -right-2 -top-6 h-32 w-32 rounded-full border-[15px] border-white/[0.035]" />


                                    {/* Application header */}
                                    <div className="relative flex items-center justify-between">

                                        <div className="flex items-center gap-3">

                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                                                <div className="h-3 w-3 rounded-[4px] bg-white/80" />
                                            </div>

                                            <div>
                                                <div className="h-1.5 w-16 rounded-full bg-white/20" />

                                                <div className="mt-1.5 h-2 w-24 rounded-full bg-white/75" />
                                            </div>

                                        </div>

                                        <div className="flex items-center gap-1.5 rounded-full bg-white/[0.08] px-2.5 py-1.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-[#8fd3ff]" />

                                            <span className="text-[8px] font-medium text-white/55">
                                                Secure
                                            </span>
                                        </div>

                                    </div>


                                    {/* Dashboard */}
                                    <div className="relative mt-5 rounded-[20px] bg-white/[0.08] p-4 xl:p-5">

                                        {/* Dashboard top */}
                                        <div className="flex items-end justify-between">

                                            <div>
                                                <p className="text-[8px] font-medium uppercase tracking-[0.15em] text-white/35">
                                                    Overview
                                                </p>

                                                <p className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-white">
                                                    Daily operations
                                                </p>
                                            </div>

                                            <div className="rounded-lg bg-white/10 px-3 py-1.5">
                                                <span className="text-[8px] font-medium text-white/55">
                                                    Today
                                                </span>
                                            </div>

                                        </div>


                                        {/* Stats */}
                                        <div className="mt-4 grid grid-cols-3 gap-2.5">

                                            {/* Leave */}
                                            <div className="rounded-[15px] bg-white p-3.5">
                                                <div className="mb-4 h-1.5 w-6 rounded-full bg-[#3d9be9]" />

                                                <p className="text-[8px] font-medium text-slate-400">
                                                    Leave
                                                </p>

                                                <p className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-[#29296f]">
                                                    08
                                                </p>
                                            </div>


                                            {/* Requests */}
                                            <div className="rounded-[15px] bg-white p-3.5">
                                                <div className="mb-4 h-1.5 w-6 rounded-full bg-[#777cc0]" />

                                                <p className="text-[8px] font-medium text-slate-400">
                                                    Requests
                                                </p>

                                                <p className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-[#29296f]">
                                                    12
                                                </p>
                                            </div>


                                            {/* Travel */}
                                            <div className="rounded-[15px] bg-white p-3.5">
                                                <div className="mb-4 h-1.5 w-6 rounded-full bg-[#8aaa2c]" />

                                                <p className="text-[8px] font-medium text-slate-400">
                                                    Travel
                                                </p>

                                                <p className="mt-1 text-[18px] font-semibold tracking-[-0.03em] text-[#29296f]">
                                                    04
                                                </p>
                                            </div>

                                        </div>


                                        {/* Bottom activity line */}
                                        <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.05] px-3 py-2.5">

                                            <div className="flex items-center gap-2">
                                                <span className="h-1.5 w-1.5 rounded-full bg-[#8aaa2c]" />

                                                <span className="text-[8px] text-white/45">
                                                    All systems operational
                                                </span>
                                            </div>

                                            <div className="h-1.5 w-12 rounded-full bg-white/10" />

                                        </div>

                                    </div>

                                </div>
                            </div>


                            {/* Minimal supporting copy */}
                            <div className="mt-7 flex items-center justify-center gap-3 text-[10px] font-medium uppercase tracking-[0.14em] text-[#8a98aa]">
                                <span>Leave</span>
                                <span className="h-1 w-1 rounded-full bg-[#d7b84b]" />
                                <span>Requests</span>
                                <span className="h-1 w-1 rounded-full bg-[#d7b84b]" />
                                <span>Travel</span>
                            </div>

                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}