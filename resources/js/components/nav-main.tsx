
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

export type NavSection =
    | 'main'
    | 'organization'
    | 'requests'
    | 'approvals'
    | 'processing'
    | 'access'
    | 'reports';

export type RBACNavItem = NavItem & {
    permission: string;
    section: NavSection;
    badgeCount?: number;
    badgeLabel?: string;
};

type NavMainProps = {
    items: RBACNavItem[];
    userRoles?: string[];
};

const sectionConfig: { key: NavSection; label: string }[] = [
    { key: 'main', label: 'Workspace' },
    { key: 'organization', label: 'Organization' },
    { key: 'requests', label: 'Requests' },
    { key: 'approvals', label: 'Approvals' },
    { key: 'processing', label: 'HR Processing' },
    { key: 'access', label: 'Access & Security' },
    { key: 'reports', label: 'Reports' },
];

function normalizeCount(count: number | undefined): number {
    if (typeof count !== 'number' || !Number.isFinite(count)) {
        return 0;
    }

    return Math.max(0, Math.floor(count));
}

export function CountBadge({
    count,
    label,
    className = '',
}: {
    count: number;
    label: string;
    className?: string;
}) {
    if (count <= 0) return null;

    const visibleCount = count > 99 ? '99+' : String(count);

    return (
        <span
            className={`ml-auto inline-flex min-w-5 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold leading-4 tabular-nums text-sky-800 ${className}`}
            aria-label={`${count} ${label}`}
            title={`${count} ${label}`}
        >
            {visibleCount}
        </span>
    );
}

export function NavMain({
    items,
    userRoles = [],
}: NavMainProps) {
    const { isCurrentUrl } = useCurrentUrl();

    const isHR = userRoles.includes('hr');

    // Defense in depth for navigation visibility.
    // Processing is rendered only for the HR role.
    const visibleItems = items.filter((item) => {
        if (item.section === 'processing' && !isHR) {
            return false;
        }

        return true;
    });

    return (
        <div className="space-y-5 pb-3">
            {sectionConfig.map(({ key, label }) => {
                const sectionItems = visibleItems.filter(
                    (item) => item.section === key,
                );

                if (sectionItems.length === 0) return null;

                const sectionCount =
                    key === 'approvals'
                        ? sectionItems.reduce(
                              (total, item) =>
                                  total + normalizeCount(item.badgeCount),
                              0,
                          )
                        : 0;

                return (
                    <SidebarGroup key={key} className="px-2 py-0">
                        <SidebarGroupLabel className="mb-1.5 flex h-7 items-center gap-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                            <span>{label}</span>

                            {sectionCount > 0 && (
                                <span
                                    className="inline-flex min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold leading-4 text-slate-600"
                                    aria-label={`${sectionCount} pending approvals in total`}
                                >
                                    {sectionCount > 99
                                        ? '99+'
                                        : sectionCount}
                                </span>
                            )}
                        </SidebarGroupLabel>

                        <SidebarMenu className="gap-1">
                            {sectionItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = isCurrentUrl(item.href);
                                const count = normalizeCount(item.badgeCount);

                                const accessibleLabel =
                                    count > 0
                                        ? `${item.title}, ${count} ${item.badgeLabel ?? 'items pending'}`
                                        : item.title;

                                return (
                                    <SidebarMenuItem
                                        key={`${item.section}:${item.title}`}
                                    >
                                        <SidebarMenuButton
                                            asChild
                                            isActive={isActive}
                                            tooltip={{
                                                children: accessibleLabel,
                                            }}
                                            className={[
                                                'group/nav-item h-10 rounded-xl px-3',
                                                'text-[13px] font-medium',
                                                'text-slate-600 transition-all duration-150',
                                                'hover:bg-slate-100 hover:text-sky-800',
                                                'focus-visible:ring-2 focus-visible:ring-sky-600',
                                                'data-[active=true]:bg-sky-50',
                                                'data-[active=true]:font-semibold',
                                                'data-[active=true]:text-sky-800',
                                                '[&>svg]:size-[18px] [&>svg]:shrink-0',
                                                '[&>svg]:text-slate-400',
                                                'data-[active=true]:[&>svg]:text-sky-700',
                                            ].join(' ')}
                                        >
                                            <Link
                                                href={item.href}
                                                prefetch
                                                aria-current={
                                                    isActive ? 'page' : undefined
                                                }
                                                aria-label={accessibleLabel}
                                            >
                                                {Icon && (
                                                    <Icon
                                                        aria-hidden="true"
                                                        className="shrink-0"
                                                    />
                                                )}

                                                <span className="min-w-0 flex-1 truncate">
                                                    {item.title}
                                                </span>

                                                <CountBadge
                                                    count={count}
                                                    label={
                                                        item.badgeLabel ??
                                                        'items pending'
                                                    }
                                                    className="group-data-[active=true]/nav-item:border-sky-200 group-data-[active=true]/nav-item:bg-white"
                                                />
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroup>
                );
            })}
        </div>
    );
}
