const express = require('express');
require("dotenv").config({ path: 'myenv.env' });
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const apiProxyTarget = process.env.API_PROXY_TARGET;

app.use(express.static('public'));

if (apiProxyTarget) {
  // Proxy for GraphQL
  app.use('/graphql', createProxyMiddleware({
    target: apiProxyTarget,
    changeOrigin: true,
    logLevel: 'debug',
  }));

  // Proxy for file uploads
  app.use('/upload', createProxyMiddleware({
    target: apiProxyTarget,
    changeOrigin: true,
    logLevel: 'debug',
  }));

  // Optional: Proxy for fetching uploaded files
  app.use('/file', createProxyMiddleware({
    target: apiProxyTarget,
    changeOrigin: true,
    logLevel: 'debug',
  }));
} else {
  console.error("API_PROXY_TARGET not set in env.");
}

const port = process.env.UI_PORT || 3000;
app.listen(port, () => {
  console.log(`UI server running on http://localhost:${port}`);
});
