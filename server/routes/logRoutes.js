const verifyRoles = require("../middleware/verifyRoles");

const express = require("express");

const {
  sendConversation,
  getStudentConversation,
  getAllConversations,
  getStudentConversationLimit,
} = require("../controllers/logControllers");

const router = express.Router();

router.post("/send", verifyRoles(["student"]), sendConversation);

router.get("/get/student", verifyRoles(["student"]), getStudentConversation);
router.get(
  "/get/student-limit",
  verifyRoles(["student"]),
  getStudentConversationLimit
);

router.get(
  "/get/all",
  verifyRoles(["guidanceCounselor", "systemAdministrator"]),
  getAllConversations
);

module.exports = router;
