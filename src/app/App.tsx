import { ThemeProvider } from '@gravity-ui/uikit';
import { useTrackerPluginContext } from '@weavix/tracker-plugin-sdk-react';

import { IssueHealthBlock } from '../components/IssueHealthBlock';
import { evaluateIssueHealth } from '../domain/health/evaluateIssueHealth';
import { mapTrackerIssueToHealthContext } from '../infrastructure/tracker/issue.mapper';

const App = () => {
    const { theme, slotContext } = useTrackerPluginContext<'issue.block' | 'drawer.issue.block'>(
        'full',
    );

    if (!slotContext) {
        return (
            <ThemeProvider theme={theme}>
                <IssueHealthBlock
                    state="error"
                    message="Текущая задача отсутствует в контексте issue.block."
                />
            </ThemeProvider>
        );
    }

    const context = mapTrackerIssueToHealthContext(slotContext);
    const result = evaluateIssueHealth(context);

    return (
        <ThemeProvider theme={theme}>
            <IssueHealthBlock state="success" result={result} />
        </ThemeProvider>
    );
};

export default App;
