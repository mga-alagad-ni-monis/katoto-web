const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  getAppointments,
  getBookedAppointments,
} = require("../controllers/appointmentControllers");

const router = express.Router();

router.get(
  "/get",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getAppointments
);

router.get(
  "/get-booked",
  verifyRoles(["guidanceCounselor", "systemAdministrator", "student"]),
  getBookedAppointments
);

module.exports = router;
