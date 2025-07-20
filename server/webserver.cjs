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
    proxyReq: (proxyReq, req, res) => {
      // the auth property from the createProxyMiddleware did not work on Ubuntu, so we set it manually
      const auth = Buffer.from(`${config.woocommerce.consumerKey}:${config.woocommerce.consumerSecret}`).toString('base64');
      proxyReq.setHeader('Authorization', `Basic ${auth}`);
    }
  }
}));

// Configuration
app.get('/api/configuration', (_, res) => {
  res.json({ applicationInsights: config.applicationInsights});
});

// Fallback to index.html for SPA
app.get('*splat', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

setInterval(() => {
  appInsights.defaultClient.trackAvailability({name: "heartbeat", success: true, runLocation: 'server' });
}, config.applicationInsights.availabilityInterval);

const packageJson = require('./package.json');
appInsights.defaultClient.trackMetric({name: "version", value: packageJson.version});
appInsights.defaultClient.trackEvent({name: "server-start"});