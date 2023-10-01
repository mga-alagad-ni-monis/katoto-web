const XLSX = require("xlsx");
const moment = require("moment");
const path = require("node:path");
const fs = require("fs");

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
            feedbacks: i.data().reports.feedbacks,
            sosAppointments: i.data().reports.sosAppointments,
            standardAppointments: i.data().reports.standardAppointments,
          });
        });
        res.status(200).json({ reports: reportsArray });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const exportReports = async (req, res) => {
  const { reports, type, title } = req.body;
  try {
    if (type === "Excel") {
      const worksheet = XLSX.utils.json_to_sheet(reports);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title);
      XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
      XLSX.write(workbook, { bookType: "xlsx", type: "binary" });
      XLSX.writeFile(
        workbook,
        `tmp/${moment().format("YYYY-MM-DD")}-${moment().format(
          "hh-mm-ss"
        )}-${title}Reports.xlsx`
      );
      const excelFilePath = path.join(
        __dirname,
        `../tmp/${moment().format("YYYY-MM-DD")}-${moment().format(
          "hh-mm-ss"
        )}-${title}Reports.xlsx`
      );
      res.sendFile(excelFilePath, (err) => {
        if (err) console.log(err);
      });
    } else if (type === "CSV") {
      const worksheet = XLSX.utils.json_to_sheet(reports);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, title);
      XLSX.write(workbook, { bookType: "csv", type: "buffer" });
      XLSX.write(workbook, { bookType: "csv", type: "binary" });

      const excelFilePath = path.join(
        __dirname,
        `../tmp/${moment().format("YYYY-MM-DD")}-${moment().format(
          "hh-mm-ss"
        )}-${title}Reports.csv`
      );

      XLSX.writeFile(
        workbook,
        `tmp/${moment().format("YYYY-MM-DD")}-${moment().format(
          "hh-mm-ss"
        )}-${title}Reports.csv`
      );

      var stream = XLSX.stream.to_csv(worksheet);
      stream.pipe(fs.createWriteStream(excelFilePath));

      res.sendFile(excelFilePath, (err) => {
        if (err) console.log(err);
      });
    }
  } catch (err) {
    console.log(err);
    res.status(404).send("Error");
  }
};

module.exports = {
  createDocument,
  getReports,
  exportReports,
};
