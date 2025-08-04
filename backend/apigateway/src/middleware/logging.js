const loggingMiddleware = (req, res, next) => {
  console.log(`[API Gateway] ${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
};

module.exports = loggingMiddleware;
