const express = require("express");

const { login } = require("../controllers/accountControllers");

const router = express.Router();

router.post("/login/send-credentials", login);

module.exports = router;
