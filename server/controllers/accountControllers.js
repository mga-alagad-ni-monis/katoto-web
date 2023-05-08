const bcrypt = require("bcrypt");

const db = require("../utils/firebase");
  
const login = async (req, res) => {
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
                const role = doc.data().credentials.privilegeType;
                res.status(200).json({ message: "Login successful!", role });
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

module.exports = { login };
