const jwt = require("jsonwebtoken");

const db = require("../utils/firebase");

const sendConversation = async (req, res) => {
  const { studentMessage, katotoMessage } = req.body;
  try {
    const currentDate = new Date()
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "");

    const document = await db.collection("reports").doc(currentDate);

    let reports = await document.get();
    console.log(reports.data().reports.conversationLogs);

    conversationLogsArray = reports.data().reports.conversationLogs;

    conversationLogsArray.push({
      email: studentMessage.sender,
      conversation: [{ katotoMessage, studentMessage }],
    });

    document.update({
      "reports.conversationLogs": conversationLogsArray,
    });

    // document.update({
    //   "reports.conversationLogs": firebase.firestore.FieldValue.arrayUnion({
    //     asd: "asd",
    //   }),
    // });
  } catch (err) {
    res.status(404).send("Error");
  }
};

module.exports = {
  sendConversation,
};
