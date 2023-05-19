const express = require("express");

const verifyRoles = require("../middleware/verifyRoles");

const {
  addCampaign,
  uploadPictures,
  upload,
  getCampaigns,
  getPublishedCampaigns,
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

router.get(
  "/get-published",
  verifyRoles(["systemAdministrator", "guidanceCounselor", "student"]),
  getPublishedCampaigns
);

module.exports = router;
