import { describe, expect, it } from 'vitest';

import { issueTypeRule } from '../../../../src/domain/health/rules/issue-type.rule';

import { createContext } from './testContext';

describe('issueTypeRule', () => {
    it('passes when an issue type exists', () => {
        const result = issueTypeRule.evaluate(createContext());

        expect(result).toEqual({
            ruleId: 'issue-type',
            status: 'passed',
            weight: issueTypeRule.weight,
            title: 'Тип задачи указан',
            message: 'Task',
        });
    });

    it.each([null, undefined])('fails when issueType is %s', (issueType) => {
        const result = issueTypeRule.evaluate(createContext({ issueType }));

        expect(result.status).toBe('failed');
        expect(result.weight).toBe(issueTypeRule.weight);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
        expect(result.recommendation).toBeTruthy();
    });
});
