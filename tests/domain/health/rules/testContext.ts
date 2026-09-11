import type { IssueHealthContext } from '../../../../src/domain/health/types';

const baseContext: IssueHealthContext = {
    id: 'issue-id',
    key: 'QUEUE-1',
    summary: 'Issue summary',
    description: 'a'.repeat(100),
    assignee: {
        id: 'user-id',
        displayName: 'User',
    },
    priority: {
        id: 'normal',
        name: 'Normal',
    },
    issueType: {
        id: 'task',
        name: 'Task',
    },
    estimation: 3600,
};

export function createContext(overrides: Partial<IssueHealthContext> = {}): IssueHealthContext {
    return {
        ...baseContext,
        ...overrides,
    };
}
