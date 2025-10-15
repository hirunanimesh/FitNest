const loggingMiddleware = (req, res, next) => {
  const startTime = Date.now();
  req.startTime = startTime;
  
  console.log(`[API Gateway] ${new Date().toISOString()} ${req.method} ${req.url} - Started`);
  
  // Override res.end to log completion time
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    console.log(`[API Gateway] ${req.method} ${req.url} - Completed ${res.statusCode} (${duration}ms)`);
    originalEnd.apply(this, args);
  };
  
  next();
};

module.exports = loggingMiddleware;
