//Loads environment variables
const dotenv = require("dotenv");
dotenv.config();

const mongoose = require("mongoose");
const app = require("./app");
const connectDB = require("./src/config/db");

// Connects to MongoDB
connectDB();

// Dynamic PORT
const PORT = process.env.PORT || 5000;

//Starts HTTP Server
const server = app.listen(PORT, () => {
  console.log(
    `Server running in ${process.env.NODE_ENV || "production"} mode on port ${PORT}`,
  );
});

const handleShutdown = async (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);

  server.close(async () => {
    console.log("HTTP server closed.");

    try {
      await mongoose.connection.close(false);
      console.log("MongoDB connection closed cleanly.");
      process.exit(0);
    } catch (err) {
      console.error("Error while closing MongoDB connection:", err.message);
      process.exit(1);
    }
  });

  setTimeout(() => {
    console.error("Forceful shutdown after 10s timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
