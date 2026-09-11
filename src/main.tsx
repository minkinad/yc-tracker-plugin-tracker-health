import React from 'react';

import { PluginError, PluginLoader, TrackerPluginProvider } from '@weavix/tracker-plugin-sdk-react';
import ReactDOM from 'react-dom/client';

import App from './app/App';

import './styles.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <TrackerPluginProvider
            fallback={<PluginLoader />}
            errorFallback={(error) => <PluginError error={error} />}
        >
            <App />
        </TrackerPluginProvider>
    </React.StrictMode>,
);
