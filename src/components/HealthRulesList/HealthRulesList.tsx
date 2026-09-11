import { Text } from '@gravity-ui/uikit';
import { TrackerDisclosure } from '@weavix/tracker-components';

import type { RuleResult, RuleStatus } from '../../domain/health/types';
import { HealthRuleItem } from '../HealthRuleItem';

import styles from './HealthRulesList.module.scss';

interface HealthRulesListProps {
    results: RuleResult[];
}

const STATUS_PRIORITY: Record<RuleStatus, number> = {
    failed: 0,
    skipped: 1,
    passed: 2,
};

export function HealthRulesList({ results }: HealthRulesListProps) {
    const orderedResults = [...results].sort(
        (left, right) => STATUS_PRIORITY[left.status] - STATUS_PRIORITY[right.status],
    );

    return (
        <section aria-label="Проверки качества задачи">
            <TrackerDisclosure
                className={styles.root}
                summaryClassName={styles.summary}
                toggleClassName={styles.toggle}
                summary={<Text variant="subheader-1">Проверки · {results.length}</Text>}
                arrowPosition="start"
                arrowSize={16}
                size="m"
            >
                <ul className={styles.list}>
                    {orderedResults.map((result) => (
                        <HealthRuleItem key={result.ruleId} result={result} />
                    ))}
                </ul>
            </TrackerDisclosure>
        </section>
    );
}
