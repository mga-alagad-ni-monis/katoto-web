import { useEffect, useRef, useState } from "react";
import axios from "../api/axios";
import OutsideClickHandler from "react-outside-click-handler";

import moment from "moment";

import { FiChevronDown } from "react-icons/fi";

import UserNumberReport from "../components/Dashboard/UserNumberReport";
import UserDemographics from "../components/Dashboard/UserDemographics";
import UserConcerns from "../components/Dashboard/UserConcerns";
import AppointmentTable from "../components/Dashboard/AppointmentTable";
import UserFeedbacks from "../components/Dashboard/UserFeedbacks";
import Loading from "../components/Loading";

function Reports({ auth, toast }) {
  const [reports, setReports] = useState([]);
  const [concerns, setConcerns] = useState([]);

  const [isGuided, setIsGuided] = useState(true);
  const [isOpenModeDropDown, setIsOpenModeDropDown] = useState(false);
  const [isOpenDateTimeDropDown, setIsOpenDateTimeDropDown] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMode, setSelectedMode] = useState("Counselor-Guided");
  const [selectedDateTime, setSelectedDateTime] = useState("Last 7d");

  const mode = ["Counselor-Guided", "Friendly Conversation"];
  const dateTime = ["Last 7d", "Last 30d", "Year"];

  useEffect(() => {
    (async () => {
      await handleGetConcerns();
      await handleGetReports();
      setIsLoading(false);
    })();
  }, []);

  const handleGetConcerns = async () => {
    try {
      await axios
        .get("/api/train/get-concerns", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setConcerns(res?.data?.concerns);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleGetReports = async () => {
    try {
      await axios
        .get("/api/reports/reports", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          const newReports = res.data.reports.map((i) => {
            let date = moment(i["date"], "MMMM D, YYYY");
            i["date"] = date.format("MM/DD/YY");
            return i;
          });

          setReports(newReports);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
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
    const newReports = reports?.filter((i) => {
      if (selectedDateTime === "Last 7d") {
        let week = moment();
        week.subtract(1, "weeks");
        return (
          moment(convertDate(week)[1]).isBefore(convertDate(i["date"])[1]) &&
          moment(new Date()).isAfter(convertDate(i["date"])[1])
        );
      } else if (selectedDateTime === "Last 30d") {
        let month = moment();
        month.subtract(1, "months");

        return (
          moment(convertDate(month)[1]).isBefore(convertDate(i["date"])[1]) &&
          moment(new Date()).isAfter(convertDate(i["date"])[1])
        );
      } else if (selectedDateTime === "Year") {
        let year = moment();
        year.subtract(1, "years");
        return (
          moment(convertDate(year)[1]).isBefore(convertDate(i["date"])[1]) &&
          moment(new Date()).isAfter(convertDate(i["date"])[1])
        );
      }
    });

    return newReports;
  };

  const ref = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        // setIsOpenDateTimeDropDown(false);
        setIsOpenModeDropDown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-[--light-brown] h-full">
          <div className="flex flex-col px-52">
            <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
              Dashboard
            </p>
            <AppointmentTable toast={toast} auth={auth}></AppointmentTable>
            <div className="sh rounded-xl p-8 mb-8">
              <div className="flex gap-5 justify-end">
                <div className="flex gap-5">
                  <div className="hs-dropdown relative inline-flex gap-5">
                    <button
                      type="button"
                      className="w-[203px] justify-between bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                      onClick={() => {
                        setIsOpenModeDropDown(!isOpenModeDropDown);
                      }}
                    >
                      {selectedMode}
                      <FiChevronDown size={16} />
                    </button>
                    <OutsideClickHandler
                      onOutsideClick={() => {
                        setIsOpenModeDropDown(false);
                      }}
                    >
                      <div
                        className={`${
                          isOpenModeDropDown ? "visible" : "hidden"
                        } absolute top-9 right-5 transition-all duration-100 w-[12.6rem]
          z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
                      >
                        {mode.map((i, k) => {
                          return (
                            <button
                              key={k}
                              className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                              onClick={() => {
                                if (i === "Counselor-Guided") {
                                  setIsGuided(true);
                                } else {
                                  setIsGuided(false);
                                }
                                setIsOpenModeDropDown(!isOpenModeDropDown);
                                setSelectedMode(i);
                              }}
                            >
                              {i}
                            </button>
                          );
                        })}
                      </div>
                    </OutsideClickHandler>
                  </div>
                </div>
                <div className="flex gap-5">
                  <div className="hs-dropdown relative inline-flex gap-5">
                    <button
                      type="button"
                      className="w-[120px] justify-between bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                      onClick={() => {
                        setIsOpenDateTimeDropDown(!isOpenDateTimeDropDown);
                      }}
                    >
                      {selectedDateTime}
                      <FiChevronDown size={16} />
                    </button>
                    <OutsideClickHandler
                      onOutsideClick={() => {
                        setIsOpenDateTimeDropDown(false);
                      }}
                    >
                      <div
                        className={`${
                          isOpenDateTimeDropDown ? "visible" : "hidden"
                        } absolute top-9 right-5 transition-all duration-100 w-[12.6rem]
          z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
                      >
                        {dateTime.map((i, k) => {
                          return (
                            <button
                              key={k}
                              className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                              onClick={() => {
                                setIsOpenDateTimeDropDown(
                                  !isOpenDateTimeDropDown
                                );
                                setSelectedDateTime(i);
                              }}
                            >
                              {i}
                            </button>
                          );
                        })}
                      </div>
                    </OutsideClickHandler>
                  </div>
                </div>
              </div>
              <div className="flex justify-between w-full mb-1">
                <div className="flex justify-between w-full">
                  <p className="flex text-xl font-extrabold items-center">
                    Daily Active Users
                  </p>
                </div>
              </div>
              <p className="mb-8 text-black/50">
                The number of students who engage in {selectedMode} mode.
              </p>
              <div className="w-full">
                <div className="w-full">
                  <UserNumberReport
                    data={filteredReports()}
                    isGuided={isGuided}
                    selectedMode={selectedMode}
                    selectedDateTime={selectedDateTime}
                  ></UserNumberReport>
                </div>
                <div className="w-full">
                  <UserDemographics
                    data={filteredReports()}
                    isGuided={isGuided}
                  ></UserDemographics>
                </div>
              </div>
            </div>
            <UserConcerns
              data={filteredReports()}
              auth={auth}
              toast={toast}
              concerns={concerns}
            ></UserConcerns>
            <UserFeedbacks
              data={filteredReports()}
              auth={auth}
              toast={toast}
            ></UserFeedbacks>
          </div>
        </div>
      )}
    </>
  );
}

export default Reports;
