import { Text } from '@gravity-ui/uikit';

import type { RuleResult } from '../../domain/health/types';
import { HealthRuleItem } from '../HealthRuleItem';

import styles from './HealthRulesList.module.scss';

interface HealthRulesListProps {
    results: RuleResult[];
}

export function HealthRulesList({ results }: HealthRulesListProps) {
    return (
        <section aria-labelledby="tracker-health-rules-title">
            <Text id="tracker-health-rules-title" variant="subheader-1" as="h3">
                Проверки
            </Text>
            <div className={styles.list} role="list">
                {results.map((result) => (
                    <HealthRuleItem key={result.ruleId} result={result} />
                ))}
            </div>
        </section>
    );
}
