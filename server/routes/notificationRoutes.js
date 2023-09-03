const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  getNotification,
  markNotification,
  deleteNotification,
} = require("../controllers/notificationControllers");

const router = express.Router();

router.get(
  "/get",
  verifyRoles(["guidanceCounselor", "systemAdministrator", "student"]),
  getNotification
);

router.post(
  "/mark",
  verifyRoles(["guidanceCounselor", "systemAdministrator", "student"]),
  markNotification
);

router.post(
  "/delete",
  verifyRoles(["guidanceCounselor", "systemAdministrator", "student"]),
  deleteNotification
);

module.exports = router;
