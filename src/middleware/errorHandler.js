const Sentry = require("@sentry/node");
const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  // Determines status code (default to 500 if not already set)
  const statusCode =
    err.statusCode ||
    (res.statusCode && res.statusCode !== 200 ? res.statusCode : 500);

  // Reports server errors (500+) to Sentry
  if (statusCode >= 500) {
    Sentry.captureException(err);
  }

  // Logs structured error details using Pino
  logger.error(
    {
      err: {
        message: err.message,
        stack: err.stack,
      },
      reqId: req.id,
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode,
    },
    "Application error captured",
  );

  res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500 && process.env.NODE_ENV === "production"
        ? "An unexpected internal server error occurred."
        : err.message || "Something went wrong on the server",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = errorHandler;
