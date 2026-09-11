import { describe, expect, it } from 'vitest';

import { priorityRule } from '../../../../src/domain/health/rules/priority.rule';

import { createContext } from './testContext';

describe('priorityRule', () => {
    it('passes when a priority exists', () => {
        const result = priorityRule.evaluate(createContext());

        expect(result).toEqual({
            ruleId: 'priority',
            status: 'passed',
            weight: priorityRule.weight,
            title: 'Приоритет указан',
            message: 'Normal',
        });
    });

    it.each([null, undefined])('fails when priority is %s', (priority) => {
        const result = priorityRule.evaluate(createContext({ priority }));

        expect(result.status).toBe('failed');
        expect(result.weight).toBe(priorityRule.weight);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
        expect(result.recommendation).toBeTruthy();
    });
});
