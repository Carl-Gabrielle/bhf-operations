
import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ClipboardList,
    CalendarDays,
    ChevronRight,
    ClipboardCheck,
    Clock3,
    FileText,
    LayoutDashboard,
    LogOut,
    MoreHorizontal,
    Plane,
    Settings,
    ShieldCheck,
    UserCog,
    Users,
    X,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import type { NavSection, RBACNavItem } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { useCurrentUrl } from '@/hooks/use-current-url';

import BhfLogo from '@/assets/images/bhflogo.png';
import { dashboard } from '@/routes';

type AuthUser = {
    id: number;
    name: string;
    email: string | null;
    avatar?: string | null;
    role?: string | null;
    roles?: string[];
    permissions?: string[];
};

type NavigationCounts = {
    leaveApplications?: number;
    undertimeRequests?: number;
    overtimeRequests?: number;
    travelOrders?: number;
    leaveApprovals?: number;
    leaveProcessing?: number;
    undertimeApprovals?: number;
    overtimeApprovals?: number;
    travelApprovals?: number;
};

type PageProps = {
    auth?: {
        user?: AuthUser | null;
    };
    navigationCounts?: NavigationCounts;
};

type MobileMenuType = 'requests' | 'approvals' | 'more' | null;

const mainNavItems: RBACNavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutDashboard,
        permission: 'dashboard.view',
        section: 'main',
    },
    {
        title: 'Employees',
        href: '/employees',
        icon: UserCog,
        permission: 'employees.view',
        section: 'organization',
    },
    {
        title: 'Leave Applications',
        href: '/leave/applications',
        icon: CalendarDays,
        permission: 'leave.view',
        section: 'requests',
        badgeLabel: 'applications',
    },
    {
        title: 'Undertime',
        href: '/undertime/applications',
        icon: Clock3,
        permission: 'undertime.view',
        section: 'requests',
        badgeLabel: 'requests',
    },
    {
        title: 'Overtime',
        href: '/overtime',
        icon: Clock3,
        permission: 'overtime.view',
        section: 'requests',
        badgeLabel: 'requests',
    },
    {
        title: 'Travel Orders',
        href: '/travel-orders',
        icon: Plane,
        permission: 'travel.view',
        section: 'requests',
        badgeLabel: 'orders',
    },
    {
        title: 'Leave Approvals',
        href: '/leave/approvals',
        icon: ClipboardCheck,
        permission: 'leave.approve',
        section: 'approvals',
        badgeLabel: 'pending approvals',
    },
    {
        title: 'Leave Processing',
        href: '/leave/processing',
        icon: ClipboardList,
        permission: 'leave.process',
        section: 'processing',
        badgeLabel: 'applications awaiting HR processing',
    },
    {
        title: 'Undertime Approvals',
        href: '/undertime/approvals',
        icon: Clock3,
        permission: 'undertime.approve',
        section: 'approvals',
        badgeLabel: 'pending approvals',
    },
    {
        title: 'Overtime Approvals',
        href: '/overtime/approvals',
        icon: Clock3,
        permission: 'overtime.approve',
        section: 'approvals',
        badgeLabel: 'pending approvals',
    },
    {
        title: 'Travel Order Approvals',
        href: '/travel-orders/approvals',
        icon: Plane,
        permission: 'travel.approve',
        section: 'approvals',
        badgeLabel: 'pending approvals',
    },
    {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
        permission: 'users.view',
        section: 'access',
    },
    {
        title: 'Roles & Permissions',
        href: '/admin/roles',
        icon: ShieldCheck,
        permission: 'users.manage-roles',
        section: 'access',
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: FileText,
        permission: 'reports.view',
        section: 'reports',
    },
];

const sectionLabels: Record<NavSection, string> = {
    main: 'Workspace',
    organization: 'Organization',
    requests: 'Requests',
    approvals: 'Approvals',
    processing: 'Processing',
    access: 'Access & Security',
    reports: 'Reports',
};

