const db = require("../utils/firebase");

const createDocument = async () => {
  try {
    const currentDate = new Date()
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "");

    const docRef = db.collection("reports").doc(currentDate);

    await docRef.set({
      date: new Date(),
      reports: {
        dailyUsers: 0,
        demographics: [],
        feedback: [],
        conversationLogs: [],
      },
    });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  createDocument,
};
