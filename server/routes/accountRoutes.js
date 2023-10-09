const express = require("express");

const {
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleForgotPassword,
  handleCheckToken,
  handlePasswordReset,
} = require("../controllers/accountControllers");

const router = express.Router();

router.post("/login", handleLogin);
router.get("/refresh", handleRefreshToken);
router.get("/logout", handleLogout);
router.post("/forgot", handleForgotPassword);
router.get("/forgot/:resetToken", handleCheckToken);
router.post("/reset/:resetToken", handlePasswordReset);

module.exports = router;
