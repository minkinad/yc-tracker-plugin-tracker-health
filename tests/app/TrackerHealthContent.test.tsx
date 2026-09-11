import type { ReactElement, ReactNode } from 'react';

import { act, create } from 'react-test-renderer';
import type { ReactTestRenderer } from 'react-test-renderer';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { TrackerHealthContent } from '../../src/app/TrackerHealthContent';
import { TrackerHealthErrorBoundary } from '../../src/components/TrackerHealthErrorBoundary';

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
    type ButtonProps = ChildrenProps & {
        loading?: boolean;
        onClick?: () => void;
    };

    const Container = ({ children }: ChildrenProps) => createElement('div', null, children);

    return {
        Button: ({ children, loading, onClick }: ButtonProps) =>
            createElement('button', { disabled: loading, onClick }, children),
        Card: Container,
        Flex: Container,
        Icon: () => null,
        Label: Container,
        Loader: () => createElement('span', null, 'loading'),
        Progress: Container,
        Text: Container,
    };
});

vi.mock('@weavix/tracker-components', async () => {
    const { createElement } = await import('react');

    return {
        TrackerDisclosure: ({ summary, children }: { summary?: ReactNode; children?: ReactNode }) =>
            createElement('div', null, summary, children),
    };
});

const trackerIssue = {
    id: 'issue-id',
    key: 'QUEUE-42',
    summary: 'Подготовить релиз',
};

function render(element: ReactElement): ReactTestRenderer {
    let renderer: ReactTestRenderer | undefined;

    act(() => {
        renderer = create(element);
    });

    if (!renderer) {
        throw new Error('React test renderer was not created.');
    }

    return renderer;
}

function getRenderedText(renderer: ReactTestRenderer): string {
    return JSON.stringify(renderer.toJSON());
}

afterEach(() => {
    vi.restoreAllMocks();
});

describe('TrackerHealthContent failures', () => {
    it('recovers by requesting the current issue again without reloading the host', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const getCurrentIssue = vi.fn().mockResolvedValue(trackerIssue);
        const renderer = render(
            <TrackerHealthContent issue={undefined} getCurrentIssue={getCurrentIssue} />,
        );

        expect(getRenderedText(renderer)).toContain('Не удалось проанализировать задачу');

        await act(async () => {
            renderer.root.findByType('button').props.onClick();
        });

        expect(getCurrentIssue).toHaveBeenCalledOnce();
        expect(getRenderedText(renderer)).toContain('Tracker Health');
    });

    it('keeps the safe error state when issue retrieval fails again', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        const getCurrentIssue = vi.fn().mockRejectedValue(new Error('Host RPC failed'));
        const renderer = render(
            <TrackerHealthContent issue={undefined} getCurrentIssue={getCurrentIssue} />,
        );

        await act(async () => {
            renderer.root.findByType('button').props.onClick();
        });

        const renderedText = getRenderedText(renderer);
        expect(getCurrentIssue).toHaveBeenCalledOnce();
        expect(renderedText).toContain('Не удалось проанализировать задачу');
        expect(renderedText).not.toContain('Host RPC failed');
    });

    it('contains unexpected React render errors', () => {
        vi.spyOn(console, 'error').mockImplementation(() => undefined);

        function CrashingChild(): never {
            throw new Error('Unexpected render failure');
        }

        const renderer = render(
            <TrackerHealthErrorBoundary>
                <CrashingChild />
            </TrackerHealthErrorBoundary>,
        );
        const renderedText = getRenderedText(renderer);

        expect(renderedText).toContain('Не удалось проанализировать задачу');
        expect(renderedText).toContain('Повторить');
        expect(renderedText).not.toContain('Unexpected render failure');
    });
});
