import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    Clock3,
    FileText,
    Plane,
} from 'lucide-react';

type PageProps = {
    auth: {
        user: {
            name: string;
        };
    };
};

const actions = [
    {
        label: 'Leave application',
        description: 'Submit a leave request',
        href: '/leave/create',
        icon: CalendarDays,
    },
    {
        label: 'Overtime',
        description: 'Submit overtime hours',
        href: '/overtime/create',
        icon: Clock3,
    },
    {
        label: 'Undertime',
        description: 'Submit an undertime request',
        href: '/undertime/create',
        icon: Clock3,
    },
    {
        label: 'Travel order',
        description: 'Create a travel request',
        href: '/travel/create',
        icon: Plane,
    },
];

export default function EmployeeDashboard() {
    const { auth } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Employee Dashboard" />

            <div className="space-y-8">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">
                        Employee Portal
                    </p>

                    <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                        Welcome back, {auth.user.name}
                    </h1>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Manage your requests and view your latest activity.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border bg-card p-5">
                        <p className="text-sm text-muted-foreground">
                            Pending requests
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                            3
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Currently being processed
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <p className="text-sm text-muted-foreground">
                            Approved requests
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                            12
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            This year
                        </p>
                    </div>

                    <div className="rounded-xl border bg-card p-5">
                        <p className="text-sm text-muted-foreground">
                            Recent activity
                        </p>

                        <p className="mt-2 text-2xl font-semibold">
                            5
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                            Recent submissions
                        </p>
                    </div>
                </div>

                <div>
                    <div className="mb-4">
                        <h2 className="font-semibold">
                            Quick actions
                        </h2>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Submit a request or access your records.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {actions.map((action) => {
                            const Icon = action.icon;

                            return (
                                <Link
                                    key={action.label}
                                    href={action.href}
                                    className="group rounded-xl border bg-card p-5 transition hover:bg-muted/50"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="rounded-lg bg-muted p-2">
                                            <Icon className="size-4" />
                                        </div>

                                        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                                    </div>

                                    <h3 className="mt-5 text-sm font-semibold">
                                        {action.label}
                                    </h3>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {action.description}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                <div className="rounded-xl border bg-card p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold">
                                Recent requests
                            </h2>

                            <p className="mt-1 text-sm text-muted-foreground">
                                Your latest submissions.
                            </p>
                        </div>

                        <FileText className="size-5 text-muted-foreground" />
                    </div>

                    <div className="mt-6">
                        <p className="text-sm text-muted-foreground">
                            No recent requests to display.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}