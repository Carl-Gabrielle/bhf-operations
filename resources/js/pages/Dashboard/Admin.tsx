import { Head } from '@inertiajs/react';
import {
    Activity,
    ArrowUpRight,
    Building2,
    CheckCircle2,
    ShieldCheck,
    Users,
} from 'lucide-react';

const stats = [
    {
        label: 'Total Users',
        value: '50',
        detail: 'Registered employees',
        icon: Users,
    },
    {
        label: 'Active Branches',
        value: '8',
        detail: '7 branches + Head Office',
        icon: Building2,
    },
    {
        label: 'System Roles',
        value: '4',
        detail: 'Configured roles',
        icon: ShieldCheck,
    },
    {
        label: 'System Status',
        value: 'Active',
        detail: 'All services operational',
        icon: CheckCircle2,
    },
];

export default function AdminDashboard() {
    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="space-y-8">
                {/* Header */}
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Administration
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                        System overview
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage users, access, and system activity.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((stat) => {
                        const Icon = stat.icon;

                        return (
                            <div
                                key={stat.label}
                                className="rounded-xl border bg-card p-5"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </p>

                                        <p className="mt-2 text-2xl font-semibold">
                                            {stat.value}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {stat.detail}
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

                {/* Main content */}
                <div className="grid gap-6 lg:grid-cols-3">
                    <div className="rounded-xl border bg-card p-6 lg:col-span-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="font-semibold">
                                    Recent system activity
                                </h2>

                                <p className="mt-1 text-sm text-muted-foreground">
                                    Latest activity across the system.
                                </p>
                            </div>

                            <Activity className="size-5 text-muted-foreground" />
                        </div>

                        <div className="mt-6 space-y-4">
                            {[
                                'User account created',
                                'Role permissions updated',
                                'Employee information updated',
                                'System configuration changed',
                            ].map((activity, index) => (
                                <div
                                    key={activity}
                                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium">
                                            {activity}
                                        </p>

                                        <p className="mt-1 text-xs text-muted-foreground">
                                            System activity #{index + 1}
                                        </p>
                                    </div>

                                    <ArrowUpRight className="size-4 text-muted-foreground" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border bg-card p-6">
                        <h2 className="font-semibold">
                            Administration
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Common system management tasks.
                        </p>

                        <div className="mt-6 space-y-3">
                            <button className="flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition hover:bg-muted">
                                <span>Manage users</span>
                                <ArrowUpRight className="size-4" />
                            </button>

                            <button className="flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition hover:bg-muted">
                                <span>Manage roles</span>
                                <ArrowUpRight className="size-4" />
                            </button>

                            <button className="flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition hover:bg-muted">
                                <span>System settings</span>
                                <ArrowUpRight className="size-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}