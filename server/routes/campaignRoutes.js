const express = require("express");

const verifyRoles = require("../middleware/verifyRoles");

const {
  addCampaign,
  uploadPictures,
  upload,
  getCampaigns,
} = require("../controllers/campaignControllers");

const router = express.Router();

router.post(
  "/add",
  verifyRoles(["systemAdministrator", "guidanceCounselor"]),
  addCampaign
);

router.post(
  "/upload",
  verifyRoles(["systemAdministrator", "guidanceCounselor"]),
  upload.array("files[]"),
  uploadPictures
);

router.get(
  "/get",
  verifyRoles(["systemAdministrator", "guidanceCounselor"]),
  getCampaigns
);

module.exports = router;
