const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({path: path.join(__dirname, '..', '.env')});

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Proxy /wp-json calls to the target server
app.use('/wp-json', createProxyMiddleware({
  target: `${process.env.VITE_WOOCOMMERCE_URL}/wp-json`,
  changeOrigin: true,
  secure: false,
  auth: `${process.env.VITE_WOOCOMMERCE_CONSUMER_KEY}:${process.env.VITE_WOOCOMMERCE_CONSUMER_SECRET}`
}));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});