const express = require("express");
const dotenv = require("dotenv");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const path = require("path");

// Loads environment variables
dotenv.config();

const app = express();

// CORS Configuration
const trustedOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:5500",
  "http://localhost:5000",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        trustedOrigins.includes(origin) ||
        origin.endsWith(".railway.app")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Blocked by CORS policy: Origin not allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Security Headers (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(express.static(path.join(__dirname, "public")));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api", limiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, "query", {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
});
app.use(xss());

app.get("/", (req, res) => {
  res.redirect("/login.html");
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Fintech API is healthy and running!",
    uptime: Math.round(process.uptime()) + "s",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is healthy and running!",
  });
});

const authRoutes = require("./src/routes/authRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const transactionRoutes = require("./src/routes/transactionRoutes");
const testRoutes = require("./src/routes/testRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const videoRoutes = require("./src/routes/videoRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");

app.use("/api/auth", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/test", testRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/payments", paymentRoutes);

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.originalUrl} does not exist on this server.`,
  });
});

const errorHandler = require("./src/middleware/errorHandler");
app.use(errorHandler);

module.exports = app;
