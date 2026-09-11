import { describe, expect, it, vi } from 'vitest';

import { evaluateIssueHealth } from '../../../src/domain/health/evaluateIssueHealth';
import { getHealthLevel } from '../../../src/domain/health/getHealthLevel';
import type {
    HealthRule,
    HealthRuleId,
    IssueHealthContext,
    RuleResult,
    RuleStatus,
} from '../../../src/domain/health/types';

const context: IssueHealthContext = {
    id: 'issue-id',
    key: 'QUEUE-1',
    summary: 'Issue summary',
    description: 'Issue description',
    assignee: {
        id: 'user-id',
        displayName: 'User',
    },
};

function createRule(status: RuleStatus, weight: number, id: HealthRuleId = 'assignee'): HealthRule {
    return {
        id,
        name: id,
        description: `${id} check`,
        weight,
        evaluate(): RuleResult {
            return {
                ruleId: id,
                status,
                weight,
                title: `${id} ${status}`,
                message: `${id} is ${status}`,
            };
        },
    };
}

describe('evaluateIssueHealth', () => {
    it('returns 100 when all applicable rules pass', () => {
        const rules = [createRule('passed', 40), createRule('passed', 60, 'priority')];

        expect(evaluateIssueHealth(context, rules)).toEqual({
            score: 100,
            level: 'healthy',
            passedWeight: 100,
            totalWeight: 100,
            passedRules: 2,
            failedRules: 0,
            skippedRules: 0,
            results: [rules[0].evaluate(context), rules[1].evaluate(context)],
        });
    });

    it('calculates a partial score', () => {
        const result = evaluateIssueHealth(context, [
            createRule('passed', 2),
            createRule('failed', 1, 'priority'),
        ]);

        expect(result.score).toBe(67);
        expect(result.level).toBe('critical');
        expect(result.passedWeight).toBe(2);
        expect(result.totalWeight).toBe(3);
        expect(result.passedRules).toBe(1);
        expect(result.failedRules).toBe(1);
    });

    it('returns 0 when no applicable rules pass', () => {
        const result = evaluateIssueHealth(context, [
            createRule('failed', 40),
            createRule('failed', 60, 'priority'),
        ]);

        expect(result.score).toBe(0);
        expect(result.level).toBe('critical');
        expect(result.passedWeight).toBe(0);
        expect(result.totalWeight).toBe(100);
    });

    it('excludes skipped rules from totalWeight', () => {
        const result = evaluateIssueHealth(context, [
            createRule('passed', 30),
            createRule('failed', 20, 'priority'),
            createRule('skipped', 50, 'description'),
        ]);

        expect(result.score).toBe(60);
        expect(result.passedWeight).toBe(30);
        expect(result.totalWeight).toBe(50);
        expect(result.passedRules).toBe(1);
        expect(result.failedRules).toBe(1);
        expect(result.skippedRules).toBe(1);
    });

    it('returns a finite 0 score when all rules are skipped', () => {
        const result = evaluateIssueHealth(context, [
            createRule('skipped', 40),
            createRule('skipped', 60, 'priority'),
        ]);

        expect(result.score).toBe(0);
        expect(result.level).toBe('critical');
        expect(result.passedWeight).toBe(0);
        expect(result.totalWeight).toBe(0);
        expect(result.passedRules).toBe(0);
        expect(result.failedRules).toBe(0);
        expect(result.skippedRules).toBe(2);
        expect(Number.isFinite(result.score)).toBe(true);
    });

    it('returns a deterministic finite result for an empty rules array', () => {
        expect(evaluateIssueHealth(context, [])).toEqual({
            score: 0,
            level: 'critical',
            passedWeight: 0,
            totalWeight: 0,
            passedRules: 0,
            failedRules: 0,
            skippedRules: 0,
            results: [],
        });
    });

    it('propagates a rule evaluation error to the application boundary', () => {
        const rule = createRule('passed', 100);
        const failure = new Error('Rule evaluation failed');
        rule.evaluate = () => {
            throw failure;
        };

        expect(() => evaluateIssueHealth(context, [rule])).toThrow(failure);
    });

    it('evaluates every rule exactly once', () => {
        const firstRule = createRule('passed', 50);
        const secondRule = createRule('failed', 50, 'priority');
        const firstEvaluate = vi.spyOn(firstRule, 'evaluate');
        const secondEvaluate = vi.spyOn(secondRule, 'evaluate');

        evaluateIssueHealth(context, [firstRule, secondRule]);

        expect(firstEvaluate).toHaveBeenCalledOnce();
        expect(firstEvaluate).toHaveBeenCalledWith(context);
        expect(secondEvaluate).toHaveBeenCalledOnce();
        expect(secondEvaluate).toHaveBeenCalledWith(context);
    });

    it('does not mutate context or rules', () => {
        const mutableContext: IssueHealthContext = {
            ...context,
            assignee: context.assignee ? { ...context.assignee } : context.assignee,
        };
        const rules = [createRule('passed', 50), createRule('failed', 50, 'priority')];
        const contextSnapshot: IssueHealthContext = {
            ...mutableContext,
            assignee: mutableContext.assignee
                ? { ...mutableContext.assignee }
                : mutableContext.assignee,
        };
        const rulesSnapshot = [...rules];

        Object.freeze(mutableContext.assignee);
        Object.freeze(mutableContext);
        rules.forEach(Object.freeze);
        Object.freeze(rules);

        expect(() => evaluateIssueHealth(mutableContext, rules)).not.toThrow();
        expect(mutableContext).toEqual(contextSnapshot);
        expect(rules).toEqual(rulesSnapshot);
    });
});

describe('getHealthLevel', () => {
    it.each([
        [0, 'critical'],
        [69, 'critical'],
        [70, 'warning'],
        [89, 'warning'],
        [90, 'healthy'],
        [100, 'healthy'],
    ] as const)('maps score %i to %s', (score, expectedLevel) => {
        expect(getHealthLevel(score)).toBe(expectedLevel);
    });
});
