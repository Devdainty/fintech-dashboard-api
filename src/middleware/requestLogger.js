const pinoHttp = require("pino-http");
const crypto = require("crypto");
const logger = require("../config/logger");

const requestLogger = pinoHttp({
  logger,
  genReqId: (req) => req.headers["x-request-id"] || crypto.randomUUID(),

  customLogLevel: (req, res, err) => {
    if (res.statusCode >= 500 || err) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },

  redact: ["req.headers.authorization", "req.headers.cookie"],
});

module.exports = requestLogger;
