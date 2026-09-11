import { describe, expect, it } from 'vitest';

import { estimateRule } from '../../../../src/domain/health/rules/estimate.rule';

import { createContext } from './testContext';

describe('estimateRule', () => {
    it.each([null, undefined, 0, -1, -3600])('fails when estimation is %s', (estimation) => {
        const result = estimateRule.evaluate(createContext({ estimation }));

        expect(result.status).toBe('failed');
        expect(result.weight).toBe(estimateRule.weight);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
        expect(result.recommendation).toBeTruthy();
    });

    it('passes when estimation is greater than zero', () => {
        const result = estimateRule.evaluate(createContext({ estimation: 1 }));

        expect(result).toEqual({
            ruleId: 'estimate',
            status: 'passed',
            weight: estimateRule.weight,
            title: 'Оценка указана',
            message: '1',
        });
    });
});
