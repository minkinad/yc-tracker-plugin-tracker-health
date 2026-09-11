import { describe, expect, it } from 'vitest';

import { hasAcceptanceCriteriaSection } from '../../../src/domain/health/hasAcceptanceCriteriaSection';

describe('hasAcceptanceCriteriaSection', () => {
    it.each([1, 2, 3, 4, 5, 6])('recognizes a Markdown h%s heading', (level) => {
        expect(hasAcceptanceCriteriaSection(`${'#'.repeat(level)} Acceptance Criteria`)).toBe(true);
    });

    it.each([
        'Acceptance Criteria:',
        'acceptance criteria:',
        'ACCEPTANCE CRITERIA:',
        'Критерии приёмки:',
        'Критерии приемки:',
        'Критерии готовности:',
        'критерии приемки:',
        'КРИТЕРИИ ГОТОВНОСТИ:',
    ])('recognizes the plain heading "%s"', (heading) => {
        expect(hasAcceptanceCriteriaSection(heading)).toBe(true);
    });

    it('allows leading spaces before a heading', () => {
        expect(hasAcceptanceCriteriaSection('    ### критерии приёмки')).toBe(true);
        expect(hasAcceptanceCriteriaSection('    Критерии приемки:')).toBe(true);
    });

    it('finds a heading between Unix line endings', () => {
        expect(hasAcceptanceCriteriaSection('Описание\n## Acceptance Criteria\n- Done')).toBe(true);
    });

    it('finds a heading between Windows line endings', () => {
        expect(
            hasAcceptanceCriteriaSection('Описание\r\n### Критерии готовности\r\n- Готово'),
        ).toBe(true);
    });

    it.each([
        'Нам нужно добавить acceptance criteria в будущем',
        'Хорошие критерии приёмки помогают разработке',
        'Проверить критерии готовности задачи',
    ])('rejects a mention inside an ordinary sentence', (description) => {
        expect(hasAcceptanceCriteriaSection(description)).toBe(false);
    });

    it('rejects an empty description', () => {
        expect(hasAcceptanceCriteriaSection('')).toBe(false);
    });

    it('accepts a heading with no content after it', () => {
        expect(hasAcceptanceCriteriaSection('Описание\n### Acceptance Criteria')).toBe(true);
    });

    it.each(['Acceptance Criteria', '####### Acceptance Criteria', '#Acceptance Criteria'])(
        'rejects text that is not a supported heading: "%s"',
        (description) => {
            expect(hasAcceptanceCriteriaSection(description)).toBe(false);
        },
    );
});
