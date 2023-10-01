import { useState, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";
import { toHeaderCase } from "js-convert-case";
import Loading from "../Loading";
import axios from "../../api/axios";
import { flatten } from "flat";
import ReportsTd from "./ReportsTd";
import moment from "moment";

function ReportTable({ filters, tableCategories, title, auth }) {
  const [isOpenDateTimeButton, setIsOpenDateTimeButton] = useState(false);
  const [isOpenDepartmentButton, setIsOpenDepartmentButton] = useState(false);
  const [isOpenCollegeButton, setIsOpenCollegeButton] = useState(false);
  const [isOpenYearButton, setIsOpenYearButton] = useState(false);
  const [isOpenSectionButton, setIsOpenSectionButton] = useState(false);
  const [isOpenGenderButton, setIsOpenGenderButton] = useState(false);

  const [filterDateTime, setFilterDateTime] = useState("Today");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterCollege, setFilterCollege] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [filterSection, setFilterSection] = useState("All");
  const [filterGender, setFilterGender] = useState("All");
  const [search, setSearch] = useState("");

  const [reports, setReports] = useState([]);

  useEffect(() => {
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
          if (title === "Appointment") {
            let updatedReports = [];
            res?.data?.reports.forEach((i) => {
              i?.sosAppointments?.forEach((j) => {
                if (auth?.userInfo?.idNo === j?.gc?.idNo) {
                  updatedReports.push(flatten(j));
                }
              });
              i?.standardAppointments?.forEach((k) => {
                if (auth?.userInfo?.idNo === k?.gc?.idNo) {
                  updatedReports.push(flatten(k));
                }
              });
            });
            setReports(updatedReports);
          }
        });
    } catch (err) {
      console.log(err);
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
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
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
                  } absolute top-9 transition-all duration-100
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
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsOpenCollegeButton(!isOpenCollegeButton);
                  }}
                >
                  {filterCollege}
                  <FiChevronDown size={16} />
                </button>
                <div
                  className={`${
                    isOpenCollegeButton ? "visible" : "hidden"
                  } absolute top-9 transition-all duration-100
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
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsOpenDepartmentButton(!isOpenDepartmentButton);
                  }}
                >
                  {filterDepartment}
                  <FiChevronDown size={16} />
                </button>
                <div
                  className={`${
                    isOpenDepartmentButton ? "visible" : "hidden"
                  } absolute top-9 transition-all duration-100
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
                        {i}
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
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
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
                  } absolute top-9 transition-all duration-100
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
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
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
                  } absolute top-9 transition-all duration-100
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
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
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
                  } absolute top-9 transition-all duration-100
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
          <div className="flex items-end">
            <button
              className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
      border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300 ml-10"
              onClick={() => {}}
            >
              <RiFileExcel2Line size={16} />
              Export
            </button>
          </div>
        </div>
      </div>
      <table
        className="w-full rounded-lg shadow-lg bg-[--light-green] relative"
        style={{ backgroundColor: "rgba(169, 230, 194, 0.2)" }}
      >
        {console.log(reports)}
        <thead className="flex px-5 py-3 text-sm text-[--light-brown] font-bold bg-[--dark-green] rounded-lg m-1">
          {Object.entries(tableCategories).map(([key, value]) => {
            return (
              <tr>
                <td className="flex gap-5 items-center">
                  <p className="min-w-[100px] w-auto mr-5 flex justify-start truncate text-ellipsis">
                    {toHeaderCase(key)}
                  </p>
                </td>
              </tr>
            );
          })}
        </thead>
        {console.log(reports)}
        <tbody className="flex flex-col max-h-[624px] overflow-y-auto">
          {reports.length ? (
            reports
              ?.filter((i) => {
                let date = new Date();
                if (filterDateTime === "Today") {
                  return (
                    convertDate(i["start"])[1] ===
                    convertDate(date.toLocaleString())[1]
                  );
                } else if (filterDateTime === "Yesterday") {
                  let yesterday = moment();
                  yesterday.subtract(1, "days");
                  return (
                    convertDate(yesterday)[1] === convertDate(i["start"])[1]
                  );
                } else if (filterDateTime === "Week") {
                  let week = moment();
                  week.subtract(1, "weeks");
                  return (
                    moment(convertDate(week)[1]).isBefore(
                      convertDate(i["start"])[1]
                    ) && moment(new Date()).isAfter(convertDate(i["start"])[1])
                  );
                } else if (filterDateTime === "Month") {
                  let month = moment();
                  month.subtract(1, "months");
                  return (
                    moment(convertDate(month)[1]).isBefore(
                      convertDate(i["start"])[1]
                    ) && moment(new Date()).isAfter(convertDate(i["start"])[1])
                  );
                } else if (filterDateTime === "Year") {
                  let year = moment();
                  year.subtract(1, "years");
                  return (
                    moment(convertDate(year)[1]).isBefore(
                      convertDate(i["start"])[1]
                    ) && moment(new Date()).isAfter(convertDate(i["start"])[1])
                  );
                }
              })
              ?.filter((i) =>
                filterCollege === "All"
                  ? i
                  : filterCollege === i["userDetails.mainDepartment"]
              )
              ?.filter((i) =>
                filterDepartment === "All"
                  ? i
                  : filterDepartment === i["userDetails.department"]
              )
              ?.filter((i) =>
                filterYear === "All"
                  ? i
                  : filterYear === i["userDetails.yearSection"][0]
              )
              ?.filter((i) =>
                filterSection === "All"
                  ? i
                  : filterSection === i["userDetails.yearSection"].slice(2)
              )
              ?.filter((i) =>
                filterGender === "All"
                  ? i
                  : filterGender === i["userDetails.gender"]
              )
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
                      i["gc.name"]
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      i["description"]
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      (i["mode"] === "facetoface" ? "Face-to-face" : "Virtual")
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      i["status"]
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      i["notes"].toLowerCase().includes(search.toLowerCase()) ||
                      i["userDetails.contactNo"]
                        .toLowerCase()
                        .includes(search.toLowerCase())
                    );
                  }
                } else {
                  return i;
                }
              })
              ?.map((i, k) => {
                if (title === "Appointment") {
                  return (
                    <tr key={k}>
                      <td
                        className={`flex font-medium mx-1 px-5 mb-1 py-3 text-sm ${
                          k % 2 ? "bg-[--light-green] rounded-lg" : null
                        }`}
                      >
                        <ReportsTd value={convertDate(i["start"])[1]} />
                        <ReportsTd value={convertDate(i["start"])[2]} />
                        <ReportsTd value={i["userDetails.idNo"]} />
                        <ReportsTd value={i["userDetails.name"]} />
                        <ReportsTd value={i["userDetails.email"]} />
                        <ReportsTd value={i["gc.name"]} />
                        <ReportsTd value={i["description"]} />
                        <ReportsTd
                          value={
                            i["mode"] === "facetoface"
                              ? "Face-to-face"
                              : "Virtual"
                          }
                        />
                        <ReportsTd value={toHeaderCase(i["status"])} />
                        <ReportsTd value={i["notes"]} />
                        <ReportsTd value={i["userDetails.contactNo"]} />
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
