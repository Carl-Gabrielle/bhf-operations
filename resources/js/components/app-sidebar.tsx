import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    ClipboardCheck,
    Clock3,
    FileText,
    LayoutGrid,
    Plane,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import type { RBACNavItem } from '@/components/nav-main';
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

import BhfLogo from '@/assets/images/bhflogo.png';
import { dashboard } from '@/routes';

/*
|--------------------------------------------------------------------------
| Inertia Props
|--------------------------------------------------------------------------
|
| Counts must be calculated on the server from requests the authenticated
| user is authorized to act on. They are display hints, never authorization.
| Missing counts safely default to zero and therefore render no badge.
|
*/

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
    undertimeApprovals?: number;
    overtimeApprovals?: number;
    travelApprovals?: number;
};

type PageProps = {
    auth?: { user?: AuthUser | null };
    navigationCounts?: NavigationCounts;
};

/*
|--------------------------------------------------------------------------
| Navigation Configuration
|--------------------------------------------------------------------------
*/

const mainNavItems: RBACNavItem[] = [
    {
        title: 'Dashboard', href: dashboard(), icon: LayoutGrid,
        permission: 'dashboard.view', section: 'main',
    },
    {
        title: 'Employees', href: '/employees', icon: UserCog,
        permission: 'employees.view', section: 'organization',
    },
    {
        title: 'Leave Applications', href: '/leave/applications', icon: CalendarDays,
        permission: 'leave.view', section: 'requests',
    },
    {
        title: 'Undertime', href: '/undertime', icon: Clock3,
        permission: 'undertime.view', section: 'requests',
    },
    {
        title: 'Overtime', href: '/overtime', icon: Clock3,
        permission: 'overtime.view', section: 'requests',
    },
    {
        title: 'Travel Orders', href: '/travel-orders', icon: Plane,
        permission: 'travel.view', section: 'requests',
    },
    {
        title: 'Leave Approvals', href: '/leave/approvals', icon: ClipboardCheck,
        permission: 'leave.approve', section: 'approvals', badgeLabel: 'pending approvals',
    },
    {
        title: 'Undertime Approvals', href: '/undertime/approvals', icon: Clock3,
        permission: 'undertime.approve', section: 'approvals', badgeLabel: 'pending approvals',
    },
    {
        title: 'Overtime Approvals', href: '/overtime/approvals', icon: Clock3,
        permission: 'overtime.approve', section: 'approvals', badgeLabel: 'pending approvals',
    },
    {
        title: 'Travel Order Approvals', href: '/travel-orders/approvals', icon: Plane,
        permission: 'travel.approve', section: 'approvals', badgeLabel: 'pending approvals',
    },
    {
        title: 'User Management', href: '/admin/users', icon: Users,
        permission: 'users.view', section: 'access',
    },
    {
        title: 'Roles & Permissions', href: '/admin/roles', icon: ShieldCheck,
        permission: 'users.manage-roles', section: 'access',
    },
    {
        title: 'Reports', href: '/reports', icon: FileText,
        permission: 'reports.view', section: 'reports',
    },
];

function normalizePermissions(user: AuthUser): Set<string> {
    if (!Array.isArray(user.permissions)) return new Set();

    return new Set(
        user.permissions.filter(
            (permission): permission is string =>
                typeof permission === 'string' && permission.trim().length > 0,
        ).map((permission) => permission.trim()),
    );
}

function normalizeRoles(user: AuthUser): Set<string> {
    const suppliedRoles = [
        ...(Array.isArray(user.roles) ? user.roles : []),
        ...(typeof user.role === 'string' ? [user.role] : []),
    ];

    return new Set(
        suppliedRoles
            .filter((role): role is string => typeof role === 'string')
            .map((role) => role.trim().toLowerCase())
            .filter(Boolean),
    );
}

function safeCount(value: number | undefined): number {
    return typeof value === 'number' && Number.isFinite(value)
        ? Math.max(0, Math.floor(value))
        : 0;
}

export function AppSidebar() {
    const { props } = usePage<PageProps>();
    const user = props.auth?.user ?? null;

    if (!user) return null;

    const permissions = normalizePermissions(user);
    const roles = normalizeRoles(user);
    const counts = props.navigationCounts ?? {};
    const isAdmin = roles.has('admin');

    const countByTitle: Record<string, number | undefined> = {
        'Leave Applications': counts.leaveApplications,
        Undertime: counts.undertimeRequests,
        Overtime: counts.overtimeRequests,
        'Travel Orders': counts.travelOrders,
        'Leave Approvals': counts.leaveApprovals,
        'Undertime Approvals': counts.undertimeApprovals,
        'Overtime Approvals': counts.overtimeApprovals,
        'Travel Order Approvals': counts.travelApprovals,
    };

    const visibleNavItems = mainNavItems
        .filter((item) => {
            // Fail closed if the item has no permission or the permission is absent.
            if (!item.permission || !permissions.has(item.permission)) return false;

            // Product policy: administrators use administration tools, not employee requests/approvals.
            if (isAdmin && (item.section === 'requests' || item.section === 'approvals')) {
                return false;
            }

            return true;
        })
        .map((item) => ({
            ...item,
            badgeCount: safeCount(countByTitle[item.title]),
        }));

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="border-b border-slate-200/80">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-16 rounded-lg hover:bg-transparent"
                        >
                            <Link href={dashboard()} prefetch aria-label="BHF Rural Bank dashboard">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                                        <img
                                            src={BhfLogo}
                                            alt="BHF Rural Bank"
                                            className="h-10 w-10 object-contain"
                                        />
                                    </div>
                                    <div className="flex min-w-0 flex-col leading-tight">
                                        <span className="truncate text-sm font-semibold text-slate-900">
                                            BHF Rural Bank
                                        </span>
                                        <span className="truncate text-xs font-medium text-slate-500">
                                            Operations Management
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="pt-3">
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-slate-200/70 pt-2">
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
