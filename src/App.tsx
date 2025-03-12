import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppInsightsContext, AppInsightsErrorBoundary, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { Main } from './screens/main/Main';
import { useEffect, useState } from 'react';
import { ConfigurationActionTypes } from './state/configuration/configurationAction';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { useAppContext } from './context/useAppContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            networkMode: 'always' // Force queries to execute regardless of browser's online/offline detection (webkit issue)
        }
    }
});

function App() {
    const { dispatch, state } = useAppContext();
    const [reactPlugin, setReactPlugin] = useState<ReactPlugin | undefined>(undefined);

    useEffect(() => {
        async function bootstrap() {
            const url = '/api/configuration';
            const response = await fetch(url);
            if (response.ok) {
                const configuration = await response.json();
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
            } else {
                throw new Error('Cannot load configuration, return code ' + response.status);
            }
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
                        <Main />
                        {/*<Styleguide />*/}
                        <ReactQueryDevtools initialIsOpen={false} />
                    </QueryClientProvider>
                </AppInsightsErrorBoundary>
            </AppInsightsContext.Provider>
    );
}

export default App;
