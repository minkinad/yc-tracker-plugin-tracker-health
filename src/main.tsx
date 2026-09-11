import React from 'react';

import { PluginLoader, TrackerPluginProvider } from '@weavix/tracker-plugin-sdk-react';
import ReactDOM from 'react-dom/client';

import App from './app/App';
import { PluginFailure } from './components/PluginFailure';
import { TrackerHealthErrorBoundary } from './components/TrackerHealthErrorBoundary';
import { reportDevelopmentError } from './shared/errors/reportDevelopmentError';

import './styles.scss';

const rootElement = document.getElementById('root');

if (rootElement === null) {
    reportDevelopmentError(
        'Plugin root element was not found.',
        new Error('Missing #root element.'),
    );
} else {
    const root = ReactDOM.createRoot(rootElement);

    root.render(
        <React.StrictMode>
            <TrackerPluginProvider
                fallback={<PluginLoader />}
                errorFallback={(error) => <PluginFailure error={error} />}
            >
                <TrackerHealthErrorBoundary>
                    <App />
                </TrackerHealthErrorBoundary>
            </TrackerPluginProvider>
        </React.StrictMode>,
    );
}
