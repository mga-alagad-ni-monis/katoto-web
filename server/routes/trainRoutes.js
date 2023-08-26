const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  getFiles,
  setFiles,
  train,
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

router.post(
  "/train",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  train
);

module.exports = router;
