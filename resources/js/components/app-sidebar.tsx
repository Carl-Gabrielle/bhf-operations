import { Link, usePage } from '@inertiajs/react';

import {
    CalendarDays,
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
| Authentication Types
|--------------------------------------------------------------------------
*/

type AuthUser = {
    id: number;
    name: string;
    email: string;

    role?: string | null;

    roles?: string[];

    permissions?: string[];
};

type PageProps = {
    auth?: {
        user?: AuthUser | null;
    };
};

/*
|--------------------------------------------------------------------------
| Main Navigation
|--------------------------------------------------------------------------
|
| IMPORTANT:
|
| Navigation is controlled by PERMISSIONS.
|
| We do NOT hardcode:
|
| if role === admin
|
| This allows Spatie Permission to control what each user can see.
|
|--------------------------------------------------------------------------
*/

const mainNavItems: RBACNavItem[] = [
    /*
    |--------------------------------------------------------------------------
    | MAIN
    |--------------------------------------------------------------------------
    */

    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
        permission: 'dashboard.view',
        section: 'main',
    },

    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION
    |--------------------------------------------------------------------------
    */

    {
        title: 'Employees',
        href: '/employees',
        icon: UserCog,
        permission: 'employees.view',
        section: 'organization',
    },

    /*
    |--------------------------------------------------------------------------
    | REQUESTS
    |--------------------------------------------------------------------------
    */

   {
    title: 'Leave Applications',
    href: '/leave/applications',
    icon: CalendarDays,
    permission: 'leave.view',
    section: 'requests',
    },

    {
        title: 'Undertime',
        href: '/undertime',
        icon: Clock3,
        permission: 'undertime.view',
        section: 'requests',
    },

    {
        title: 'Overtime',
        href: '/overtime',
        icon: Clock3,
        permission: 'overtime.view',
        section: 'requests',
    },

    {
        title: 'Travel Orders',
        href: '/travel-orders',
        icon: Plane,
        permission: 'travel.view',
        section: 'requests',
    },

    /*
    |--------------------------------------------------------------------------
    | ACCESS & SECURITY
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | REPORTS
    |--------------------------------------------------------------------------
    */

    {
        title: 'Reports',
        href: '/reports',
        icon: FileText,
        permission: 'reports.view',
        section: 'reports',
    },
];

/*
|--------------------------------------------------------------------------
| Permission Helper
|--------------------------------------------------------------------------
*/

function hasPermission(
    permissions: string[],
    requiredPermission?: string,
): boolean {
    /*
    |--------------------------------------------------------------------------
    | No Permission Required
    |--------------------------------------------------------------------------
    */

    if (!requiredPermission) {
        return true;
    }

    /*
    |--------------------------------------------------------------------------
    | Check Permission
    |--------------------------------------------------------------------------
    */

    return permissions.includes(
        requiredPermission,
    );
}

/*
|--------------------------------------------------------------------------
| App Sidebar
|--------------------------------------------------------------------------
*/

export function AppSidebar() {
    /*
    |--------------------------------------------------------------------------
    | Get Inertia Props
    |--------------------------------------------------------------------------
    */

    const page = usePage<PageProps>();

    const user =
        page.props.auth?.user ?? null;

    /*
    |--------------------------------------------------------------------------
    | Guest Protection
    |--------------------------------------------------------------------------
    */

    if (!user) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | Get Permissions
    |--------------------------------------------------------------------------
    */

    const permissions =
        user.permissions ?? [];

    /*
    |--------------------------------------------------------------------------
    | Filter Navigation By Permission
    |--------------------------------------------------------------------------
    */

   const isAdmin =
    user.roles?.some(
        (role: string) => role.toLowerCase() === 'admin',
    ) ?? false;

const visibleNavItems =
    mainNavItems.filter((item) => {
        // Admin does not need Requests
        if (
            isAdmin &&
            item.section === 'requests'
        ) {
            return false;
        }

        return hasPermission(
            permissions,
            item.permission,
        );
    });
    /*
    |--------------------------------------------------------------------------
    | Render Sidebar
    |--------------------------------------------------------------------------
    */

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
        >
            {/* ============================================================= */}
            {/* HEADER                                                        */}
            {/* ============================================================= */}

            <SidebarHeader className="border-b border-slate-200">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="
                                h-16
                                rounded-lg
                                hover:bg-transparent
                            "
                        >
                            <Link
                                href={dashboard()}
                                prefetch
                            >
                                <div className="flex items-center gap-3">

                                    {/* ================================================= */}
                                    {/* LOGO                                            */}
                                    {/* ================================================= */}

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                                        <img
                                            src={BhfLogo}
                                            alt="BHF Rural Bank"
                                            className="h-10 w-10 object-contain"
                                        />
                                    </div>

                                    {/* ================================================= */}
                                    {/* BRAND                                           */}
                                    {/* ================================================= */}

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

            {/* ============================================================= */}
            {/* NAVIGATION                                                     */}
            {/* ============================================================= */}

            <SidebarContent className="pt-3">
                <NavMain
                    items={visibleNavItems}
                />
            </SidebarContent>

            {/* ============================================================= */}
            {/* USER                                                           */}
            {/* ============================================================= */}

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}