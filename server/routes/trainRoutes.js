const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  getFiles,
  setFiles,
  getConcerns,
} = require("../controllers/trainControllers");

const router = express.Router();

router.get(
  "/get-files",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getFiles
);

router.post(
  "/set-files",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  setFiles
);

router.get(
  "/get-concerns",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getConcerns
);

module.exports = router;
