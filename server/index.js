require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");

const { db } = require("./utils/firebase");

const { verifyJwt } = require("./middleware/verifyJwt");

const accountRoutes = require("./routes/accountRoutes");
const userAccountRoutes = require("./routes/userAccountRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const logRoutes = require("./routes/logRoutes");
const reportRoutes = require("./routes/reportRoutes");
const { createDocument } = require("./controllers/reportControllers");

const app = express();

app.listen(process.env.PORT, () => {
  console.log("Server running");
});

//middlewares

app.use("/tmp", express.static(process.env.FILE_STORAGE_PATH));

app.use(cors({ origin: process.env.CLIENT_URI, credentials: true }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

//routes

app.use("/api", accountRoutes);

app.use(verifyJwt);

app.use("/api/accounts", userAccountRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/reports", reportRoutes);

cron.schedule("34 15 * * *", () => {
  createDocument();
});
