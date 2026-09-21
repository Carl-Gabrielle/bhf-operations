import { Head, Link } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    ClipboardCheck,
    UserPlus,
    Users,
} from 'lucide-react';

const stats = [
    {
        label: 'Employees',
        value: '50',
        description: 'Active employees',
        icon: Users,
    },
    {
        label: 'Leave Requests',
        value: '8',
        description: 'Pending review',
        icon: CalendarDays,
    },
    {
        label: 'For Approval',
        value: '10',
        description: 'Across HR requests',
        icon: ClipboardCheck,
    },
    {
        label: 'Branches',
        value: '8',
        description: 'Active locations',
        icon: Users,
    },
];

export default function HRDashboard() {
    return (
        <>
            <Head title="HR Dashboard" />

            <div className="space-y-8">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Human Resources
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                        HR overview
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage employees and review HR operations.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.label}
                                className="rounded-xl border bg-card p-5"
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </p>

                                        <p className="mt-2 text-2xl font-semibold">
                                            {stat.value}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {stat.description}
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-muted p-2">
                                        <Icon className="size-4" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border bg-card p-6 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">
                                    HR requests
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Requests currently requiring review.
                                </p>
                            </div>

                            <ClipboardCheck className="size-5 text-muted-foreground" />
                        </div>

                        <div className="mt-6 space-y-3">
                            {[
                                ['Leave applications', '8 pending', '/leave'],
                                ['Overtime requests', '5 pending', '/overtime'],
                                ['Undertime requests', '2 pending', '/undertime'],
                                ['Travel orders', '3 pending', '/travel'],
                            ].map(([label, count, href]) => (
                                <Link
                                    key={label}
                                    href={href}
                                    className="flex items-center justify-between rounded-lg border p-4 transition hover:bg-muted"
                                >
                                    <span className="text-sm font-medium">
                                        {label}
                                    </span>

                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-muted-foreground">
                                            {count}
                                        </span>

                                        <ArrowUpRight className="size-4" />
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="font-semibold">
                            Quick actions
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Common HR tasks.
                        </p>

                        <div className="mt-6 space-y-3">
                            <Link
                                href="/employees/create"
                                className="flex items-center gap-3 rounded-lg border p-3 text-sm transition hover:bg-muted"
                            >
                                <UserPlus className="size-4" />
                                Add employee
                            </Link>

                            <Link
                                href="/employees"
                                className="flex items-center gap-3 rounded-lg border p-3 text-sm transition hover:bg-muted"
                            >
                                <Users className="size-4" />
                                Employee directory
                            </Link>

                            <Link
                                href="/reports"
                                className="flex items-center gap-3 rounded-lg border p-3 text-sm transition hover:bg-muted"
                            >
                                <ClipboardCheck className="size-4" />
                                View reports
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}