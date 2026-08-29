const express = require("express");
const app = express();
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const { config } = require("dotenv");
const authRoute = require("./routes/auth.route");
const documentRoute = require("./routes/document.route");
const itineraryRoute = require("./routes/itinerary.route");
const dashboardRoute = require("./routes/dashboard.route");

app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Serve static uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/document", documentRoute);
app.use("/api/v1/itinerary", itineraryRoute);
app.use("/api/v1/dashboard", dashboardRoute);

app.get("/", (req, res) => {
  res.json({ Message: "API Is Running..." });
});

module.exports = app;