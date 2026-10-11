import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowUpRight,
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Clock3,
    FileText,
    KeyRound,
    ListChecks,
    Search,
    ShieldCheck,
    Users,
    XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ElementType } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

type DashboardUser = {
    id: number;
    name: string;
    email: string;
    role: string | null;
    roles: string[];
    permissions: string[];
    position: string | null;
};

type Stat = {
    key: string;
    label: string;
    value: number | null;
    description: string;
};

type RequestItem = {
    id: number;
    reference: string;
    employee: string;
    employeeNumber: string | null;
    department: string;
    type: string;
    date: string | null;
    status: string;
    url: string;
};

type AdminUser = {
    id: number;
    name: string;
    email: string;
    createdAt: string | null;
};

type PageProps = {
    user: DashboardUser;
    dashboard: {
        admin: null | {
            totalUsers: number;
            activeUsers: number;
            roles: number;
            permissions: number;
            recentUsers: AdminUser[];
        };
        stats: Stat[];
        recentRequests: RequestItem[];
        pendingApprovals: number;
        pendingHrProcessing: number;
        can: {
            viewEmployees: boolean;
            viewLeave: boolean;
            approveLeave: boolean;
            processLeave: boolean;
        };
    };
};

const brand = '#3F2A8F';

const roleDescriptions: Record<string, string> = {
    admin: 'Manage access, accounts, roles, and system configuration.',
    coo: 'Review assigned approvals and monitor requests requiring executive attention.',
    hr: 'Track employee leave requests and manage post-approval HR processing.',
    manager: 'Review requests assigned to you and follow your team’s activity.',
    employee: 'Submit requests and keep track of your application status.',
};

const statIcons: Record<string, ElementType> = {
    users: Users,
    leaves: CalendarDays,
    pending: Clock3,
    approved: CheckCircle2,
    rejected: XCircle,
    my_approvals: ShieldCheck,
    hr_processing: ListChecks,
};

const statAccents: Record<string, string> = {
    users: 'border-l-slate-400 bg-slate-100 text-slate-700',
    leaves: 'border-l-[#3F2A8F] bg-[#F3F1FA] text-[#3F2A8F]',
    pending: 'border-l-amber-500 bg-amber-50 text-amber-700',
    approved: 'border-l-emerald-500 bg-emerald-50 text-emerald-700',
    rejected: 'border-l-rose-500 bg-rose-50 text-rose-700',
    my_approvals: 'border-l-blue-500 bg-blue-50 text-blue-700',
    hr_processing: 'border-l-violet-500 bg-violet-50 text-violet-700',
};

function initials(name?: string | null) {
    return (
        (name ?? 'User')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase() || 'U'
    );
}

function prettyRole(role?: string | null) {
    if (!role) return 'User';

    return role === 'hr'
        ? 'HR'
        : role === 'coo'
          ? 'COO'
          : role.replaceAll('_', ' ').replace(/\b\w/g, (character) => character.toUpperCase());
}

function statusStyle(status: string) {
    const normalized = status.toLowerCase();

    if (normalized.includes('reject')) {
        return 'border-rose-200 bg-rose-50 text-rose-700';
    }

    if (normalized.includes('approv') && !normalized.includes('pending')) {
        return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    }

    if (normalized.includes('pending') || normalized.includes('approval')) {
        return 'border-amber-200 bg-amber-50 text-amber-800';
    }

    return 'border-slate-200 bg-slate-50 text-slate-600';
}

function SectionHeading({
    eyebrow,
    title,
    description,
}: {
    eyebrow?: string;
    title: string;
    description?: string;
}) {
    return (
        <div className="min-w-0">
            {eyebrow && (
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                    {eyebrow}
                </p>
            )}
            <h2 className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
                {title}
            </h2>
            {description && <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>}
        </div>
    );
}

function ShortcutLink({
    href,
    icon: Icon,
    title,
    description,
    iconClass = 'bg-[#F3F1FA] text-[#3F2A8F]',
}: {
    href: string;
    icon: ElementType;
    title: string;
    description: string;
    iconClass?: string;
}) {
    return (
        <Link
            href={href}
            className="group flex min-w-0 items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F2A8F]/30"
        >
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}>
                <Icon className="h-4 w-4" strokeWidth={1.8} />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-slate-800">{title}</span>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{description}</span>
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-500" />
        </Link>
    );
}

