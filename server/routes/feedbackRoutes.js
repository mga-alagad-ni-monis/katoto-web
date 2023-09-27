const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const { sendFeedback } = require("../controllers/feedbackControllers");

const router = express.Router();

router.post("/send", verifyRoles(["student"]), sendFeedback);

module.exports = router;
