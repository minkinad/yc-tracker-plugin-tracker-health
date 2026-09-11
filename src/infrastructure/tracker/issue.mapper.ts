import type { IssueHealthContext } from '../../domain/health/types';

import type { TrackerIssue } from './tracker.types';

interface MappedTrackerReference {
    id: string;
    display: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function mapReferenceId(value: unknown): string | null {
    if (typeof value === 'string' && value.length > 0) {
        return value;
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value);
    }

    return null;
}

function mapLocalizedString(value: unknown): string {
    if (typeof value === 'string') {
        return value;
    }

    if (!isRecord(value)) {
        return '';
    }

    if (typeof value.ru === 'string') {
        return value.ru;
    }

    return typeof value.en === 'string' ? value.en : '';
}

function mapTrackerReference(value: unknown): MappedTrackerReference | null {
    if (!isRecord(value)) {
        return null;
    }

    const id = mapReferenceId(value.id);

    if (id === null) {
        return null;
    }

    return {
        id,
        display: mapLocalizedString(value.display),
    };
}

function mapEstimation(value: unknown): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

export function mapTrackerIssueToHealthContext(issue: TrackerIssue): IssueHealthContext {
    const assignee = mapTrackerReference(issue.assignee);
    const priority = mapTrackerReference(issue.priority);
    const issueType = mapTrackerReference(issue.type);

    return {
        id: issue.id,
        key: issue.key,
        summary: typeof issue.summary === 'string' ? issue.summary : '',
        description: typeof issue.description === 'string' ? issue.description : null,
        assignee:
            assignee === null
                ? null
                : {
                      id: assignee.id,
                      displayName: assignee.display,
                  },
        priority:
            priority === null
                ? null
                : {
                      id: priority.id,
                      name: priority.display,
                  },
        issueType:
            issueType === null
                ? null
                : {
                      id: issueType.id,
                      name: issueType.display,
                  },
        estimation: mapEstimation(issue.estimation),
    };
}
