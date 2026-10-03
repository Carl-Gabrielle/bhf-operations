import type { UserData } from '@/types/user';

export function safeString(value: string | null | undefined): string {
    return typeof value === 'string' ? value : '';
}

export function normalizeUser(
    user: UserData | { data: UserData },
): UserData {
    if (
        user &&
        typeof user === 'object' &&
        'data' in user &&
        user.data
    ) {
        return user.data;
    }

    return user as UserData;
}

export function getDisplayName(user: UserData): string {
    const fullName = [
        safeString(user.first_name).trim(),
        safeString(user.middle_name).trim(),
        safeString(user.last_name).trim(),
    ]
        .filter(Boolean)
        .join(' ');

    return (
        fullName ||
        safeString(user.name).trim() ||
        safeString(user.username).trim() ||
        'User'
    );
}

export function getInitials(user: UserData): string {
    const name = getDisplayName(user).trim();

    if (!name) {
        return 'U';
    }

    const parts = name.split(/\s+/).filter(Boolean);

    if (parts.length === 1) {
        return parts[0].slice(0, 2).toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}
