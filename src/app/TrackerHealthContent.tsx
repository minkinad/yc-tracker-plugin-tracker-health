import { useEffect, useMemo, useState } from 'react';

import { IssueHealthBlock } from '../components/IssueHealthBlock';
import type { HealthRule } from '../domain/health/types';
import { reportDevelopmentError } from '../shared/errors/reportDevelopmentError';

import { analyzeTrackerIssue } from './analyzeTrackerIssue';

interface RetriedIssue {
    baseIssue: unknown;
    value: unknown;
    attempt: number;
}

interface TrackerHealthContentProps {
    issue: unknown;
    getCurrentIssue: () => Promise<unknown>;
    rules?: HealthRule[];
}

type AnalysisOutcome =
    | {
          status: 'success';
          result: ReturnType<typeof analyzeTrackerIssue>;
      }
    | {
          status: 'error';
          error: unknown;
      };

function runAnalysis(issue: unknown, rules: HealthRule[] | undefined): AnalysisOutcome {
    try {
        return {
            status: 'success',
            result: analyzeTrackerIssue(issue, rules),
        };
    } catch (error: unknown) {
        return {
            status: 'error',
            error,
        };
    }
}

export function TrackerHealthContent({ issue, getCurrentIssue, rules }: TrackerHealthContentProps) {
    const [retriedIssue, setRetriedIssue] = useState<RetriedIssue | null>(null);
    const [isRetrying, setIsRetrying] = useState(false);
    const activeRetry =
        retriedIssue && Object.is(retriedIssue.baseIssue, issue) ? retriedIssue : null;
    const currentIssue = activeRetry ? activeRetry.value : issue;
    const retryAttempt = activeRetry?.attempt ?? 0;
    const outcome = useMemo(
        () => runAnalysis(currentIssue, rules),
        [currentIssue, retryAttempt, rules],
    );

    useEffect(() => {
        if (outcome.status === 'error') {
            reportDevelopmentError('Issue analysis failed.', outcome.error);
        }
    }, [outcome]);

    const retry = async () => {
        setIsRetrying(true);

        try {
            const refreshedIssue = await getCurrentIssue();

            setRetriedIssue((previous) => ({
                baseIssue: issue,
                value: refreshedIssue,
                attempt: (previous?.attempt ?? 0) + 1,
            }));
        } catch (error: unknown) {
            reportDevelopmentError('Current issue retry failed.', error);
        } finally {
            setIsRetrying(false);
        }
    };

    if (outcome.status === 'error') {
        return <IssueHealthBlock state="error" onRetry={retry} retrying={isRetrying} />;
    }

    return <IssueHealthBlock state="success" result={outcome.result} />;
}
