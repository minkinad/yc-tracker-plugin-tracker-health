export function reportDevelopmentError(scope: string, error: unknown, details?: unknown): void {
    if (!import.meta.env.DEV) {
        return;
    }

    console.error(`[Tracker Health] ${scope}`, error, details);
}
