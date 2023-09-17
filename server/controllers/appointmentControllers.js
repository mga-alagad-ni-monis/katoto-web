const uniqid = require("uniqid");
const jwt = require("jsonwebtoken");

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
    status: "upcoming",
    // subject for date changes
    scheduledDate: new Date(date.setDate(date.getDate() + 1)).toLocaleString(),
  };

  sosAppointments.push(sosDetails);

  await document.update({
    "reports.sosAppointments": sosAppointments,
  });

  return sosDetails;
};

const addStandardAppointment = async (
  userDetails,
  start,
  end,
  gc,
  mode,
  creator,
  description
) => {
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
    status: userDetails.idNo !== creator ? "upcoming" : "pending",
    // subject for date changes
    start: start,
    end: end,
    gc: gc,
    mode: mode,
    creator: creator,
    description,
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
          if (i.data().reports.standardAppointments !== undefined) {
            i.data().reports.standardAppointments.forEach((j) => {
              appointmentsArray.push({
                title: `Regular - ${j.userDetails.name}`,
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
    res.status(404).send("Error");
  }
};

const cancelAppointment = async (req, res) => {
  const { id, type } = req.body;
  try {
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let docInfo = {};
        querySnapshot.forEach((i) => {
          if (
            i.data().reports.sosAppointments !== undefined &&
            type === "sos"
          ) {
            appointments = i.data().reports.sosAppointments.map((j) => {
              if (j.id === id) {
                docInfo["name"] = i.id;
                docInfo["appointments"] = i.data().reports.sosAppointments;
                return;
              }
            });
          }

          if (
            i.data().reports.standardAppointments !== undefined &&
            type === "standard"
          ) {
            appointments = i.data().reports.standardAppointments.map((j) => {
              if (j.id === id) {
                docInfo["name"] = i.id;
                docInfo["appointments"] = i.data().reports.standardAppointments;
                return;
              }
            });
          }
        });

        let appointmentsArray = docInfo.appointments.map((j) => {
          if (j.id === id) {
            return {
              creator: j.creator,
              mode: j.mode,
              gc: j.gc,
              createdDate: j.createdDate,
              end: j.end,
              id: j.id,
              start: j.start,
              type: j.type,
              userDetails: j.userDetails,
              status: "cancelled",
            };
          }
          return j;
        });

        const doc = db.collection("reports").doc(docInfo.name);

        if (type === "sos") {
          doc.update({
            "reports.sosAppointments": appointmentsArray,
          });
        }

        if (type === "standard") {
          doc.update({
            "reports.standardAppointments": appointmentsArray,
          });
        }

        res
          .status(200)
          .json({ message: "Appointment cancelled successfully!" });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const editAppointment = async (req, res) => {
  const {
    id,
    type,
    appointmentDateStart,
    appointmentDateEnd,
    appointmentMode,
  } = req.body;

  try {
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let docInfo = {};
        querySnapshot.forEach((i) => {
          if (
            i.data().reports.sosAppointments !== undefined &&
            type === "sos"
          ) {
            appointments = i.data().reports.sosAppointments.map((j) => {
              if (j.id === id) {
                docInfo["name"] = i.id;
                docInfo["appointments"] = i.data().reports.sosAppointments;
                return;
              }
            });
          }

          if (
            i.data().reports.standardAppointments !== undefined &&
            type === "standard"
          ) {
            appointments = i.data().reports.standardAppointments.map((j) => {
              if (j.id === id) {
                docInfo["name"] = i.id;
                docInfo["appointments"] = i.data().reports.standardAppointments;
                return;
              }
            });
          }
        });

        let appointmentOldNew = {};

        let appointmentsArray = docInfo.appointments.map((j) => {
          if (j.id === id) {
            appointmentOldNew["old"] = j;
            let newAppointment = {
              createdDate: j.createdDate,
              end: appointmentDateEnd,
              id: j.id,
              start: appointmentDateStart,
              type: j.type,
              mode: appointmentMode,
              userDetails: j.userDetails,
              status: "upcoming",
            };
            appointmentOldNew["new"] = newAppointment;
            return newAppointment;
          }
          return j;
        });

        const doc = db.collection("reports").doc(docInfo.name);

        if (type === "sos") {
          doc.update({
            "reports.sosAppointments": appointmentsArray,
          });
        }

        if (type === "standard") {
          doc.update({
            "reports.standardAppointments": appointmentsArray,
          });
        }

        res.status(200).json({
          message: "Appointment edited successfully!",
          appointmentOldNew,
        });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const approveAppointment = async (req, res) => {
  const { id } = req.body;

  try {
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }

        let docInfo = {};

        querySnapshot.forEach((i) => {
          if (i.data().reports.standardAppointments !== undefined) {
            appointments = i.data().reports.standardAppointments.map((j) => {
              if (j.id === id) {
                docInfo["name"] = i.id;
                docInfo["appointments"] = i.data().reports.standardAppointments;
                return;
              }
            });
          }
        });

        let appointmentsArray = docInfo.appointments.map((j) => {
          if (j.id === id) {
            let newAppointment = {
              creator: j.creator,
              mode: j.mode,
              gc: j.gc,
              createdDate: j.createdDate,
              end: j.end,
              id: j.id,
              start: j.start,
              type: j.type,
              userDetails: j.userDetails,
              description: j.description,
              status: "upcoming",
            };
            docInfo["appointment"] = newAppointment;
            return newAppointment;
          }
          return j;
        });

        const doc = db.collection("reports").doc(docInfo.name);

        doc.update({
          "reports.standardAppointments": appointmentsArray,
        });

        res.status(200).json({
          message: "Appointment approved!",
          appointmentDetails: docInfo["appointment"],
        });
      });
  } catch (err) {
    console.log(err);
    res.status(404).send("Error");
  }
};

const completeAppointment = async (req, res) => {
  const { id } = req.body;

  try {
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }

        let docInfo = {};

        querySnapshot.forEach((i) => {
          if (i.data().reports.standardAppointments !== undefined) {
            appointments = i.data().reports.standardAppointments.map((j) => {
              if (j.id === id) {
                docInfo["name"] = i.id;
                docInfo["appointments"] = i.data().reports.standardAppointments;
                return;
              }
            });
          }
        });

        let appointmentsArray = docInfo.appointments.map((j) => {
          if (j.id === id) {
            let newAppointment = {
              creator: j.creator,
              mode: j.mode,
              gc: j.gc,
              createdDate: j.createdDate,
              end: j.end,
              id: j.id,
              start: j.start,
              type: j.type,
              userDetails: j.userDetails,
              description: j.description,
              status: "completed",
            };
            docInfo["appointment"] = newAppointment;
            return newAppointment;
          }
          return j;
        });

        const doc = db.collection("reports").doc(docInfo.name);

        doc.update({
          "reports.standardAppointments": appointmentsArray,
        });

        res.status(200).json({
          message: "Appointment completed!",
          appointmentDetails: docInfo["appointment"],
        });
      });
  } catch (err) {
    console.log(err);
    res.status(404).send("Error");
  }
};

const getMyAppointment = async (req, res) => {
  const token = req.headers.authorization.slice(7);

  try {
    const idNo = jwt.decode(token)?.idNo;
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let appointment = {};
        querySnapshot.forEach((i) => {
          if (i.data().reports.sosAppointments !== undefined) {
            i.data().reports.sosAppointments.forEach((j) => {
              if (
                j.userDetails.idNo === idNo &&
                new Date(j.end) > new Date() &&
                j.status === "upcoming"
              ) {
                appointment = j;
                return;
              }
            });
          }

          if (i.data().reports.standardAppointments !== undefined) {
            i.data().reports.standardAppointments.forEach((j) => {
              if (
                j.userDetails.idNo === idNo &&
                new Date(j.end) > new Date() &&
                j.status === "upcoming"
              ) {
                appointment = j;
                return;
              }
            });
          }
        });

        res.status(200).json({ appointment: appointment });
      });
  } catch (err) {
    console.log(err);
    res.status(404).send("Error");
  }
};

const deleteAppointment = async (req, res) => {
  const { id, type } = req.body;
  try {
    await db
      .collection("reports")
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.empty) {
          return res.status(404).send("Error");
        }
        let docInfo = {};
        querySnapshot.forEach((i) => {
          if (
            i.data().reports.standardAppointments !== undefined &&
            type === "standard"
          ) {
            i.data().reports.standardAppointments.map((j) => {
              if (j.id === id) {
                console.log("asdasdads");
                docInfo["name"] = i.id;
                docInfo["appointments"] = i.data().reports.standardAppointments;
                return;
              }
            });
          }
        });

        let appointmentsArray = docInfo.appointments.filter((j) => j.id !== id);

        const doc = db.collection("reports").doc(docInfo.name);

        if (type === "sos") {
          doc.update({
            "reports.sosAppointments": appointmentsArray,
          });
        }

        if (type === "standard") {
          doc.update({
            "reports.standardAppointments": appointmentsArray,
          });
        }

        res.status(200).json({ message: "Appointment deleted successfully!" });
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
  cancelAppointment,
  editAppointment,
  getMyAppointment,
  approveAppointment,
  completeAppointment,
  deleteAppointment,
};
