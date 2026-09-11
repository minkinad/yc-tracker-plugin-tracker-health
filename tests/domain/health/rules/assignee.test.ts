import { describe, expect, it } from 'vitest';

import { assigneeRule } from '../../../../src/domain/health/rules/assignee.rule';

import { createContext } from './testContext';

describe('assigneeRule', () => {
    it('passes when an assignee exists', () => {
        const result = assigneeRule.evaluate(createContext());

        expect(result).toEqual({
            ruleId: 'assignee',
            status: 'passed',
            weight: assigneeRule.weight,
            title: 'Исполнитель назначен',
            message: 'User',
        });
    });

    it.each([null, undefined])('fails when assignee is %s', (assignee) => {
        const result = assigneeRule.evaluate(createContext({ assignee }));

        expect(result.status).toBe('failed');
        expect(result.weight).toBe(assigneeRule.weight);
        expect(result.title).toBeTruthy();
        expect(result.message).toBeTruthy();
        expect(result.recommendation).toBeTruthy();
    });
});
