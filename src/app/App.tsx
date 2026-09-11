import { Card, DefinitionList, ThemeProvider, Text as Typography } from '@gravity-ui/uikit';
import { useTrackerPluginContext } from '@weavix/tracker-plugin-sdk-react';

const App = () => {
    const { theme, slotContext } = useTrackerPluginContext<'issue.block' | 'drawer.issue.block'>(
        'full',
    );

    if (!slotContext) {
        return null;
    }

    return (
        <ThemeProvider theme={theme}>
            <Card style={{ padding: '20px' }}>
                <Typography variant="header-1" as="div" style={{ marginBottom: '16px' }}>
                    Полный контекст (contextLevel: full)
                </Typography>
                <DefinitionList>
                    <DefinitionList.Item name="Ключ">{slotContext.key}</DefinitionList.Item>
                </DefinitionList>
            </Card>
        </ThemeProvider>
    );
};

export default App;
