import type { Issue as SdkIssue } from '@weavix/tracker-plugin-sdk-react';
import { describe, expect, expectTypeOf, it } from 'vitest';

import {
    TrackerIssueMappingError,
    mapTrackerIssueToHealthContext,
} from '../../../src/infrastructure/tracker/issue.mapper';
import type { TrackerIssue } from '../../../src/infrastructure/tracker/tracker.types';

const requiredIssueFields: Pick<TrackerIssue, 'id' | 'key' | 'summary'> = {
    id: 'issue-id',
    key: 'QUEUE-42',
    summary: 'Подготовить релиз',
};

describe('mapTrackerIssueToHealthContext', () => {
    it('accepts the issue type exposed by the installed Tracker Plugin SDK', () => {
        expectTypeOf<SdkIssue>().toMatchTypeOf<TrackerIssue>();
    });

    it('maps all Tracker fields to the domain context', () => {
        const issue: TrackerIssue = {
            ...requiredIssueFields,
            description: 'Описание задачи',
            assignee: {
                id: 'user-id',
                display: 'Alexander',
            },
            priority: {
                id: '3',
                display: 'Normal',
            },
            type: {
                id: '2',
                display: 'Task',
            },
            estimation: 3_600_000,
        };

        expect(mapTrackerIssueToHealthContext(issue)).toEqual({
            id: 'issue-id',
            key: 'QUEUE-42',
            summary: 'Подготовить релиз',
            description: 'Описание задачи',
            assignee: {
                id: 'user-id',
                displayName: 'Alexander',
            },
            priority: {
                id: '3',
                name: 'Normal',
            },
            issueType: {
                id: '2',
                name: 'Task',
            },
            estimation: 3_600_000,
        });
    });

    it('maps missing optional fields to null', () => {
        expect(mapTrackerIssueToHealthContext(requiredIssueFields)).toEqual({
            id: 'issue-id',
            key: 'QUEUE-42',
            summary: 'Подготовить релиз',
            description: null,
            assignee: null,
            priority: null,
            issueType: null,
            estimation: null,
        });
    });

    it('maps explicitly null optional fields to null', () => {
        const issue: TrackerIssue = {
            ...requiredIssueFields,
            description: null,
            assignee: null,
            priority: null,
            type: null,
            estimation: null,
        };

        expect(mapTrackerIssueToHealthContext(issue)).toMatchObject({
            description: null,
            assignee: null,
            priority: null,
            issueType: null,
            estimation: null,
        });
    });

    it('maps a partially populated issue without inventing absent values', () => {
        expect(
            mapTrackerIssueToHealthContext({
                ...requiredIssueFields,
                description: 'Короткое описание',
                priority: {
                    id: '3',
                    display: 'Normal',
                },
            }),
        ).toEqual({
            id: 'issue-id',
            key: 'QUEUE-42',
            summary: 'Подготовить релиз',
            description: 'Короткое описание',
            assignee: null,
            priority: {
                id: '3',
                name: 'Normal',
            },
            issueType: null,
            estimation: null,
        });
    });

    it('maps localized Tracker display values and numeric reference ids', () => {
        const issue: TrackerIssue = {
            ...requiredIssueFields,
            assignee: {
                id: 'user-id',
                display: { en: 'Alexander' },
            },
            priority: {
                id: 3,
                display: { ru: 'Средний', en: 'Normal' },
            },
            type: {
                id: 2,
                display: { ru: 'Задача', en: 'Task' },
            },
        };

        expect(mapTrackerIssueToHealthContext(issue)).toMatchObject({
            assignee: {
                id: 'user-id',
                displayName: 'Alexander',
            },
            priority: {
                id: '3',
                name: 'Средний',
            },
            issueType: {
                id: '2',
                name: 'Задача',
            },
        });
    });

    it('does not pass malformed Tracker values into the domain', () => {
        const issue: TrackerIssue = {
            id: 'issue-id',
            key: 'QUEUE-42',
            summary: 42,
            description: { text: 'Описание' },
            assignee: 'user-id',
            priority: { display: 'Normal' },
            type: [],
            estimation: 'PT1H',
        };

        expect(mapTrackerIssueToHealthContext(issue)).toEqual({
            id: 'issue-id',
            key: 'QUEUE-42',
            summary: '',
            description: null,
            assignee: null,
            priority: null,
            issueType: null,
            estimation: null,
        });
    });

    it.each([null, undefined, [], 42, 'QUEUE-42'])(
        'rejects a non-object issue value: %j',
        (issue) => {
            expect(() => mapTrackerIssueToHealthContext(issue)).toThrow(TrackerIssueMappingError);
        },
    );

    it.each([
        { id: null, key: 'QUEUE-42' },
        { id: '', key: 'QUEUE-42' },
        { id: 'issue-id', key: null },
        { id: 'issue-id', key: '   ' },
    ])('rejects invalid required identifiers: %j', (issue) => {
        expect(() => mapTrackerIssueToHealthContext(issue)).toThrow(TrackerIssueMappingError);
    });

    it('ignores unknown SDK fields', () => {
        expect(
            mapTrackerIssueToHealthContext({
                ...requiredIssueFields,
                unknownField: { nested: true },
            }),
        ).toMatchObject({
            id: 'issue-id',
            key: 'QUEUE-42',
            summary: 'Подготовить релиз',
        });
    });

    it.each([Number.NaN, Number.POSITIVE_INFINITY, Number.NEGATIVE_INFINITY])(
        'maps non-finite estimation %s to null',
        (estimation) => {
            expect(
                mapTrackerIssueToHealthContext({
                    ...requiredIssueFields,
                    estimation,
                }).estimation,
            ).toBeNull();
        },
    );

    it.each([0, -1])('preserves estimation %s for domain validation', (estimation) => {
        expect(
            mapTrackerIssueToHealthContext({
                ...requiredIssueFields,
                estimation,
            }).estimation,
        ).toBe(estimation);
    });
});
