import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppInsightsContext, AppInsightsErrorBoundary, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { Main } from './screens/main/Main';
import { useEffect, useState } from 'react';
import { ConfigurationActionTypes } from './state/configuration/configurationAction';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { Configuration } from './state/reducer';
import { useAppContext } from './context/useAppContext';

const queryClient = new QueryClient();

// configuration taken from .env.development file
const developmentConfiguration: Configuration = {
  woocommerce: {
    url: import.meta.env.VITE_WOOCOMMERCE_URL,
    consumerKey: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY,
    consumerSecret: import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET
  },
  appInsights: {
    connectionString: import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING
  },
  electron: false
};

const isElectron = 'undefined' != typeof window && 'object' == typeof window.process && 'renderer' === window.process.type || (!('undefined' == typeof process || 'object' != typeof process.versions || !process.versions.electron) || 'object' == typeof navigator && 'string' == typeof navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0);

function App() {
  const { dispatch, state } = useAppContext();
  const [reactPlugin, setReactPlugin] = useState<ReactPlugin | undefined>(undefined);

  useEffect(() => {
    if (isElectron) {
      const getConfiguration = async () => {
        const config = await window.api.getConfig();
        dispatch({ type: ConfigurationActionTypes.SET_CONFIGURATION, payload: config });
      };
      getConfiguration().catch((e) => console.log(e));
    } else {
      dispatch({ type: ConfigurationActionTypes.SET_CONFIGURATION, payload: developmentConfiguration });
    }
  }, []);

  useEffect(() => {
    if (state.configuration) {
      const reactPlugin = new ReactPlugin();
      const appInsights = new ApplicationInsights({
        config: {
          connectionString: state.configuration.appInsights.connectionString,
          enableAutoRouteTracking: true,
          extensions: [reactPlugin]
        }
      });
      appInsights.loadAppInsights();
      setReactPlugin(reactPlugin);
    }
  }, [state.configuration]);

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
