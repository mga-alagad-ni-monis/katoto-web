import { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { RiFileExcel2Line, RiDownloadCloud2Line } from "react-icons/ri";
import { FaLongArrowAltUp, FaLongArrowAltDown } from "react-icons/fa";
import { toHeaderCase, toLowerCase } from "js-convert-case";
import Loading from "../Loading";
import axios from "../../api/axios";
import { flatten } from "flat";
import ReportsTd from "./ReportsTd";
import moment from "moment";
import download from "js-file-download";

function ReportTable({ toast, filters, tableCategories, title, auth }) {
  const [isOpenDateTimeButton, setIsOpenDateTimeButton] = useState(false);
  const [isOpenDepartmentButton, setIsOpenDepartmentButton] = useState(false);
  const [isOpenCollegeButton, setIsOpenCollegeButton] = useState(false);
  const [isOpenYearButton, setIsOpenYearButton] = useState(false);
  const [isOpenSectionButton, setIsOpenSectionButton] = useState(false);
  const [isOpenGenderButton, setIsOpenGenderButton] = useState(false);
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [isAscending, setIsAscending] = useState(true);

  const [sortString, setSortString] = useState({});
  const [sortName, setSortName] = useState("");
  const [filterDateTime, setFilterDateTime] = useState("Today");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterCollege, setFilterCollege] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [search, setSearch] = useState("");

  const [reports, setReports] = useState([]);

  useEffect(() => {
    let newSortString = {};
    Object.entries(tableCategories).forEach(([key, value]) => {
      newSortString[key] = value;
    });
    setSortString(newSortString);
    getReports();
  }, []);

  const getReports = async () => {
    try {
      await axios
        .get("/api/reports/reports", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          let updatedReports = [];
          if (title === "Appointment") {
            res?.data?.reports.forEach((i) => {
              i?.sosAppointments?.forEach((j) => {
                if (
                  auth?.userInfo?.assignedCollege.includes(
                    j?.userDetails.mainDepartment
                  )
                ) {
                  updatedReports.push(flatten(j));
                }
              });
              i?.standardAppointments?.forEach((k) => {
                if (
                  auth?.userInfo?.assignedCollege.includes(
                    k?.userDetails.mainDepartment
                  )
                ) {
                  updatedReports.push(flatten(k));
                }
              });
            });
          } else if (title === "Daily User") {
            res?.data?.reports.forEach((i) => {
              i?.dailyUsers?.friendly?.forEach((j) => {
                if (
                  auth?.userInfo?.assignedCollege.includes(j?.mainDepartment)
                ) {
                  j["type"] = "Friendly";
                  j["age"] = moment().diff(
                    new Date(j["birthday"]),
                    "years",
                    false
                  );
                  updatedReports.push(flatten(j));
                }
              });
              i?.dailyUsers?.guided?.forEach((k) => {
                if (
                  auth?.userInfo?.assignedCollege.includes(k?.mainDepartment)
                ) {
                  k["age"] = moment().diff(
                    new Date(k["birthday"]),
                    "years",
                    false
                  );
                  k["type"] = "Guided";
                  updatedReports.push(flatten(k));
                }
              });
            });
          } else if (title === "Feedback") {
            res?.data?.reports.forEach((i) => {
              i?.feedbacks?.forEach((j) => {
                if (
                  auth?.userInfo?.assignedCollege.includes(
                    j?.userDetails?.mainDepartment
                  )
                ) {
                  updatedReports.push(flatten(j));
                }
              });
            });
          } else if (title === "Concern") {
            res?.data?.reports.forEach((i) => {
              i?.concerns?.forEach((j) => {
                if (
                  auth?.userInfo?.assignedCollege.includes(j?.mainDepartment)
                ) {
                  j["age"] = moment().diff(
                    new Date(j["birthday"]),
                    "years",
                    false
                  );
                  updatedReports.push(flatten(j));
                }
              });
            });
          }
          setReports(updatedReports);
        });
    } catch (err) {
      toast.error("Error");
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

  const filteredReports = () => {
    const filteredReports = reports
      ?.sort((a, b) => {
        if (sortName) {
          let propA = "";
          let propB = "";
          if (title === "Appointment") {
            if (sortName === "date") {
              propA = a["scheduledDate"]
                ? new Date(convertDate(a["createdDate"])[1])
                : new Date(convertDate(a["start"])[1]);
              propB = b["scheduledDate"]
                ? new Date(convertDate(b["createdDate"])[1])
                : new Date(convertDate(b["start"])[1]);
            } else if (sortName === "time") {
              propA = a["scheduledDate"]
                ? convertDate(a["createdDate"])[2]
                : convertDate(a["start"])[2];
              propB = b["scheduledDate"]
                ? convertDate(b["createdDate"])[2]
                : convertDate(b["start"])[2];
            } else if (sortName === "idNo") {
              propA = toLowerCase(a["userDetails.idNo"]);
              propB = toLowerCase(b["userDetails.idNo"]);
            } else if (sortName === "name") {
              propA = toLowerCase(a["userDetails.name"]);
              propB = toLowerCase(b["userDetails.name"]);
            } else if (sortName === "email") {
              propA = toLowerCase(a["userDetails.email"]);
              propB = toLowerCase(b["userDetails.email"]);
            } else if (sortName === "guidanceCounselor") {
              propA = toLowerCase(a["gc.name"]);
              propB = toLowerCase(b["gc.name"]);
            } else if (sortName === "concernOverview") {
              propA = toLowerCase(a["description"]);
              propB = toLowerCase(b["description"]);
            } else if (sortName === "phone") {
              propA = toLowerCase(a["userDetails.contactNo"]);
              propB = toLowerCase(b["userDetails.contactNo"]);
            } else {
              propA = toLowerCase(a[sortName]);
              propB = toLowerCase(b[sortName]);
            }
          } else if (title === "Daily User") {
            if (sortName === "date") {
              propA = new Date(convertDate(a["createdDate"])[1]);
              propB = new Date(convertDate(b["createdDate"])[1]);
            } else if (sortName === "time") {
              propA = convertDate(a["createdDate"])[2];
              propB = convertDate(b["createdDate"])[2];
            } else if (sortName === "email") {
              propA = toLowerCase(a["credentials.email"]);
              propB = toLowerCase(b["credentials.email"]);
            } else if (sortName === "phone") {
              propA = toLowerCase(a["contactNo"]);
              propB = toLowerCase(b["contactNo"]);
            } else {
              propA = toLowerCase(a[sortName]);
              propB = toLowerCase(b[sortName]);
            }
          } else if (title === "Feedback") {
            if (sortName === "date") {
              propA = new Date(convertDate(a["createdDate"])[1]);
              propB = new Date(convertDate(b["createdDate"])[1]);
            } else if (sortName === "time") {
              propA = convertDate(a["createdDate"])[2];
              propB = convertDate(b["createdDate"])[2];
            } else if (sortName === "idNo") {
              propA = toLowerCase(a["userDetails.idNo"]);
              propB = toLowerCase(b["userDetails.idNo"]);
            } else if (sortName === "name") {
              propA = toLowerCase(a["userDetails.name"]);
              propB = toLowerCase(b["userDetails.name"]);
            } else if (sortName === "email") {
              propA = toLowerCase(a["userDetails.credentials.email"]);
              propB = toLowerCase(b["userDetails.credentials.email"]);
            } else if (sortName === "department") {
              propA = toLowerCase(a["userDetails.department"]);
              propB = toLowerCase(b["userDetails.department"]);
            } else if (sortName === "yearSection") {
              propA = toLowerCase(a["userDetails.yearSection"]);
              propB = toLowerCase(b["userDetails.yearSection"]);
            } else if (sortName === "feedback") {
              propA = toLowerCase(a["feedbackDetails"]);
              propB = toLowerCase(b["feedbackDetails"]);
            } else {
              propA = toLowerCase(a[sortName]);
              propB = toLowerCase(b[sortName]);
            }
          } else if (title === "Concern") {
            if (sortName === "date") {
              propA = new Date(convertDate(a["createdDate"])[1]);
              propB = new Date(convertDate(b["createdDate"])[1]);
            } else if (sortName === "time") {
              propA = convertDate(a["createdDate"])[2];
              propB = convertDate(b["createdDate"])[2];
            } else if (sortName === "email") {
              propA = toLowerCase(a["credentials.email"]);
              propB = toLowerCase(b["credentials.email"]);
            } else if (sortName === "phone") {
              propA = toLowerCase(a["contactNo"]);
              propB = toLowerCase(b["contactNo"]);
            } else {
              propA = toLowerCase(a[sortName]);
              propB = toLowerCase(b[sortName]);
            }
          }

          if (isAscending) {
            if (propA > propB) {
              return 1;
            } else {
              return -1;
            }
          } else {
            if (propA < propB) {
              return 1;
            } else {
              return -1;
            }
          }
        } else {
          return 0;
        }
      })
      ?.filter((i) => {
        let date = new Date();
        if (title === "Appointment") {
          if (filterDateTime === "Today") {
            return i["scheduledDate"] !== undefined
              ? convertDate(i["createdDate"])[1] ===
                  convertDate(date.toLocaleString())[1]
              : convertDate(i["start"])[1] ===
                  convertDate(date.toLocaleString())[1];
          } else if (filterDateTime === "Yesterday") {
            let yesterday = moment();
            yesterday.subtract(1, "days");
            return i["scheduledDate"] !== undefined
              ? convertDate(yesterday)[1] === convertDate(i["createdDate"])[1]
              : convertDate(yesterday)[1] === convertDate(i["start"])[1];
          } else if (filterDateTime === "Week") {
            let week = moment();
            week.subtract(1, "weeks");
            if (i["scheduledDate"] !== undefined) {
              return (
                moment(convertDate(week)[1]).isBefore(
                  convertDate(i["createdDate"])[1]
                ) &&
                moment(new Date()).isAfter(convertDate(i["createdDate"])[1])
              );
            } else {
              return (
                moment(convertDate(week)[1]).isBefore(
                  convertDate(i["start"])[1]
                ) && moment(new Date()).isAfter(convertDate(i["start"])[1])
              );
            }
          } else if (filterDateTime === "Month") {
            let month = moment();
            month.subtract(1, "months");
            if (i["scheduledDate"] !== undefined) {
              return (
                moment(convertDate(month)[1]).isBefore(
                  convertDate(i["createdDate"])[1]
                ) &&
                moment(new Date()).isAfter(convertDate(i["createdDate"])[1])
              );
            } else {
              return (
                moment(convertDate(month)[1]).isBefore(
                  convertDate(i["start"])[1]
                ) && moment(new Date()).isAfter(convertDate(i["start"])[1])
              );
            }
          } else if (filterDateTime === "Year") {
            let year = moment();
            year.subtract(1, "years");

            if (i["scheduledDate"] !== undefined) {
              return (
                moment(convertDate(year)[1]).isBefore(
                  convertDate(i["createdDate"])[1]
                ) &&
                moment(new Date()).isAfter(convertDate(i["createdDate"])[1])
              );
            } else {
              return (
                moment(convertDate(year)[1]).isBefore(
                  convertDate(i["start"])[1]
                ) && moment(new Date()).isAfter(convertDate(i["start"])[1])
              );
            }
          }
        }

        if (
          title === "Daily User" ||
          title === "Feedback" ||
          title === "Concern"
        ) {
          if (filterDateTime === "Today") {
            return (
              convertDate(i["createdDate"])[1] ===
              convertDate(date.toLocaleString())[1]
            );
          } else if (filterDateTime === "Yesterday") {
            let yesterday = moment();
            yesterday.subtract(1, "days");
            return (
              convertDate(yesterday)[1] === convertDate(i["createdDate"])[1]
            );
          } else if (filterDateTime === "Week") {
            let week = moment();
            week.subtract(1, "weeks");

            return (
              moment(convertDate(week)[1]).isBefore(
                convertDate(i["createdDate"])[1]
              ) && moment(new Date()).isAfter(convertDate(i["createdDate"])[1])
            );
          } else if (filterDateTime === "Month") {
            let month = moment();
            month.subtract(1, "months");

            return (
              moment(convertDate(month)[1]).isBefore(
                convertDate(i["createdDate"])[1]
              ) && moment(new Date()).isAfter(convertDate(i["createdDate"])[1])
            );
          } else if (filterDateTime === "Year") {
            let year = moment();
            year.subtract(1, "years");
            return (
              moment(convertDate(year)[1]).isBefore(
                convertDate(i["createdDate"])[1]
              ) && moment(new Date()).isAfter(convertDate(i["createdDate"])[1])
            );
          }
        }
      })
      ?.filter((i) => {
        if (title === "Appointment" || title === "Feedback") {
          return filterCollege === "All"
            ? i
            : filterCollege === i["userDetails.mainDepartment"];
        } else if (title === "Daily User" || title === "Concern") {
          return filterCollege === "All"
            ? i
            : filterCollege === i["mainDepartment"];
        }
      })
      ?.filter((i) => {
        if (title === "Appointment" || title === "Feedback") {
          return filterDepartment === "All"
            ? i
            : filterDepartment === i["userDetails.department"];
        } else if (title === "Daily User" || title === "Concern") {
          return filterDepartment === "All"
            ? i
            : filterDepartment === i["department"];
        }
      })
      ?.filter((i) => {
        if (title === "Appointment" || title === "Feedback") {
          return filterYear === "All"
            ? i
            : filterYear === i["userDetails.yearSection"][0];
        } else if (title === "Daily User" || title === "Concern") {
          return filterYear === "All" ? i : filterYear === i["yearSection"][0];
        }
      })
      ?.filter((i) => {
        if (title === "Appointment" || title === "Feedback") {
          return filterSection === "All"
            ? i
            : filterSection === i["userDetails.yearSection"].slice(2);
        } else if (title === "Daily User" || title === "Concern") {
          return filterSection === "All"
            ? i
            : filterSection === i["yearSection"].slice(2);
        }
      })
      ?.filter((i) => {
        if (title === "Appointment" || title === "Feedback") {
          return filterGender === "All"
            ? i
            : filterGender === i["userDetails.gender"];
        } else if (title === "Daily User" || title === "Concern") {
          return filterGender === "All" ? i : filterGender === i["gender"];
        }
      })
      ?.filter((i) => {
        if (search?.toLowerCase().trim()) {
          if (title === "Appointment") {
            return (
              convertDate(i["start"])[1]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              convertDate(i["start"])[2]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["userDetails.idNo"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["userDetails.name"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["userDetails.email"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["gc.name"].toLowerCase().includes(search.toLowerCase()) ||
              i["description"].toLowerCase().includes(search.toLowerCase()) ||
              (i["mode"] === "facetoface" ? "Face-to-face" : "Virtual")
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["status"].toLowerCase().includes(search.toLowerCase()) ||
              i["notes"].toLowerCase().includes(search.toLowerCase()) ||
              i["userDetails.contactNo"]
                .toLowerCase()
                .includes(search.toLowerCase())
            );
          } else if (title === "Daily User") {
            return (
              convertDate(i["createdDate"])[1]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              convertDate(i["createdDate"])[2]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["idNo"].toLowerCase().includes(search.toLowerCase()) ||
              i["name"].toLowerCase().includes(search.toLowerCase()) ||
              i["credentials.email"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["age"]
                .toString()
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["department"].toLowerCase().includes(search.toLowerCase()) ||
              i["gender"].toLowerCase().includes(search.toLowerCase()) ||
              i["yearSection"].toLowerCase().includes(search.toLowerCase()) ||
              i["type"].toLowerCase().includes(search.toLowerCase()) ||
              i["contactNo"].toLowerCase().includes(search.toLowerCase())
            );
          } else if (title === "Feedback") {
            return (
              convertDate(i["createdDate"])[1]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              convertDate(i["createdDate"])[2]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["userDetails.idNo"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["userDetails.name"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["userDetails.credentials.email"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["userDetails.department"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["userDetails.yearSection"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["rating"]
                .toString()
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["feedbackDetails"].toLowerCase().includes(search.toLowerCase())
            );
          } else if (title === "Concern") {
            return (
              convertDate(i["createdDate"])[1]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              convertDate(i["createdDate"])[2]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["idNo"].toLowerCase().includes(search.toLowerCase()) ||
              i["name"].toLowerCase().includes(search.toLowerCase()) ||
              i["credentials.email"]
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["age"]
                .toString()
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              i["department"].toLowerCase().includes(search.toLowerCase()) ||
              i["gender"].toLowerCase().includes(search.toLowerCase()) ||
              i["yearSection"].toLowerCase().includes(search.toLowerCase()) ||
              i["concern"].toLowerCase().includes(search.toLowerCase()) ||
              i["contactNo"].toLowerCase().includes(search.toLowerCase())
            );
          }
        } else {
          return i;
        }
      });

    return filteredReports;
  };

  const exportReports = async (type) => {
    try {
      const finalReports = filteredReports();
      await axios
        .post(
          "/api/reports/export",
          { reports: finalReports, type, title, tableCategories },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
            responseType: "arraybuffer",
          }
        )
        .then((res) => {
          if (type === "Excel") {
            download(
              res.data,
              `${moment().format("YYYY-MM-DD")}-${moment().format(
                "hh-mm-ss"
              )}-${title}Reports.xlsx`
            );
          } else {
            download(
              res.data,
              `${moment().format("YYYY-MM-DD")}-${moment().format(
                "hh-mm-ss"
              )}-${title}Reports.csv`
            );
          }
          setIsOpenExport(false);
        });
    } catch (err) {
      if (err.response.status === 403) {
        toast.error("No reports available!");
      } else {
        toast.error("Error");
      }
    }
  };

  const dateTime = ["Today", "Yesterday", "Week", "Month", "Year"];

  const departments = [
    "All",
    "Bachelor of Early Childhood Education (BECED)",
    "Bachelor of Secondary Education Major in English (BSED English)",
    "Bachelor of Secondary Education Major in Filipino (BSED Filipino)",
    "Bachelor of Secondary Education Major in Mathematics (BSED Mathematics)",
    "Bachelor of Secondary Education Major in Science (BSED Science)",
    "Bachelor of Secondary Education Major in Social Studies (BSED Social Studies)",
    "Bachelor of Science in Civil Engineering (BSCE)",
    "Bachelor of Science in Electrical Engineering (BSEE)",
    "Bachelor of Science in Information Technology (BSIT)",
    "Bachelor of Arts in Communication (BAC)",
    "Bachelor of Science in Psychology (BSP)",
    "Bachelor of Science in Social Work (BSSW)",
    "Bachelor of Science in Accountancy (BSA)",
    "Bachelor of Science in Business Administration Major in Financial Management (BSBA FM)",
    "Bachelor of Science in Business Administration Major in Human Resource Development Management (BSBA HRDM)",
    "Bachelor of Science in Business Administration Major in Marketing Management (BSBA MM)",
    "Bachelor of Science in Public Administration (BSPA)",
  ];

  const colleges = [
    "All",
    "College of Education",
    "College of Arts and Sciences",
    "College of Engineering and Information Technology",
    "College of Business Administration, Public Administration and Accountancy",
  ];

  const genders = ["All", "Male", "Female", "Other"];

  return (
    <div className="flex flex-col gap-5 w-full">
      <div className="flex justify-between w-full">
        <div className="flex gap-10">
          <div>
            <p className="mb-3 font-bold text-xs">What are you looking for?</p>
            <input
              type="text"
              placeholder="Search..."
              className="py-2 px-5 bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
            />
          </div>
          <div>
            <p className="mb-3 font-bold text-xs">Date/Time</p>
            {filters.dateTime ? (
              <div className="relative">
                <button
                  type="button"
                  className="w-[120px] flex justify-between bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsOpenDateTimeButton(!isOpenDateTimeButton);
                  }}
                >
                  {filterDateTime}
                  <FiChevronDown size={16} />
                </button>
                <div
                  className={`${
                    isOpenDateTimeButton ? "visible" : "hidden"
                  } absolute top-9 transition-all duration-100 w-[120px]
              z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
                >
                  {dateTime.map((i, k) => {
                    return (
                      <button
                        key={k}
                        className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                        onClick={() => {
                          setFilterDateTime(i);
                          setIsOpenDateTimeButton(false);
                        }}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex gap-5">
          <div>
            <p className="mb-3 font-bold text-xs">College</p>
            {filters.college ? (
              <div className="relative">
                <button
                  type="button"
                  className="w-[200px] flex justify-between bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsOpenCollegeButton(!isOpenCollegeButton);
                  }}
                >
                  <span class="truncate w-[130px] text-left">
                    {filterCollege}
                  </span>
                  <FiChevronDown size={16} />
                </button>
                <div
                  className={`${
                    isOpenCollegeButton ? "visible" : "hidden"
                  } absolute top-9 transition-all duration-100 w-[570px]
              z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
                >
                  {colleges.map((i, k) => {
                    return (
                      <button
                        key={k}
                        className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                        onClick={() => {
                          setFilterCollege(i);
                          setIsOpenCollegeButton(false);
                        }}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <div>
            <p className="mb-3 font-bold text-xs">Department</p>
            {filters.department ? (
              <div className="relative">
                <button
                  type="button"
                  className="w-[150px] flex justify-between bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsOpenDepartmentButton(!isOpenDepartmentButton);
                  }}
                >
                  <span class="truncate w-[80px] text-left">
                    {filterDepartment === "All"
                      ? "All"
                      : JSON.stringify(
                          filterDepartment.match(/\(([^)]+)\)/g)
                        ).slice(3, -3)}
                  </span>
                  <FiChevronDown size={16} />
                </button>
                <div
                  className={`${
                    isOpenDepartmentButton ? "visible" : "hidden"
                  } absolute top-9 transition-all duration-100 w-[190px]
              z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
                >
                  {departments.map((i, k) => {
                    return (
                      <button
                        key={k}
                        className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                        onClick={() => {
                          setFilterDepartment(i);
                          setIsOpenDepartmentButton(false);
                        }}
                      >
                        {i === "All"
                          ? "All"
                          : JSON.stringify(i.match(/\(([^)]+)\)/g)).slice(
                              3,
                              -3
                            )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <div>
            <p className="mb-3 font-bold text-xs">Year</p>
            {filters.year ? (
              <div className="relative">
                <button
                  type="button"
                  className="w-[71px] bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsOpenYearButton(!isOpenYearButton);
                  }}
                >
                  {filterYear}
                  <FiChevronDown size={16} />
                </button>
                <div
                  className={`${
                    isOpenYearButton ? "visible" : "hidden"
                  } absolute top-9 transition-all duration-100 w-[71px]
              z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
                >
                  {["All", "1", "2", "3", "4"].map((i, k) => {
                    return (
                      <button
                        key={k}
                        className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                        onClick={() => {
                          setFilterYear(i);
                          setIsOpenYearButton(false);
                        }}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <div>
            <p className="mb-3 font-bold text-xs">Section</p>
            {filters.section ? (
              <div className="relative">
                <button
                  type="button"
                  className="w-[71px] bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsOpenSectionButton(!isOpenSectionButton);
                  }}
                >
                  {filterSection}
                  <FiChevronDown size={16} />
                </button>
                <div
                  className={`${
                    isOpenSectionButton ? "visible" : "hidden"
                  } absolute top-9 transition-all duration-100 w-[71px]
              z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
                >
                  {[
                    "All",
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6",
                    "7",
                    "8",
                    "9",
                    "10",
                    "11",
                    "12",
                  ].map((i, k) => {
                    return (
                      <button
                        key={k}
                        className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                        onClick={() => {
                          setFilterSection(i);
                          setIsOpenSectionButton(false);
                        }}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <div>
            <p className="mb-3 font-bold text-xs">Gender</p>
            {filters.gender ? (
              <div className="relative">
                <button
                  type="button"
                  className="flex justify-between w-[102px] bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsOpenGenderButton(!isOpenGenderButton);
                  }}
                >
                  {filterGender}
                  <FiChevronDown size={16} />
                </button>
                <div
                  className={`${
                    isOpenGenderButton ? "visible" : "hidden"
                  } absolute top-9 transition-all duration-100 w-[102px]
              z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
                >
                  {genders.map((i, k) => {
                    return (
                      <button
                        key={k}
                        className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                        onClick={() => {
                          setFilterGender(i);
                          setIsOpenGenderButton(false);
                        }}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex items-end relative">
            <button
              className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300 ml-10"
              onClick={() => {
                setIsOpenExport(!isOpenExport);
              }}
            >
              <RiDownloadCloud2Line size={16} />
              Export
            </button>
            <div
              className={`${
                isOpenExport ? "visible" : "hidden"
              } w-[105px] absolute top-16 right-0 transition-all duration-100
              z-10 mt-2 shadow-md rounded-lg p-2 bg-black`}
            >
              {["Excel", "CSV"].map((i, k) => {
                return (
                  <button
                    key={k}
                    className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-black"
                    onClick={() => {
                      exportReports(i);
                    }}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <table
        className="w-full rounded-lg shadow-lg bg-[--light-green] relative"
        style={{ backgroundColor: "rgba(169, 230, 194, 0.2)" }}
      >
        <thead className="flex px-5 py-3 text-sm text-[--light-brown] font-bold bg-[--dark-green] rounded-lg m-1">
          {Object.entries(tableCategories).map(([key, value]) => {
            return (
              <p className="min-w-[100px] max-w-[100px] mr-[20px] flex justify-between truncate text-ellipsis">
                <span className="truncate w-[70%]">{toHeaderCase(key)}</span>
                {sortString[key] ? (
                  <button
                    onClick={() => {
                      setSortString((prevSortString) => ({
                        ...prevSortString,
                        [key]: !prevSortString[key],
                      }));
                      setSortName(key);
                      setIsAscending(false);
                    }}
                  >
                    <FaLongArrowAltUp />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSortString((prevSortString) => ({
                        ...prevSortString,
                        [key]: !prevSortString[key],
                      }));
                      setSortName(key);
                      setIsAscending(true);
                    }}
                  >
                    <FaLongArrowAltDown />
                  </button>
                )}
              </p>
            );
          })}
        </thead>
        <tbody className="flex flex-col max-h-[624px] overflow-y-auto">
          {reports.length ? (
            filteredReports()?.length === 0 ? (
              <p className="font-bold flex justify-center items-center min-h-[624px]">
                No data...
              </p>
            ) : null
          ) : null}

          {reports.length ? (
            filteredReports()?.map((i, k) => {
              if (title === "Appointment") {
                return (
                  <tr key={k}>
                    <td
                      className={`flex font-medium mx-1 px-5 my-1 py-3 text-sm ${
                        k % 2 ? "bg-[--light-green] rounded-lg" : null
                      }`}
                    >
                      <ReportsTd
                        value={
                          convertDate(
                            i["scheduledDate"] ? i["createdDate"] : i["start"]
                          )[1]
                        }
                      />
                      <ReportsTd
                        value={
                          convertDate(
                            i["scheduledDate"] ? i["createdDate"] : i["start"]
                          )[2]
                        }
                      />
                      <ReportsTd value={i["userDetails.idNo"]} />
                      <ReportsTd value={i["userDetails.name"]} />
                      <ReportsTd value={i["userDetails.email"]} />
                      <ReportsTd value={i["gc.name"]} />
                      <ReportsTd
                        value={
                          i["mode"] === "facetoface"
                            ? "Face-to-face"
                            : "Virtual"
                        }
                      />
                      <ReportsTd value={i["description"]} />
                      <ReportsTd value={toHeaderCase(i["type"])} />
                      <ReportsTd value={toHeaderCase(i["status"])} />
                      <ReportsTd value={i["notes"]} />
                      <ReportsTd value={i["userDetails.contactNo"]} />
                    </td>
                  </tr>
                );
              } else if (title === "Daily User") {
                return (
                  <tr key={k}>
                    <td
                      className={`flex font-medium mx-1 px-5 my-1 py-3 text-sm ${
                        k % 2 ? "bg-[--light-green] rounded-lg" : null
                      }`}
                    >
                      <ReportsTd value={convertDate(i["createdDate"])[1]} />
                      <ReportsTd value={convertDate(i["createdDate"])[2]} />
                      <ReportsTd value={i["idNo"]} />
                      <ReportsTd value={i["name"]} />
                      <ReportsTd value={i["credentials.email"]} />
                      <ReportsTd value={i["age"]} />
                      <ReportsTd value={i["department"]} />
                      <ReportsTd value={i["gender"]} />
                      <ReportsTd value={i["yearSection"]} />
                      <ReportsTd value={i["type"]} />
                      <ReportsTd value={i["contactNo"]} />
                    </td>
                  </tr>
                );
              } else if (title === "Feedback") {
                return (
                  <tr key={k}>
                    <td
                      className={`flex font-medium mx-1 px-5 my-1 py-3 text-sm ${
                        k % 2 ? "bg-[--light-green] rounded-lg" : null
                      }`}
                    >
                      <ReportsTd value={convertDate(i["createdDate"])[1]} />
                      <ReportsTd value={convertDate(i["createdDate"])[2]} />
                      <ReportsTd value={i["userDetails.idNo"]} />
                      <ReportsTd value={i["userDetails.name"]} />
                      <ReportsTd value={i["userDetails.credentials.email"]} />
                      <ReportsTd value={i["userDetails.department"]} />
                      <ReportsTd value={i["userDetails.yearSection"]} />
                      <ReportsTd value={i["rating"]} />
                      <ReportsTd value={i["feedbackDetails"]} />
                    </td>
                  </tr>
                );
              } else if (title === "Concern") {
                return (
                  <tr key={k}>
                    <td
                      className={`flex font-medium mx-1 px-5 my-1 py-3 text-sm ${
                        k % 2 ? "bg-[--light-green] rounded-lg" : null
                      }`}
                    >
                      <ReportsTd value={convertDate(i["createdDate"])[1]} />
                      <ReportsTd value={convertDate(i["createdDate"])[2]} />
                      <ReportsTd value={i["idNo"]} />
                      <ReportsTd value={i["name"]} />
                      <ReportsTd value={i["credentials.email"]} />
                      <ReportsTd value={i["age"]} />
                      <ReportsTd value={i["department"]} />
                      <ReportsTd value={i["gender"]} />
                      <ReportsTd value={i["yearSection"]} />
                      <ReportsTd value={i["concern"]} />
                      <ReportsTd value={i["contactNo"]} />
                    </td>
                  </tr>
                );
              }
            })
          ) : (
            <Loading />
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReportTable;
