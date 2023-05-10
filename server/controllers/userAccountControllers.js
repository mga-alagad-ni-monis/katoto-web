const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");

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
          const user = i.data();
          user.credentials.password = "";
          users.push(user);
        });
        res.status(200).json({ users });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

//multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.env.FILE_STORAGE_PATH);
  },
  filename: function (req, file, cb) {
    cb(null, "file-" + Date.now());
  },
});

let upload = multer({ storage });

const handleImport = async (req, res) => {
  const { path } = req.file;
  try {
    const results = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => {
        console.log(results);
        res.status(200).json({ message: "CSV import successful!" });
      })
      .on("error", (err) => {
        res.status(404).send("An error encountered in CSV!");
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

module.exports = { addUser, getUsers, handleImport, upload };