export default function Dashboard() {
    const { user, dashboard } = usePage<PageProps>().props;
    const role = user.roles.includes('admin') ? 'admin' : (user.role ?? 'employee');
    const isAdmin = role === 'admin';
    const [search, setSearch] = useState('');

    const filteredRequests = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return dashboard.recentRequests;

        return dashboard.recentRequests.filter((item) =>
            [
                item.reference,
                item.employee,
                item.employeeNumber,
                item.department,
                item.type,
                item.status,
            ].some((value) => String(value ?? '').toLowerCase().includes(term)),
        );
    }, [dashboard.recentRequests, search]);

    const now = new Date();
    const dateLabel = now.toLocaleDateString('en-PH', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });

    const adminStats = [
        {
            label: 'User accounts',
            value: dashboard.admin?.totalUsers ?? 0,
            detail: 'Registered accounts',
            icon: Users,
            iconClass: 'bg-slate-100 text-slate-700',
        },
        {
            label: 'Active accounts',
            value: dashboard.admin?.activeUsers ?? 0,
            detail: 'Marked active in the system',
            icon: CheckCircle2,
            iconClass: 'bg-emerald-50 text-emerald-700',
        },
        {
            label: 'Configured roles',
            value: dashboard.admin?.roles ?? 0,
            detail: 'Role-based access groups',
            icon: ShieldCheck,
            iconClass: 'bg-[#F3F1FA] text-[#3F2A8F]',
        },
        {
            label: 'Permissions',
            value: dashboard.admin?.permissions ?? 0,
            detail: 'Available access rules',
            icon: KeyRound,
            iconClass: 'bg-blue-50 text-blue-700',
        },
    ];

    const quickActions = [
        ...(user.permissions.includes('leave.create')
            ? [
                  {
                      label: 'New leave application',
                      description: 'Submit a request for review',
                      href: '/leave/applications/create',
                      icon: CalendarDays,
                      iconClass: 'bg-[#F3F1FA] text-[#3F2A8F]',
                  },
              ]
            : []),
        ...(dashboard.can.approveLeave
            ? [
                  {
                      label: 'Leave approvals',
                      description: `${dashboard.pendingApprovals} assigned pending`,
                      href: '/leave/approvals',
                      icon: ShieldCheck,
                      iconClass: 'bg-blue-50 text-blue-700',
                  },
              ]
            : []),
        ...(dashboard.can.processLeave
            ? [
                  {
                      label: 'Leave processing',
                      description: 'HR processing workspace',
                      href: '/leave/processing',
                      icon: ListChecks,
                      iconClass: 'bg-violet-50 text-violet-700',
                  },
              ]
            : []),
        ...(dashboard.can.viewEmployees
            ? [
                  {
                      label: 'Employee directory',
                      description: 'View employee accounts',
                      href: '/admin/users',
                      icon: Users,
                      iconClass: 'bg-slate-100 text-slate-600',
                  },
              ]
            : []),
    ];

    return (
        <>
            <Head title="Dashboard" />

            <main className="min-h-full bg-[#F5F6FA] px-3 py-4 text-slate-900 sm:px-5 sm:py-6 lg:px-8">
                <div className="mx-auto max-w-[1600px] space-y-5">
                    <header className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                        <div
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-1"
                            style={{ backgroundColor: brand }}
                        />
                        <div className="flex flex-col gap-5 px-5 py-5 pl-6 sm:px-6 sm:pl-7 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                                <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400 sm:text-[11px]">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                                    BHF Operations
                                    <span className="text-slate-300">/</span>
                                    <span className="text-[#3F2A8F]">{prettyRole(role)}</span>
                                </div>
                                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                                    {isAdmin
                                        ? 'System overview'
                                        : `Welcome back, ${(user.name || 'there').trim().split(/\s+/)[0]}`}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                                    {roleDescriptions[role] ?? 'Your workspace and assigned operational tasks.'}
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3">
                                    <p className="text-xs font-medium text-slate-500">{dateLabel}</p>
                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                        {user.position || prettyRole(role)}
                                    </p>
                                </div>
                                {!isAdmin && user.permissions.includes('leave.create') && (
                                    <Button
                                        asChild
                                        className="h-11 rounded-xl px-4 font-semibold shadow-sm"
                                        style={{ backgroundColor: brand }}
                                    >
                                        <Link href="/leave/applications/create">
                                            <FileText className="mr-2 h-4 w-4" />
                                            New leave request
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </header>

                    {isAdmin ? (
                        <>
                            <section
                                aria-label="System statistics"
                                className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
                            >
                                {adminStats.map((item) => (
                                    <div
                                        key={item.label}
                                        className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                                                <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                                    {item.value.toLocaleString()}
                                                </p>
                                                <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
                                            </div>
                                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.iconClass}`}>
                                                <item.icon className="h-5 w-5" strokeWidth={1.8} />
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </section>

                            <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
                                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                                    <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
                                        <SectionHeading
                                            eyebrow="System activity"
                                            title="Recently added users"
                                            description="Latest accounts registered in BHF Operations"
                                        />
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                                            <Users className="h-4 w-4" />
                                        </span>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {(dashboard.admin?.recentUsers ?? []).length ? (
                                            dashboard.admin!.recentUsers.map((item) => (
                                                <div key={item.id} className="flex items-center gap-3 px-5 py-4 sm:px-6">
                                                    <Avatar className="h-10 w-10 shrink-0">
                                                        <AvatarFallback className="bg-[#F3F1FA] text-xs font-semibold text-[#3F2A8F]">
                                                            {initials(item.name)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate text-sm font-semibold text-slate-800">{item.name}</p>
                                                        <p className="truncate text-xs text-slate-500">{item.email}</p>
                                                    </div>
                                                    <span className="hidden whitespace-nowrap text-xs text-slate-400 sm:block">
                                                        {item.createdAt ?? '—'}
                                                    </span>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="px-5 py-12 text-center text-sm text-slate-500">
                                                No user accounts found.
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <aside className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                        <SectionHeading
                                            eyebrow="Administration"
                                            title="Access management"
                                            description="Accounts and authorization"
                                        />
                                        <div className="mt-4 space-y-2">
                                            {dashboard.can.viewEmployees && (
                                                <ShortcutLink
                                                    href="/admin/users"
                                                    icon={Users}
                                                    title="Manage users"
                                                    description="Accounts and employee access"
                                                />
                                            )}
                                            {user.permissions.includes('users.manage-roles') && (
                                                <ShortcutLink
                                                    href="/admin/roles"
                                                    icon={KeyRound}
                                                    title="Roles & permissions"
                                                    description="Configure access rules"
                                                />
                                            )}
                                            {!dashboard.can.viewEmployees &&
                                                !user.permissions.includes('users.manage-roles') && (
                                                    <p className="py-2 text-sm text-slate-500">
                                                        No access-management shortcuts are assigned.
                                                    </p>
                                                )}
                                        </div>
                                    </section>

                                    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-10 w-10">
                                                <AvatarFallback className="bg-slate-100 text-sm font-semibold text-slate-700">
                                                    {initials(user.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <h2 className="text-sm font-semibold text-slate-900">Signed-in account</h2>
                                                <p className="text-xs text-slate-500">Current administrator</p>
                                            </div>
                                        </div>
                                        <p className="mt-4 truncate text-sm font-semibold text-slate-800">{user.name}</p>
                                        <p className="mt-1 break-all text-xs leading-5 text-slate-500">{user.email}</p>
                                        <Badge
                                            variant="outline"
                                            className="mt-3 border-emerald-200 bg-emerald-50 text-emerald-700"
                                        >
                                            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            Authenticated
                                        </Badge>
                                    </section>
                                </aside>
                            </section>
                        </>
                    ) : (
                        <>
                            <section
                                aria-label="Dashboard statistics"
                                className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5"
                            >
                                {dashboard.stats.map((stat) => {
                                    const Icon = statIcons[stat.key] ?? FileText;
                                    const accent = statAccents[stat.key] ?? 'border-l-slate-300 bg-slate-100 text-slate-600';
                                    const [borderAccent, ...iconAccent] = accent.split(' ');

                                    return (
                                        <div
                                            key={stat.key}
                                            className={`min-w-0 rounded-2xl border border-slate-200/80 border-l-[3px] ${borderAccent} bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                                                    <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                                                        {stat.value ?? '—'}
                                                    </p>
                                                    <p className="mt-1 text-xs leading-5 text-slate-400">{stat.description}</p>
                                                </div>
                                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconAccent.join(' ')}`}>
                                                    <Icon className="h-5 w-5" strokeWidth={1.8} />
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>

                            <section className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                                    <div className="flex flex-col justify-between gap-4 border-b border-slate-100 px-4 py-4 sm:px-5 lg:flex-row lg:items-center">
                                        <SectionHeading
                                            eyebrow="Request activity"
                                            title={
                                                role === 'employee'
                                                    ? 'My recent requests'
                                                    : role === 'hr'
                                                      ? 'Recent employee leave applications'
                                                      : 'Recent requests'
                                            }
                                            description="Records available to your account"
                                        />
                                        <div className="relative w-full lg:max-w-[260px]">
                                            <Search
                                                aria-hidden="true"
                                                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                            />
                                            <Input
                                                value={search}
                                                onChange={(event) => setSearch(event.target.value)}
                                                placeholder="Search requests..."
                                                aria-label="Search recent requests"
                                                className="h-10 rounded-xl border-slate-200 bg-slate-50/70 pl-9 text-sm focus-visible:bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="hidden overflow-x-auto md:block">
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-slate-50/80 hover:bg-slate-50/80">
                                                    {['Reference / request', 'Employee', 'Date filed', 'Status', ''].map((heading) => (
                                                        <TableHead
                                                            key={heading}
                                                            className="h-11 whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500"
                                                        >
                                                            {heading}
                                                        </TableHead>
                                                    ))}
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredRequests.length ? (
                                                    filteredRequests.map((item) => (
                                                        <TableRow key={item.id} className="transition-colors hover:bg-slate-50/70">
                                                            <TableCell className="py-3.5">
                                                                <div className="font-semibold text-slate-800">{item.type}</div>
                                                                <div className="mt-1 text-xs text-slate-400">{item.reference}</div>
                                                            </TableCell>
                                                            <TableCell className="py-3.5">
                                                                <div className="flex items-center gap-3">
                                                                    <Avatar className="h-8 w-8">
                                                                        <AvatarFallback className="bg-[#F3F1FA] text-[10px] font-semibold text-[#3F2A8F]">
                                                                            {initials(item.employee)}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="min-w-0">
                                                                        <p className="max-w-[220px] truncate text-sm font-medium text-slate-700">
                                                                            {item.employee}
                                                                        </p>
                                                                        <p className="max-w-[220px] truncate text-xs text-slate-400">
                                                                            {item.employeeNumber || item.department}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="whitespace-nowrap py-3.5 text-sm text-slate-500">
                                                                {item.date ?? '—'}
                                                            </TableCell>
                                                            <TableCell className="py-3.5">
                                                                <Badge
                                                                    variant="outline"
                                                                    className={`whitespace-nowrap font-medium ${statusStyle(item.status)}`}
                                                                >
                                                                    {item.status.replaceAll('_', ' ')}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell className="py-3.5 text-right">
                                                                <Button asChild variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                                                                    <Link href={item.url} aria-label={`View ${item.reference}`}>
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    </Link>
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="h-28 text-center text-sm text-slate-500">
                                                            No matching requests found.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </div>

                                    <div className="divide-y divide-slate-100 md:hidden">
                                        {filteredRequests.length ? (
                                            filteredRequests.map((item) => (
                                                <Link
                                                    key={item.id}
                                                    href={item.url}
                                                    className="flex items-center gap-3 px-4 py-4 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3F2A8F]/30"
                                                >
                                                    <Avatar className="h-10 w-10 shrink-0">
                                                        <AvatarFallback className="bg-[#F3F1FA] text-xs font-semibold text-[#3F2A8F]">
                                                            {initials(item.employee)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <p className="truncate text-sm font-semibold text-slate-800">{item.type}</p>
                                                            <Badge
                                                                variant="outline"
                                                                className={`shrink-0 text-[10px] ${statusStyle(item.status)}`}
                                                            >
                                                                {item.status.replaceAll('_', ' ')}
                                                            </Badge>
                                                        </div>
                                                        <p className="mt-1 truncate text-xs text-slate-500">
                                                            {item.employee} · {item.reference}
                                                        </p>
                                                        <p className="mt-1 text-[11px] text-slate-400">{item.date ?? '—'}</p>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
                                                </Link>
                                            ))
                                        ) : (
                                            <p className="px-4 py-10 text-center text-sm text-slate-500">
                                                No matching requests found.
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                                        <span className="text-xs text-slate-400">
                                            Showing {filteredRequests.length} recent record(s)
                                        </span>
                                        {dashboard.can.viewLeave && (
                                            <Link
                                                href="/leave/applications"
                                                className="inline-flex items-center gap-1 self-start text-xs font-semibold text-[#3F2A8F] hover:underline sm:self-auto"
                                            >
                                                View leave applications
                                                <ArrowUpRight className="h-3.5 w-3.5" />
                                            </Link>
                                        )}
                                    </div>
                                </div>

                                <aside className="min-w-0 rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                                    <div className="border-b border-slate-100 px-5 py-4">
                                        <SectionHeading
                                            eyebrow="Workspace"
                                            title="Quick actions"
                                            description="Shortcuts based on your access"
                                        />
                                    </div>
                                    <div className="divide-y divide-slate-100 p-1.5">
                                        {quickActions.length ? (
                                            quickActions.map((action) => (
                                                <ShortcutLink
                                                    key={action.label}
                                                    href={action.href}
                                                    icon={action.icon}
                                                    title={action.label}
                                                    description={action.description}
                                                    iconClass={action.iconClass}
                                                />
                                            ))
                                        ) : (
                                            <p className="px-4 py-8 text-sm leading-6 text-slate-500">
                                                No quick actions are assigned to this account.
                                            </p>
                                        )}
                                    </div>
                                </aside>
                            </section>
                        </>
                    )}
                </div>
            </main>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [{ title: 'Dashboard', href: '/dashboard' }],
};
