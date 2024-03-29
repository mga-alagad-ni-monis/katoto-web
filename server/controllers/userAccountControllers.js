const bcrypt = require("bcrypt");
const multer = require("multer");
const fs = require("fs");
const csv = require("csv-parser");
const jwt = require("jsonwebtoken");
// const FileType = require("file-type");

const db = require("../utils/firebase");
// const { type } = require("os");

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
    assignedCollege,
  } = req.body;
  try {
    if (userType.trim() === "student") {
      if (!yearSection.trim()) {
        return res.status(404).send("Please add a year and section!");
      }
      if (!department.trim()) {
        return res.status(404).send("Please add department!");
      }
    }

    if (userType.trim() === "guidanceCounselor") {
      if (assignedCollege.length < 1) {
        return res.status(404).send("Please add at least 1 assigned college!");
      } else if (assignedCollege.length > 2) {
        return res.status(404).send("Limit of assigned college reached!");
      }
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !/^[^@\s]+@plv.edu.ph$/i.test(email) ||
      !password.trim() ||
      !(password.trim().length > 7) ||
      !idNo.trim() ||
      !gender.trim() ||
      !contactNo.trim() ||
      !birthday.trim() ||
      !userType.trim()
    ) {
      return res.status(404).send("Please complete the form!");
    }

    await db
      .collection("accounts")
      .where("idNo", "==", idNo)
      .get()
      .then(async (querySnapshot) => {
        if (!querySnapshot.empty) {
          return res
            .status(404)
            .send("This school ID no. is already registered!");
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
                let COED = [
                  "Bachelor of Early Childhood Education (BECED)",
                  "Bachelor of Secondary Education Major in English (BSED English)",
                  "Bachelor of Secondary Education Major in Filipino (BSED Filipino)",
                  "Bachelor of Secondary Education Major in Mathematics (BSED Mathematics)",
                  "Bachelor of Secondary Education Major in Science (BSED Science)",
                  "Bachelor of Secondary Education Major in Social Studies (BSED Social Studies)",
                ];

                let CAS = [
                  "Bachelor of Arts in Communication (BAC)",
                  "Bachelor of Science in Psychology (BSP)",
                  "Bachelor of Science in Social Work (BSSW)",
                ];

                let CEIT = [
                  "Bachelor of Science in Civil Engineering (BSCE)",
                  "Bachelor of Science in Electrical Engineering (BSEE)",
                  "Bachelor of Science in Information Technology (BSIT)",
                ];

                let CABA = [
                  "Bachelor of Science in Accountancy (BSA)",
                  "Bachelor of Science in Business Administration Major in Financial Management (BSBA FM)",
                  "Bachelor of Science in Business Administration Major in Human Resource Development Management (BSBA HRDM)",
                  "Bachelor of Science in Business Administration Major in Marketing Management (BSBA MM)",
                  "Bachelor of Science in Public Administration (BSPA)",
                ];

                let mainDepartment = "";

                if (COED.includes(department)) {
                  mainDepartment = "College of Education";
                } else if (CAS.includes(department)) {
                  mainDepartment = "College of Arts and Sciences";
                } else if (CEIT.includes(department)) {
                  mainDepartment =
                    "College of Engineering and Information Technology";
                } else if (CABA.includes(department)) {
                  mainDepartment =
                    "College of Business Administration, Public Administration and Accountancy";
                }

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
                    mainDepartment,
                    assignedCollege,
                  })
                  .then(async (querySnapshot) => {
                    if (querySnapshot.empty) {
                      return res.status(404).send("Error");
                    }
                    await db
                      .collection("notifications")
                      .add({
                        name,
                        idNo,
                        email,
                        privilegeType: userType,
                        notifications: [],
                      })
                      .then((querySnapshot) => {
                        if (querySnapshot.empty) {
                          return res.status(404).send("Error");
                        }
                        res
                          .status(200)
                          .json({ message: "Successfully added!" });
                      });
                  });
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
        return res.status(200).json({ users });
      });
  } catch (err) {
    return res.status(404).send("Error");
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

        console.log(users);

        let documents = await Promise.all(
          //if email is registered
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

            //if id no is registered
            const querySnapshot2 = await db
              .collection("accounts")
              .where("idNo", "==", user["ID Number"])
              .get();

            if (!querySnapshot2.empty) {
              if (user["ID Number"]) {
                isError = true;
                errorAccounts.push(
                  `Error on Row ${k + 2}: ID Number ${
                    user["ID Number"]
                  } is already registered.`
                );
              }
            }

            //if plv domain
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

            //if password > 7
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

            //if gender is included
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

            //if privilege is correct
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

            //check the format of y/s
            if (
              user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                user[Object.keys(users[k])[0]].slice(1).replace(/\s/g, "") ===
              "student"
            ) {
              if (user["Year Section"]) {
                if (
                  !(
                    user["Year Section"][0] > 0 && user["Year Section"][0] < 5
                  ) ||
                  !(
                    user["Year Section"].slice(2) > 0 &&
                    user["Year Section"].slice(2) < 21
                  )
                ) {
                  isError = true;
                  errorAccounts.push(
                    `Error on Row ${k + 2}: ${
                      user["Name"]
                    }'s year and section must follow the format e.g. (4-12)`
                  );
                }
              }
            }

            //if student the y/s must be filled and if gc not
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

              if (user[Object.keys(users[k])[10]]) {
                isError = true;
                if (user["Email"]) {
                  errorAccounts.push(
                    `Error on Row ${k + 2}: ${
                      user["Name"]
                    } is a student and does not need an assigned college`
                  );
                }
              }
            } else if (
              user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                user[Object.keys(users[k])[0]].slice(1).replace(/\s/g, "") ===
              "guidanceCounselor"
            ) {
              if (user[Object.keys(users[k])[8]]) {
                isError = true;
                if (user["Email"]) {
                  errorAccounts.push(
                    `Error on Row ${k + 2}: ${
                      user["Name"]
                    } is a guidance counselor and does not need a year and section`
                  );
                }
              }

              if (user[Object.keys(users[k])[9]]) {
                isError = true;
                if (user["Email"]) {
                  errorAccounts.push(
                    `Error on Row ${k + 2}: ${
                      user["Name"]
                    } is a guidance counselor and does not need a department`
                  );
                }
              }
            }

            if (
              user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                user[Object.keys(users[k])[0]].slice(1).replace(/\s/g, "") ===
              "student"
            ) {
              if (
                !user[Object.keys(users[k])[0]] ||
                !user[Object.keys(users[k])[1]] ||
                !user[Object.keys(users[k])[2]] ||
                !user[Object.keys(users[k])[3]] ||
                !user[Object.keys(users[k])[4]] ||
                !user[Object.keys(users[k])[5]] ||
                !user[Object.keys(users[k])[6]] ||
                !user[Object.keys(users[k])[7]] ||
                !user[Object.keys(users[k])[8]] ||
                !user[Object.keys(users[k])[9]]
              ) {
                isError = true;

                errorAccounts.push(
                  `Error on Row ${
                    k + 2
                  }: All the details must be filled except Colleges`
                );
              }
            }

            if (
              user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                user[Object.keys(users[k])[0]].slice(1).replace(/\s/g, "") ===
              "guidanceCounselor"
            ) {
              if (
                !user[Object.keys(users[k])[0]] ||
                !user[Object.keys(users[k])[1]] ||
                !user[Object.keys(users[k])[2]] ||
                !user[Object.keys(users[k])[3]] ||
                !user[Object.keys(users[k])[4]] ||
                !user[Object.keys(users[k])[5]] ||
                !user[Object.keys(users[k])[6]] ||
                !user[Object.keys(users[k])[7]] ||
                !user[Object.keys(users[k])[10]]
              ) {
                isError = true;

                errorAccounts.push(
                  `Error on Row ${
                    k + 2
                  }: All the details must be filled except Department`
                );
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

              if (
                user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                  user[Object.keys(users[k])[0]].slice(1).replace(/\s/g, "") ===
                "guidanceCounselor"
              ) {
                return {
                  name: user[Object.keys(users[k])[1]],
                  credentials: {
                    privilegeType:
                      user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                      user[Object.keys(users[k])[0]]
                        .slice(1)
                        .replace(/\s/g, ""),
                    email: user[Object.keys(users[k])[2]],
                    password: hashedPassword,
                  },
                  idNo: user[Object.keys(users[k])[4]],
                  gender: user[Object.keys(users[k])[5]],
                  contactNo: user[Object.keys(users[k])[6]],
                  birthday: user[Object.keys(users[k])[7]],
                  yearSection: user[Object.keys(users[k])[8]],
                  assignedCollege: [user[Object.keys(users[k])[10]]],
                };
              } else {
                return {
                  name: user[Object.keys(users[k])[1]],
                  credentials: {
                    privilegeType:
                      user[Object.keys(users[k])[0]].charAt(0).toLowerCase() +
                      user[Object.keys(users[k])[0]]
                        .slice(1)
                        .replace(/\s/g, ""),
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
    gender,
    contactNo,
    birthday,
    department,
    userType,
    yearSection,
    assignedCollege,
  } = req.body;
  try {
    if (userType.trim() === "student") {
      if (!yearSection.trim()) {
        return res.status(404).send("Please add a year and section!");
      }
    }

    if (userType.trim() === "guidanceCounselor") {
      if (assignedCollege.length < 1) {
        return res.status(404).send("Please add at least 1 assigned college!");
      } else if (assignedCollege.length > 2) {
        return res.status(404).send("Limit of assigned college reached!");
      }
    }

    if (
      !name.trim() ||
      !email.trim() ||
      !/^[^@\s]+@plv.edu.ph$/i.test(email) ||
      !gender.trim() ||
      !contactNo.trim() ||
      !birthday.trim() ||
      !department.trim() ||
      !userType.trim()
    ) {
      return res.status(404).send("Please complete the form!");
    }

    if (assignedCollege.length === 2) {
      if (assignedCollege[0] === assignedCollege[1])
        return res.status(404).send("Assigned college is the same!");
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

      let COED = [
        "Bachelor of Early Childhood Education (BECED)",
        "Bachelor of Secondary Education Major in English (BSED English)",
        "Bachelor of Secondary Education Major in Filipino (BSED Filipino)",
        "Bachelor of Secondary Education Major in Mathematics (BSED Mathematics)",
        "Bachelor of Secondary Education Major in Science (BSED Science)",
        "Bachelor of Secondary Education Major in Social Studies (BSED Social Studies)",
      ];

      let CAS = [
        "Bachelor of Arts in Communication (BAC)",
        "Bachelor of Science in Psychology (BSP)",
        "Bachelor of Science in Social Work (BSSW)",
      ];

      let CEIT = [
        "Bachelor of Science in Civil Engineering (BSCE)",
        "Bachelor of Science in Electrical Engineering (BSEE)",
        "Bachelor of Science in Information Technology (BSIT)",
      ];

      let CABA = [
        "Bachelor of Science in Accountancy (BSA)",
        "Bachelor of Science in Business Administration Major in Financial Management (BSBA FM)",
        "Bachelor of Science in Business Administration Major in Human Resource Development Management (BSBA HRDM)",
        "Bachelor of Science in Business Administration Major in Marketing Management (BSBA MM)",
        "Bachelor of Science in Public Administration (BSPA)",
      ];

      let mainDepartment = "";

      if (COED.includes(department)) {
        mainDepartment = "College of Education";
      } else if (CAS.includes(department)) {
        mainDepartment = "College of Arts and Sciences";
      } else if (CEIT.includes(department)) {
        mainDepartment = "College of Engineering and Information Technology";
      } else if (CABA.includes(department)) {
        mainDepartment =
          "College of Business Administration, Public Administration and Accountancy";
      }

      if (i.data().credentials.privilegeType === "student") {
        i.ref.update({
          birthday: birthday,
          gender: gender,
          yearSection: yearSection,
          name: name,
          department: department,
          mainDepartment: mainDepartment,
          contactNo: contactNo,
        });
      } else {
        i.ref.update({
          birthday: birthday,
          gender: gender,
          name: name,
          mainDepartment: mainDepartment,
          contactNo: contactNo,
          assignedCollege: assignedCollege,
        });
      }
    });

    res.status(200).json({ message: "Edit successfully!" });
  } catch (err) {
    console.log(err);
    res.status(404).send("Error");
  }
};

const getUser = async (idNo) => {
  console.log(idNo);
  const querySnapshot = await db
    .collection("accounts")
    .where("idNo", "==", idNo)
    .get();

  if (querySnapshot.empty) {
    return;
  }

  const userDetails = {};

  querySnapshot.forEach((i) => {
    userDetails["name"] = i.data().name;
    userDetails["email"] = i.data().credentials.email;
    userDetails["privilegeType"] = i.data().credentials.privilegeType;
    userDetails["idNo"] = i.data().idNo;
    userDetails["gender"] = i.data().gender;
    userDetails["yearSection"] = i.data().yearSection;
    userDetails["department"] = i.data().department;
    userDetails["mainDepartment"] = i.data().mainDepartment;
    userDetails["birthday"] = i.data().birthday;
    userDetails["contactNo"] = i.data().contactNo;
    // userDetails["assignedCollege"] = i.data().assignedCollege;
  });

  return userDetails;
};

const getGCName = async (req, res) => {
  await db
    .collection("accounts")
    .where("credentials.privilegeType", "in", [
      "guidanceCounselor",
      "systemAdministrator",
    ])
    .get()
    .then(async (querySnapshot) => {
      if (querySnapshot.empty) {
        return res.status(404).send("Error");
      }

      let names = [];

      querySnapshot.forEach((i) => {
        names.push({
          name: i.data().name,
          idNo: i.data().idNo,
          assignedCollege: i.data().assignedCollege,
        });
      });
      res.status(200).json({ names });
    });
};

const getStudents = async (req, res) => {
  const { college } = req.body;
  try {
    await db
      .collection("accounts")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let students = [];
        querySnapshot.forEach((i) => {
          if (
            college.includes(i.data().mainDepartment) &&
            i.data().credentials.privilegeType === "student"
          ) {
            students.push({
              name: i.data().name,
              gender: i.data().gender,
              email: i.data().credentials.email,
              idNo: i.data().idNo,
              department: i.data().department,
              yearSection: i.data().yearSection,
              mainDepartment: i.data().mainDepartment,
              contactNo: i.data().contactNo,
            });
          }
        });
        return res.status(200).json({ students });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const changePassword = async (req, res) => {
  const { currentPw, newPwF, newPwS } = req.body;
  try {
    if (!currentPw.trim() || !newPwF.trim() || !newPwS.trim()) {
      return res.status(404).send("Please fill the required fields!");
    }

    if (!(newPwF.trim().length > 7) || !(newPwS.trim().length > 7)) {
      return res.status(404).send("Minimum of 8 characters!");
    }

    if (newPwF.trim() !== newPwS.trim()) {
      return res.status(404).send("New password does not match!");
    }

    const token = req.headers.authorization.slice(7);

    await db
      .collection("accounts")
      .where("idNo", "==", jwt.decode(token)?.idNo)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }

        querySnapshot.forEach(async (i) => {
          const isRight = await bcrypt.compare(
            currentPw,
            i.data().credentials.password
          );

          if (isRight) {
            bcrypt.genSalt(10).then((salt) => {
              bcrypt.hash(newPwS.trim(), salt).then(async (hashedPassword) => {
                i.ref.update({
                  "credentials.password": hashedPassword,
                });
                return res
                  .status(200)
                  .json({ message: "Password changed successfully!" });
              });
            });
          } else {
            return res.status(404).send("Current password does not match!");
          }
        });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const editProfileDetails = async (req, res) => {
  const { name, yearSection, gender, birthday, contactNo, department } =
    req.body;
  try {
    const token = req.headers.authorization.slice(7);

    let COED = [
      "Bachelor of Early Childhood Education (BECED)",
      "Bachelor of Secondary Education Major in English (BSED English)",
      "Bachelor of Secondary Education Major in Filipino (BSED Filipino)",
      "Bachelor of Secondary Education Major in Mathematics (BSED Mathematics)",
      "Bachelor of Secondary Education Major in Science (BSED Science)",
      "Bachelor of Secondary Education Major in Social Studies (BSED Social Studies)",
    ];

    let CAS = [
      "Bachelor of Arts in Communication (BAC)",
      "Bachelor of Science in Psychology (BSP)",
      "Bachelor of Science in Social Work (BSSW)",
    ];

    let CEIT = [
      "Bachelor of Science in Civil Engineering (BSCE)",
      "Bachelor of Science in Electrical Engineering (BSEE)",
      "Bachelor of Science in Information Technology (BSIT)",
    ];

    let CABA = [
      "Bachelor of Science in Accountancy (BSA)",
      "Bachelor of Science in Business Administration Major in Financial Management (BSBA FM)",
      "Bachelor of Science in Business Administration Major in Human Resource Development Management (BSBA HRDM)",
      "Bachelor of Science in Business Administration Major in Marketing Management (BSBA MM)",
      "Bachelor of Science in Public Administration (BSPA)",
    ];

    await db
      .collection("accounts")
      .where("idNo", "==", jwt.decode(token)?.idNo)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        querySnapshot.forEach(async (i) => {
          if (i.data().credentials.privilegeType === "student") {
            if (
              !name.trim() ||
              !yearSection.trim() ||
              !gender.trim() ||
              !contactNo.trim() ||
              !birthday.trim() ||
              !department.trim()
            ) {
              return res.status(404).send("Please fill in the fields!");
            }

            if (
              !(yearSection[0] < 5) ||
              !(yearSection[0] > 0) ||
              !(yearSection.slice(2) < 15) ||
              !(yearSection.slice(2) > 0)
            ) {
              return res.status(404).send("Invalid year and section!");
            }

            let mainDepartment = "";

            if (COED.includes(department)) {
              mainDepartment = "College of Education";
            } else if (CAS.includes(department)) {
              mainDepartment = "College of Arts and Sciences";
            } else if (CEIT.includes(department)) {
              mainDepartment =
                "College of Engineering and Information Technology";
            } else if (CABA.includes(department)) {
              mainDepartment =
                "College of Business Administration, Public Administration and Accountancy";
            }

            i.ref.update({
              name: name,
              yearSection: yearSection,
              gender: gender,
              birthday: birthday,
              contactNo: contactNo,
              department: department,
              mainDepartment: mainDepartment,
            });
          }

          if (
            i.data().credentials.privilegeType === "guidanceCounselor" ||
            i.data().credentials.privilegeType === "systemAdministrator"
          ) {
            if (
              !name.trim() ||
              !gender.trim() ||
              !contactNo.trim() ||
              !birthday.trim()
            ) {
              return res.status(404).send("Please fill in the fields!");
            }
            i.ref.update({
              name: name,
              gender: gender,
              birthday: birthday,
              contactNo: contactNo,
            });
          }

          return res
            .status(200)
            .json({ message: "Profile details edited successfully!" });
        });
      });
  } catch (err) {
    console.log(err);
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
  getUser,
  getGCName,
  getStudents,
  changePassword,
  editProfileDetails,
};
