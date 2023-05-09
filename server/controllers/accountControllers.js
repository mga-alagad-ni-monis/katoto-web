const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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
                const accessToken = jwt.sign(
                  {
                    id: doc.data().id,
                    email: doc.data().credentials.email,
                    privilegeType: doc.data().credentials.privilegeType,
                    name: doc.data().name,
                  },
                  process.env.ACCESS_TOKEN,
                  {
                    expiresIn: "1d",
                  }
                );

                const refreshToken = jwt.sign(
                  { email: doc.data().credentials.email },
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

                res
                  .status(200)
                  .json({ message: "Login successful!", role, accessToken });
              } else {
                res.status(404).send("Incorrect email and password!");
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
                },
                process.env.ACCESS_TOKEN,
                { expiresIn: "1d" }
              );
              res
                .status(200)
                .json({ message: "Login successful!", role, accessToken });
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

module.exports = { handleLogin, handleRefreshToken, handleLogout };
