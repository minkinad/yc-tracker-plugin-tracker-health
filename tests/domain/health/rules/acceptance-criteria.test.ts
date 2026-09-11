import { describe, expect, it } from 'vitest';

import { defaultRules } from '../../../../src/domain/health/rules';
import { acceptanceCriteriaRule } from '../../../../src/domain/health/rules/acceptance-criteria.rule';

import { createContext } from './testContext';

describe('acceptanceCriteriaRule', () => {
    it('passes when the description contains an acceptance criteria section', () => {
        const result = acceptanceCriteriaRule.evaluate(
            createContext({ description: 'Контекст задачи\n\n## Критерии приёмки\n\n- Условие' }),
        );

        expect(result.status).toBe('passed');
        expect(result.weight).toBe(acceptanceCriteriaRule.weight);
        expect(result.recommendation).toBeUndefined();
    });

    it.each([null, undefined, '', 'Нам нужны хорошие критерии приёмки'])(
        'fails when the description is %s',
        (description) => {
            const result = acceptanceCriteriaRule.evaluate(createContext({ description }));

            expect(result.status).toBe('failed');
            expect(result.weight).toBe(acceptanceCriteriaRule.weight);
            expect(result.title).not.toBe('');
            expect(result.message).not.toBe('');
            expect(result.recommendation).not.toBe('');
        },
    );
});

describe('defaultRules', () => {
    it('exports all rules with their configured weights', () => {
        expect(defaultRules.map(({ id, weight }) => [id, weight])).toEqual([
            ['assignee', 15],
            ['priority', 10],
            ['description', 20],
            ['issue-type', 10],
            ['estimate', 15],
            ['acceptance-criteria', 30],
        ]);
    });

    it('has a total weight of 100', () => {
        expect(defaultRules.reduce((total, rule) => total + rule.weight, 0)).toBe(100);
    });
});
