const mongoose = require("mongoose");
const dns = require("dns");
const logger = require("./logger");

// Forces Google DNS to prevent querySrv ECONNREFUSED errors
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const connectDB = async () => {
  // Supports both MONGODB_URI (Railway standard) and MONGO_URI
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    logger.fatal(
      "Database connection aborted: Neither MONGODB_URI nor MONGO_URI is defined in your .env file.",
    );
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri);

    // Structured logging with Pino instead of console.log
    logger.info(
      { host: conn.connection.host },
      "MongoDB Atlas Connected Successfully",
    );
  } catch (error) {
    logger.fatal(
      { err: error.message },
      "MongoDB connection failure. Shutting down application.",
    );
    process.exit(1);
  }
};

module.exports = connectDB;
