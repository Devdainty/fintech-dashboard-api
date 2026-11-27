const pino = require("pino");

const isDev = process.env.NODE_ENV !== "production";

const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  transport: isDev
    ? {
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      }
    : undefined,
});

module.exports = logger;
