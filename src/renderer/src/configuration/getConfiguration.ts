type Configuration = {
  woocommerce: {
    url: string;
    consumerKey: string;
    consumerSecret: string;
  },
  appInsights: {
    connectionString: string
  }
  electron: boolean
};

export function getConfiguration(): Configuration {
  const WOOCOMMERCE_URL = import.meta.env.VITE_WOOCOMMERCE_URL;
  const WOOCOMMERCE_CONSUMER_KEY = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
  const WOOCOMMERCE_CONSUMER_SECRET = import.meta.env.VITE_WOOCOMMERCE_CONSUMER_SECRET;
  const APPINSIGHTS_CONNECTION_STRING = import.meta.env.VITE_APPINSIGHTS_CONNECTION_STRING;

  return {
    woocommerce: {
      url: WOOCOMMERCE_URL,
      consumerKey: WOOCOMMERCE_CONSUMER_KEY,
      consumerSecret: WOOCOMMERCE_CONSUMER_SECRET
    },
    appInsights: {
      connectionString: APPINSIGHTS_CONNECTION_STRING
    },
    electron: isElectron()
  };
}


function isElectron() {
  return 'undefined' != typeof window && 'object' == typeof window.process && 'renderer' === window.process.type || (!('undefined' == typeof process || 'object' != typeof process.versions || !process.versions.electron) || 'object' == typeof navigator && 'string' == typeof navigator.userAgent && navigator.userAgent.indexOf('Electron') >= 0);
}
