import { ThemeProvider } from '@gravity-ui/uikit';
import { hostApi, useTrackerPluginContext } from '@weavix/tracker-plugin-sdk-react';

import { TrackerHealthContent } from './TrackerHealthContent';

const App = () => {
    const { theme, slotContext } = useTrackerPluginContext<'issue.block' | 'drawer.issue.block'>(
        'full',
    );

    return (
        <ThemeProvider theme={theme}>
            <TrackerHealthContent
                issue={slotContext}
                getCurrentIssue={() => hostApi.getContext()}
            />
        </ThemeProvider>
    );
};

export default App;
