import { Link, usePage } from '@inertiajs/react';
import {
    CalendarDays,
    Clock3,
    FileText,
    LayoutGrid,
    Plane,
    Settings,
    ShieldCheck,
    UserCog,
    Users,
} from 'lucide-react';

import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
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

import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

type AuthUser = {
    id: number;
    name: string;
    email: string;
    role: string | null;
    roles: string[];
    permissions: string[];
};

type PageProps = {
    auth: {
        user: AuthUser | null;
    };
};

type RBACNavItem = NavItem & {
    permission?: string;
    roles?: string[];
};

/*
|--------------------------------------------------------------------------
| Main Navigation
|--------------------------------------------------------------------------
|
| If "permission" is provided, the item will only appear when the
| authenticated user has that permission.
|
| If "roles" is provided, the item will only appear for those roles.
|
| You can use either or both.
|
*/

const mainNavItems: RBACNavItem[] = [
    /*
    |--------------------------------------------------------------------------
    | General
    |--------------------------------------------------------------------------
    */

    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },

    /*
    |--------------------------------------------------------------------------
    | Administration
    |--------------------------------------------------------------------------
    */

    {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
        permission: 'users.view',
    },

    {
        title: 'Roles & Permissions',
        href: '/admin/roles',
        icon: ShieldCheck,
        permission: 'roles.view',
    },

    /*
    |--------------------------------------------------------------------------
    | Employees
    |--------------------------------------------------------------------------
    */

    {
        title: 'Employees',
        href: '/employees',
        icon: UserCog,
        permission: 'employees.view',
    },

    /*
    |--------------------------------------------------------------------------
    | Leave
    |--------------------------------------------------------------------------
    */

    {
        title: 'Leave Applications',
        href: '/leave-applications',
        icon: CalendarDays,
        permission: 'leave.view',
    },

    /*
    |--------------------------------------------------------------------------
    | Time Requests
    |--------------------------------------------------------------------------
    */

    {
        title: 'Undertime',
        href: '/undertime',
        icon: Clock3,
        permission: 'undertime.view',
    },

    {
        title: 'Overtime',
        href: '/overtime',
        icon: Clock3,
        permission: 'overtime.view',
    },

    /*
    |--------------------------------------------------------------------------
    | Travel
    |--------------------------------------------------------------------------
    */

    {
        title: 'Travel Orders',
        href: '/travel-orders',
        icon: Plane,
        permission: 'travel.view',
    },

    /*
    |--------------------------------------------------------------------------
    | Reports
    |--------------------------------------------------------------------------
    */

    {
        title: 'Reports',
        href: '/reports',
        icon: FileText,
        permission: 'reports.view',
    },

    /*
    |--------------------------------------------------------------------------
    | System
    |--------------------------------------------------------------------------
    */

    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        permission: 'settings.view',
    },
];

/*
|--------------------------------------------------------------------------
| Footer Navigation
|--------------------------------------------------------------------------
*/

const footerNavItems: NavItem[] = [];

/*
|--------------------------------------------------------------------------
| Permission Helper
|--------------------------------------------------------------------------
*/

function hasPermission(
    permissions: string[],
    requiredPermission?: string,
) {
    if (!requiredPermission) {
        return true;
    }

    return permissions.includes(requiredPermission);
}

/*
|--------------------------------------------------------------------------
| Sidebar
|--------------------------------------------------------------------------
*/

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;

    const user = auth.user;

    /*
    |--------------------------------------------------------------------------
    | Guest protection
    |--------------------------------------------------------------------------
    |
    | Normally AppSidebar is only rendered for authenticated users.
    | This prevents errors if the layout is ever rendered without auth data.
    |
    */

    if (!user) {
        return null;
    }

    const permissions = user.permissions ?? [];

    /*
    |--------------------------------------------------------------------------
    | Filter navigation according to RBAC
    |--------------------------------------------------------------------------
    */

    const visibleNavItems = mainNavItems.filter((item) => {
        return hasPermission(permissions, item.permission);
    });

    return (
        <Sidebar collapsible="icon" variant="inset">
            {/* ------------------------------------------------------------- */}
            {/* HEADER */}
            {/* ------------------------------------------------------------- */}

            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            {/* ------------------------------------------------------------- */}
            {/* MAIN NAVIGATION */}
            {/* ------------------------------------------------------------- */}

            <SidebarContent>
                <NavMain items={visibleNavItems} />
            </SidebarContent>

            {/* ------------------------------------------------------------- */}
            {/* FOOTER */}
            {/* ------------------------------------------------------------- */}

            <SidebarFooter>
                {footerNavItems.length > 0 && (
                    <NavFooter
                        items={footerNavItems}
                        className="mt-auto"
                    />
                )}

                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}