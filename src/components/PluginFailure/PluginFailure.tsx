import { useEffect } from 'react';

import { ThemeProvider } from '@gravity-ui/uikit';

import { reportDevelopmentError } from '../../shared/errors/reportDevelopmentError';
import { IssueHealthBlock } from '../IssueHealthBlock';

interface PluginFailureProps {
    error: Error;
}

export function PluginFailure({ error }: PluginFailureProps) {
    useEffect(() => {
        reportDevelopmentError('Plugin initialization failed.', error);
    }, [error]);

    return (
        <ThemeProvider>
            <IssueHealthBlock state="error" onRetry={() => window.location.reload()} />
        </ThemeProvider>
    );
}
