import { useEffect, useState } from "react";

import axios from "../api/axios";
import TrainingEditor from "../components/Train/TrainingEditor";

import { FiChevronDown } from "react-icons/fi";
import { FaTimes } from "react-icons/fa";
import QoutesTable from "../components/Train/QoutesTable";

import { motion } from "framer-motion";
import Modal from "../components/Modal";
import Loading from "../components/Loading";

function Train({ auth, toast, socket }) {
  const [trainingData, setTrainingData] = useState();
  const [isGuided, setIsGuided] = useState(true);
  const [isOpenModeDropDown, setIsOpenModeDropDown] = useState(false);
  const [isOpenTrainingModeDropDown, setIsOpenTrainingModeDropDown] =
    useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedMode, setSelectedMode] = useState("Counselor-Guided");
  const [trainingMode, setTrainingMode] = useState("Chatbot");
  const [mode, setMode] = useState("cg");
  const [author, setAuthor] = useState("");
  const [quote, setQuote] = useState("");
  const [id, setId] = useState("");
  const [status, setStatus] = useState(null);

  const [quotes, setQuotes] = useState([]);

  useEffect(() => {
    (async () => {
      await handleGetFiles();
      await getQuotes();
      setIsLoading(false);
    })();
  }, []);

  const handleSubmitAddQuote = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(
          "/api/train/add-quote",
          {
            author,
            quote,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          setIsOpenAddModal(false);
          toast.success(res?.data?.message);
          getQuotes();
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleSubmitEditQuote = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(
          "/api/train/edit-quote",
          {
            author,
            quote,
            id,
            status,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          setIsOpenEditModal(false);
          toast.success(res?.data?.message);
          getQuotes();
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleSubmitUpdateStatusQuote = async (a, q, i, s) => {
    try {
      await axios
        .post(
          "/api/train/edit-quote",
          {
            author: a,
            quote: q,
            id: i,
            status: s,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
          getQuotes();
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleDeleteQuotes = async (array) => {
    try {
      await axios
        .post(
          "/api/train/delete-quotes",
          {
            array,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
          getQuotes();
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

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
  const trainingModes = ["Chatbot", "Qoutes"];

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

  const getQuotes = async () => {
    await axios
      .get("/api/train/get-quotes", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
        },
      })
      .then((res) => {
        setQuotes(res?.data?.quotes);
      })
      .catch((err) => {
        toast.error(err?.response?.data);
      });
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-[--light-brown] h-screen overflow-hidden">
          {isOpenAddModal || isOpenEditModal ? (
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
              animate={isOpenAddModal || isOpenEditModal ? "show" : "hide"}
              initial={{
                opacity: 0,
              }}
            ></motion.div>
          ) : null}

          <form
            className="w-full justify-between flex"
            onSubmit={handleSubmitAddQuote}
          >
            <Modal isOpen={isOpenAddModal}>
              <div className="w-full justify-between flex">
                <p className="text-2xl font-extrabold">Add Quote</p>
                <button
                  onClick={() => {
                    setIsOpenAddModal(false);
                  }}
                  type="button"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-4 mt-5">
                <div className="flex gap-5 w-full">
                  <div className="w-full flex flex-col gap-2">
                    <label htmlFor="name" className="font-semibold">
                      Author *
                    </label>
                    <input
                      id="name"
                      className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold mr-3"
                      type="text"
                      placeholder="Author Name"
                      value={author}
                      onChange={(e) => {
                        setAuthor(e.target.value);
                      }}
                      required
                    />
                    <label htmlFor="email" className="font-semibold">
                      Quote *
                    </label>
                    <input
                      id="idNo"
                      className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                      type="text"
                      placeholder="Aa..."
                      value={quote}
                      onChange={(e) => {
                        setQuote(e.target.value);
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  className="bg-[--dark-green] w-full p-3 text-[--light-brown] text-sm rounded-lg border border-2 border-[--dark-green] 
          hover:bg-transparent hover:text-[--dark-green] transition-all duration-300 font-semibold"
                  type="submit"
                >
                  Submit
                </button>
              </div>
            </Modal>
          </form>
          <form
            className="w-full justify-between flex"
            onSubmit={handleSubmitEditQuote}
          >
            <Modal isOpen={isOpenEditModal}>
              <div className="w-full justify-between flex">
                <p className="text-2xl font-extrabold">Edit Quote</p>
                <button
                  onClick={() => {
                    setIsOpenEditModal(false);
                  }}
                  type="button"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="flex flex-col gap-4 mt-5">
                <div className="flex gap-5 w-full">
                  <div className="w-full flex flex-col gap-2">
                    <label htmlFor="name" className="font-semibold">
                      Author *
                    </label>
                    <input
                      id="name"
                      className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold mr-3"
                      type="text"
                      placeholder="Author Name"
                      value={author}
                      onChange={(e) => {
                        setAuthor(e.target.value);
                      }}
                      required
                    />
                    <label htmlFor="email" className="font-semibold">
                      Quote *
                    </label>
                    <input
                      id="idNo"
                      className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                      type="text"
                      placeholder="Aa..."
                      value={quote}
                      onChange={(e) => {
                        setQuote(e.target.value);
                      }}
                      required
                    />
                  </div>
                </div>

                <button
                  className="bg-[--dark-green] w-full p-3 text-[--light-brown] text-sm rounded-lg border border-2 border-[--dark-green] 
          hover:bg-transparent hover:text-[--dark-green] transition-all duration-300 font-semibold"
                  type="submit"
                >
                  Save Changes
                </button>
              </div>
            </Modal>
          </form>
          <div className="flex flex-col px-52">
            <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
              Train
            </p>
            <div
              className={`flex gap-5 ${
                trainingMode === "Chatbot" ? "justify-between" : "justify-end"
              }`}
            >
              {trainingMode === "Chatbot" ? (
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
              ) : null}
              <div className="hs-dropdown relative inline-flex gap-5">
                <button
                  type="button"
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsOpenTrainingModeDropDown(!isOpenTrainingModeDropDown);
                  }}
                >
                  {trainingMode}
                  <FiChevronDown size={16} />
                </button>
                <div
                  className={`${
                    isOpenTrainingModeDropDown ? "visible" : "hidden"
                  } absolute top-9 right-0 transition-all duration-100 w-[12.6rem]
              z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
                >
                  {trainingModes.map((i, k) => {
                    return (
                      <button
                        key={k}
                        className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                        onClick={() => {
                          setIsOpenTrainingModeDropDown(
                            !isOpenTrainingModeDropDown
                          );
                          setTrainingMode(i);
                        }}
                      >
                        {i}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
            {trainingMode === "Chatbot" ? (
              <TrainingEditor
                trainingData={isGuided ? trainingData?.cG : trainingData?.fC}
                handleSetFiles={handleSetFiles}
                selectedMode={selectedMode}
                handleTrain={handleTrain}
                socket={socket}
              ></TrainingEditor>
            ) : (
              <QoutesTable
                auth={auth}
                toast={toast}
                setIsOpenAddModal={setIsOpenAddModal}
                setAuthor={setAuthor}
                setQuote={setQuote}
                quotes={quotes}
                setQuotes={setQuotes}
                quote={quote}
                author={author}
                setIsOpenEditModal={setIsOpenEditModal}
                setId={setId}
                isOpenEditModal={isOpenEditModal}
                setStatus={setStatus}
                handleSubmitUpdateStatusQuote={handleSubmitUpdateStatusQuote}
                handleDeleteQuotes={handleDeleteQuotes}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Train;
