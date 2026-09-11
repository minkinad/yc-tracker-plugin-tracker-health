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
    failedRules: number;
}

function getProblemsLabel(count: number): string {
    if (count === 0) {
        return 'Проблем нет';
    }

    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
        return `${count} проблем`;
    }

    if (lastDigit === 1) {
        return `${count} проблема`;
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
        return `${count} проблемы`;
    }

    return `${count} проблем`;
}

export function HealthSummary({ score, level, failedRules }: HealthSummaryProps) {
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
                <Flex alignItems="center" gap="2" wrap>
                    <Label
                        icon={<Icon data={view.icon} size={14} aria-hidden="true" />}
                        theme={view.theme}
                        size="xs"
                    >
                        {view.label}
                    </Label>
                    <Text
                        variant="caption-2"
                        color={failedRules > 0 ? 'danger-heavy' : 'secondary'}
                    >
                        {getProblemsLabel(failedRules)}
                    </Text>
                </Flex>
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
