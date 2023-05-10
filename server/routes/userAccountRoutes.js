const express = require("express");

const { getUsers, addUser } = require("../controllers/userAccountControllers");

const router = express.Router();

router.get("/get", getUsers);
router.post("/add", addUser);

module.exports = router;
