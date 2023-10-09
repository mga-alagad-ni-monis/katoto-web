const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const formData = require("form-data");
const Mailgun = require("mailgun.js");
const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const db = require("../utils/firebase");

const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(404).send("Please provide account credentials!");
    }

    if (!/^[^@\s]+@plv.edu.ph$/i.test(email)) {
      return res
        .status(404)
        .send(
          "This email address is not associated with our institutional domain!"
        );
    }

    db.collection("accounts")
      .where("credentials.email", "==", email)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res
            .status(404)
            .send(
              "This email address is not registered! Please contact the PLV Guidance Counselling Center regarding this matter. Thank you!"
            );
        }

        querySnapshot.forEach((doc) => {
          bcrypt.compare(
            password,
            doc.data().credentials.password,
            (error, result) => {
              if (error) {
                console.log(error);
              }
              if (result) {
                let userInfo = doc.data();
                delete userInfo.credentials.password;
                delete userInfo.credentials.role;
                const accessToken = jwt.sign(
                  {
                    email: doc.data().credentials.email,
                    role: doc.data().credentials.privilegeType,
                    idNo: doc.data().idNo,
                  },
                  process.env.ACCESS_TOKEN,
                  {
                    expiresIn: "1d",
                  }
                );

                const refreshToken = jwt.sign(
                  {
                    email: doc.data().credentials.email,
                    role: doc.data().credentials.privilegeType,
                    idNo: doc.data().idNo,
                  },
                  process.env.REFRESH_TOKEN,
                  { expiresIn: "1d" }
                );

                doc.ref.update({ refreshToken });

                const role = doc.data().credentials.privilegeType;

                res.cookie("jwt", refreshToken, {
                  httpOnly: true,
                  secure: true,
                  sameSite: "None",
                  maxAge: 24 * 60 * 60 * 1000,
                });

                res.status(200).json({
                  message: "Login successful!",
                  role,
                  accessToken,
                  userInfo,
                });
              } else {
                res.status(404).send("Incorrect email or password!");
              }
            }
          );
        });
      })
      .catch((err) => {
        res.status(404).send("Error");
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  try {
    if (!cookies?.jwt) return res.status(404).send("Error");
    const refreshToken = cookies.jwt;

    db.collection("accounts")
      .where("refreshToken", "==", refreshToken)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Unknown user!");
        }

        querySnapshot.forEach((doc) => {
          let userInfo = doc.data();
          delete userInfo.credentials.password;
          delete userInfo.credentials.role;
          jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN,
            (err, decoded) => {
              if (err || doc.data().credentials.email !== decoded.email)
                return res.status(404).send("Error");
              const role = doc.data().credentials.privilegeType;
              const accessToken = jwt.sign(
                {
                  email: decoded.email,
                  role,
                  idNo: doc.data().idNo,
                },
                process.env.ACCESS_TOKEN,
                { expiresIn: "1d" }
              );
              res.status(200).json({
                message: "Login successful!",
                role,
                accessToken,
                userInfo,
              });
            }
          );
        });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const handleLogout = async (req, res) => {
  const cookies = req.cookies;

  try {
    if (!cookies?.jwt) return res.status(404).send("Error");
    const refreshToken = cookies.jwt;

    db.collection("accounts")
      .where("refreshToken", "==", refreshToken)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
          });
          return res.status(404).send("Unknown user!");
        }

        querySnapshot.forEach((doc) => {
          doc.ref.update({ refreshToken: "" });
          res.clearCookie("jwt", {
            httpOnly: true,
            sameSite: "None",
            secure: true,
          });
          res.status(200).json({ message: "Logout successful!" });
        });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const handleForgotPassword = async (req, res) => {
  const { forgotEmail } = req.body;
  try {
    db.collection("accounts")
      .where("credentials.email", "==", forgotEmail)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).json({
            message:
              "We could not find your account with the information provided. Please contact the PLV Guidance Counselling Center regarding this matter. Thank you!",
          });
        }

        querySnapshot.forEach((i) => {
          const token = crypto.randomBytes(128).toString("hex");

          mg.messages
            .create(process.env.MAILGUN_DOMAIN, {
              from: "Katoto Team <team@katoto.live>",
              to: [forgotEmail],
              subject: "Katoto Account Password Reset",
              text: `Dear ${i?.data()?.name},

It seems that you have forgotten your password to access your account on our website. Not to worry, we are here to help you reset your password and regain access to your account.

Please click on the link ${
                process.env.CLIENT_URI
              }/forgot/${token} within the next 15 minutes to reset your password. If you do not reset your password within this time frame, the link will expire, and you will need to request a new one.

Please note that for security reasons, we cannot retrieve it for you. You will need to follow the password reset process to create a new password. If you did not request a password reset, please disregard this email and contact us immediately to report any unauthorized activity on your account.

Thank you for your cooperation.

Best regards,
Katoto Team`,
            })
            .then((msg) => console.log(msg))
            .catch((err) => console.log(err));

          i.ref.update({
            resetToken: token,
            resetExpiresOn: Date.now() + 900000,
          });

          res.status(200).json({
            message: "Password reset instructions were sent to your email!",
          });
        });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const handleCheckToken = async (req, res) => {
  const { resetToken } = req.params;
  try {
    db.collection("accounts")
      .where("resetToken", "==", resetToken)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).json({
            redirect: "/error",
          });
        }

        querySnapshot.forEach((i) => {
          if (Date.now() < i?.data()?.resetExpiresOn) {
            res.status(200).send("Valid");
          } else {
            return res.status(404).json({
              redirect: "/error",
            });
          }
        });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const handlePasswordReset = async (req, res) => {
  const { newPwF, newPwS } = req.body;
  const { resetToken } = req.params;
  try {
    if (!newPwF.trim() || !newPwS.trim()) {
      return res.status(404).send("Please fill the required fields!");
    }

    if (!(newPwF.trim().length > 7) || !(newPwS.trim().length > 7)) {
      return res.status(404).send("Minimum of 8 characters!");
    }

    if (newPwF.trim() !== newPwS.trim()) {
      return res.status(404).send("New password does not match!");
    }

    await db
      .collection("accounts")
      .where("resetToken", "==", resetToken)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).json({
            redirect: "/error",
          });
        }

        querySnapshot.forEach(async (i) => {
          if (Date.now() < i?.data()?.resetExpiresOn) {
            bcrypt.genSalt(10).then((salt) => {
              bcrypt.hash(newPwS.trim(), salt).then(async (hashedPassword) => {
                i.ref.update({
                  "credentials.password": hashedPassword,
                  resetToken: "",
                  resetExpiresOn: "",
                });
                return res.status(200).json({
                  redirect: "/login",
                  message: "Password reset successfully!",
                });
              });
            });
          } else {
            return res.status(404).json({
              redirect: "/error",
            });
          }
        });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

module.exports = {
  handleLogin,
  handleRefreshToken,
  handleLogout,
  handleForgotPassword,
  handleCheckToken,
  handlePasswordReset,
};
