const express = require("express");

const {
  getUsers,
  addUser,
  upload,
  handleImport,
} = require("../controllers/userAccountControllers");

const router = express.Router();

router.get("/get", getUsers);
router.post("/add", addUser);
router.post("/import", upload.single("file"), handleImport);

module.exports = router;
