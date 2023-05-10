const bcrypt = require("bcrypt");

const db = require("../utils/firebase");

const addUser = async (req, res) => {
  const {
    name,
    email,
    password,
    idNo,
    gender,
    contactNo,
    birthday,
    department,
    userType,
  } = req.body;
  try {
    if (
      !name.trim() ||
      !email.trim() ||
      !/^[^@\s]+@plv.edu.ph$/i.test(email) ||
      !password.trim() ||
      !password.trim().length > 8 ||
      !idNo.trim() ||
      !gender.trim() ||
      !contactNo.trim() ||
      !birthday.trim() ||
      !department.trim() ||
      !userType.trim()
    ) {
      return res.status(404).send("Please complete the form!");
    }
    bcrypt.genSalt(10).then((salt) => {
      bcrypt.hash(password, salt).then((hashedPassword) => {
        db.collection("accounts")
          .add({
            name,
            idNo,
            credentials: {
              email,
              password: hashedPassword,
              privilegeType: userType,
            },
            gender,
            contactNo,
            birthday,
            department,
          })
          .then((querySnapshot) => {
            if (querySnapshot.empty) {
              return res.status(404).send("Error");
            }
            res.status(200).json({ message: "Successfully added!" });
          });
      });
    });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getUsers = async (req, res) => {
  try {
    db.collection("accounts")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let users = [];
        querySnapshot.forEach((i) => {
          users.push(i.data());
        });
        res.status(200).json({ users });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

module.exports = { addUser, getUsers };
