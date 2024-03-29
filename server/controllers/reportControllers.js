const XLSX = require("xlsx-js-style");
const moment = require("moment");
const path = require("node:path");
const fs = require("fs");
const jsConvert = require("js-convert-case");

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
        concerns: [],
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
            concerns: i.data().reports.concerns,
          });
        });
        res.status(200).json({ reports: reportsArray });
      });
  } catch (err) {
    res.status(404).send("Error");
  }
};

const convertDate = (date) => {
  const formattedDate = new Date(date);

  const convertedDateTime = formattedDate.toLocaleString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Asia/Singapore",
  });

  const convertedDate = formattedDate.toLocaleString("en-PH", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Singapore",
  });

  const convertedTime = formattedDate.toLocaleString("en-PH", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "Asia/Singapore",
  });

  return [convertedDateTime, convertedDate, convertedTime];
};

const exportReports = async (req, res) => {
  const { reports, type, title, tableCategories } = req.body;
  try {
    let newReports = [];

    if (reports.length === 0) {
      return res.status(403).send();
    }

    if (title === "Appointment") {
      reports.forEach((i) => {
        let obj = {};
        Object.entries(tableCategories).map(([key, value]) => {
          if (key === "date") {
            obj["Date"] = i["scheduledDate"]
              ? convertDate(i["createdDate"])[1]
              : convertDate(i["start"])[1];
          } else if (key === "time") {
            obj["Time"] = i["scheduledDate"]
              ? convertDate(i["createdDate"])[2]
              : convertDate(i["start"])[2];
          } else if (key === "idNo") {
            obj["Id No"] = i["userDetails.idNo"];
          } else if (key === "name") {
            obj["Name"] = jsConvert.toHeaderCase(i["userDetails.name"]);
          } else if (key === "email") {
            obj["Email"] = i["userDetails.email"];
          } else if (key === "guidanceCounselor") {
            obj["Guidance Counselor"] = jsConvert.toHeaderCase(i["gc.name"]);
          } else if (key === "concernOverview") {
            obj["Concern Overview"] = i["description"];
          } else if (key === "phone") {
            obj["Phone"] = i["userDetails.contactNo"];
          } else if (key === "mode") {
            obj["Mode"] = i["mode"] === "virtual" ? "Virtual" : "Face-to-face";
          } else if (key === "type") {
            obj["Type"] = i["type"];
          } else {
            obj[jsConvert.toHeaderCase(key)] = jsConvert.toHeaderCase(i[key]);
          }
        });
        newReports.push(obj);
      });
    } else if (title === "Daily User") {
      reports.forEach((i) => {
        let obj = {};
        Object.entries(tableCategories).map(([key, value]) => {
          if (key === "date") {
            obj["Date"] = convertDate(i["createdDate"])[1];
          } else if (key === "time") {
            obj["Time"] = convertDate(i["createdDate"])[1];
          } else if (key === "email") {
            obj["Email"] = i["credentials.email"];
          } else if (key === "phone") {
            obj["Phone"] = i["contactNo"];
          } else if (key === "idNo") {
            obj["Id No"] = i["idNo"];
          } else if (key === "department") {
            obj["Department"] = i["department"];
          } else if (key === "yearSection") {
            obj["Year Section"] = ` ${i["yearSection"]}`;
          } else {
            obj[jsConvert.toHeaderCase(key)] = jsConvert.toHeaderCase(i[key]);
          }
        });
        newReports.push(obj);
      });
    } else if (title === "Feedback") {
      reports.forEach((i) => {
        let obj = {};
        Object.entries(tableCategories).map(([key, value]) => {
          if (key === "date") {
            obj["Date"] = convertDate(i["createdDate"])[1];
          } else if (key === "time") {
            obj["Time"] = convertDate(i["createdDate"])[1];
          } else if (key === "idNo") {
            obj["Id No"] = i["userDetails.idNo"];
          } else if (key === "name") {
            obj["Name"] = i["userDetails.name"];
          } else if (key === "email") {
            obj["Email"] = i["userDetails.credentials.email"];
          } else if (key === "department") {
            obj["Department"] = i["userDetails.department"];
          } else if (key === "yearSection") {
            obj["Year Section"] = ` ${i["userDetails.yearSection"]}`;
          } else if (key === "feedback") {
            obj["Feedback"] = i["feedbackDetails"];
          } else {
            obj[jsConvert.toHeaderCase(key)] = jsConvert.toHeaderCase(i[key]);
          }
        });
        newReports.push(obj);
      });
    } else if (title === "Concern") {
      reports.forEach((i) => {
        let obj = {};
        Object.entries(tableCategories).map(([key, value]) => {
          if (key === "date") {
            obj["Date"] = convertDate(i["createdDate"])[1];
          } else if (key === "time") {
            obj["Time"] = convertDate(i["createdDate"])[1];
          } else if (key === "email") {
            obj["Email"] = i["credentials.email"];
          } else if (key === "phone") {
            obj["Phone"] = i["contactNo"];
          } else if (key === "idNo") {
            obj["Id No"] = i["idNo"];
          } else if (key === "department") {
            obj["Department"] = i["department"];
          } else if (key === "yearSection") {
            obj["Year Section"] = ` ${i["yearSection"]}`;
          } else {
            obj[jsConvert.toHeaderCase(key)] = jsConvert.toHeaderCase(i[key]);
          }
        });
        newReports.push(obj);
      });
    }

    if (type === "Excel") {
      const worksheet = XLSX.utils.json_to_sheet(newReports);
      const workbook = XLSX.utils.book_new();

      const cellStyle = {
        font: { name: "Arial", sz: 11 },
      };

      const range2 = XLSX.utils.decode_range(worksheet["!ref"]);

      for (let row = range2.s.r; row <= range2.e.r; row++) {
        for (let col = range2.s.c; col <= range2.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          const cell = worksheet[cellAddress];
          cell.s = cellStyle;
        }
      }

      const headerStyle = {
        font: { bold: true, color: { rgb: "f5f3eb" }, name: "Arial", sz: 11 },
        alignment: { horizontal: "center" },
        fill: { patternType: "solid", fgColor: { rgb: "2d757c" } },
        border: {
          top: { style: "thick", color: { auto: 1 } },
          bottom: { style: "thick", color: { auto: 1 } },
          left: { style: "thick", color: { auto: 1 } },
          right: { style: "thick", color: { auto: 1 } },
        },
        padding: {
          top: 5,
          bottom: 5,
          left: 5,
          right: 5,
        },
      };

      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const firstRowRange = {
        s: { r: range.s.r, c: range.s.c },
        e: { r: range.s.r, c: range.e.c },
      };

      worksheet["!cols"] = [];

      for (let i = firstRowRange.s.c; i <= firstRowRange.e.c; i++) {
        const cellAddress = XLSX.utils.encode_cell({
          r: firstRowRange.s.r,
          c: i,
        });
        const cell = worksheet[cellAddress];
        const desiredWidth = estimateCellWidth(cell.v);
        worksheet["!cols"][i] = { wpx: desiredWidth };
        worksheet[cellAddress].s = headerStyle;
      }

      function estimateCellWidth(content) {
        const defaultCharWidth = 18;
        const contentLength = content.toString().length;
        return contentLength * defaultCharWidth;
      }

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
      const worksheet = XLSX.utils.json_to_sheet(newReports);
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
