const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  getReports,
  exportReports,
} = require("../controllers/reportControllers");

const router = express.Router();

router.get(
  "/reports",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getReports
);

router.post(
  "/export",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  exportReports
);

module.exports = router;
