import React from 'react';

import { PluginLoader, TrackerPluginProvider } from '@weavix/tracker-plugin-sdk-react';
import ReactDOM from 'react-dom/client';

import App from './app/App';
import { PluginFailure } from './components/PluginFailure';

import './styles.scss';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <TrackerPluginProvider
            fallback={<PluginLoader />}
            errorFallback={(error) => <PluginFailure error={error} />}
        >
            <App />
        </TrackerPluginProvider>
    </React.StrictMode>,
);
