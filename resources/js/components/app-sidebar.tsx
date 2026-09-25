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
    role: string | null;
    roles: string[];
    permissions: string[];
};

type PageProps = {
    auth: {
        user: AuthUser | null;
    };
};

/*
|--------------------------------------------------------------------------
| Main Navigation
|--------------------------------------------------------------------------
|
| Dashboard
|
| Pages
| ├── Employees
| ├── Leave Applications
| ├── Undertime
| ├── Overtime
| ├── Travel Orders
| └── Reports
|
| Administration
| ├── User Management
| ├── Roles & Permissions
| └── Settings
|
|--------------------------------------------------------------------------
*/

const mainNavItems: RBACNavItem[] = [
    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    */

    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },

    /*
    |--------------------------------------------------------------------------
    | Pages
    |--------------------------------------------------------------------------
    */

    {
        title: 'Employees',
        href: '/employees',
        icon: UserCog,
        permission: 'employees.view',
        section: 'pages',
    },

    {
        title: 'Leave Applications',
        href: '/leave-applications',
        icon: CalendarDays,
        permission: 'leave.view',
        section: 'pages',
    },

    {
        title: 'Undertime',
        href: '/undertime',
        icon: Clock3,
        permission: 'undertime.view',
        section: 'pages',
    },

    {
        title: 'Overtime',
        href: '/overtime',
        icon: Clock3,
        permission: 'overtime.view',
        section: 'pages',
    },

    {
        title: 'Travel Orders',
        href: '/travel-orders',
        icon: Plane,
        permission: 'travel.view',
        section: 'pages',
    },

    {
        title: 'Reports',
        href: '/reports',
        icon: FileText,
        permission: 'reports.view',
        section: 'pages',
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
        section: 'administration',
    },

    {
        title: 'Roles & Permissions',
        href: '/admin/roles',
        icon: ShieldCheck,
        permission: 'roles.view',
        section: 'administration',
    },

    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        permission: 'settings.view',
        section: 'administration',
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
) {
    /*
    |--------------------------------------------------------------------------
    | No permission requirement
    |--------------------------------------------------------------------------
    |
    | Items without a permission are available to authenticated users.
    |
    */

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
    | Guest Protection
    |--------------------------------------------------------------------------
    |
    | Normally the sidebar only renders for authenticated users.
    | This prevents errors if the layout is ever rendered without auth data.
    |
    */

    if (!user) {
        return null;
    }

    /*
    |--------------------------------------------------------------------------
    | User Permissions
    |--------------------------------------------------------------------------
    */

    const permissions = user.permissions ?? [];

    /*
    |--------------------------------------------------------------------------
    | Filter Navigation According To RBAC
    |--------------------------------------------------------------------------
    */

    const visibleNavItems = mainNavItems.filter((item) => {
        return hasPermission(
            permissions,
            item.permission,
        );
    });

    return (
        <Sidebar
            collapsible="icon"
            variant="inset"
        >
            {/* ------------------------------------------------------------- */}
            {/* HEADER */}
            {/* ------------------------------------------------------------- */}

            <SidebarHeader className="border-b border-slate-200">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            size="lg"
                            asChild
                            className="h-16 rounded-lg hover:bg-transparent"
                        >
                            <Link
                                href={dashboard()}
                                prefetch
                            >
                                <div className="flex items-center gap-3">
                                    {/* ------------------------------------------------- */}
                                    {/* BHF LOGO */}
                                    {/* ------------------------------------------------- */}

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center">
                                        <img
                                            src={BhfLogo}
                                            alt="BHF Rural Bank"
                                            className="h-10 w-10 object-contain"
                                        />
                                    </div>

                                    {/* ------------------------------------------------- */}
                                    {/* BRAND NAME */}
                                    {/* ------------------------------------------------- */}

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

            {/* ------------------------------------------------------------- */}
            {/* MAIN NAVIGATION */}
            {/* ------------------------------------------------------------- */}

            <SidebarContent className="pt-3">
                <NavMain
                    items={visibleNavItems}
                />
            </SidebarContent>

            {/* ------------------------------------------------------------- */}
            {/* FOOTER */}
            {/* ------------------------------------------------------------- */}

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}