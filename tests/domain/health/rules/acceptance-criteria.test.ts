import { describe, expect, it } from 'vitest';

import { defaultRules } from '../../../../src/domain/health/rules';
import { acceptanceCriteriaRule } from '../../../../src/domain/health/rules/acceptance-criteria.rule';

import { createContext } from './testContext';

describe('acceptanceCriteriaRule', () => {
    it.each([
        ['English heading', '## Acceptance Criteria\n\n- Done'],
        ['Russian heading with ё', '### Критерии приёмки\n\n- Готово'],
        ['Russian heading with е', '## Критерии приемки\n\n- Готово'],
        ['plain heading with a colon', 'Описание\nAcceptance Criteria:\n- Done'],
        ['uppercase heading', 'КРИТЕРИИ ГОТОВНОСТИ:\n- ГОТОВО'],
        ['Windows newlines', 'Описание\r\n## Критерии приёмки\r\n- Готово'],
    ])('passes for a %s', (_caseName, description) => {
        const result = acceptanceCriteriaRule.evaluate(createContext({ description }));

        expect(result.status).toBe('passed');
        expect(result.weight).toBe(acceptanceCriteriaRule.weight);
        expect(result.recommendation).toBeUndefined();
    });

    it.each([null, undefined, '', '   ', '\t\n'])(
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

    it.each([
        'Нам нужно добавить acceptance criteria в будущем',
        'Хорошие критерии приёмки помогают разработке',
        'Проверить критерии готовности задачи',
    ])('rejects an inline mention: "%s"', (description) => {
        const result = acceptanceCriteriaRule.evaluate(createContext({ description }));

        expect(result.status).toBe('failed');
        expect(result.recommendation).toBeTruthy();
    });
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
