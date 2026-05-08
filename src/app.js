require("dotenv").config();
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const morgan = require("morgan");
const expressLayouts = require("express-ejs-layouts");
const path = require("path");
const fs = require("fs");

const logger = require("./utils/logger");
const authRoutes = require("./routes/auth");
const taskRoutes = require("./routes/tasks");
const { notFound, errorHandler } = require("./middleware/errorHandler");

// Ensure logs directory exists
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Body parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// HTTP request logging
app.use(
  morgan("combined", {
    stream: { write: (message) => logger.http(message.trim()) },
    skip: (req) => req.path === "/health",
  })
);

if (!process.env.SESSION_SECRET) {
  console.error("SESSION_SECRET environment variable is required!");
  process.exit(1);
}

const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

if (process.env.MONGODB_URI && process.env.NODE_ENV !== "test") {
  sessionConfig.store = MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    touchAfter: 24 * 3600,
  });
}

app.use(session(sessionConfig));
app.use(flash());

// Make flash messages and user info available in all views
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.session.username || null;
  res.locals.userId = req.session.userId || null;
  next();
});

// Health check
app.get("/health", (req, res) =>
  res.json({ status: "ok", uptime: process.uptime() })
);

// Redirect root to tasks or login
app.get("/", (req, res) => {
  res.redirect(req.session.userId ? "/tasks" : "/auth/login");
});

// Routes
app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

module.exports = app;
