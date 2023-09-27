const db = require("../utils/firebase");
const uniqid = require("uniqid");

const sendFeedback = async (req, res) => {
  const { userInfo, feedbackDetails, rating } = req.body;
  try {
    const currentDate = new Date()
      .toLocaleDateString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
      })
      .replace(/\//g, "");

    delete userInfo.refreshToken;

    const document = db.collection("reports").doc(currentDate);

    let reports = await document.get();

    let feedbacks = reports.data().reports.feedbacks;

    let date = new Date();

    const feedback = {
      id: uniqid.time(),
      createdDate: date.toLocaleString(),
      userDetails: userInfo,
      rating,
      feedbackDetails,
    };

    feedbacks.push(feedback);

    await document.update({
      "reports.feedbacks": feedbacks,
    });

    res.status(200).json({ message: "Feedback submitted!" });
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  sendFeedback,
};
