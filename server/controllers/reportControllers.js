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
        dailyUsers: {
          friendly: [],
          guided: [],
        },
        demographics: {
          friendly: [],
          guided: [],
        },
        feedbacks: [],
        conversationLogs: [],
        sosAppointments: [],
        standardAppointments: [],
      },
    });
  } catch (err) {
    console.log(err);
  }
};

const getReports = async (req, res) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  try {
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }

        reportsArray = [];

        querySnapshot.forEach((i) => {
          reportsArray.push({
            date: `${
              months[parseInt(i.id.toString().substring(0, 2)) - 1]
            } ${parseInt(i.id.toString().substring(2, 4))}, ${i.id
              .toString()
              .substring(4, 8)}`,
            dailyUsers: i.data().reports.dailyUsers,
            demographics: i.data().reports.demographics,
            feedback: i.data().reports.feedback,
            sosSchedules: i.data().reports.sosSchedules,
            appointmentSchedules: i.data().reports.appointmentSchedules,
          });
        });
        res.status(200).json({ reports: reportsArray });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

module.exports = {
  createDocument,
  getReports,
};
