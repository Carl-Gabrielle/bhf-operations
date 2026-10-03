function normalizeStatus(status?: string | null): string {
    return status?.trim().toLowerCase() ?? '';
}

export function getStatusLabel(status?: string | null): string {
    const value = normalizeStatus(status);

    if (!value) {
        return 'Unknown';
    }

    return value
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function getStatusClass(status?: string | null): string {
    switch (normalizeStatus(status)) {
        case 'active':
            return 'border-emerald-200 bg-emerald-50 text-emerald-700';
        case 'inactive':
        case 'disabled':
        case 'suspended':
            return 'border-red-200 bg-red-50 text-red-700';
        case 'locked':
            return 'border-amber-200 bg-amber-50 text-amber-700';
        default:
            return 'border-slate-200 bg-slate-50 text-slate-600';
    }
}

export function getStatusDot(status?: string | null): string {
    switch (normalizeStatus(status)) {
        case 'active':
            return 'bg-emerald-500';
        case 'locked':
            return 'bg-amber-500';
        case 'inactive':
        case 'disabled':
        case 'suspended':
            return 'bg-red-500';
        default:
            return 'bg-slate-400';
    }
}
