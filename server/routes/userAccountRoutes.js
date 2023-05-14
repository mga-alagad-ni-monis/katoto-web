const express = require("express");

const verifyRoles = require("../middleware/verifyRoles");

const {
  getUsers,
  addUser,
  upload,
  handleImport,
} = require("../controllers/userAccountControllers");

const router = express.Router();

router.get("/get", verifyRoles(["systemAdministrator"]), getUsers);
router.post("/add", verifyRoles(["systemAdministrator"]), addUser);
router.post(
  "/import",
  verifyRoles(["systemAdministrator"]),
  upload.single("file"),
  handleImport
);

module.exports = router;
