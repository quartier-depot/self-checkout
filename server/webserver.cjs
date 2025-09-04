// connection string
const appInsightsConnectionString = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING || process.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING;

// appInsights
// Note: warning "Accessing resource attributes before async attributes settled []" is noise
// see: https://github.com/microsoft/ApplicationInsights-node.js/issues/1218"
const appInsights = require('applicationinsights');
appInsights.setup(appInsightsConnectionString).start();

// config
let config = {
  woocommerce: {},
  applicationInsights: {}
};
config.woocommerce.url = process.env.WOOCOMMERCE_URL || process.env.VITE_WOOCOMMERCE_URL;
config.woocommerce.consumerKey = process.env.WOOCOMMERCE_CONSUMER_KEY || process.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
config.woocommerce.consumerSecret = process.env.WOOCOMMERCE_CONSUMER_SECRET || process.env.VITE_WOOCOMMERCE_CONSUMER_SECRET;
config.applicationInsights.connectionString = appInsightsConnectionString;
config.applicationInsights.availabilityInterval = process.env.APPLICATIONINSIGHTS_AVAILABILITY_INTERVAL || process.env.VITE_APPLICATIONINSIGHTS_AVAILABILITY_INTERVAL || 900000;
config.inactivityTimeout = process.env.INACTIVITY_TIMEOUT || process.env.VITE_INACTIVITY_TIMEOUT || 180000;
config.inactivityConfirmationTimeout = process.env.INACTIVITY_CONFIRMATION_TIMEOUT || process.env.INACTIVITY_CONFIRMATION_TIMEOUT || 30000;
config.aboDocumentId = process.env.ABO_DOCUMENT_ID || process.env.VITE_ABO_DOCUMENT_ID;

// express
const express = require('express');
const app = express();

// Serve static files from the dist folder
const path = require('path');
const root = path.join(__dirname, '..', 'app', 'dist');
app.use(express.static(root));

// Proxy /wp-json calls to the target server
const { createProxyMiddleware } = require('http-proxy-middleware');
app.use('/wp-json', createProxyMiddleware({
  target: `${config.woocommerce.url}/wp-json`,
  changeOrigin: true,
  secure: false,
  on: {
    proxyReq: (proxyReq, _, res) => {
      // the auth property from the createProxyMiddleware did not work on Ubuntu, so we set it manually
      const auth = Buffer.from(`${config.woocommerce.consumerKey}:${config.woocommerce.consumerSecret}`).toString('base64');
      proxyReq.setHeader('Authorization', `Basic ${auth}`);
    }
  }
}));

// Proxy calls to google docs for abo
app.use('/docs-google-com', createProxyMiddleware({
  target: `https://docs.google.com`,
  changeOrigin: true,
  followRedirects: true,
  rewrite: (path) => path.replace(/^\/docs-google-com/, ''),
}));

// Configuration
app.get('/api/configuration', (_, res) => {
  res.json({
    applicationInsights: config.applicationInsights,
    inactivityTimeout: config.inactivityTimeout,
    inactivityConfirmationTimeout: config.inactivityConfirmationTimeout,
    api: {
      documentId: config.apiDocumentId,
    }
  })
});

// frontend availability
app.post('/api/availability', (_, res) => {
  appInsights.defaultClient.trackAvailability({name: "heartbeat", success: true, runLocation: 'frontend' });
  res.json({ response: 'ok' });
});

// Fallback to index.html for SPA
app.get('*splat', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

appInsights.defaultClient.trackAvailability({name: "heartbeat", success: true, runLocation: 'server' });
setInterval(() => {
  appInsights.defaultClient.trackAvailability({name: "heartbeat", success: true, runLocation: 'server' });
}, config.applicationInsights.availabilityInterval);

const packageJson = require('./package.json');
appInsights.defaultClient.trackEvent({name: "server-start", properties: { version: packageJson.version }});