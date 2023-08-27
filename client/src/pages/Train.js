import { useEffect, useState } from "react";

import axios from "../api/axios";
import TrainingEditor from "../components/Train/TrainingEditor";

import { FiChevronDown } from "react-icons/fi";
import { fetchEventSource } from "@microsoft/fetch-event-source";

function Train({ auth, toast, socket }) {
  const [trainingData, setTrainingData] = useState();
  const [isGuided, setIsGuided] = useState(true);
  const [isOpenModeDropDown, setIsOpenModeDropDown] = useState(false);
  const [selectedMode, setSelectedMode] = useState("Counselor-Guided");
  const [mode, setMode] = useState("cg");

  useEffect(() => {
    handleGetFiles();
  }, []);

  const handleGetFiles = async () => {
    try {
      await axios
        .get("/api/train/get-files", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setTrainingData(res?.data?.trainingData);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const modes = ["Counselor-Guided", "Friendly Conversation"];

  const handleSetFiles = async (data, file) => {
    try {
      await axios
        .post(
          "/api/train/set-files",
          { data, mode, file },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleTrain = async () => {
    try {
      socket.emit("train", {
        mode: mode,
        id: socket.id,
      });
    } catch (err) {
      toast.error("Error");
    }
  };

  return (
    <div className="bg-[--light-brown] h-screen">
      <div className="flex flex-col px-52">
        <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">Train</p>
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
              {modes.map((i, k) => {
                return (
                  <button
                    key={k}
                    className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                    onClick={() => {
                      if (i === "Counselor-Guided") {
                        setIsGuided(true);
                        setMode("cg");
                      } else {
                        setIsGuided(false);
                        setMode("fc");
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

        <TrainingEditor
          trainingData={isGuided ? trainingData?.cG : trainingData?.fC}
          handleSetFiles={handleSetFiles}
          selectedMode={selectedMode}
          handleTrain={handleTrain}
          socket={socket}
        ></TrainingEditor>
      </div>
    </div>
  );
}

export default Train;
