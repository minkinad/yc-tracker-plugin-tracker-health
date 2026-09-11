import { Progress } from '@gravity-ui/uikit';

import type { HealthLevel } from '../../domain/health/types';

import styles from './HealthProgress.module.scss';

const PROGRESS_THEME: Record<HealthLevel, 'success' | 'warning' | 'danger'> = {
    healthy: 'success',
    warning: 'warning',
    critical: 'danger',
};

interface HealthProgressProps {
    score: number;
    level: HealthLevel;
}

export function HealthProgress({ score, level }: HealthProgressProps) {
    return (
        <div
            className={styles.root}
            role="progressbar"
            aria-label={`Health score: ${score} из 100`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={score}
        >
            <Progress value={score} theme={PROGRESS_THEME[level]} size="s" />
        </div>
    );
}
