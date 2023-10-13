const uniqid = require("uniqid");
const jwt = require("jsonwebtoken");

const db = require("../utils/firebase");

const addNotificationGcSa = async (notificationDetails) => {
  const newNotificationDetails = {
    id: uniqid.time(),
    details: notificationDetails,
    isSeen: false,
    createdDate: new Date().toLocaleString(),
    type: notificationDetails.type,
  };
  await addNotificationOnAllGcSa(newNotificationDetails, "systemAdministrator");
  await addNotificationOnAllGcSa(newNotificationDetails, "guidanceCounselor");
};

const addNotificationStudent = async (notificationDetails, idNo) => {
  const newNotificationDetails = {
    id: uniqid.time(),
    details: notificationDetails,
    isSeen: false,
    createdDate: new Date().toLocaleString(),
    type: notificationDetails.type,
  };
  await addNotification(newNotificationDetails, idNo);
};

const addNotification = async (notificationDetails, idNo) => {
  const querySnapshot = await db
    .collection("notifications")
    .where("idNo", "==", idNo)
    .get();

  if (querySnapshot.empty) {
    return res.status(404).send("Error");
  }

  querySnapshot.forEach((i) => {
    const notifications = i.data().notifications;
    notifications.push(notificationDetails);
    i.ref.update({
      notifications,
    });
  });
};

const addNotificationOnAllGcSa = async (notificationDetails, role) => {
  const querySnapshot = await db
    .collection("notifications")
    .where("privilegeType", "==", role)
    .get();

  if (querySnapshot.empty) {
    return res.status(404).send("Error");
  }

  querySnapshot.forEach((i) => {
    const notifications = i.data().notifications;
    notifications.push(notificationDetails);
    i.ref.update({
      notifications,
    });
  });
};

const getNotification = async (req, res) => {
  try {
    const token = req.headers.authorization.slice(7);
    await db
      .collection("notifications")
      .where("idNo", "==", jwt.decode(token)?.idNo)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        const notifications = [];
        querySnapshot.forEach((i) => {
          i.data().notifications.forEach((i) => {
            notifications.push(i);
          });
        });
        res.status(200).json({ notifications });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const markNotification = async (req, res) => {
  const { id, isSeen } = req.body;
  try {
    const token = req.headers.authorization.slice(7);
    await db
      .collection("notifications")
      .where("idNo", "==", jwt.decode(token)?.idNo)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        querySnapshot.forEach((i) => {
          const newNotifications = i.data().notifications.map((j) => {
            if (j.id === id) {
              j.isSeen = isSeen;
            }
            return j;
          });
          i.ref.update({
            notifications: newNotifications,
          });
        });
        res.status(200).send("Marked notification!");
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const deleteNotification = async (req, res) => {
  const { id } = req.body;
  try {
    const token = req.headers.authorization.slice(7);
    await db
      .collection("notifications")
      .where("idNo", "==", jwt.decode(token)?.idNo)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        querySnapshot.forEach((i) => {
          const newNotifications = i
            .data()
            .notifications.filter((j) => j.id !== id);
          i.ref.update({
            notifications: newNotifications,
          });
        });
        res.status(200).json({ message: "Notification deleted successfully!" });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

module.exports = {
  addNotificationGcSa,
  addNotificationStudent,
  getNotification,
  markNotification,
  deleteNotification,
};
