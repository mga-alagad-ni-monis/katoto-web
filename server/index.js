require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { db } = require("./utils/firebase");

const accountRoutes = require("./routes/accountRoutes");

const app = express();

app.listen(process.env.port, () => {
  console.log("Server running");
});

//middlewares

app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

//routes
app.use("/api", accountRoutes);
