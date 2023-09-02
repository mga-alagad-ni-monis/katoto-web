const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const { getNotification } = require("../controllers/notificationControllers");

const router = express.Router();

router.get(
  "/get",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getNotification
);

module.exports = router;
