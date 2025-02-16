import './App.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { AppInsightsContext, AppInsightsErrorBoundary, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { getConfiguration } from './configuration/getConfiguration';
import { Main } from './screens/main/Main';
import { Route, Switch } from 'wouter';
import { Styleguide } from './screens/styleguide/Styleguide';

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
    <AppInsightsContext.Provider value={reactPlugin}>
      <AppInsightsErrorBoundary onError={() => <h1>Something went wrong</h1>} appInsights={reactPlugin}>
        <QueryClientProvider client={queryClient}>
          <Switch>
            <Route path={'/'} component={Main} />
            <Route path={'/styleguide'} component={Styleguide} />
          </Switch>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </AppInsightsErrorBoundary>
    </AppInsightsContext.Provider>
  );
}

export default App;
