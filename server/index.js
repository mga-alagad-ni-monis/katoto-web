require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { db } = require("./utils/firebase");

const accountRoutes = require("./routes/accountRoutes");

const app = express();

app.listen(process.env.PORT, () => {
  console.log("Server running");
});

//middlewares

app.use(cors({ origin: process.env.CLIENT_URI, credentials: true }));

app.use(express.json());

app.use(cookieParser());

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

//routes
app.use("/api", accountRoutes);
