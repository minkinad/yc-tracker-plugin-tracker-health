import { evaluateIssueHealth } from '../domain/health/evaluateIssueHealth';
import { defaultRules } from '../domain/health/rules';
import type { HealthRule, IssueHealthResult } from '../domain/health/types';
import { mapTrackerIssueToHealthContext } from '../infrastructure/tracker/issue.mapper';

export class TrackerHealthAnalysisError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'TrackerHealthAnalysisError';
    }
}

export function analyzeTrackerIssue(
    issue: unknown,
    rules: HealthRule[] = defaultRules,
): IssueHealthResult {
    if (rules.length === 0) {
        throw new TrackerHealthAnalysisError('Tracker Health cannot run without rules.');
    }

    const context = mapTrackerIssueToHealthContext(issue);

    return evaluateIssueHealth(context, rules);
}