const sectionOrder: NavSection[] = [
    'main',
    'organization',
    'requests',
    'approvals',
    'processing',
    'access',
    'reports',
];

function safeCount(value: number | undefined): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return 0;
    }

    return Math.max(0, Math.floor(value));
}

function normalizePermissions(user: AuthUser): Set<string> {
    if (!Array.isArray(user.permissions)) {
        return new Set<string>();
    }

    return new Set(
        user.permissions
            .filter(
                (permission): permission is string =>
                    typeof permission === 'string' &&
                    permission.trim().length > 0,
            )
            .map((permission) => permission.trim()),
    );
}

function normalizeRoles(user: AuthUser): Set<string> {
    const suppliedRoles: string[] = [
        ...(Array.isArray(user.roles) ? user.roles : []),
        ...(typeof user.role === 'string' ? [user.role] : []),
    ];

    return new Set(
        suppliedRoles
            .filter(
                (role): role is string =>
                    typeof role === 'string',
            )
            .map((role) => role.trim().toLowerCase())
            .filter(Boolean),
    );
}

function getItemCount(
    title: string,
    counts: NavigationCounts,
): number {
    const countByTitle: Record<string, number | undefined> = {
        'Leave Applications': counts.leaveApplications,
        Undertime: counts.undertimeRequests,
        Overtime: counts.overtimeRequests,
        'Travel Orders': counts.travelOrders,
        'Leave Approvals': counts.leaveApprovals,
        'Undertime Approvals': counts.undertimeApprovals,
        'Leave Processing': counts.leaveProcessing,
        'Overtime Approvals': counts.overtimeApprovals,
        'Travel Order Approvals': counts.travelApprovals,
    };

    return safeCount(countByTitle[title]);
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);

    return parts.length
        ? parts
              .slice(0, 2)
              .map((part) => part.charAt(0).toUpperCase())
              .join('')
        : 'U';
}

function PendingBadge({
    count,
    label,
}: {
    count: number;
    label: string;
}) {
    if (count <= 0) return null;

    return (
        <span
            aria-label={`${count} ${label}`}
            className="inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold tabular-nums text-rose-700 ring-1 ring-inset ring-rose-100"
        >
            {count > 99 ? '99+' : count}
        </span>
    );
}

