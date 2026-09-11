import type { Issue as SdkIssue } from '@weavix/tracker-plugin-sdk-react';

/**
 * Minimal view of the full issue context exposed by the Tracker Plugin SDK.
 *
 * The installed SDK declares dynamic issue fields as `unknown`, so the adapter
 * validates them at runtime before they enter the domain layer.
 */
export interface TrackerIssue {
    id: SdkIssue['id'];
    key: SdkIssue['key'];
    summary?: unknown;
    description?: unknown;
    assignee?: unknown;
    priority?: unknown;
    type?: unknown;
    estimation?: unknown;
}
