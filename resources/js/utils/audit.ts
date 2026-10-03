import type { AuditLog } from '@/types/user';
import { safeString } from '@/utils/user';

export function getAuditActorName(audit: AuditLog): string {
    return (
        safeString(audit.actor?.name).trim() ||
        safeString(audit.actor?.username).trim() ||
        'System'
    );
}

export function getAuditActionLabel(action: string): string {
    const labels: Record<string, string> = {
        password_reset: 'Password Reset',
        password_changed: 'Password Changed',
        user_updated: 'User Updated',
        user_created: 'User Created',
        user_deleted: 'User Deleted',
    };

    return (
        labels[action] ??
        action
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase())
    );
}

export function getAuditActionClass(action: string): string {
    const classes: Record<string, string> = {
        password_reset:
            'border-amber-200 bg-amber-50 text-amber-700',
        password_changed:
            'border-emerald-200 bg-emerald-50 text-emerald-700',
        user_updated:
            'border-blue-200 bg-blue-50 text-blue-700',
        user_created:
            'border-violet-200 bg-violet-50 text-violet-700',
        user_deleted:
            'border-red-200 bg-red-50 text-red-700',
    };

    return (
        classes[action] ??
        'border-slate-200 bg-slate-50 text-slate-600'
    );
}

export function formatAuditField(field: string): string {
    return field
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatAuditValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
        return 'Empty';
    }

    if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
    }

    return String(value);
}
