const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const { sendConversation } = require("../controllers/logControllers");

const router = express.Router();

router.post("/send", verifyRoles(["student"]), sendConversation);

module.exports = router;
