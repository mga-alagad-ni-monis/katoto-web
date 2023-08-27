require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const { spawn } = require("child_process");

const { db } = require("./utils/firebase");

const { verifyJwt } = require("./middleware/verifyJwt");

const accountRoutes = require("./routes/accountRoutes");
const userAccountRoutes = require("./routes/userAccountRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const logRoutes = require("./routes/logRoutes");
const reportRoutes = require("./routes/reportRoutes");
const trainRoutes = require("./routes/trainRoutes");
const { createDocument } = require("./controllers/reportControllers");

const app = express();

//newly added
const http = require("http");

const server = http.createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: process.env.CLIENT_URI,
    credentials: true,
  },
});
//

// app.listen
server.listen(process.env.PORT, () => {
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

//newly added
let onlineUsers = [];

const addNewUser = (username, socketId) => {
  !onlineUsers.some((user) => user.username === username) &&
    onlineUsers.push({ username, socketId });
};

const getUser = (username) => {
  return onlineUsers.find((user) => user.username === username);
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (email) => {
    const isPresent = onlineUsers.some((i) => i.socketId === socket.id);
    if (!isPresent) {
      addNewUser(email, socket.id);
    }
    console.log(onlineUsers);
  });

  socket.on("train", ({ mode, id }) => {
    let port = mode === "cg" ? 8080 : 8081;
    const trainData = spawn(
      `conda activate katoto-ml-${mode} && rasa train --config config.yml && rasa run --enable-api --cors \"*\" -p ${port} --debug`,
      {
        shell: true,
        cwd: `${process.env.RASA_FILES_PATH}katoto-ml-${mode}`,
      }
    );

    trainData.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
      io.to(id).emit("displayData", {
        data: data,
      });
    });
    trainData.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      io.to(id).emit("displayData", {
        data: data,
      });
    });
    trainData.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
      io.to(id).emit("displayData", {
        data: code,
      });
    });
  });

  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log(onlineUsers);
    // onlineUsers.forEach((i) => {
    //   io.to(i?.socketId).emit("getOnlineFriends", {
    //     onlineUsers,
    //   });
    // });
  });
});
//

//routes

app.use("/api", accountRoutes);

app.use(verifyJwt);

app.use("/api/accounts", userAccountRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/train", trainRoutes);

cron.schedule("0 0 * * *", () => {
  createDocument();
});
