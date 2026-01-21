import './App.css';
import { AppInsightsContext, AppInsightsErrorBoundary, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { Main } from './screens/main/Main';
import { useEffect, useRef, useState } from 'react';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { BrowserRouter, Route, Routes } from 'react-router';
import { Styleguide } from './screens/styleguide/Styleguide';
import { Provider } from 'react-redux';
import store, { useAppDispatch, useAppSelector } from './store/store';
import { setConfiguration } from './store/slices/configurationSlice';
import { initializeCartLoggingMiddleware } from './store/middleware/cartLoggingMiddleware';
import { Error as ErrorScreen } from './screens/main/error/Error';
import { initializeProductValidationMiddleware } from './store/middleware/productValidationMiddleware.ts';
import { initializeCustomerValidationMiddleware } from './store/middleware/customerValidationMiddleware.ts';
import { PersistGate } from 'redux-persist/integration/react'
import { Loading } from './components/modal/loading/Loading.tsx';

function AppContent() {
    const dispatch = useAppDispatch();
    const configuration = useAppSelector(state => state.configuration.configuration);
    const [reactPlugin, setReactPlugin] = useState<ReactPlugin | undefined>(undefined);
    const availabilityIntervalRef = useRef<NodeJS.Timeout>(null);

    useEffect(() => {
        async function bootstrap() {
            let configuration = undefined;
            if (import.meta.env.VITE_WOOCOMMERCE_URL) {
                // using vite dev
                configuration = {
                    woocommerce: {
                        url: import.meta.env.VITE_WOOCOMMERCE_URL,
                        consumerKey: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY,
                        consumerSecret: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET
                    },
                    applicationInsights: {
                        connectionString: import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING,
                        availabilityInterval: import.meta.env.VITE_APPlICATIONINSIGHTS_AVAILABILITY_INTERVAL
                    },
                    abo: {
                        documentId: import.meta.env.VITE_ABO_DOCUMENT_ID
                    },
                    payrexx: {
                        redirectUrl: import.meta.env.VITE_PAYREXX_REDIRECT_URL,
                    },
                    inactivityTimeout: import.meta.env.VITE_INACTIVITY_TIMEOUT,
                    inactivityConfirmationTimeout: import.meta.env.VITE_INACTIVITY_CONFIRMATION_TIMEOUT
                };
            } else {
                // using express webserver
                
                // wait for proxy to be ready
                let proxyReady = false;
                let attempts = 0;
                while (!proxyReady && attempts < 50) {
                    try {
                        const healthResponse = await fetch('/api/health/proxy');
                        if (healthResponse.ok) {
                            proxyReady = true;
                        } else {
                            throw new Error();
                        }
                    } catch (e) {
                        attempts++;
                        console.log(`Waiting for proxy to be ready... ${attempts}/50`);
                        await new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                
                // get configuration
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
            setReactPlugin(reactPlugin);

            initializeCartLoggingMiddleware(appInsights);
            initializeProductValidationMiddleware(appInsights);
            initializeCustomerValidationMiddleware(appInsights);

        }

        bootstrap();
    }, []);

    useEffect(() => {
        const sendAvailabilityPing = async () => {
            try {
                await fetch('/api/availability', { method: 'POST' });
            } catch (error) {
                console.error('Failed to send availability ping:', error);
            }
        };

        if (configuration?.applicationInsights?.availabilityInterval) {
            if (availabilityIntervalRef.current) {
                clearInterval(availabilityIntervalRef.current);
            }

            // noinspection JSIgnoredPromiseFromCall
            sendAvailabilityPing();
            availabilityIntervalRef.current = setInterval(sendAvailabilityPing, configuration.applicationInsights.availabilityInterval);

            return () => {
                if (availabilityIntervalRef.current) {
                    clearInterval(availabilityIntervalRef.current);
                }
            };
        }
    }, [configuration]);

    if (!reactPlugin || !configuration) {
        return <Loading text='' />;
    }

    return (
            <AppInsightsContext.Provider value={reactPlugin}>
                <AppInsightsErrorBoundary onError={() => <ErrorScreen />} appInsights={reactPlugin}>
                    <Routes>
                        <Route path="/" element={<Main />} />
                        <Route path="styleguide" element={<Styleguide />} />
                        <Route path="error" element={<ErrorScreen />} />
                    </Routes>
                </AppInsightsErrorBoundary>
            </AppInsightsContext.Provider>
    );
}

export default function App() {
    return (
            <Provider store={store.store}>
                <PersistGate loading={<Loading text='' />} persistor={store.persistor}>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </PersistGate>
            </Provider>
    );
}