function MobileMenuPanel({
    type,
    items,
    user,
    onClose,
}: {
    type: Exclude<MobileMenuType, null>;
    items: RBACNavItem[];
    user: AuthUser;
    onClose: () => void;
}) {
    const { isCurrentUrl } = useCurrentUrl();

    const title =
        type === 'requests'
            ? 'Requests'
            : type === 'approvals'
              ? 'Approvals'
              : 'More';

    const subtitle =
        type === 'requests'
            ? 'Access your operational requests'
            : type === 'approvals'
              ? 'Review items awaiting your decision'
              : 'Your account and other services';

    const visibleItems =
        type === 'requests'
            ? items.filter((item) => item.section === 'requests')
            : type === 'approvals'
              ? items.filter((item) => item.section === 'approvals')
              : items.filter(
                    (item) =>
                        item.section !== 'main' &&
                        item.section !== 'requests' &&
                        item.section !== 'approvals',
                );

    const groupedItems = sectionOrder
        .map((section) => ({
            section,
            items: visibleItems.filter(
                (item) => item.section === section,
            ),
        }))
        .filter((group) => group.items.length > 0);

    const totalPending = visibleItems.reduce(
        (total, item) => total + safeCount(item.badgeCount),
        0,
    );

    return (
        <>
            <button
                type="button"
                aria-label="Close navigation panel"
                onClick={onClose}
                className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-[3px] lg:hidden"
            />

            <section
                id="mobile-navigation-panel"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={[
                    'fixed inset-x-0 bottom-0 z-50 lg:hidden',
                    'max-h-[min(82dvh,46rem)] overflow-y-auto',
                    'rounded-t-[1.5rem] border border-slate-200',
                    'bg-white shadow-[0_-12px_45px_rgba(15,23,42,0.16)]',
                    'pb-[calc(1rem+env(safe-area-inset-bottom))]',
                ].join(' ')}
            >
                <div className="sticky top-0 z-10 rounded-t-[1.5rem] border-b border-slate-100 bg-white/95 px-5 pb-4 pt-3 backdrop-blur-xl">
                    <div className="mx-auto mb-4 h-1 w-9 rounded-full bg-slate-200" />

                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-sky-700">
                                BHF OPERATIONS
                            </p>

                            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950">
                                {title}
                            </h2>

                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                {subtitle}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close panel"
                            className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                        >
                            <X className="size-5" />
                        </button>
                    </div>

                    {type === 'approvals' && totalPending > 0 && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5">
                            <ClipboardCheck className="size-4 shrink-0 text-amber-700" />

                            <p className="flex-1 text-xs font-medium text-amber-900">
                                Items requiring your attention
                            </p>

                            <span className="text-sm font-bold tabular-nums text-amber-900">
                                {totalPending > 999 ? '999+' : totalPending}
                            </span>
                        </div>
                    )}
                </div>

                <div className="space-y-5 px-5 pt-4">
                    {type === 'more' && (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sky-100 text-sm font-bold text-sky-800 ring-1 ring-inset ring-sky-200">
                                    {user.avatar ? (
                                        <img
                                            src={user.avatar}
                                            alt=""
                                            className="size-full object-cover"
                                        />
                                    ) : (
                                        getInitials(user.name || 'User')
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-900">
                                        {user.name || 'User'}
                                    </p>

                                    <p className="mt-0.5 truncate text-xs text-slate-500">
                                        {user.email || 'No email available'}
                                    </p>

                                    <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
                                        {user.roles?.[0] ??
                                            user.role ??
                                            'BHF Operations'}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <Link
                                    href="/settings/profile"
                                    prefetch
                                    onClick={onClose}
                                    className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600"
                                >
                                    <Settings className="size-4" />
                                    Settings
                                </Link>

                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        router.post('/logout');
                                    }}
                                    className="flex min-h-10 items-center justify-center gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                                >
                                    <LogOut className="size-4" />
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}

                    {groupedItems.map(({ section, items: groupItems }) => (
                        <div key={section}>
                            {type === 'more' && (
                                <h3 className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                                    {sectionLabels[section]}
                                </h3>
                            )}

                            <div className="space-y-2">
                                {groupItems.map((item) => {
                                    const Icon = item.icon;
                                    const active = isCurrentUrl(item.href);
                                    const count = safeCount(item.badgeCount);

                                    return (
                                        <Link
                                            key={`${section}:${item.title}`}
                                            href={item.href}
                                            prefetch
                                            onClick={onClose}
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                            className={[
                                                'flex min-h-[60px] items-center gap-3',
                                                'rounded-xl border p-3',
                                                'transition-colors duration-150',
                                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600',
                                                active
                                                    ? 'border-sky-200 bg-sky-50'
                                                    : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50',
                                            ].join(' ')}
                                        >
                                            <span
                                                className={[
                                                    'flex size-10 shrink-0 items-center justify-center rounded-xl',
                                                    active
                                                        ? 'bg-sky-800 text-white'
                                                        : 'bg-slate-100 text-slate-600',
                                                ].join(' ')}
                                            >
                                                {Icon && (
                                                    <Icon
                                                        aria-hidden="true"
                                                        className="size-[19px]"
                                                        strokeWidth={1.9}
                                                    />
                                                )}
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span
                                                    className={[
                                                        'block text-[13px] font-semibold',
                                                        active
                                                            ? 'text-sky-900'
                                                            : 'text-slate-800',
                                                    ].join(' ')}
                                                >
                                                    {item.title}
                                                </span>

                                                <span className="mt-1 block text-[11px] text-slate-500">
                                                    {type === 'approvals'
                                                        ? 'Review and process requests'
                                                        : type === 'requests'
                                                          ? 'Open request list'
                                                          : item.section === 'organization'
                                                            ? 'Manage organization'
                                                            : item.section === 'access'
                                                              ? 'Manage access and security'
                                                              : 'View reports and information'}
                                                </span>
                                            </span>

                                            {count > 0 && (
                                                <PendingBadge
                                                    count={count}
                                                    label={
                                                        item.badgeLabel ??
                                                        'items pending'
                                                    }
                                                />
                                            )}

                                            <ChevronRight className="size-4 shrink-0 text-slate-400" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {visibleItems.length === 0 && type !== 'more' && (
                        <div className="rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
                            <p className="text-sm font-semibold text-slate-700">
                                No available destinations
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Your account has no accessible pages in this section.
                            </p>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export function AppSidebar() {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user ?? null;

    const [mobileMenu, setMobileMenu] =
        useState<MobileMenuType>(null);

    const { isCurrentUrl } = useCurrentUrl();

    if (!user) return null;

    const permissions = normalizePermissions(user);
    const roles = normalizeRoles(user);
    const counts = props.navigationCounts ?? {};
    const isAdmin = roles.has('admin');

    const visibleNavItems: RBACNavItem[] = mainNavItems
        .filter((item) => {
            // Leave Processing is HR-only, even if another role has
            // the leave.process permission.
            if (item.section === 'processing' && !roles.has('hr')) {
                return false;
            }

            if (!permissions.has(item.permission)) {
                return false;
            }

            // Preserve the existing administrator navigation policy.
            if (
                isAdmin &&
                (item.section === 'requests' ||
                    item.section === 'approvals')
            ) {
                return false;
            }

            return true;
        })
        .map((item) => ({
            ...item,
            badgeCount: getItemCount(item.title, counts),
        }));

    const dashboardItem = visibleNavItems.find(
        (item) => item.section === 'main',
    );

    const requestItems = visibleNavItems.filter(
        (item) => item.section === 'requests',
    );

    const approvalItems = visibleNavItems.filter(
        (item) => item.section === 'approvals',
    );

    const moreItems = visibleNavItems.filter(
        (item) =>
            item.section !== 'main' &&
            item.section !== 'requests' &&
            item.section !== 'approvals',
    );

    const approvalCount = approvalItems.reduce(
        (total, item) => total + safeCount(item.badgeCount),
        0,
    );

    /*
     * Only render destinations available to this account.
     * flex-1 distributes the visible items evenly, eliminating
     * the empty grid columns shown in your screenshots.
     */
    const bottomItems = [
        ...(dashboardItem
            ? [
                  {
                      key: 'home',
                      label: 'Home',
                      icon: LayoutDashboard,
                      active: isCurrentUrl(dashboardItem.href),
                      onClick: undefined,
                      href: dashboardItem.href,
                      badge: 0,
                  },
              ]
            : []),
        ...(requestItems.length > 0
            ? [
                  {
                      key: 'requests',
                      label: 'Requests',
                      icon: CalendarDays,
                      active: mobileMenu === 'requests',
                      onClick: () =>
                          setMobileMenu((current) =>
                              current === 'requests' ? null : 'requests',
                          ),
                      href: undefined,
                      badge: 0,
                  },
              ]
            : []),
        ...(approvalItems.length > 0
            ? [
                  {
                      key: 'approvals',
                      label: 'Approvals',
                      icon: ClipboardCheck,
                      active: mobileMenu === 'approvals',
                      onClick: () =>
                          setMobileMenu((current) =>
                              current === 'approvals' ? null : 'approvals',
                          ),
                      href: undefined,
                      badge: approvalCount,
                  },
              ]
            : []),
        {
            key: 'more',
            label: 'More',
            icon: MoreHorizontal,
            active: mobileMenu === 'more',
            onClick: () =>
                setMobileMenu((current) =>
                    current === 'more' ? null : 'more',
                ),
            href: undefined,
            badge: 0,
        },
    ];

    return (
        <>
            {/* Desktop sidebar */}
            <div className="hidden lg:block">
                <Sidebar collapsible="icon" variant="inset">
                    <SidebarHeader className="border-b border-slate-200/80 px-2">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton
                                    size="lg"
                                    asChild
                                    className="h-[68px] rounded-xl hover:bg-slate-50"
                                >
                                    <Link
                                        href={dashboard()}
                                        prefetch
                                        aria-label="BHF Rural Bank dashboard"
                                    >
                                        <div className="flex min-w-0 items-center gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl">
                                                <img
                                                    src={BhfLogo}
                                                    alt="BHF Rural Bank"
                                                    className="size-10 object-contain"
                                                />
                                            </div>

                                            <div className="flex min-w-0 flex-col gap-1 leading-none">
                                                <span className="truncate text-[13px] font-bold tracking-tight text-slate-900">
                                                    BHF Rural Bank
                                                </span>
                                                <span className="truncate text-[10px] font-medium text-slate-500">
                                                    Operations Management
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>

                    <SidebarContent className="pt-4">
                        <NavMain
                            items={visibleNavItems}
                            userRoles={[...roles]}
                        />
                    </SidebarContent>

                    <SidebarFooter className="border-t border-slate-200/80 pt-2">
                        <NavUser />
                    </SidebarFooter>
                </Sidebar>
            </div>

            {/* Full-width responsive mobile navigation */}
            <nav
                aria-label="Mobile navigation"
                className={[
                    'fixed inset-x-0 bottom-0 z-30 lg:hidden',
                    'border-t border-slate-200 bg-white',
                    'shadow-[0_-4px_20px_rgba(15,23,42,0.06)]',
                    'pb-[env(safe-area-inset-bottom)]',
                ].join(' ')}
            >
                <div className="mx-auto flex w-full max-w-2xl items-stretch gap-1 px-2 pt-1.5">
                    {bottomItems.map((item) => {
                        const Icon = item.icon;

                        const content = (
                            <>
                                <span className="relative flex size-6 items-center justify-center">
                                    <Icon
                                        aria-hidden="true"
                                        className="size-[21px]"
                                        strokeWidth={item.active ? 2.2 : 1.8}
                                    />

                                    {item.badge > 0 && (
                                        <span className="absolute -right-2 -top-1 flex min-w-4 items-center justify-center rounded-full border-2 border-white bg-rose-600 px-1 text-[9px] font-bold leading-[13px] text-white">
                                            {item.badge > 99
                                                ? '99+'
                                                : item.badge}
                                        </span>
                                    )}
                                </span>

                                <span className="truncate text-[10px] font-semibold leading-4">
                                    {item.label}
                                </span>
                            </>
                        );

                        const className = [
                            'relative flex min-h-[52px] min-w-0 flex-1',
                            'flex-col items-center justify-center gap-1',
                            'rounded-lg px-1 py-1.5',
                            'transition-colors duration-150',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-600',
                            item.active
                                ? 'bg-sky-50 text-sky-800'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800',
                        ].join(' ');

                        if (item.href) {
                            return (
                                <Link
                                    key={item.key}
                                    href={item.href}
                                    prefetch
                                    aria-current={
                                        item.active ? 'page' : undefined
                                    }
                                    className={className}
                                >
                                    {content}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={item.key}
                                type="button"
                                onClick={item.onClick}
                                aria-expanded={item.active}
                                aria-controls="mobile-navigation-panel"
                                className={className}
                            >
                                {content}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {mobileMenu && (
                <MobileMenuPanel
                    type={mobileMenu}
                    items={visibleNavItems}
                    user={user}
                    onClose={() => setMobileMenu(null)}
                />
            )}
        </>
    );
}
