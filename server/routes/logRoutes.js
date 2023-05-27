const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  sendConversation,
  getStudentConversation,
} = require("../controllers/logControllers");

const router = express.Router();

router.post("/send", verifyRoles(["student"]), sendConversation);

router.get("/get/student", verifyRoles(["student"]), getStudentConversation);

module.exports = router;
