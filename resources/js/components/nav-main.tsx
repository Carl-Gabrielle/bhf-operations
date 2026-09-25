import { Link } from '@inertiajs/react';

import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

import { useCurrentUrl } from '@/hooks/use-current-url';
import type { NavItem } from '@/types';

export type NavSection = 'pages' | 'administration';

export type RBACNavItem = NavItem & {
    permission?: string;
    roles?: string[];
    section?: NavSection;
};

type NavMainProps = {
    items: RBACNavItem[];
};

export function NavMain({ items }: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();

    const dashboardItem = items.find(
        (item) => item.title === 'Dashboard',
    );

    const pageItems = items.filter(
        (item) => item.section === 'pages',
    );

    const administrationItems = items.filter(
        (item) => item.section === 'administration',
    );

const navigationClassName = `
    relative
    h-10
    rounded-lg
    px-3
    text-[14px]
    font-medium
    text-slate-600
    transition-all
    duration-150

    hover:bg-[#EEF5FA]
    hover:text-[#28658F]

    data-[active=true]:bg-[#4389BC]
    data-[active=true]:text-white
    data-[active=true]:font-semibold
    data-[active=true]:shadow-sm
    data-[active=true]:shadow-[#4389BC]/20

    [&>svg]:size-[18px]
    [&>svg]:text-slate-500
    [&>svg]:transition-colors
    hover:[&>svg]:text-[#4389BC]
    data-[active=true]:[&>svg]:text-white
`;

    return (
        <div className="space-y-6">
            {/* ------------------------------------------------------------- */}
            {/* DASHBOARD */}
            {/* ------------------------------------------------------------- */}

            {dashboardItem && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                asChild
                                isActive={isCurrentUrl(
                                    dashboardItem.href,
                                )}
                                tooltip={{
                                    children: dashboardItem.title,
                                }}
                                className={navigationClassName}
                            >
                                <Link
                                    href={dashboardItem.href}
                                    prefetch
                                >
                                    {dashboardItem.icon && (
                                        <dashboardItem.icon />
                                    )}

                                    <span>
                                        {dashboardItem.title}
                                    </span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {/* ------------------------------------------------------------- */}
            {/* PAGES */}
            {/* ------------------------------------------------------------- */}

            {pageItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                        Pages
                    </SidebarGroupLabel>

                    <SidebarMenu className="gap-1">
                        {pageItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(
                                        item.href,
                                    )}
                                    tooltip={{
                                        children: item.title,
                                    }}
                                    className={navigationClassName}
                                >
                                    <Link
                                        href={item.href}
                                        prefetch
                                    >
                                        {item.icon && (
                                            <item.icon />
                                        )}

                                        <span>
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}

            {/* ------------------------------------------------------------- */}
            {/* ADMINISTRATION */}
            {/* ------------------------------------------------------------- */}

            {administrationItems.length > 0 && (
                <SidebarGroup className="px-2 py-0">
                    <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                        Administration
                    </SidebarGroupLabel>

                    <SidebarMenu className="gap-1">
                        {administrationItems.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(
                                        item.href,
                                    )}
                                    tooltip={{
                                        children: item.title,
                                    }}
                                    className={navigationClassName}
                                >
                                    <Link
                                        href={item.href}
                                        prefetch
                                    >
                                        {item.icon && (
                                            <item.icon />
                                        )}

                                        <span>
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            )}
        </div>
    );
}