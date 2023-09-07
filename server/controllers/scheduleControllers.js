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

  let sosAppointments = reports.data().reports.sosAppointments;

  let date = new Date();

  const sosDetails = {
    id: uniqid.time(),
    userDetails,
    createdDate: date.toLocaleString(),
    type: "sos",
    // subject for date changes
    scheduledDate: new Date(date.setDate(date.getDate() + 1)).toLocaleString(),
  };

  sosAppointments.push(sosDetails);

  await document.update({
    "reports.sosAppointments": sosAppointments,
  });

  return sosDetails;
};

const addStandardAppointment = async (userDetails, start, end) => {
  const currentDate = new Date()
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "");

  const document = await db.collection("reports").doc(currentDate);

  let reports = await document.get();

  let standardAppointments = reports.data().reports.standardAppointments;

  let date = new Date();

  const standardDetails = {
    id: uniqid.time(),
    userDetails,
    createdDate: date.toLocaleString(),
    type: "standard",
    // subject for date changes
    start: start,
    end: end,
  };

  standardAppointments.push(standardDetails);

  await document.update({
    "reports.standardAppointments": standardAppointments,
  });

  return standardDetails;
};

module.exports = {
  addSOSAppointment,
  addStandardAppointment,
};
