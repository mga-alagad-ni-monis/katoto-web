const jwt = require("jsonwebtoken");

const db = require("../utils/firebase");

const ageCalculator = require("age-calculator");

const sendConversation = async (req, res) => {
  const { studentMessage, katotoMessage, isGuided } = req.body;

  try {
    const token = jwt.decode(studentMessage.sender);

    const currentDate = new Date()
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "");

    const document = await db.collection("reports").doc(currentDate);

    let reports = await document.get();

    db.collection("accounts")
      .where("credentials.email", "==", token.email)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Unknown user!");
        }

        querySnapshot.forEach(async (doc) => {
          let demographics = reports.data().reports.demographics;

          let user = {
            email: doc.data().credentials.email,
            idNo: doc.data().idNo,
            age: new ageCalculator.AgeFromDateString(doc.data().birthday).age,
            gender: doc.data().gender,
            department: doc.data().department,
            mainDepartment: doc.data().mainDepartment,
            concern: "",
          };
          if (isGuided) {
            if (!demographics.guided.some((i) => i.idNo == doc.data().idNo)) {
              demographics.guided.push(user);
              await document.update({
                "reports.demographics.guided": demographics.guided,
              });
            }
          } else {
            if (!demographics.friendly.some((i) => i.idNo == doc.data().idNo)) {
              demographics.friendly.push(user);
              await document.update({
                "reports.demographics.friendly": demographics.friendly,
              });
            }
          }
        });
      });

    if (isGuided) {
      let guidedArray = reports.data().reports.dailyUsers.guided;

      if (!guidedArray.includes(token.email)) {
        guidedArray.push(token.email);
      }

      let conversationLogsArray = reports.data().reports.conversationLogs;

      if (conversationLogsArray.length === 0) {
        conversationLogsArray.push({
          email: token.email,
          conversation: [
            {
              katotoMessage,
              studentMessage: {
                message: studentMessage.message,
                sender: token.email,
              },
              dateTime: new Date(),
            },
          ],
        });
      } else {
        if (conversationLogsArray.some((i) => i.email === token.email)) {
          conversationLogsArray.map((i) => {
            if (i.email === token.email) {
              i.conversation.push({
                katotoMessage,
                studentMessage: {
                  message: studentMessage.message,
                  sender: token.email,
                },
                dateTime: new Date(),
              });
            }
          });
        } else {
          conversationLogsArray.push({
            email: token.email,
            conversation: [
              {
                katotoMessage,
                studentMessage: {
                  message: studentMessage.message,
                  sender: token.email,
                },
                dateTime: new Date(),
              },
            ],
          });
        }
      }

      await document.update({
        "reports.conversationLogs": conversationLogsArray,
        "reports.dailyUsers.guided": guidedArray,
      });
    } else {
      let friendlyArray = reports.data().reports.dailyUsers.friendly;

      if (!friendlyArray.includes(token.email)) {
        friendlyArray.push(token.email);
      }

      await document.update({
        "reports.dailyUsers.friendly": friendlyArray,
      });
    }

    res.status(200);
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getStudentConversation = async (req, res) => {
  try {
    const token = jwt.decode(
      req.headers.authorization.slice(7, req.headers.authorization.length)
    );

    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let conversationArray = [];
        querySnapshot.forEach((i) => {
          i.data().reports.conversationLogs.forEach((j) => {
            if (token.email === j.email) {
              j.conversation.forEach((k) => {
                conversationArray.push(k.studentMessage);
                conversationArray.push(k.katotoMessage);
              });
            }
          });
        });
        res.status(200).json({ conversation: conversationArray });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getAllConversations = async (req, res) => {
  try {
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let conversationArray = [];
        querySnapshot.forEach((i) => {
          i.data().reports.conversationLogs.forEach((j) => {
            conversationArray.push(j);
          });
        });
        res.status(200).json({ conversations: conversationArray });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

module.exports = {
  sendConversation,
  getStudentConversation,
  getAllConversations,
};
