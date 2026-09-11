import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { reportDevelopmentError } from '../../shared/errors/reportDevelopmentError';
import { IssueHealthBlock } from '../IssueHealthBlock';

interface TrackerHealthErrorBoundaryProps {
    children: ReactNode;
}

interface TrackerHealthErrorBoundaryState {
    error: Error | null;
}

export class TrackerHealthErrorBoundary extends Component<
    TrackerHealthErrorBoundaryProps,
    TrackerHealthErrorBoundaryState
> {
    static getDerivedStateFromError(error: Error): TrackerHealthErrorBoundaryState {
        return { error };
    }

    state: TrackerHealthErrorBoundaryState = {
        error: null,
    };

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        reportDevelopmentError('Unexpected React render error.', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.error) {
            return <IssueHealthBlock state="error" onRetry={this.retry} />;
        }

        return this.props.children;
    }

    private retry = (): void => {
        this.setState({ error: null });
    };
}
