import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppInsightsContext, AppInsightsErrorBoundary, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { Main } from './screens/main/Main';
import { useEffect, useState } from 'react';
import { ConfigurationActionTypes } from './state/configuration/configurationAction';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { useAppContext } from './context/useAppContext';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Styleguide } from './screens/styleguide/Styleguide';
import { Statistics } from './screens/statistics/Statistics';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            throwOnError: true
        },
        mutations: {
            throwOnError: true
        }
    }
});

function App() {
    const { dispatch, state } = useAppContext();
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

            dispatch({ type: ConfigurationActionTypes.SET_CONFIGURATION, payload: configuration });

            const reactPlugin = new ReactPlugin();
            const appInsights = new ApplicationInsights({
                config: {
                    connectionString: configuration.applicationInsights.connectionString,
                    enableAutoRouteTracking: true,
                    extensions: [reactPlugin]
                }
            });
            appInsights.loadAppInsights();
            setReactPlugin(reactPlugin);
        }

        bootstrap();
    }, []);

    if (!reactPlugin || !state.configuration) {
        return <h1>Loading configuration...</h1>;
    }

    return (
        <AppInsightsContext.Provider value={reactPlugin}>
            <AppInsightsErrorBoundary onError={() => <h1>Something went wrong</h1>} appInsights={reactPlugin}>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Main />} />
                            <Route path="styleguide" element={<Styleguide />} />
                            <Route path="statistics" element={<Statistics />} />
                        </Routes>
                    </BrowserRouter>
                    <ReactQueryDevtools initialIsOpen={false} />
                </QueryClientProvider>
            </AppInsightsErrorBoundary>
        </AppInsightsContext.Provider>
    );
}

export default App;
