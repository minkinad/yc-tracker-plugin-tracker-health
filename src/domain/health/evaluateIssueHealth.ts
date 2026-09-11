import { getHealthLevel } from './getHealthLevel';
import type { HealthRule, IssueHealthContext, IssueHealthResult } from './types';

export function evaluateIssueHealth(
    context: IssueHealthContext,
    rules: HealthRule[],
): IssueHealthResult {
    const results = rules.map((rule) => rule.evaluate(context));
    const applicableResults = results.filter((result) => result.status !== 'skipped');
    const passedResults = results.filter((result) => result.status === 'passed');
    const failedRules = results.filter((result) => result.status === 'failed').length;
    const skippedRules = results.filter((result) => result.status === 'skipped').length;
    const totalWeight = applicableResults.reduce((sum, result) => sum + result.weight, 0);
    const passedWeight = passedResults.reduce((sum, result) => sum + result.weight, 0);
    const score = totalWeight === 0 ? 0 : Math.round((passedWeight / totalWeight) * 100);

    return {
        score,
        level: getHealthLevel(score),
        passedWeight,
        totalWeight,
        passedRules: passedResults.length,
        failedRules,
        skippedRules,
        results,
    };
}
