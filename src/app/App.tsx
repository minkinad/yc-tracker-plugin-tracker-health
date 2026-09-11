import { ThemeProvider } from '@gravity-ui/uikit';
import { hostApi, useTrackerPluginContext } from '@weavix/tracker-plugin-sdk-react';

import { TrackerHealthErrorBoundary } from '../components/TrackerHealthErrorBoundary';

import { TrackerHealthContent } from './TrackerHealthContent';

const App = () => {
    const { theme, slotContext } = useTrackerPluginContext<'issue.block' | 'drawer.issue.block'>(
        'full',
    );

    return (
        <ThemeProvider theme={theme}>
            <TrackerHealthErrorBoundary>
                <TrackerHealthContent
                    issue={slotContext}
                    getCurrentIssue={() => hostApi.getContext()}
                />
            </TrackerHealthErrorBoundary>
        </ThemeProvider>
    );
};

export default App;
