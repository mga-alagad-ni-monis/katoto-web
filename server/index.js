require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const { spawn } = require("child_process");
const jwt = require("jsonwebtoken");

const { db } = require("./utils/firebase");

const { verifyJwt } = require("./middleware/verifyJwt");

const accountRoutes = require("./routes/accountRoutes");
const userAccountRoutes = require("./routes/userAccountRoutes");
const campaignRoutes = require("./routes/campaignRoutes");
const logRoutes = require("./routes/logRoutes");
const reportRoutes = require("./routes/reportRoutes");
const trainRoutes = require("./routes/trainRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const { createDocument } = require("./controllers/reportControllers");
const { getUser } = require("./controllers/userAccountControllers");
const {
  addSOSAppointment,
  addStandardAppointment,
} = require("./controllers/appointmentControllers");
const {
  addNotificationGcSa,
  addNotificationStudent,
} = require("./controllers/notificationControllers");
const { detectOSType } = require("./utils/utils");

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

const addNewUser = (email, role, idNo, socketId) => {
  !onlineUsers.some((user) => user.email === email) &&
    onlineUsers.push({ email, role, idNo, socketId });
};

const getOnlineUser = (email) => {
  return onlineUsers.find((user) => user.email === email);
};

const getGCnSA = () => {
  return onlineUsers.filter(
    (user) =>
      user.role === "systemAdministrator" || user.role === "guidanceCounselor"
  );
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

io.on("connection", (socket) => {
  socket.on("newUser", (token) => {
    const isPresent = onlineUsers.some((i) => i.socketId === socket.id);
    if (!isPresent) {
      addNewUser(
        jwt.decode(token)?.email,
        jwt.decode(token)?.role,
        jwt.decode(token)?.idNo,
        socket.id
      );
    }
    console.log(onlineUsers);
  });

  socket.on("train", ({ mode, id }) => {
    let port = mode === "cg" ? 8000 : 8001;

    if (detectOSType() === "Windows") {
      console.log("Windows");
      const trainData = spawn(
        `echo Training has started, Please wait and do not close the window. && conda activate katoto-ml-${mode} && rasa train --config config.yml && rasa run --enable-api --cors \"*\" -p ${port} --debug`,
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
    } else if (detectOSType() === "Linux") {
      console.log("Linux");
      const trainData = spawn(
        `echo Training has started, Please wait and do not close the window. && eval "$(conda shell.bash hook)" && conda activate katoto-env && rasa train --config config.yml && pm2 delete "${mode}" && pm2 start ../../katoto-ml/katoto-ml-${mode}/${mode}.sh --attach`,
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
    }
  });

  socket.on("scheduleRequest", async ({ id, token, type, start, end }) => {
    if (jwt.decode(token)?.role === "student") {
      const counselorAdmin = getGCnSA();
      const idNo = jwt.decode(token)?.idNo;
      const userDetails = await getUser(idNo);
      //adding SOS appointment to appointment
      //adding to guidance counselors and system admin
      //sending notifs to guidance counselors and system admin
      let appointmentDetails = {};
      if (type === "sos") {
        appointmentDetails = await addSOSAppointment(userDetails);
      } else if (type === "standard") {
        appointmentDetails = await addStandardAppointment(
          userDetails,
          start,
          end
        );
      }
      await addNotificationGcSa(appointmentDetails);
      if (counselorAdmin.length > 0) {
        counselorAdmin.forEach((user) => {
          io.to(user.socketId).emit("scheduleResponse", {
            id: id,
            type: type,
          });
        });
      }
      await addNotificationStudent(appointmentDetails, idNo);
      onlineUsers.forEach((user) => {
        if (idNo === user.idNo) {
          io.to(user.socketId).emit("studentScheduleResponse", {
            appointmentDetails,
          });
        }
      });
    }
  });

  socket.on(
    "cancelAppointmentRequest",
    async ({ appointmentDetails, token }) => {
      if (
        jwt.decode(token)?.role === "guidanceCounselor" ||
        jwt.decode(token)?.role === "systemAdministrator"
      ) {
        let idNo = appointmentDetails.userDetails.idNo;
        await addNotificationStudent(appointmentDetails, idNo);
        onlineUsers.forEach((user) => {
          if (idNo === user.idNo) {
            io.to(user.socketId).emit("cancelAppointmentResponse", {
              appointmentDetails,
            });
          }
        });
      }
    }
  );

  socket.on("editAppointmentRequest", async ({ appointmentDetails, token }) => {
    if (
      jwt.decode(token)?.role === "guidanceCounselor" ||
      jwt.decode(token)?.role === "systemAdministrator"
    ) {
      let idNo = appointmentDetails.old.userDetails.idNo;
      appointmentDetails["type"] = "edited";
      await addNotificationStudent(appointmentDetails, idNo);
      onlineUsers.forEach((user) => {
        if (idNo === user.idNo) {
          io.to(user.socketId).emit("editAppointmentResponse", {
            appointmentDetails,
          });
        }
      });
    }
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
app.use("/api/notifications", notificationRoutes);
app.use("/api/appointments", appointmentRoutes);

cron.schedule("0 0 * * *", () => {
  createDocument();
});
