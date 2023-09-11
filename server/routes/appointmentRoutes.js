const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  getAppointments,
  getBookedAppointments,
  cancelAppointment,
  editAppointment,
  getMyAppointment,
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

router.post(
  "/cancel",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  cancelAppointment
);

router.post(
  "/edit",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  editAppointment
);

router.get(
  "/mine",
  verifyRoles(["guidanceCounselor", "systemAdministrator", "student"]),
  getMyAppointment
);

module.exports = router;
