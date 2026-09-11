import { describe, expect, it } from 'vitest';

import { descriptionRule } from '../../../../src/domain/health/rules/description.rule';

import { createContext } from './testContext';

describe('descriptionRule', () => {
    it.each([null, undefined, '', '   ', '\t\n', 'a'.repeat(99)])(
        'fails when the trimmed description is %#',
        (description) => {
            const result = descriptionRule.evaluate(createContext({ description }));

            expect(result.status).toBe('failed');
            expect(result.weight).toBe(descriptionRule.weight);
            expect(result.title).toBeTruthy();
            expect(result.message).toBeTruthy();
            expect(result.recommendation).toBeTruthy();
        },
    );

    it('uses the trimmed description length', () => {
        const result = descriptionRule.evaluate(
            createContext({ description: `  ${'a'.repeat(100)}  ` }),
        );

        expect(result.status).toBe('passed');
        expect(result.message).toBe('100 символов');
    });

    it('passes when the trimmed description contains more than 100 characters', () => {
        const result = descriptionRule.evaluate(createContext({ description: 'a'.repeat(500) }));

        expect(result.status).toBe('passed');
        expect(result.weight).toBe(descriptionRule.weight);
    });
});
