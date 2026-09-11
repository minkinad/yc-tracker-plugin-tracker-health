import { describe, expect, expectTypeOf, it } from 'vitest';

import type {
    HealthLevel,
    HealthRule,
    HealthRuleId,
    IssueHealthContext,
    IssueHealthResult,
    RuleResult,
    RuleStatus,
} from '../../../src/domain/health/types';

describe('Tracker Health domain contracts', () => {
    it('represent an issue, a rule and an analysis result', () => {
        const ruleId: HealthRuleId = 'assignee';
        const status: RuleStatus = 'passed';
        const level: HealthLevel = 'healthy';
        const context: IssueHealthContext = {
            id: 'issue-id',
            key: 'QUEUE-1',
            summary: 'Typed issue',
            description: null,
            assignee: {
                id: 'user-id',
                displayName: 'User',
            },
            priority: {
                id: 'normal',
                name: 'Normal',
            },
            issueType: {
                id: 'task',
                name: 'Task',
            },
            estimation: 3600,
        };
        const ruleResult: RuleResult = {
            ruleId,
            status,
            weight: 15,
            title: 'Assignee is set',
            message: 'User',
        };
        const rule: HealthRule = {
            id: ruleId,
            name: 'Assignee',
            description: 'The issue must have an assignee.',
            weight: 15,
            evaluate(): RuleResult {
                return ruleResult;
            },
        };
        const healthResult: IssueHealthResult = {
            score: 100,
            level,
            passedWeight: 15,
            totalWeight: 15,
            passedRules: 1,
            failedRules: 0,
            skippedRules: 0,
            results: [rule.evaluate(context)],
        };

        expect(healthResult.results).toEqual([ruleResult]);
        expectTypeOf(context).toMatchTypeOf<IssueHealthContext>();
        expectTypeOf(healthResult).toMatchTypeOf<IssueHealthResult>();
    });

    it('allows nullable and omitted optional issue fields', () => {
        const nullableContext: IssueHealthContext = {
            id: 'issue-id',
            key: 'QUEUE-2',
            summary: 'Minimal typed issue',
            description: null,
            assignee: null,
            priority: null,
            issueType: null,
            estimation: null,
        };
        const omittedContext: IssueHealthContext = {
            id: 'another-issue-id',
            key: 'QUEUE-3',
            summary: 'Issue with omitted optional fields',
        };

        expect(nullableContext.assignee).toBeNull();
        expect(omittedContext.description).toBeUndefined();
    });
});
