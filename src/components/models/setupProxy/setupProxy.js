const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://api.coingecko.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // '/api' 경로를 공백으로 대체하여 실제 API 경로에 맞춥니다.
      },
    })
  );
};
