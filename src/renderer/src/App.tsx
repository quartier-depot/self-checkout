import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Main } from './screens/main/Main';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { AppInsightsErrorBoundary, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { getConfiguration } from './configuration/getConfiguration';

const configuration = getConfiguration();
const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    connectionString: configuration.appInsights.connectionString,
    enableAutoRouteTracking: true,
    extensions: [reactPlugin]
  }
});
appInsights.loadAppInsights();

const queryClient = new QueryClient();

function App() {
  return (
    <AppInsightsErrorBoundary onError={() => <h1>Something went wrong</h1>} appInsights={reactPlugin}>
      <QueryClientProvider client={queryClient}>
        <Main />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </AppInsightsErrorBoundary>
  );
}

export default App;
