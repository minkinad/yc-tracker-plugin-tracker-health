import type { HealthLevel } from './types';

export function getHealthLevel(score: number): HealthLevel {
    if (score >= 90) {
        return 'healthy';
    }

    if (score >= 70) {
        return 'warning';
    }

    return 'critical';
}
