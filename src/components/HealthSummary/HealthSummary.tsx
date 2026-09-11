import { CircleCheckFill, CircleExclamationFill, CircleXmarkFill } from '@gravity-ui/icons';
import { Flex, Icon, Label, Text } from '@gravity-ui/uikit';

import type { HealthLevel } from '../../domain/health/types';

import styles from './HealthSummary.module.scss';

const LEVEL_VIEW = {
    healthy: {
        label: 'Задача готова',
        icon: CircleCheckFill,
        theme: 'success',
    },
    warning: {
        label: 'Есть рекомендации',
        icon: CircleExclamationFill,
        theme: 'warning',
    },
    critical: {
        label: 'Требует внимания',
        icon: CircleXmarkFill,
        theme: 'danger',
    },
} as const satisfies Record<
    HealthLevel,
    {
        label: string;
        icon: typeof CircleCheckFill;
        theme: 'success' | 'warning' | 'danger';
    }
>;

interface HealthSummaryProps {
    score: number;
    level: HealthLevel;
}

export function HealthSummary({ score, level }: HealthSummaryProps) {
    const view = LEVEL_VIEW[level];

    return (
        <Flex
            className={styles.root}
            alignItems="flex-start"
            justifyContent="space-between"
            gap="3"
        >
            <Flex className={styles.heading} direction="column" gap="1">
                <Text variant="subheader-2" as="h2">
                    Tracker Health
                </Text>
                <Label icon={<Icon data={view.icon} size={14} />} theme={view.theme} size="xs">
                    {view.label}
                </Label>
            </Flex>

            <div className={styles.score} aria-label={`${score} из 100`}>
                <Text variant="header-2">{score}</Text>
                <Text variant="body-1" color="secondary">
                    {' '}
                    / 100
                </Text>
            </div>
        </Flex>
    );
}
