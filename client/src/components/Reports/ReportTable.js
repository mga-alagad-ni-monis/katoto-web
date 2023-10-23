import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { FiChevronDown } from "react-icons/fi";
import { RiDownloadCloud2Line } from "react-icons/ri";
import {
  FaLongArrowAltUp,
  FaLongArrowAltDown,
  FaEllipsisH,
  FaTimes,
} from "react-icons/fa";
import { toHeaderCase, toLowerCase } from "js-convert-case";
import Loading from "../Loading";
import axios from "../../api/axios";
import { flatten } from "flat";
import ReportsTd from "./ReportsTd";
import moment from "moment";
import download from "js-file-download";
import { DateRangePicker } from "react-date-range";
import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import Modal from "../Modal";

function ReportTable({ toast, filters, tableCategories, title, auth }) {
  const [isOpenDateTimeButton, setIsOpenDateTimeButton] = useState(false);
  const [isOpenDepartmentButton, setIsOpenDepartmentButton] = useState(false);
  const [isOpenCollegeButton, setIsOpenCollegeButton] = useState(false);
  const [isOpenYearButton, setIsOpenYearButton] = useState(false);
  const [isOpenSectionButton, setIsOpenSectionButton] = useState(false);
  const [isOpenGenderButton, setIsOpenGenderButton] = useState(false);
  const [isOpenExport, setIsOpenExport] = useState(false);
  const [isAscending, setIsAscending] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenCustom, setIsOpenCustom] = useState(false);
  const [isOpenLongData, setIsOpenLongData] = useState(false);

  const [sortString, setSortString] = useState({});
  const [sortName, setSortName] = useState("");
  const [filterDateTime, setFilterDateTime] = useState("Today");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterCollege, setFilterCollege] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [search, setSearch] = useState("");
  const [longDataTitle, setLongDataTitle] = useState("");
  const [longDataDesc, setLongDataDesc] = useState("");

  const [lines, setLines] = useState(10);
  const [page, setPage] = useState(1);

  const [customDate, setCustomDate] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [reports, setReports] = useState([]);

  const searchRef = useRef();

  useEffect(() => {
    (async () => {
      let newSortString = {};
      Object.entries(tableCategories).forEach(([key, value]) => {
        newSortString[key] = value;
      });
      setSortString(newSortString);
      await getReports();
      setIsLoading(false);
    })();
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
                  j["type"] = "SOS";
                  updatedReports.push(flatten(j));
                }
              });
              i?.standardAppointments?.forEach((k) => {
                if (
                  auth?.userInfo?.assignedCollege.includes(
                    k?.userDetails.mainDepartment
                  )
                ) {
                  k["type"] = "Regular";
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
          } else if (filterDateTime === "Custom") {
            if (i["scheduledDate"] !== undefined) {
              return (
                moment(
                  moment(customDate[0]?.startDate).subtract(1, "days")
                ).isBefore(convertDate(i["createdDate"])[1]) &&
                moment(moment(customDate[0]?.endDate).add(1, "days")).isAfter(
                  convertDate(i["createdDate"])[1]
                )
              );
            } else {
              return (
                moment(
                  moment(customDate[0]?.startDate).subtract(1, "days")
                ).isBefore(convertDate(i["start"])[1]) &&
                moment(moment(customDate[0]?.endDate).add(1, "days")).isAfter(
                  convertDate(i["start"])[1]
                )
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
          } else if (filterDateTime === "Custom") {
            return (
              moment(
                moment(customDate[0]?.startDate).subtract(1, "days")
              ).isBefore(convertDate(i["createdDate"])[1]) &&
              moment(moment(customDate[0]?.endDate).add(1, "days")).isAfter(
                convertDate(i["createdDate"])[1]
              )
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
        if (search.toLowerCase().trim()) {
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

  const dateTime = ["Today", "Yesterday", "Week", "Month", "Year", "Custom"];

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

  const handleSubmitCustom = () => {
    setCustomDate(customDate);
    setIsOpenCustom(false);
  };

  const handleShowLongData = (title, desc) => {
    setLongDataTitle(title);
    setLongDataDesc(desc);
    setIsOpenLongData(true);
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-[--light-brown] h-screen overflow-hidden">
          {isOpenLongData ? (
            <motion.div
              className="bg-black/50 absolute w-screen h-screen z-40"
              variants={{
                show: {
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                  },
                },
                hide: {
                  opacity: 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                  },
                },
              }}
              animate={isOpenLongData ? "show" : "hide"}
              initial={{
                opacity: 0,
              }}
            ></motion.div>
          ) : null}
          <Modal isOpen={isOpenLongData}>
            <div className="w-full justify-between flex">
              <p className="text-2xl font-extrabold">{longDataTitle}</p>
              <button
                onClick={() => {
                  setIsOpenLongData(false);
                }}
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-5 items-center text-center text-md w-[600px] max-h-[600px]">
              <div className="flex text-left w-full">
                <p className="w-full">{longDataDesc}</p>
              </div>
              <div className="w-full flex justify-end mt-4">
                <button
                  className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--red] transition-all duration-300"
                  onClick={() => {
                    setIsOpenLongData(false);
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </Modal>
          <div className="flex flex-col px-52">
            <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
              {`${title} Reports`}
            </p>
            <div className="flex flex-col gap-5 w-full">
              <div className="flex justify-between w-full">
                <div className="flex gap-10">
                  <div>
                    <p className="mb-3 font-bold text-xs">
                      What are you looking for?
                    </p>
                    <input
                      type="text"
                      placeholder="Search..."
                      className="py-2 px-5 bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                      // ref={searchRef}
                      // value={search}
                      onBlur={(e) => {
                        setSearch(e.target.value);
                      }}
                    />
                    {/* <button
                      onClick={() => {
                        setSearch(searchRef.current.value);
                      }}
                      className="w-[120px] flex justify-between bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 
                      items-center justify-center border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                    ></button> */}
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
                            setIsOpenCustom(false);
                          }}
                          onMouseEnter={() => {
                            if (filterDateTime === "Custom") {
                              if (!isOpenDateTimeButton) {
                                setIsOpenCustom(true);
                              }
                            }
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
                                  if (i === "Custom") {
                                    setIsOpenCustom(true);
                                  }
                                }}
                              >
                                {i}
                              </button>
                            );
                          })}
                        </div>
                        {isOpenCustom ? (
                          <div className="p-3 sh rounded-2xl absolute z-30 bg-[--light-brown] mt-3">
                            <div className="relative">
                              <DateRangePicker
                                ranges={customDate}
                                staticRanges={[]}
                                onChange={(item) =>
                                  setCustomDate([item.selection])
                                }
                                showSelectionPreview={true}
                                moveRangeOnFirstSelection={false}
                                months={2}
                                rangeColors={["#2d757c"]}
                                color="#f5f3eb"
                                direction="horizontal"
                              />
                              <div className="absolute bottom-0 right-0 flex gap-3 mr-3 mb-3">
                                <button
                                  onClick={() => {
                                    setIsOpenCustom(false);
                                  }}
                                  className="flex justify-center bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                                >
                                  Close
                                </button>
                                <button
                                  onClick={handleSubmitCustom}
                                  className="w-[60px] flex justify-center bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                                >
                                  Ok
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : null}
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
                                  : JSON.stringify(
                                      i.match(/\(([^)]+)\)/g)
                                    ).slice(3, -3)}
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
              <div className="flex flex-col gap-1">
                <div className="w-full justify-between flex items-center">
                  <p className="">
                    <span>Showing </span>
                    <span>{`${
                      filteredReports().length ? lines * page - lines + 1 : 0
                    }-${
                      lines * page > filteredReports().length
                        ? filteredReports().length
                        : lines * page
                    }`}</span>
                    <span> of </span>
                    <span>{filteredReports().length} entries</span>
                  </p>
                  <div className="flex gap-3 items-center">
                    <p>
                      <span>Show </span>
                      <input
                        type="text"
                        value={lines}
                        placeholder="10"
                        className="p-1 w-9 bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                        onBlur={(e) => {
                          if (
                            e.target.value < 10 ||
                            e.target.value > filteredReports().length
                          ) {
                            return setLines(10);
                          }
                          return setLines(e.target.value);
                        }}
                        onChange={(e) => {
                          setPage(1);
                          return setLines(e.target.value);
                        }}
                      />
                      <span> entries</span>
                    </p>
                    <p className="">
                      <span>Page </span>
                      <span>{filteredReports().length === 0 ? 0 : page}</span>
                      <span> of </span>
                      <span>
                        {lines
                          ? Math.ceil(filteredReports().length / lines)
                          : 0}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setPage(page - 1);
                      }}
                      className={`flex justify-between bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] p-1 
                      flex gap-2 items-center justify-center border border-2 border-[--dark-green]  
                      ${
                        page <= 1
                          ? "opacity-50"
                          : "hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                      }`}
                      disabled={page <= 1}
                    >
                      <HiOutlineChevronLeft size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPage(page + 1);
                      }}
                      className={`flex justify-between bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] p-1 
                      flex gap-2 items-center justify-center border border-2 border-[--dark-green]  
                      ${
                        page >= Math.ceil(filteredReports().length / lines)
                          ? "opacity-50"
                          : "hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                      }`}
                      disabled={
                        page >= Math.ceil(filteredReports().length / lines)
                      }
                    >
                      <HiOutlineChevronRight size={18} />
                    </button>
                  </div>
                </div>
                <div className="w-full overflow-x-auto rounded-lg shadow-lg max-h-[560px] overflow-y-auto">
                  <table
                    className="w-full rounded-lg shadow-lg bg-[--light-green] relative"
                    style={{ backgroundColor: "rgba(169, 230, 194, 0.2)" }}
                  >
                    <thead className="sticky top-0 bg-[#e7f1e2]">
                      <tr className="text-sm">
                        {Object.entries(tableCategories).map(
                          ([key, value], k) => {
                            return (
                              <th className="px-0">
                                <div
                                  className={`flex justify-between truncate text-ellipsis text-[--light-brown] font-bold bg-[--dark-green] ${
                                    k === 0
                                      ? "ml-1 my-1 px-5 py-3 rounded-l-lg"
                                      : "my-1 py-3 pr-2"
                                  }
                        ${
                          k === Object.entries(tableCategories).length - 1
                            ? "mr-1 my-1 py-3 rounded-r-lg pr-2"
                            : null
                        }
                        `}
                                >
                                  <span className="">{toHeaderCase(key)}</span>
                                  {sortString[key] ? (
                                    <button
                                      className="px-5"
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
                                      className="px-5"
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
                                </div>
                              </th>
                            );
                          }
                        )}
                      </tr>
                    </thead>
                    <tbody className="max-h-[520px] overflow-y-auto overflow-x-hidden">
                      {filteredReports()?.length === 0 ? (
                        <div
                          className={`${
                            title === "Feedback" ? "ml-[350%]" : "ml-[450%]"
                          } font-bold w-full flex justify-center items-center min-h-[500px]`}
                        >
                          No data...
                        </div>
                      ) : null}
                      {filteredReports()
                        ?.slice(lines * page - lines, lines * page)
                        ?.map((i, k) => {
                          if (title === "Appointment") {
                            return (
                              <tr key={k} className="text-sm font-medium">
                                <td
                                  className={`${
                                    k % 2 ? "pl-1 py-1 pr-0" : null
                                  }`}
                                >
                                  <div
                                    className={`pl-5 py-3 ${
                                      k % 2
                                        ? "bg-[--light-green] rounded-l-lg"
                                        : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={
                                        convertDate(
                                          i["scheduledDate"]
                                            ? i["createdDate"]
                                            : i["start"]
                                        )[1]
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={
                                        convertDate(
                                          i["scheduledDate"]
                                            ? i["createdDate"]
                                            : i["start"]
                                        )[2]
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["userDetails.idNo"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["userDetails.name"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["userDetails.email"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["gc.name"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={
                                        i["mode"] === "facetoface"
                                          ? "Face-to-face"
                                          : "Virtual"
                                      }
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 pl-12 ${
                                      k % 2 ? "bg-[--light-green] h-auto" : null
                                    }`}
                                  >
                                    {/* <ReportsTd value={i["description"]} />{" "} */}
                                    {i["description"] ? (
                                      <button
                                        type="button"
                                        className="flex justify-between w-auto bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] p-y-auto px-1 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                                        onClick={() => {
                                          handleShowLongData(
                                            "Concern Overview",
                                            i["description"]
                                          );
                                        }}
                                      >
                                        <FaEllipsisH size={16} />
                                      </button>
                                    ) : (
                                      <span>N/A</span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["type"]} />{" "}
                                  </div>
                                </td>{" "}
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={toHeaderCase(i["status"])}
                                    />{" "}
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    {/* <ReportsTd value={i["notes"]} /> */}
                                    {i["notes"] ? (
                                      <button
                                        type="button"
                                        className="flex justify-between w-auto bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] p-y-auto px-1 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                                        onClick={() => {
                                          handleShowLongData(
                                            "Notes",
                                            i["notes"]
                                          );
                                        }}
                                      >
                                        <FaEllipsisH size={16} />
                                      </button>
                                    ) : (
                                      <span>N/A</span>
                                    )}
                                  </div>
                                </td>
                                <td
                                  className={`${
                                    k % 2 ? "pr-1 py-1 pl-0" : null
                                  }`}
                                >
                                  <div
                                    className={`py-3 ${
                                      k % 2
                                        ? "bg-[--light-green] rounded-r-lg"
                                        : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={i["userDetails.contactNo"]}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          } else if (title === "Daily User") {
                            return (
                              <tr key={k} className="text-sm font-medium">
                                <td
                                  className={`${
                                    k % 2 ? "pl-1 py-1 pr-0" : null
                                  }`}
                                >
                                  <div
                                    className={`pl-5 py-3 ${
                                      k % 2
                                        ? "bg-[--light-green] rounded-l-lg"
                                        : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={convertDate(i["createdDate"])[1]}
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={convertDate(i["createdDate"])[2]}
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["idNo"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["name"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["credentials.email"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["age"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["department"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green] h-auto" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["gender"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["yearSection"]} />
                                  </div>
                                </td>{" "}
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["type"]} />
                                  </div>
                                </td>
                                <td
                                  className={`${
                                    k % 2 ? "pr-1 py-1 pl-0" : null
                                  }`}
                                >
                                  <div
                                    className={`py-3 ${
                                      k % 2
                                        ? "bg-[--light-green] rounded-r-lg"
                                        : null
                                    }`}
                                  >
                                    <ReportsTd value={i["contactNo"]} />
                                  </div>
                                </td>
                              </tr>
                            );
                          } else if (title === "Feedback") {
                            return (
                              <tr key={k} className="text-sm font-medium">
                                <td
                                  className={`${
                                    k % 2 ? "pl-1 py-1 pr-0" : null
                                  }`}
                                >
                                  <div
                                    className={`pl-5 py-3 ${
                                      k % 2
                                        ? "bg-[--light-green] rounded-l-lg"
                                        : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={convertDate(i["createdDate"])[1]}
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={convertDate(i["createdDate"])[2]}
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["userDetails.idNo"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["userDetails.name"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={i["userDetails.credentials.email"]}
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={i["userDetails.department"]}
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={i["userDetails.yearSection"]}
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green] h-auto" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["rating"]} />
                                  </div>
                                </td>

                                <td
                                  className={`${
                                    k % 2 ? "pr-1 py-1 pl-0" : null
                                  }`}
                                >
                                  <div
                                    className={`py-3 ${
                                      k % 2
                                        ? "bg-[--light-green] rounded-r-lg"
                                        : null
                                    }`}
                                  >
                                    {/* <ReportsTd value={i["feedbackDetails"]} /> */}
                                    {i["feedbackDetails"] ? (
                                      <button
                                        type="button"
                                        className="flex justify-between w-auto bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] p-y-auto px-1 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                                        onClick={() => {
                                          handleShowLongData(
                                            "Feedback Details",
                                            i["feedbackDetails"]
                                          );
                                        }}
                                      >
                                        <FaEllipsisH size={16} />
                                      </button>
                                    ) : (
                                      <span>N/A</span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          } else if (title === "Concern") {
                            return (
                              <tr key={k} className="text-sm font-medium">
                                <td
                                  className={`${
                                    k % 2 ? "pl-1 py-1 pr-0" : null
                                  }`}
                                >
                                  <div
                                    className={`pl-5 py-3 ${
                                      k % 2
                                        ? "bg-[--light-green] rounded-l-lg"
                                        : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={convertDate(i["createdDate"])[1]}
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd
                                      value={convertDate(i["createdDate"])[2]}
                                    />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["idNo"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["name"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["credentials.email"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["age"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["department"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green] h-auto" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["gender"]} />
                                  </div>
                                </td>
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["yearSection"]} />
                                  </div>
                                </td>{" "}
                                <td className="px-0">
                                  <div
                                    className={`py-3 ${
                                      k % 2 ? "bg-[--light-green]" : null
                                    }`}
                                  >
                                    <ReportsTd value={i["concern"]} />
                                  </div>
                                </td>
                                <td
                                  className={`${
                                    k % 2 ? "pr-1 py-1 pl-0" : null
                                  }`}
                                >
                                  <div
                                    className={`py-3 ${
                                      k % 2
                                        ? "bg-[--light-green] rounded-r-lg"
                                        : null
                                    }`}
                                  >
                                    <ReportsTd value={i["contactNo"]} />
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ReportTable;
