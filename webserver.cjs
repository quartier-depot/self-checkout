const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const dotenv = require('dotenv');

const snap = process.env.SNAP;

let root = "";
let config = {
  woocommerce: {},
  appInsights: {}
};

if (snap) {   // executed in snap environment
  root = path.join(snap, 'dist');
  config.url = "";
  config.woocommerce.url = "";
  config.woocommerce.consumerKey = "";
  config.woocommerce.consumerSecret = "";
  config.appInsights.connectionString = "";

} else { // executed in development environment
  root = path.join(__dirname, '..', 'dist');
  dotenv.config({path: path.join(__dirname, '..', '.env')});
  config.woocommerce.url = process.env.VITE_WOOCOMMERCE_URL;
  config.woocommerce.consumerKey = process.env.VITE_WOOCOMMERCE_CONSUMER_KEY;
  config.woocommerce.consumerSecret = process.env.VITE_WOOCOMMERCE_CONSUMER_SECRET;
  config.appInsights.connectionString = process.env.VITE_APPINSIGHTS_CONNECTION_STRING;
}

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist folder
app.use(express.static(root));

// Proxy /wp-json calls to the target server
app.use('/wp-json', createProxyMiddleware({
  target: `${config.woocommerce.url}/wp-json`,
  changeOrigin: true,
  secure: false,
  auth: `${config.woocommerce.consumerKey}:${config.woocommerce.consumerSecret}`
}));

// Configuration
app.get('/api/configuration', (_, res) => {
  res.json({ appInsights: config.appInsights});
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});