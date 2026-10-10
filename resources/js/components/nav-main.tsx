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
    | 'approvals'
    | 'access'
    | 'reports';

/*
|--------------------------------------------------------------------------
| RBAC Navigation Item
|--------------------------------------------------------------------------
*/

export type RBACNavItem = NavItem & {
    /** Every protected navigation item should declare a permission. */
    permission: string;
    section: NavSection;
    /** Server-calculated count of actionable items visible to this user. */
    badgeCount?: number;
    /** Accessible description for the count, e.g. "pending approvals". */
    badgeLabel?: string;
};

type NavMainProps = {
    items: RBACNavItem[];
};

const sectionConfig: { key: NavSection; label: string }[] = [
    { key: 'main', label: 'Main' },
    { key: 'organization', label: 'Organization' },
    { key: 'requests', label: 'Requests' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'access', label: 'Access & Security' },
    { key: 'reports', label: 'Reports' },
];

const navigationClassName = `
    group/nav-item relative h-10 rounded-lg px-3 text-[14px] font-medium
    text-slate-600 transition-colors duration-150
    hover:bg-[#EEF5FA] hover:text-[#28658F]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4389BC]
    focus-visible:ring-offset-2
    data-[active=true]:bg-[#E7F1F8]
    data-[active=true]:text-[#205C86]
    data-[active=true]:font-semibold
    [&>svg]:size-[18px] [&>svg]:shrink-0 [&>svg]:text-slate-500
    [&>svg]:transition-colors
    hover:[&>svg]:text-[#4389BC]
    data-[active=true]:[&>svg]:text-[#28658F]
`;

function normalizeCount(count: number | undefined): number {
    if (typeof count !== 'number' || !Number.isFinite(count)) return 0;
    return Math.max(0, Math.floor(count));
}

function CountBadge({ count, label }: { count: number; label: string }) {
    if (count <= 0) return null;

    const visibleCount = count > 99 ? '99+' : String(count);

    return (
        <span
            className="ml-auto inline-flex min-w-5 items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[11px] font-semibold leading-4 tabular-nums text-sky-800 group-data-[active=true]/nav-item:border-sky-200 group-data-[active=true]/nav-item:bg-white group-data-[active=true]/nav-item:text-sky-800"
            aria-label={`${count} ${label}`}
            title={`${count} ${label}`}
        >
            {visibleCount}
        </span>
    );
}

export function NavMain({ items }: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();

    const renderSection = (section: NavSection, label: string) => {
        const sectionItems = items.filter((item) => item.section === section);
        if (sectionItems.length === 0) return null;

        const sectionCount = section === 'approvals'
            ? sectionItems.reduce((total, item) => total + normalizeCount(item.badgeCount), 0)
            : 0;

        return (
            <SidebarGroup key={section} className="px-2 py-0">
                <SidebarGroupLabel className="mb-2 flex h-7 items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    <span>{label}</span>
                    {sectionCount > 0 && (
                        <span
                            className="inline-flex min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold leading-4 tabular-nums text-slate-600"
                            aria-label={`${sectionCount} pending approvals in total`}
                            title={`${sectionCount} pending approvals in total`}
                        >
                            {sectionCount > 99 ? '99+' : sectionCount}
                        </span>
                    )}
                </SidebarGroupLabel>

                <SidebarMenu className="gap-1">
                    {sectionItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = isCurrentUrl(item.href);
                        const count = normalizeCount(item.badgeCount);
                        const accessibleLabel = count > 0
                            ? `${item.title}, ${count} ${item.badgeLabel ?? 'items pending'}`
                            : item.title;

                        return (
                            <SidebarMenuItem key={`${item.section}:${item.title}`}>
                                <SidebarMenuButton
                                    asChild
                                    isActive={isActive}
                                    tooltip={{ children: accessibleLabel }}
                                    className={navigationClassName}
                                >
                                    <Link
                                        href={item.href}
                                        prefetch
                                        aria-current={isActive ? 'page' : undefined}
                                        aria-label={accessibleLabel}
                                    >
                                        {Icon && <Icon aria-hidden="true" />}
                                        <span className="min-w-0 flex-1 truncate">{item.title}</span>
                                        <CountBadge
                                            count={count}
                                            label={item.badgeLabel ?? 'items pending'}
                                        />
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        );
                    })}
                </SidebarMenu>
            </SidebarGroup>
        );
    };

    return <div className="space-y-5 pb-2">{sectionConfig.map(({ key, label }) => renderSection(key, label))}</div>;
}
