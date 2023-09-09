const uniqid = require("uniqid");
const moment = require("moment");

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

const getAppointments = async (req, res) => {
  try {
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let appointmentsArray = [];
        querySnapshot.forEach((i) => {
          // console.log(i.data().reports.sosAppointments);
          if (i.data().reports.sosAppointments !== undefined) {
            i.data().reports.sosAppointments.forEach((j) => {
              appointmentsArray.push({
                title: `SOS - ${j.userDetails.name}`,
                // subject for changes
                start: j.scheduledDate,
                end: j.scheduledDate,
                data: j,
              });
            });
          }
          if (i.data().reports.standardAppointments !== undefined) {
            i.data().reports.standardAppointments.forEach((j) => {
              appointmentsArray.push({
                title: `Standard - ${j.userDetails.name}`,
                start: j.start,
                end: j.end,
                data: j,
              });
            });
          }
        });

        res.status(200).json({ appointments: appointmentsArray });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const getBookedAppointments = async (req, res) => {
  try {
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let appointmentsArray = [];
        querySnapshot.forEach((i) => {
          // console.log(i.data().reports.sosAppointments);
          if (i.data().reports.sosAppointments !== undefined) {
            i.data().reports.sosAppointments.forEach((j) => {
              appointmentsArray.push({
                // subject for changes
                start: j.scheduledDate,
              });
            });
          }
          if (i.data().reports.standardAppointments !== undefined) {
            i.data().reports.standardAppointments.forEach((j) => {
              appointmentsArray.push({
                start: j.start,
              });
            });
          }
        });

        res.status(200).json({ appointments: appointmentsArray });
      });
  } catch (err) {
    console.log(err);
    res.status(404).send("Error");
  }
};

module.exports = {
  addSOSAppointment,
  addStandardAppointment,
  getAppointments,
  getBookedAppointments,
};
