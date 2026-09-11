import type { ReactNode } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { IssueHealthBlock } from '../../src/components/IssueHealthBlock';
import type {
    HealthRuleId,
    IssueHealthResult,
    RuleResult,
    RuleStatus,
} from '../../src/domain/health/types';

vi.mock('@gravity-ui/icons', () => {
    const MockIcon = () => null;

    return {
        CircleCheck: MockIcon,
        CircleCheckFill: MockIcon,
        CircleExclamationFill: MockIcon,
        CircleMinus: MockIcon,
        CircleXmark: MockIcon,
        CircleXmarkFill: MockIcon,
        TriangleExclamation: MockIcon,
    };
});

vi.mock('@gravity-ui/uikit', async () => {
    const { createElement } = await import('react');
    type ChildrenProps = { children?: ReactNode };

    const Container = ({ children }: ChildrenProps) => createElement('div', null, children);

    return {
        Card: Container,
        Flex: Container,
        Icon: () => null,
        Label: Container,
        Loader: () => createElement('span', null, 'loading'),
        Progress: ({ value }: { value: number }) => createElement('div', null, String(value)),
        Text: Container,
    };
});

const RULE_IDS: HealthRuleId[] = [
    'assignee',
    'priority',
    'description',
    'issue-type',
    'estimate',
    'acceptance-criteria',
];

function createRuleResults(status: RuleStatus, message = 'Результат проверки'): RuleResult[] {
    return RULE_IDS.map((ruleId) => ({
        ruleId,
        status,
        weight: 10,
        title: `Проверка ${ruleId}`,
        message,
        recommendation:
            status === 'failed'
                ? 'Добавьте недостающие сведения, чтобы задача была готова к работе.'
                : undefined,
    }));
}

function createResult(score: number, status: 'passed' | 'failed'): IssueHealthResult {
    const results = createRuleResults(status);

    return {
        score,
        level: score === 100 ? 'healthy' : 'critical',
        passedWeight: score === 100 ? 100 : 0,
        totalWeight: 100,
        passedRules: status === 'passed' ? results.length : 0,
        failedRules: status === 'failed' ? results.length : 0,
        skippedRules: 0,
        results,
    };
}

function renderBlock(props: Parameters<typeof IssueHealthBlock>[0]): string {
    return renderToStaticMarkup(<IssueHealthBlock {...props} />);
}

describe('IssueHealthBlock', () => {
    it('renders score 0 and six failed rules with recommendations', () => {
        const html = renderBlock({ state: 'success', result: createResult(0, 'failed') });

        expect(html).toContain('aria-label="0 из 100"');
        expect(html).toContain('Требует внимания');
        expect(html.match(/Нужно исправить/g)).toHaveLength(6);
        expect(html.match(/Рекомендация/g)).toHaveLength(6);
    });

    it('renders score 100 and six compact passed rules', () => {
        const html = renderBlock({ state: 'success', result: createResult(100, 'passed') });

        expect(html).toContain('aria-label="100 из 100"');
        expect(html).toContain('Задача готова');
        expect(html.match(/Пройдено/g)).toHaveLength(6);
        expect(html).not.toContain('Рекомендация');
    });

    it('renders long Russian strings without truncating their content', () => {
        const longMessage =
            'Очень длинное описание результата проверки, которое должно корректно переноситься в узком блоке задачи и оставаться полностью доступным пользователю.';
        const result = createResult(0, 'failed');
        result.results = createRuleResults('failed', longMessage);

        expect(renderBlock({ state: 'success', result })).toContain(longMessage);
    });

    it('renders the loading state', () => {
        expect(renderBlock({ state: 'loading' })).toContain('Анализируем задачу');
    });

    it('renders the error state', () => {
        const message = 'Контекст текущей задачи недоступен.';

        const html = renderBlock({ state: 'error', message });

        expect(html).toContain('Не удалось проанализировать задачу');
        expect(html).toContain(message);
    });
});
