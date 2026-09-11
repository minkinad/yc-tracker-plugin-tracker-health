import { describe, expect, it } from 'vitest';

import { TrackerHealthAnalysisError, analyzeTrackerIssue } from '../../src/app/analyzeTrackerIssue';
import type { HealthRule } from '../../src/domain/health/types';
import { TrackerIssueMappingError } from '../../src/infrastructure/tracker/issue.mapper';

const issue = {
    id: 'issue-id',
    key: 'QUEUE-42',
    summary: 'Подготовить релиз',
};

describe('analyzeTrackerIssue', () => {
    it('maps and evaluates a valid Tracker issue', () => {
        const result = analyzeTrackerIssue(issue);

        expect(result.results).toHaveLength(6);
        expect(Number.isFinite(result.score)).toBe(true);
    });

    it('rejects an empty rule configuration before rendering a misleading score', () => {
        expect(() => analyzeTrackerIssue(issue, [])).toThrow(TrackerHealthAnalysisError);
    });

    it('keeps malformed SDK data as a mapper failure', () => {
        expect(() => analyzeTrackerIssue({ key: 'QUEUE-42' })).toThrow(TrackerIssueMappingError);
    });

    it('does not swallow rule evaluation errors', () => {
        const failure = new Error('Rule evaluation failed');
        const rule: HealthRule = {
            id: 'assignee',
            name: 'Broken rule',
            description: 'Throws while evaluating',
            weight: 100,
            evaluate() {
                throw failure;
            },
        };

        expect(() => analyzeTrackerIssue(issue, [rule])).toThrow(failure);
    });
});
