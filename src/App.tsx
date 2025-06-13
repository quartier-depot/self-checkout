import './App.css';
import { AppInsightsContext, AppInsightsErrorBoundary, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { Main } from './screens/main/Main';
import { useEffect, useState } from 'react';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Styleguide } from './screens/styleguide/Styleguide';
import { Statistics } from './screens/statistics/Statistics';
import { Provider } from 'react-redux';
import  store from './store/store';
import { useAppDispatch, useAppSelector } from './store/store';
import { setConfiguration } from './store/slices/configurationSlice';
import { initializeCartLoggingMiddleware } from './store/middleware/cartLoggingMiddleware';

function AppContent() {
    const dispatch = useAppDispatch();
    const configuration = useAppSelector(state => state.configuration.configuration);
    const [reactPlugin, setReactPlugin] = useState<ReactPlugin | undefined>(undefined);

    useEffect(() => {
        async function bootstrap() {
            let configuration = undefined;
            if (import.meta.env.VITE_WOOCOMMERCE_URL) {
                configuration = {
                    woocommerce: {
                        url: import.meta.env.VITE_WOOCOMMERCE_URL,
                        consumerKey: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY,
                        consumerSecret: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET
                    },
                    applicationInsights: {
                        connectionString: import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING
                    },
                    snap: {
                        version: import.meta.env.VITE_SNAP_VERSION
                    }
                }
            } else {
                const url = '/api/configuration';
                const response = await fetch(url);
                if (response.ok) {
                    configuration = await response.json();
                } else {
                    throw new Error('Cannot load configuration, return code ' + response.status);
                }
            }

            dispatch(setConfiguration(configuration));

            const reactPlugin = new ReactPlugin();
            const appInsights = new ApplicationInsights({
                config: {
                    connectionString: configuration.applicationInsights.connectionString,
                    enableAutoRouteTracking: true,
                    extensions: [reactPlugin]
                }
            });
            appInsights.loadAppInsights();
            appInsights.trackPageView();

            initializeCartLoggingMiddleware(appInsights);
            setReactPlugin(reactPlugin);
        }

        bootstrap();
    }, []);

    if (!reactPlugin || !configuration) {
        return <h1>Loading configuration...</h1>;
    }

    return (
        <AppInsightsContext.Provider value={reactPlugin}>
            <AppInsightsErrorBoundary onError={() => <h1>Something went wrong</h1>} appInsights={reactPlugin}>
                <BrowserRouter>
                    <Routes>
                        <Route path="/" element={<Main />} />
                        <Route path="styleguide" element={<Styleguide />} />
                        <Route path="statistics" element={<Statistics />} />
                    </Routes>
                </BrowserRouter>
            </AppInsightsErrorBoundary>
        </AppInsightsContext.Provider>
    );
}

export default function App() {
    return (
        <Provider store={store}>
            <AppContent />
        </Provider>
    );
}
