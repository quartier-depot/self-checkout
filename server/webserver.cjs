const { useAzureMonitor } = require("@azure/monitor-opentelemetry");
const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express');
const path = require('path');

// configure
let root = "";
let config = {
  woocommerce: {},
  applicationInsights: {},
  snap: {}
};

const snap = process.env.SNAP;
if (snap) {   // executed in snap environment
  root = path.join(snap, 'dist');
} else { // executed in development environment
  root = path.join(__dirname, 'dist');
}

config.woocommerce.url = process.env.WOOCOMMERCE_URL || process.env.VITE_WOOCOMMERCE_URL;
config.woocommerce.consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
config.woocommerce.consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.VITE_WOOCOMMERCE_CONSUMER_SECRET;
config.applicationInsights.connectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING;
config.snap.version = process.env.SNAP_VERSION || process.env.VITE_SNAP_VERSION; 

// tracking
const options = {
  azureMonitorExporterOptions: {
    connectionString: config.applicationInsights.connectionString
  },
}
useAzureMonitor(options);
registerInstrumentations({
  instrumentations: [
    // Express instrumentation expects HTTP layer to be instrumented
    new HttpInstrumentation(),
    new ExpressInstrumentation(),
  ],
});

// express
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Serve static files from the dist folder
app.use(express.static(root));

// Proxy /wp-json calls to the target server
app.use('/wp-json', createProxyMiddleware({
  target: `${config.woocommerce.url}/wp-json`,
  changeOrigin: true,
  secure: false,
  on: {
    proxyReq: (proxyReq, req, res) => {
      // the auth property from the createProxyMiddleware did not work on Ubuntu, so we set it manually
      const auth = Buffer.from(`${config.woocommerce.consumerKey}:${config.woocommerce.consumerSecret}`).toString('base64');
      proxyReq.setHeader('Authorization', `Basic ${auth}`);
    }
  }
}));

// Configuration
app.get('/api/configuration', (_, res) => {
  res.json({ applicationInsights: config.applicationInsights, snap: config.snap});
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});