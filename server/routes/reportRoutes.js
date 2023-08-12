const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const { getReports } = require("../controllers/reportControllers");

const router = express.Router();

router.get(
  "/reports",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getReports
);

module.exports = router;
