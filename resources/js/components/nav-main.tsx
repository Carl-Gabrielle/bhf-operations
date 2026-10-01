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

/*
|--------------------------------------------------------------------------
| Navigation Sections
|--------------------------------------------------------------------------
*/

export type NavSection =
    | 'main'
    | 'organization'
    | 'requests'
    | 'access'
    | 'reports';

/*
|--------------------------------------------------------------------------
| RBAC Navigation Item
|--------------------------------------------------------------------------
*/

export type RBACNavItem = NavItem & {
    permission?: string;
    roles?: string[];
    section?: NavSection;
};

/*
|--------------------------------------------------------------------------
| Props
|--------------------------------------------------------------------------
*/

type NavMainProps = {
    items: RBACNavItem[];
};

/*
|--------------------------------------------------------------------------
| Section Configuration
|--------------------------------------------------------------------------
|
| Controls the order and labels of the sidebar sections.
|
|--------------------------------------------------------------------------
*/

const sectionConfig: {
    key: NavSection;
    label: string;
}[] = [
    {
        key: 'main',
        label: 'Main',
    },
    {
        key: 'organization',
        label: 'Organization',
    },
    {
        key: 'requests',
        label: 'Requests',
    },
    {
        key: 'access',
        label: 'Access & Security',
    },
    {
        key: 'reports',
        label: 'Reports',
    },
];

/*
|--------------------------------------------------------------------------
| Navigation Styling
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| NavMain
|--------------------------------------------------------------------------
*/

export function NavMain({
    items,
}: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();

    /*
    |--------------------------------------------------------------------------
    | Render Individual Section
    |--------------------------------------------------------------------------
    */

    const renderSection = (
        section: NavSection,
        label: string,
    ) => {
        const sectionItems = items.filter(
            (item) => item.section === section,
        );

        /*
        |--------------------------------------------------------------------------
        | Don't render empty sections
        |--------------------------------------------------------------------------
        */

        if (sectionItems.length === 0) {
            return null;
        }

        return (
            <SidebarGroup
                key={section}
                className="px-2 py-0"
            >
                {/* --------------------------------------------------------- */}
                {/* SECTION LABEL                                              */}
                {/* --------------------------------------------------------- */}

                <SidebarGroupLabel
                    className="
                        mb-2
                        px-3
                        text-[11px]
                        font-semibold
                        uppercase
                        tracking-[0.08em]
                        text-slate-400
                    "
                >
                    {label}
                </SidebarGroupLabel>

                {/* --------------------------------------------------------- */}
                {/* NAVIGATION ITEMS                                           */}
                {/* --------------------------------------------------------- */}

                <SidebarMenu className="gap-1">
                    {sectionItems.map((item) => {
                        const Icon = item.icon;

                        return (
                            <SidebarMenuItem
                                key={item.title}
                            >
                                <SidebarMenuButton
                                    asChild
                                    isActive={isCurrentUrl(
                                        item.href,
                                    )}
                                    tooltip={{
                                        children:
                                            item.title,
                                    }}
                                    className={
                                        navigationClassName
                                    }
                                >
                                    <Link
                                        href={item.href}
                                        prefetch
                                    >
                                        {Icon && <Icon />}

                                        <span>
                                            {item.title}
                                        </span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroup>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="space-y-6">
            {sectionConfig.map(
                ({ key, label }) =>
                    renderSection(key, label),
            )}
        </div>
    );
}