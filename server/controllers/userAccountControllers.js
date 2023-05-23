const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const FileType = require("file-type");

const db = require("../utils/firebase");
const { type } = require("os");

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
    yearSection,
  } = req.body;
  try {
    if (userType.trim() === "student") {
      if (!yearSection.trim()) {
        return res.status(404).send("Please add a year and section!");
      }
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !/^[^@\s]+@plv.edu.ph$/i.test(email) ||
      !password.trim() ||
      !password.trim().length > 7 ||
      !idNo.trim() ||
      !gender.trim() ||
      !contactNo.trim() ||
      !birthday.trim() ||
      !department.trim() ||
      !userType.trim()
    ) {
      return res.status(404).send("Please complete the form!");
    }

    await db
      .collection("accounts")
      .where("credentials.email", "==", email)
      .get()
      .then((querySnapshot) => {
        if (!querySnapshot.empty) {
          return res
            .status(404)
            .send("This email address is already registered!");
        }
        bcrypt.genSalt(10).then((salt) => {
          bcrypt.hash(password, salt).then(async (hashedPassword) => {
            await db
              .collection("accounts")
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
                yearSection,
              })
              .then((querySnapshot) => {
                if (querySnapshot.empty) {
                  return res.status(404).send("Error");
                }
                res.status(200).json({ message: "Successfully added!" });
              });
          });
        });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getUsers = async (req, res) => {
  try {
    await db
      .collection("accounts")
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
  try {
    if (!req.file) {
      return res.status(404).send("Please import a CSV file!");
    }

    if (req.file.mimetype !== "text/csv") {
      return res.status(404).send("Please import a CSV file!");
    }

    const { path } = req.file;

    const users = [];
    fs.createReadStream(path)
      .pipe(csv())
      .on("data", (data) => users.push(data))
      .on("end", async () => {
        let errorAccounts = [];
        let isError = false;
        let documents = await Promise.all(
          users.map(async (user, k) => {
            const querySnapshot = await db
              .collection("accounts")
              .where("credentials.email", "==", user["Email"])
              .get();

            if (!querySnapshot.empty) {
              if (user["Email"]) {
                isError = true;
                errorAccounts.push(
                  `Error on Row ${k + 2}: Email ${
                    user["Email"]
                  } is already registered.`
                );
              }
            }

            if (!/^[^@\s]+@plv.edu.ph$/i.test(user["Email"])) {
              if (user["Email"]) {
                isError = true;
                errorAccounts.push(
                  `Error on Row ${k + 2}: Email ${
                    user["Email"]
                  } not a valid PLV domain`
                );
              }
            }

            if (!(user["Password"].length > 7)) {
              if (user["Email"]) {
                isError = true;
                errorAccounts.push(
                  `Error on Row ${k + 2}: Password ${
                    user["Email"]
                  } atleast 8 characters or more`
                );
              }
            }

            if (
              user["Gender"] !== "Male" &&
              user["Gender"] !== "Female" &&
              user["Gender"] !== "Other"
            ) {
              isError = true;
              if (user["Email"]) {
                errorAccounts.push(
                  `Error on Row ${k + 2}: Gender ${user["Gender"]}`
                );
              }
            }

            if (
              user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                user[Object.keys(users[k])[0]].slice(1).replace(/\s/g, "") !==
                "student" &&
              user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                user[Object.keys(users[k])[0]].slice(1).replace(/\s/g, "") !==
                "guidanceCounselor"
            ) {
              isError = true;
              if (user["Email"]) {
                errorAccounts.push(
                  `Error on Row ${k + 2}: User Type ${
                    user[Object.keys(users[k])[0]]
                  } is not valid`
                );
              }
            }

            if (
              user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                user[Object.keys(users[k])[0]].slice(1).replace(/\s/g, "") ===
              "student"
            ) {
              if (!user[Object.keys(users[k])[8]]) {
                isError = true;
                if (user["Email"]) {
                  errorAccounts.push(
                    `Error on Row ${k + 2}: ${
                      user["Name"]
                    }'s year and section must be filled`
                  );
                }
              }
            }

            if (isError) {
              return;
            }

            if (user["Email"]) {
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash(
                user[Object.keys(users[k])[3]],
                salt
              );

              return {
                name: user[Object.keys(users[k])[1]],
                credentials: {
                  privilegeType:
                    user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                    user[Object.keys(users[k])[0]].slice(1).replace(/\s/g, ""),
                  email: user[Object.keys(users[k])[2]],
                  password: hashedPassword,
                },
                idNo: user[Object.keys(users[k])[4]],
                gender: user[Object.keys(users[k])[5]],
                contactNo: user[Object.keys(users[k])[6]],
                birthday: user[Object.keys(users[k])[7]],
                yearSection: user[Object.keys(users[k])[8]],
                department: user[Object.keys(users[k])[9]],
              };
            }
          })
        );

        if (errorAccounts.length) {
          return res.status(404).send({ errorMessages: errorAccounts });
        } else {
          const batch = await db.batch();

          documents
            .filter((item) => item !== undefined)
            .forEach((i) => {
              const docId = db.collection("accounts").doc();
              batch.set(docId, i);
            });

          batch.commit().then((querySnapshot) => {
            if (querySnapshot.empty) {
              return res.status(404).send("Error");
            }
          });
          fs.unlinkSync(path);
          res.status(200).json({ message: "CSV imported successfully!" });
        }
      })
      .on("error", (err) => {
        fs.unlinkSync(path);
        res.status(404).send("An error encountered in CSV!");
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const deleteUsers = async (req, res) => {
  const { deleteUsers } = req.body;
  try {
    const querySnapshot = await db
      .collection("accounts")
      .where("credentials.privilegeType", "!=", "systemAdministrator")
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send("Unable to delete this account!");
    }

    const batch = await db.batch();

    querySnapshot.forEach((i) => {
      if (deleteUsers.includes(i.data().credentials.email)) {
        batch.delete(i.ref);
      }
    });

    batch.commit();

    if (deleteUsers.length === 1) {
      res.status(200).json({ message: "Successfully deleted a user!" });
    } else {
      res
        .status(200)
        .json({ message: "Successfully deleted a bunch of users!" });
    }
  } catch (err) {
    res.status(404).send("Error");
  }
};

const editUser = async (req, res) => {
  const {
    name,
    email,
    idNo,
    gender,
    contactNo,
    birthday,
    department,
    userType,
    yearSection,
  } = req.body;
  try {
    if (userType.trim() === "student") {
      if (!yearSection.trim()) {
        return res.status(404).send("Please add a year and section!");
      }
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !/^[^@\s]+@plv.edu.ph$/i.test(email) ||
      !idNo.trim() ||
      !gender.trim() ||
      !contactNo.trim() ||
      !birthday.trim() ||
      !department.trim() ||
      !userType.trim()
    ) {
      return res.status(404).send("Please complete the form!");
    }

    const querySnapshot = await db
      .collection("accounts")
      .where("credentials.email", "==", email)
      .get();

    if (querySnapshot.empty) {
      return res.status(404).send("Error");
    }

    querySnapshot.forEach((i) => {
      if (i.data().credentials.privilegeType === "systemAdministrator") {
        return res.status(404).send("Unable to edit!");
      }

      i.ref.update({
        birthday: birthday,
        gender: gender,
        "credentials.privilegeType": userType,
        yearSection: yearSection,
        name: name,
        department: department,
        idNo: idNo,
        contactNo: contactNo,
      });
    });

    res.status(200).json({ message: "Edit successfully!" });
  } catch (err) {
    console.log("asd");
    res.status(404).send("Error");
  }
};

module.exports = {
  addUser,
  getUsers,
  handleImport,
  upload,
  deleteUsers,
  editUser,
};
