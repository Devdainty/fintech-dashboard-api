const logger = require("../config/logger");

const performanceMonitor = (req, res, next) => {
  const start = process.hrtime.bigint();

  // Listens to the response 'finish' event
  res.on("finish", () => {
    const end = process.hrtime.bigint();
    // Converts nanoseconds to milliseconds
    const durationMs = Number(end - start) / 1_000_000;

    logger.info(
      {
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode: res.statusCode,
        durationMs: Number(durationMs.toFixed(2)),
      },
      `API Request completed in ${durationMs.toFixed(2)}ms`,
    );
  });

  next();
};

module.exports = performanceMonitor;
