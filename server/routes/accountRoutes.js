const express = require("express");

const {
  handleLogin,
  handleRefreshToken,
  handleLogout,
} = require("../controllers/accountControllers");

const router = express.Router();

router.post("/login", handleLogin);
router.get("/refresh", handleRefreshToken);
router.get("/logout", handleLogout);

module.exports = router;
