const uniqid = require("uniqid");

const db = require("../utils/firebase");

const addSOSAppointment = async (userDetails) => {
  const currentDate = new Date()
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "");

  const document = await db.collection("reports").doc(currentDate);

  let reports = await document.get();

  let sosSchedules = reports.data().reports.sosSchedules;

  let date = new Date();

  const sosDetails = {
    id: uniqid.time(),
    userDetails,
    createdDate: date.toLocaleString(),
    type: "sos",
    // subject for date changes
    scheduledDate: new Date(date.setDate(date.getDate() + 1)).toLocaleString(),
  };

  sosSchedules.push(sosDetails);

  await document.update({
    "reports.sosSchedules": sosSchedules,
  });

  return sosDetails;
};

module.exports = {
  addSOSAppointment,
};
