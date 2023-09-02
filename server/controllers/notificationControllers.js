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
  await addNotification(newNotificationDetails, "systemAdministrator");
  await addNotification(newNotificationDetails, "guidanceCounselor");
};

const addNotification = async (notificationDetails, role) => {
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
    const querySnapshot = await db
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

module.exports = {
  addNotificationGcSa,
  getNotification,
};
