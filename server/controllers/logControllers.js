const jwt = require("jsonwebtoken");

const db = require("../utils/firebase");
const { QuerySnapshot } = require("firebase-admin/firestore");

const sendConversation = async (req, res) => {
  const { studentMessage, katotoMessage } = req.body;
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
        console.log("norem");
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
    });

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

module.exports = {
  sendConversation,
  getStudentConversation,
};
