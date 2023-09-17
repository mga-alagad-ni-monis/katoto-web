const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  getAppointments,
  getBookedAppointments,
  cancelAppointment,
  editAppointment,
  getMyAppointment,
  approveAppointment,
  completeAppointment,
  deleteAppointment,
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

router.post(
  "/approve",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  approveAppointment
);

router.post(
  "/complete",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  completeAppointment
);

router.post(
  "/delete",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  deleteAppointment
);

module.exports = router;
