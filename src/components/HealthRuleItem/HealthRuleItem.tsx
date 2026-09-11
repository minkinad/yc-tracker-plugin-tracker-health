import { CircleCheck, CircleMinus, CircleXmark } from '@gravity-ui/icons';
import { Flex, Icon, Label, Text } from '@gravity-ui/uikit';

import type { RuleResult, RuleStatus } from '../../domain/health/types';

import styles from './HealthRuleItem.module.scss';

const STATUS_VIEW = {
    passed: {
        label: 'Пройдено',
        icon: CircleCheck,
        iconColor: 'positive',
        labelTheme: 'success',
    },
    failed: {
        label: 'Нужно исправить',
        icon: CircleXmark,
        iconColor: 'danger',
        labelTheme: 'danger',
    },
    skipped: {
        label: 'Пропущено',
        icon: CircleMinus,
        iconColor: 'secondary',
        labelTheme: 'unknown',
    },
} as const satisfies Record<
    RuleStatus,
    {
        label: string;
        icon: typeof CircleCheck;
        iconColor: 'positive' | 'danger' | 'secondary';
        labelTheme: 'success' | 'danger' | 'unknown';
    }
>;

interface HealthRuleItemProps {
    result: RuleResult;
}

export function HealthRuleItem({ result }: HealthRuleItemProps) {
    const view = STATUS_VIEW[result.status];
    const isFailed = result.status === 'failed';

    return (
        <div className={styles.root} role="listitem">
            <Flex alignItems="flex-start" gap="2">
                <Icon className={styles.icon} data={view.icon} color={view.iconColor} size={16} />

                <div className={styles.content}>
                    <Flex alignItems="center" gap="2" wrap>
                        <Text className={styles.title} variant="body-1">
                            {result.title}
                        </Text>
                        <Label theme={view.labelTheme} size="xxs">
                            {view.label}
                        </Label>
                    </Flex>

                    <Text className={styles.message} variant="caption-2" color="secondary" as="div">
                        {result.message}
                    </Text>

                    {isFailed && result.recommendation ? (
                        <div className={styles.recommendation}>
                            <Text variant="caption-2" color="danger-heavy" as="div">
                                Рекомендация
                            </Text>
                            <Text variant="body-1" as="div">
                                {result.recommendation}
                            </Text>
                        </div>
                    ) : null}
                </div>
            </Flex>
        </div>
    );
}
