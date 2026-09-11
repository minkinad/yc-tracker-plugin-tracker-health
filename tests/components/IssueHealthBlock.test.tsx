import type { AriaRole, ReactNode } from 'react';

import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { TrackerHealthContent } from '../../src/app/TrackerHealthContent';
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
    type CardProps = ChildrenProps & {
        role?: AriaRole;
        'aria-live'?: 'off' | 'assertive' | 'polite';
    };
    type ButtonProps = ChildrenProps & {
        loading?: boolean;
        onClick?: () => void;
    };

    const Container = ({ children }: ChildrenProps) => createElement('div', null, children);
    const Card = ({ children, role, 'aria-live': ariaLive }: CardProps) =>
        createElement('div', { role, 'aria-live': ariaLive }, children);

    return {
        Button: ({ children, loading, onClick }: ButtonProps) =>
            createElement('button', { disabled: loading, onClick }, children),
        Card,
        Flex: Container,
        Icon: () => null,
        Label: Container,
        Loader: () => createElement('span', null, 'loading'),
        Progress: ({ value }: { value: number }) => createElement('div', null, String(value)),
        Text: Container,
    };
});

vi.mock('@weavix/tracker-components', async () => {
    const { createElement } = await import('react');

    return {
        TrackerDisclosure: ({ summary, children }: { summary?: ReactNode; children?: ReactNode }) =>
            createElement(
                'div',
                null,
                createElement('button', { type: 'button', 'aria-expanded': false }, summary),
                children,
            ),
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

const trackerIssue = {
    id: 'issue-id',
    key: 'QUEUE-42',
    summary: 'Подготовить релиз',
};

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
        expect(html).toContain('6 проблем');
        expect(html.match(/Проблема/g)).toHaveLength(6);
        expect(html.match(/Рекомендация/g)).toHaveLength(6);
    });

    it('renders score 100 and six compact passed rules', () => {
        const html = renderBlock({ state: 'success', result: createResult(100, 'passed') });

        expect(html).toContain('aria-label="100 из 100"');
        expect(html).toContain('Задача готова');
        expect(html).toContain('Проблем нет');
        expect(html.match(/Готово/g)).toHaveLength(6);
        expect(html).not.toContain('Рекомендация');
    });

    it('renders the warning health level with text, not color alone', () => {
        const result: IssueHealthResult = {
            ...createResult(80, 'passed'),
            level: 'warning',
            score: 80,
            passedWeight: 80,
            failedRules: 1,
            passedRules: 5,
        };
        const html = renderBlock({ state: 'success', result });

        expect(html).toContain('aria-label="80 из 100"');
        expect(html).toContain('Есть рекомендации');
        expect(html).toContain('1 проблема');
    });

    it('renders long Russian strings without truncating their content', () => {
        const longMessage =
            'Очень длинное описание результата проверки, которое должно корректно переноситься в узком блоке задачи и оставаться полностью доступным пользователю.';
        const result = createResult(0, 'failed');
        result.results = createRuleResults('failed', longMessage);

        expect(renderBlock({ state: 'success', result })).toContain(longMessage);
    });

    it('renders the loading state', () => {
        const html = renderBlock({ state: 'loading' });

        expect(html).toContain('role="status"');
        expect(html).toContain('aria-live="polite"');
        expect(html).toContain('Анализируем задачу');
    });

    it('renders the error state', () => {
        const html = renderBlock({ state: 'error', onRetry: vi.fn() });

        expect(html).toContain('role="alert"');
        expect(html).toContain('Не удалось проанализировать задачу');
        expect(html).toContain('Повторить');
        expect(html).not.toContain('Контекст');
    });

    it('shows failed rules before passed rules', () => {
        const result = createResult(50, 'passed');
        result.failedRules = 1;
        result.passedRules = 1;
        result.results = [
            createRuleResults('passed')[0],
            {
                ...createRuleResults('failed')[1],
                title: 'Первая проблема',
            },
        ];

        const html = renderBlock({ state: 'success', result });

        expect(html.indexOf('Первая проблема')).toBeLessThan(html.indexOf('Проверка assignee'));
    });

    it('does not repeat a recommendation identical to the message', () => {
        const repeatedText = 'Добавьте исполнителя.';
        const result = createResult(0, 'failed');
        result.failedRules = 1;
        result.results = [
            {
                ...result.results[0],
                message: repeatedText,
                recommendation: repeatedText,
            },
        ];

        const html = renderBlock({ state: 'success', result });

        expect(html.split(repeatedText)).toHaveLength(2);
    });

    it('contains mapper failures and shows only the safe error state', () => {
        const html = renderToStaticMarkup(
            <TrackerHealthContent issue={null} getCurrentIssue={() => Promise.resolve(null)} />,
        );

        expect(html).toContain('Не удалось проанализировать задачу');
        expect(html).toContain('Повторить');
        expect(html).not.toContain('Tracker issue must be an object');
    });

    it('contains rule evaluation failures', () => {
        const throwingRule = {
            id: 'assignee',
            name: 'Broken rule',
            description: 'Throws while evaluating',
            weight: 100,
            evaluate() {
                throw new Error('Rule failed unexpectedly');
            },
        } satisfies import('../../src/domain/health/types').HealthRule;
        const html = renderToStaticMarkup(
            <TrackerHealthContent
                issue={trackerIssue}
                getCurrentIssue={() => Promise.resolve(trackerIssue)}
                rules={[throwingRule]}
            />,
        );

        expect(html).toContain('Не удалось проанализировать задачу');
        expect(html).not.toContain('Rule failed unexpectedly');
    });

    it('treats an empty rules array as an analysis failure', () => {
        const html = renderToStaticMarkup(
            <TrackerHealthContent
                issue={trackerIssue}
                getCurrentIssue={() => Promise.resolve(trackerIssue)}
                rules={[]}
            />,
        );

        expect(html).toContain('Не удалось проанализировать задачу');
        expect(html).not.toContain('0 из 100');
    });
});
