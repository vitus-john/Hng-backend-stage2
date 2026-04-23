const express = require("express");
const cors = require("cors");

const profilesRouter = require("./routes/profiles");

const app = express();
const port = process.env.PORT || 5000;

// Trust proxy for rate limiting
app.set("trust proxy", 1);

require("./config/db_conn");
//CORS header
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});
// CORS
app.use(cors({ origin: "*" }));

// JSON parser
app.use(express.json());

// Routes
app.use("/api", profilesRouter);

// 404 handler
app.use((req, res) => {
  return res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  return res.status(err.status || 500).json({
    status: "error",
    message: err.message || "Internal server error",
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
