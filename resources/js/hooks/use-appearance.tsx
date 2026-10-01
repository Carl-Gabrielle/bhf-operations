import { useSyncExternalStore } from 'react';

export type ResolvedAppearance = 'light' | 'dark';
export type Appearance = ResolvedAppearance;

export type UseAppearanceReturn = {
    readonly appearance: Appearance;
    readonly resolvedAppearance: ResolvedAppearance;
    readonly updateAppearance: (mode: Appearance) => void;
};

const listeners = new Set<() => void>();

let currentAppearance: Appearance = 'light';

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const maxAge = days * 24 * 60 * 60;

    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getStoredAppearance = (): Appearance => {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const stored = localStorage.getItem('appearance');

    if (stored === 'dark') {
        return 'dark';
    }

    return 'light';
};

const isDarkMode = (appearance: Appearance): boolean => {
    return appearance === 'dark';
};

const applyTheme = (appearance: Appearance): void => {
    if (typeof document === 'undefined') {
        return;
    }

    const isDark = isDarkMode(appearance);

    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

const subscribe = (callback: () => void) => {
    listeners.add(callback);

    return () => listeners.delete(callback);
};

const notify = (): void => {
    listeners.forEach((listener) => listener());
};

export function initializeTheme(): void {
    if (typeof window === 'undefined') {
        return;
    }

    const stored = localStorage.getItem('appearance');

    /*
     * Only allow valid appearance values.
     *
     * Old "system" values are automatically replaced with "light".
     */
    const appearance: Appearance =
        stored === 'dark' ? 'dark' : 'light';

    currentAppearance = appearance;

    localStorage.setItem('appearance', appearance);
    setCookie('appearance', appearance);

    applyTheme(appearance);
}

export function useAppearance(): UseAppearanceReturn {
    const appearance: Appearance = useSyncExternalStore(
        subscribe,
        () => currentAppearance,
        () => 'light',
    );

    const resolvedAppearance: ResolvedAppearance = appearance;

    const updateAppearance = (mode: Appearance): void => {
        currentAppearance = mode;

        localStorage.setItem('appearance', mode);
        setCookie('appearance', mode);

        applyTheme(mode);
        notify();
    };

    return {
        appearance,
        resolvedAppearance,
        updateAppearance,
    };
}