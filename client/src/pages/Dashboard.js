import { useEffect, useState } from "react";
import axios from "../api/axios";

import { FiChevronDown } from "react-icons/fi";

import UserNumberReport from "../components/Dashboard/UserNumberReport";
import UserDemographics from "../components/Dashboard/UserDemographics";

function Reports({ auth, toast }) {
  const [reports, setReports] = useState([]);
  const [isGuided, setIsGuided] = useState(true);
  const [isOpenModeDropDown, setIsOpenModeDropDown] = useState(false);
  const [selectedMode, setSelectedMode] = useState("Counselor-Guided");

  const mode = ["Counselor-Guided", "Friendly Conversation"];

  useEffect(() => {
    handleGetReports();
  }, []);

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
          setReports(res.data.reports);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  return (
    <div className="bg-[--light-brown] h-full">
      <div className="flex flex-col px-52">
        <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
          Dashboard
        </p>
        <div className="flex gap-5">
          <div className="hs-dropdown relative inline-flex gap-5">
            <button
              type="button"
              className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
              onClick={() => {
                setIsOpenModeDropDown(!isOpenModeDropDown);
              }}
            >
              {selectedMode}
              <FiChevronDown size={16} />
            </button>
            <div
              className={`${
                isOpenModeDropDown ? "visible" : "hidden"
              } absolute top-9 right-0 transition-all duration-100 w-[12.6rem]
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
          </div>
        </div>
        <UserNumberReport data={reports} isGuided={isGuided}></UserNumberReport>
        <UserDemographics data={reports} isGuided={isGuided}></UserDemographics>
      </div>
    </div>
  );
}

export default Reports;
