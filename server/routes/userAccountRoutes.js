const express = require("express");

const verifyRoles = require("../middleware/verifyRoles");

const {
  getUsers,
  addUser,
  upload,
  handleImport,
  deleteUsers,
  editUser,
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
router.post("/edit", verifyRoles(["systemAdministrator"]), editUser);
router.post("/delete", verifyRoles(["systemAdministrator"]), deleteUsers);

module.exports = router;
