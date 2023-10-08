const express = require("express");

const verifyRoles = require("../middleware/verifyRoles");

const {
  getUsers,
  addUser,
  upload,
  handleImport,
  deleteUsers,
  editUser,
  getGCName,
  getStudents,
  changePassword,
  editProfileDetails,
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
router.get(
  "/get-gc",
  verifyRoles(["systemAdministrator", "guidanceCounselor", "student"]),
  getGCName
);

router.post(
  "/get-students",
  verifyRoles(["systemAdministrator", "guidanceCounselor"]),
  getStudents
);

router.post(
  "/change-password",
  verifyRoles(["systemAdministrator", "guidanceCounselor", "student"]),
  changePassword
);

router.post(
  "/edit-profile",
  verifyRoles(["systemAdministrator", "guidanceCounselor", "student"]),
  editProfileDetails
);

module.exports = router;
