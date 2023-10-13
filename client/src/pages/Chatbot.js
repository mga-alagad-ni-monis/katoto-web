import { useState, useRef, useEffect } from "react";
import axios from "../api/axios";
import axiosDef from "axios";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";
import { Rating, RoundedStar, ThinStar } from "@smastrom/react-rating";
import "@smastrom/react-rating/style.css";

import { IoSend } from "react-icons/io5";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { MdSos, MdOutlinePending } from "react-icons/md";
import { FaTimes } from "react-icons/fa";

import {
  BsCalendar4Week,
  BsClockHistory,
  BsCalendarPlus,
  BsPatchCheck,
} from "react-icons/bs";

import Modal from "../components/Modal";
import CalendarComponent from "../components/Calendar/CalendarComponent";
import katoto from "../assets/katoto/katoto-full.png";
import katotoWatch from "../assets/katoto/katoto-watch.png";
import logo from "../assets/logo/katoto-logo.png";
import wave from "../assets/wave.png";

import NotificationModal from "../components/Notifications/NotificationModal";
import Loading from "../components/Loading";

function Chatbot({ toast, auth, socket }) {
  const [isInitial, setIsInitial] = useState(true);
  const [isGuided, setIsGuided] = useState(false);
  const [isFriendly, setIsFriendly] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [popUpSOS, setPopUpSOS] = useState(false);
  const [popUpStandard, setPopUpStandard] = useState(false);
  const [isOpenStandardAppoint, setIsOpenStandardAppoint] = useState(false);
  const [isOpenNotificationModal, setIsOpenNotificationModal] = useState(false);
  const [isAppointmentChecked, setIsAppointmentChecked] = useState(false);
  const [isOpenFeedbackModal, setIsOpenFeedbackModal] = useState(false);
  const [isOpenPolicyModal, setIsOpenPolicyModal] = useState(false);
  const [isAcceptedPolicy, setIsAcceptedPolicy] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [katotoMessage, setKatotoMessage] = useState("");
  const [inputFriendly, setInputFriendly] = useState("");
  const [appointmentDateStart, setAppointmentDateStart] = useState("");
  const [appointmentDateEnd, setAppointmentDateEnd] = useState("");
  const [description, setDescription] = useState("");
  const [preferredGC, setPreferredGC] = useState("");
  const [preferredMode, setPreferredMode] = useState("facetoface");

  const [guidedButtons, setGuidedButtons] = useState([]);
  const [messages, setMessages] = useState([]);
  const [friendlyMessages, setFriendlyMessages] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [gcNames, setGcNames] = useState([]);

  const [sosDetails, setSosDetails] = useState({});
  const [standardDetails, setStandardDetails] = useState({});
  const [appointmentDetails, setAppointmentDetails] = useState({});
  const [quote, setQuote] = useState({});

  const [sosNo, setSosNo] = useState(0);
  const [rating, setRating] = useState(0);
  const [descRefLen, setDescRefLen] = useState(0);

  const bottomRef = useRef(null);
  const descRef = useRef();
  const feedbackRef = useRef();
  const friendlyMsgRef = useRef();

  useEffect(() => {
    (async () => {
      await getBookedAppointments();
      await getGCName();
      await getQuote();
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("studentScheduleResponse", (details) => {
        getBookedAppointments();
        setSosNo(0);
        setPopUpSOS(false);
        setIsOpenStandardAppoint(false);
        setDescRefLen(0);
        if (details.appointmentDetails.type === "sos") {
          setSosDetails(details);
        } else if (details.appointmentDetails.type === "standard") {
          setStandardDetails(details);
        }
      });

      socket.on("hasPending", (message) => {
        toast.error(message.appointmentDetails);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (Object.keys(sosDetails).length !== 0) {
      setIsOpenNotificationModal(true);
    }
  }, [sosDetails]);

  useEffect(() => {
    if (Object.keys(standardDetails).length !== 0) {
      setIsOpenNotificationModal(true);
    }
  }, [standardDetails]);

  useEffect(() => {
    handleGetConversation();
    if (!isInitial) {
      handleSubmitMessage(
        auth.accessToken,
        isGuided
          ? {
              title: "Hi",
              payload: "initial",
            }
          : "Hi"
      );
    }
  }, [isInitial]);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, guidedButtons, friendlyMessages]);

  const getGCName = async () => {
    try {
      await axios
        .get("/api/accounts/get-gc", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setGcNames(res?.data?.names);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const getBookedAppointments = async () => {
    try {
      await axios
        .get("/api/appointments/get-booked", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setBookedAppointments(convertToDateObject(res?.data?.appointments));
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const convertToDateObject = (appointments) => {
    const result = appointments.map((i) => {
      return {
        start: moment(i.start).toDate(),
      };
    });

    return result;
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

  const handleGetConversation = async (req, res) => {
    try {
      await axios
        .get("/api/logs/get/student", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setMessages(res?.data?.conversation);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleSubmitMessage = async (sender, inputMessage) => {
    try {
      let msg = friendlyMsgRef.current.value;
      friendlyMsgRef.current.value = "";
      setGuidedButtons([]);
      setInputFriendly("");
      setIsTyping(true);
      setMessages([...messages, { sender, message: inputMessage.title }]);
      setFriendlyMessages([
        ...friendlyMessages,
        {
          sender,
          message: msg ? msg : inputMessage,
        },
      ]);

      axios
        .post(
          isGuided
            ? process.env.REACT_APP_KATOTO_CG_API_URI
            : process.env.REACT_APP_KATOTO_FC_API_URI,
          {
            sender,
            message: isGuided ? inputMessage.title : msg ? msg : inputMessage,
          }
        )
        .then(async (res) => {
          res.data[0].text =
            res.data[0].custom !== undefined
              ? res.data[0].custom.text
              : res.data[0].text;

          if (isGuided) {
            const buttons = res.data[0].buttons.map((i) => {
              return i;
            });

            setKatotoMessage(res.data[0].text);
            setTimeout(() => {
              setMessages([
                ...messages,
                { sender, message: inputMessage.title },
                { sender: "Katoto", message: res.data[0].text },
              ]);
              setIsTyping(false);
              setTimeout(() => {
                setGuidedButtons(buttons);
              }, 1000);
            }, 900);

            let isProblem = false;

            if (inputMessage.payload === "Mga Problema") {
              isProblem = true;
            }

            await axios
              .post(
                "/api/logs/send",
                {
                  studentMessage: { sender, message: inputMessage.title },
                  katotoMessage: {
                    sender: "Katoto",
                    message: res.data[0].text,
                  },
                  isGuided,
                  credentials: auth?.userInfo,
                  isProblem,
                },
                {
                  withCredentials: true,
                  headers: {
                    Authorization: `Bearer ${auth?.accessToken}`,
                  },
                }
              )
              .then((res) => {
                setKatotoMessage("");
                return;
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            setKatotoMessage(res.data[0].text);
            setTimeout(() => {
              setFriendlyMessages([
                ...friendlyMessages,
                {
                  sender,
                  message: msg ? msg : inputMessage,
                },
                { sender: "Katoto", message: res.data[0].text },
              ]);
              setIsTyping(false);
              if (res.data[0].custom !== undefined) {
                setTimeout(() => {
                  setPopUpSOS(res.data[0].custom.opensos);
                }, 900);
              }
            }, 900);

            await axios
              .post(
                "/api/logs/send",
                {
                  studentMessage: { sender },
                  isGuided,
                  credentials: auth?.userInfo,
                },
                {
                  withCredentials: true,
                  headers: {
                    Authorization: `Bearer ${auth?.accessToken}`,
                  },
                }
              )
              .then((res) => {
                setKatotoMessage("");
                return;
              })
              .catch((err) => {
                console.log(err);
              });
          }
        })
        .catch((err) => {
          console.log(err);
          toast.error("Error");
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleClickSOS = async () => {
    try {
      socket.emit("scheduleRequest", {
        id: socket.id,
        token: auth?.accessToken,
        type: "sos",
        mode: preferredMode,
        gc: gcNames.filter((i) => i.idNo === preferredGC)[0],
        creator: auth?.userInfo?.idNo,
        description: description,
      });
    } catch (err) {
      toast.error("Error");
    }
  };

  const convertDateAppointment = (date, hours, minutes) => {
    const date_object = new Date(date);

    date_object.setHours(hours);
    date_object.setMinutes(minutes);
    date_object.setSeconds(0);

    return date_object.toLocaleString();
  };

  const handleSetStandardAppointment = async () => {
    try {
      if (
        isAppointmentChecked &&
        appointmentDateStart !== "" &&
        appointmentDateEnd !== "" &&
        preferredGC !== "" &&
        preferredMode !== ""
      ) {
        try {
          socket.emit("scheduleRequest", {
            id: socket.id,
            token: auth?.accessToken,
            type: "standard",
            start: appointmentDateStart,
            end: appointmentDateEnd,
            gc: gcNames.filter((i) => i.idNo === preferredGC)[0],
            mode: preferredMode,
            creator: auth?.userInfo?.idNo,
            description: descRef.current.value,
          });
          descRef.current.value = "";
        } catch (err) {
          toast.error("Error");
        }
      } else {
        toast.error("Please check the details");
      }
    } catch (err) {}
  };

  const availableTime = [
    { no: "8", time: "8:00:00 AM" },
    { no: "9", time: "9:00:00 AM" },
    { no: "10", time: "10:00:00 AM" },
    { no: "11", time: "11:00:00 AM" },
    { no: "13", time: "1:00:00 PM" },
    { no: "14", time: "2:00:00 PM" },
  ];

  const handleSendFeedback = async () => {
    if (rating !== 0) {
      try {
        await axios
          .post(
            "/api/feedbacks/send",
            {
              feedbackDetails: feedbackRef.current.value,
              rating: rating,
              userInfo: auth?.userInfo,
            },
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${auth?.accessToken}`,
              },
            }
          )
          .then((res) => {
            feedbackRef.current.value = "";
            setRating(0);
            setIsOpenFeedbackModal(false);
            toast.success(res?.data?.message);
          })
          .catch((err) => {
            toast.error(err?.response?.data);
          });
        descRef.current.value = "";
      } catch (err) {
        toast.error("Error");
      }
    } else {
      toast.error("Please rate!");
    }
  };

  const getQuote = async () => {
    await axios
      .get("/api/train/get-quote", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${auth?.accessToken}`,
        },
      })
      .then((res) => {
        setQuote(res?.data?.quote);
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
        <>
          {isOpenNotificationModal ||
          popUpSOS ||
          popUpStandard ||
          isOpenStandardAppoint ||
          isOpenFeedbackModal ||
          isOpenPolicyModal ? (
            <motion.div
              className="bg-black/50 absolute w-screen h-screen z-50 overflow-hidden"
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
              animate={
                isOpenNotificationModal ||
                popUpSOS ||
                popUpStandard ||
                isOpenStandardAppoint ||
                isOpenFeedbackModal ||
                isOpenPolicyModal
                  ? "show"
                  : "hide"
              }
              initial={{
                opacity: 0,
              }}
            ></motion.div>
          ) : null}

          <Modal isOpen={isOpenNotificationModal}>
            {(() => {
              let newAppointmentDetails = {};
              if (sosDetails?.appointmentDetails?.type === "sos") {
                newAppointmentDetails["details"] =
                  sosDetails?.appointmentDetails;
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="SOS Appointment"
                    status={sosDetails?.appointmentDetails?.status}
                    icon={<MdSos size={48} />}
                    description={`<span style="font-weight: bold;">You </span>have successfully <span style="font-weight: bold;">booked </span>an <span style="font-weight: bold;">SOS appointment</span>. You can come to PLV Guidance Counseling Center anytime, and you will be entertained first.`}
                    appointmentDetails={newAppointmentDetails}
                    dateTime={
                      "You can come anytime at PLV Guidance Counseling Center, and you will be entertained first"
                    }
                    isDisplay={true}
                    handleDeleteNotification={null}
                    handleDeleteLocal={null}
                  />
                );
              } else if (
                standardDetails?.appointmentDetails?.type === "standard"
              ) {
                newAppointmentDetails["details"] =
                  standardDetails?.appointmentDetails;
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="Pending Regular Appointment"
                    status={standardDetails?.appointmentDetails?.status}
                    icon={<MdOutlinePending size={48} />}
                    description={`<span style="font-weight: bold;">You </span> have <span style="font-weight: bold;">pending </span> regular appointment on <span style="font-weight: bold;">${
                      convertDate(standardDetails?.appointmentDetails?.start)[0]
                    } to ${
                      convertDate(standardDetails?.appointmentDetails?.end)[2]
                    }</span>`}
                    appointmentDetails={newAppointmentDetails}
                    dateTime={
                      <div className="flex gap-4">
                        {<BsCalendar4Week size={24} />}
                        <p>
                          {
                            convertDate(
                              standardDetails?.appointmentDetails?.start
                            )[1]
                          }
                        </p>
                        <div className="border-[1px] border-black/20 border-right"></div>
                        {<BsClockHistory size={24} />}
                        <p>
                          {
                            convertDate(
                              standardDetails?.appointmentDetails?.start
                            )[2]
                          }{" "}
                          to{" "}
                          {
                            convertDate(
                              standardDetails?.appointmentDetails?.end
                            )[2]
                          }
                        </p>
                        <p>45 mins</p>
                      </div>
                    }
                    isDisplay={true}
                    handleDeleteNotification={null}
                    handleDeleteLocal={null}
                  />
                );
              }
            })()}
          </Modal>
          <Modal isOpen={popUpSOS}>
            <div className="w-full justify-between flex">
              <p className="text-2xl font-extrabold">SOS Appointment</p>

              <button
                onClick={() => {
                  setPopUpSOS(false);
                  setSosNo(0);
                  setDescription("");
                  setPreferredMode("facetoface");
                  setIsAppointmentChecked(false);
                  setDescRefLen(0);
                }}
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>
            {(() => {
              if (sosNo === 0) {
                return (
                  <div>
                    <p className="my-5">
                      <span className="text-black font-bold">TAKE NOTE:</span>{" "}
                      If you are experiencing any{" "}
                      <span className="text-black font-bold">
                        emotional distress
                      </span>
                      , please know that you are not alone. PLV guidance
                      counselors are available to provide support and guidance.
                      You can reach them by clicking the "Next" button below to
                      set an{" "}
                      <span className="text-black font-bold">
                        SOS appointment
                      </span>
                      .
                    </p>
                    <div className="flex w-full justify-end">
                      <button
                        className="bg-[--dark-green] border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green]
                rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
                border border-2 transition-all duration-300"
                        onClick={() => {
                          setSosNo(sosNo + 1);
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                );
              } else if (sosNo === 1) {
                return (
                  <div>
                    <p className="my-5">
                      Please describe your concern and choose mode
                    </p>
                    <div className="flex gap-5 mb-5">
                      <div>
                        <p className="text-[--dark-green] font-bold flex items-center mb-3 justify-between  ">
                          Concern{" "}
                          <span className="text-[8px] text-[--red]">
                            {200 - descRefLen} character(s) left
                          </span>
                        </p>
                        <textarea
                          className="w-auto h-[46px] bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 
              p-3 font-semibold resize-none"
                          placeholder="Describe your concern..."
                          maxLength={200}
                          ref={descRef}
                          onChange={() => {
                            setTimeout(() => {
                              setDescRefLen(descRef.current.value.length);
                            }, 1000);
                          }}
                        ></textarea>
                      </div>

                      <div>
                        <p className="text-[--dark-green] font-bold flex items-center mb-3">
                          Mode
                        </p>
                        <select
                          id="mode"
                          className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                          value={preferredMode}
                          onChange={(e) => {
                            setPreferredMode(e.target.value);
                          }}
                          required
                        >
                          <option value="facetoface" defaultValue>
                            Face-to-face
                          </option>
                          <option value="virtual">Virtual</option>
                        </select>
                      </div>
                      <div>
                        <p className="text-[--dark-green] font-bold flex items-center mb-3 ">
                          Guidance Counselor
                        </p>
                        <p>
                          {
                            gcNames.filter((i) => i.idNo === preferredGC)[0]
                              ?.name
                          }
                        </p>
                        {/* <select
                id="guidanceCounselors"
                className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                value={preferredGC}
                onChange={(e) => {
                  setPreferredGC(e.target.value);
                }}
                required
              >
                {gcNames.map((i, k) => {
                  return (
                    <option
                      defaultValue={i?.assignedCollege?.includes(
                        auth?.userInfo?.mainDepartment
                      )}
                      value={i.idNo}
                      key={k}
                    >
                      {i.name}
                    </option>
                  );
                })}
              </select> */}
                      </div>
                    </div>
                    <div className="flex w-full justify-end">
                      <button
                        className="bg-[--dark-green] border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green]
                rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
                border border-2 transition-all duration-300"
                        onClick={() => {
                          setSosNo(sosNo + 1);
                          setDescription(descRef.current.value);
                        }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div className="flex flex-col gap-4 mt-5 items-center text-center text-md">
                    <div className="flex gap-5 mb-3">
                      <input
                        id="checkbox-1"
                        className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 mt-1
   checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
   float-left cursor-pointer appearance-none border border-solid border-2  border-[--light-gray] checked:border-[--light-gray] checked:border-2 bg-[--light-gray] 
   bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
   after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['✔'] 
   checked:bg-[--dark-green] checked:after:opacity-100"
                        type="checkbox"
                        style={{
                          fontFamily: "FontAwesome",
                        }}
                        checked={isAppointmentChecked ? true : false}
                        onChange={() => {
                          setIsAppointmentChecked(!isAppointmentChecked);
                        }}
                      />
                      <p
                        className="w-fit cursor-pointer text-left"
                        onClick={() => {
                          setIsAppointmentChecked(!isAppointmentChecked);
                        }}
                      >
                        By ticking the box, you hereby acknowledge and consent
                        to the use of your personal information for scheduling
                        appointments with our mental health chatbot.
                      </p>
                    </div>
                    <div className="w-auto">
                      {isAppointmentChecked ? (
                        <button
                          className="bg-[--red] rounded-full p-1 text-white border border-2 border-[--red] hover:bg-transparent hover:text-[--red] 
              transition-all duration-300"
                          onClick={() => {
                            handleClickSOS();
                            setDescription("");
                            setPreferredMode("facetoface");
                            setIsAppointmentChecked(false);
                            setDescription("");
                          }}
                        >
                          <MdSos size={160} />
                        </button>
                      ) : (
                        <button
                          className="bg-[--red] rounded-full p-1 text-white border border-2 border-[--red] opacity-50"
                          disabled
                        >
                          <MdSos size={160} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            })()}
          </Modal>
          <Modal isOpen={popUpStandard} isCalendar={true}>
            <div className="w-full justify-between flex">
              <p className="text-2xl font-extrabold">Pick a date</p>
              <button
                onClick={() => {
                  setPopUpStandard(false);
                }}
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-5 items-center text-center text-md">
              <CalendarComponent
                setIsOpenStandardAppoint={setIsOpenStandardAppoint}
                setPopUpStandard={setPopUpStandard}
                setAppointmentDetails={setAppointmentDetails}
              ></CalendarComponent>
            </div>
          </Modal>
          <Modal isOpen={isOpenStandardAppoint}>
            <div className="w-full justify-between flex">
              <p className="text-2xl font-extrabold">Regular Appointment</p>
              <button
                onClick={() => {
                  setIsOpenStandardAppoint(false);
                  setPopUpStandard(true);
                  setAppointmentDateStart("");
                  setAppointmentDateEnd("");
                  setIsAppointmentChecked(false);
                  setDescRefLen(0);
                }}
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="mt-4">
              <div className="flex items-center gap-5">
                <p className="text-[--dark-green] font-bold flex items-center mb-3">
                  Appointment Details
                </p>
              </div>
              <div className="bg-black/10 w-full h-auto p-3 rounded-lg mb-5">
                <div className="flex gap-4">
                  <BsCalendar4Week size={24} />
                  <p>{convertDate(appointmentDetails?.start)[1]}</p>
                  <div className="border-[1px] border-black/20 border-right"></div>
                  <BsClockHistory size={24} />
                  <p>
                    {appointmentDateStart
                      ? `${new Date(
                          appointmentDateStart
                        ).toLocaleTimeString()} - ${new Date(
                          appointmentDateEnd
                        ).toLocaleTimeString()}`
                      : "00:00:00"}
                  </p>
                  <p>45 mins</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-5 mb-5 gap-y-3">
                {availableTime.map((i, k) => {
                  return bookedAppointments.some(
                    (j) =>
                      `${new Date(
                        appointmentDetails?.start
                      ).toLocaleDateString()}, ${i.time}` ===
                      new Date(j.start).toLocaleString()
                  ) ? (
                    <button
                      key={k}
                      className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] transition-all duration-300 opacity-50"
                      disabled
                    >
                      {i.time}
                    </button>
                  ) : (
                    <button
                      key={k}
                      className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                      onClick={() => {
                        setAppointmentDateStart(
                          convertDateAppointment(
                            new Date(
                              convertDate(appointmentDetails?.start)[1]
                            ).toLocaleString(),
                            i.no,
                            0
                          )
                        );
                        setAppointmentDateEnd(
                          convertDateAppointment(
                            new Date(
                              convertDate(appointmentDetails?.start)[1]
                            ).toLocaleString(),
                            i.no,
                            45
                          )
                        );
                      }}
                    >
                      {i.time}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-5 mb-5">
                <div>
                  <p className="text-[--dark-green] font-bold flex items-center mb-3 justify-between  ">
                    Concern{" "}
                    <span className="text-[8px] text-[--red]">
                      {200 - descRefLen} character(s) left
                    </span>
                  </p>
                  <textarea
                    className="w-auto h-[46px] bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 
              p-3 font-semibold resize-none"
                    placeholder="Describe your concern..."
                    ref={descRef}
                    maxLength={200}
                    onChange={() => {
                      setTimeout(() => {
                        setDescRefLen(descRef.current.value.length);
                      }, 1000);
                    }}
                  ></textarea>
                </div>

                <div>
                  <p className="text-[--dark-green] font-bold flex items-center mb-3">
                    Mode
                  </p>
                  <select
                    id="mode"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={preferredMode}
                    onChange={(e) => {
                      setPreferredMode(e.target.value);
                    }}
                    required
                  >
                    <option value="facetoface" defaultValue>
                      Face-to-face
                    </option>
                    <option value="virtual">Virtual</option>
                  </select>
                </div>
                <div>
                  <p className="text-[--dark-green] font-bold flex items-center mb-3 ">
                    Guidance Counselor
                  </p>

                  <p>
                    {gcNames.filter((i) => i.idNo === preferredGC)[0]?.name}
                  </p>
                  {/* <select
                id="guidanceCounselors"
                className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                value={preferredGC}
                onChange={(e) => {
                  setPreferredGC(e.target.value);
                }}
                required
              >
                {gcNames.map((i, k) => {
                  return (
                    <option
                      defaultValue={i?.assignedCollege?.includes(
                        auth?.userInfo?.mainDepartment
                      )}
                      value={i.idNo}
                      key={k}
                    >
                      {i.name}
                    </option>
                  );
                })}
              </select> */}
                </div>
              </div>
              <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                Your Details
              </p>
              <table className="mb-5 text-xs">
                <tr>
                  <td className="w-[150px] flex justify-start">Name</td>
                  <td>{auth?.userInfo?.name}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">Gender</td>
                  <td>{auth?.userInfo?.gender}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">Email</td>
                  <td>{auth?.userInfo?.credentials?.email}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start"> ID Number</td>
                  <td> {auth?.userInfo?.idNo}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">Course</td>
                  <td>{auth?.userInfo?.department}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">
                    Year and Section
                  </td>
                  <td>{auth?.userInfo?.yearSection}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">College</td>
                  <td>{auth?.userInfo?.mainDepartment}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">Phone</td>
                  <td>{auth?.userInfo?.contactNo}</td>
                </tr>
              </table>
              <div className="flex gap-5 mb-5">
                <input
                  id="checkbox-1"
                  className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 mt-1
   checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
   float-left cursor-pointer appearance-none border border-solid border-2  border-[--light-gray] checked:border-[--light-gray] checked:border-2 bg-[--light-gray] 
   bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
   after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['✔'] 
   checked:bg-[--dark-green] checked:after:opacity-100"
                  type="checkbox"
                  style={{
                    fontFamily: "FontAwesome",
                  }}
                  checked={isAppointmentChecked ? true : false}
                  onChange={() => {
                    setIsAppointmentChecked(!isAppointmentChecked);
                  }}
                />
                <p
                  className="w-fit cursor-pointer"
                  onClick={() => {
                    setIsAppointmentChecked(!isAppointmentChecked);
                  }}
                >
                  By ticking the box, you hereby acknowledge and consent to the
                  use of your personal information for scheduling appointments
                  with our mental health chatbot.
                </p>
              </div>
              <div className="flex justify-end gap-5">
                <button
                  className="bg-[--red] border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red]
                rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
                border border-2 transition-all duration-300"
                  onClick={() => {
                    setIsOpenStandardAppoint(false);
                    setPopUpStandard(true);
                    setIsAppointmentChecked(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={`${
                    isAppointmentChecked
                      ? "hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green]"
                      : "opacity-50"
                  } bg-[--dark-green] border-[--dark-green]  rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 transition-all duration-300`}
                  onClick={handleSetStandardAppointment}
                  disabled={isAppointmentChecked ? false : true}
                >
                  Submit
                </button>
              </div>
            </div>
          </Modal>
          <Modal isOpen={isOpenFeedbackModal} isCalendar={true}>
            <div className="w-full justify-between flex">
              <p className="text-2xl font-extrabold">Give Feedback</p>
              <button
                onClick={() => {
                  setIsOpenFeedbackModal(false);
                  feedbackRef.current.value = "";
                  setRating(0);
                }}
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>

            <div className="mt-4">
              <div>
                <p>How's your experience with Katoto? Share with us!</p>
              </div>
              <div className="w-full justify-center flex mt-10">
                <Rating
                  style={{ width: 500, gap: "30px" }}
                  value={rating}
                  onChange={setRating}
                  itemStyles={{
                    itemShapes: RoundedStar,
                    activeFillColor: "#f0ad4e",
                    inactiveFillColor: "rgba(240, 173, 78, 0.5)",
                  }}
                />
              </div>
              <div className="mt-10">
                <p className="font-bold text-sm">
                  What are the main reasons for your rating?
                </p>
                <textarea
                  className="mt-3 mb-5 w-full h-[150px] bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 
              p-3 font-semibold resize-none"
                  placeholder="Tell us your reasons..."
                  maxLength={1000}
                  ref={feedbackRef}
                ></textarea>
              </div>
              <div className="flex justify-end gap-5">
                <button
                  className="bg-[--red] border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red]
                rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
                border border-2 transition-all duration-300"
                  onClick={() => {
                    setIsOpenFeedbackModal(false);
                    feedbackRef.current.value = "";
                    setRating(0);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={
                    "hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] bg-[--dark-green] border-[--dark-green]  rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center border border-2 transition-all duration-300"
                  }
                  onClick={handleSendFeedback}
                >
                  Submit
                </button>
              </div>
            </div>
          </Modal>
          <Modal isOpen={isOpenPolicyModal}>
            <div className="w-full justify-between flex">
              <p className="text-2xl font-extrabold">Privacy Policy</p>

              <button
                onClick={() => {
                  setIsOpenPolicyModal(false);
                  setIsAcceptedPolicy(false);
                  setIsGuided(false);
                  setIsFriendly(false);
                }}
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="text-sm mt-5 flex flex-col gap-3">
              <p className="indent-10">
                This Privacy Policy outlines the practices and procedures for
                collecting, using, and safeguarding data in the context of our
                mental health assessment for students using Katoto. By checking
                the box below, you provide your consent for us to collect and
                process certain categories of personal data.
              </p>
              <p className="indent-10">
                We collect various details, including names, dates of birth,
                contact information (such as email addresses and phone numbers),
                educational institution details, and other relevant profile
                information. Additionally, we gather data related to mental
                health, including counselor-guided conversations, session notes
                with mental health advocates/guidance counselors, and any
                additional information voluntarily provided concerning mental
                health concerns.
              </p>
              <p className="indent-10">
                The primary purposes of collecting and processing this data are
                to provide improved mental health assessments for students,
                identify potential mental health concerns, and enhance our
                services. This valuable information is only accessible to our
                team of guidance counselors at PLV.
              </p>
              <p className="indent-10">
                Ensuring the security of your data is of utmost importance to
                us. We have implemented up-to-date security measures to ensure
                the safety of your data.
              </p>
              <p className="indent-10">
                You have certain rights regarding your data, including the right
                to access, correct, or delete your personal data, the right to
                withdraw consent for data processing (if applicable), the right
                to object to data processing, and the right to file a complaint
                with a data protection authority.
              </p>
              <p className="indent-10">
                If you have any questions or concerns regarding this Privacy
                Policy or the data we collect, please do not hesitate to provide
                a feedback.
              </p>
            </div>
            {isGuided || isFriendly ? (
              <>
                <div className="flex gap-5 mb-3 text-sm mt-5">
                  <input
                    id="checkbox-1"
                    className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 mt-1
   checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
   float-left cursor-pointer appearance-none border border-solid border-2  border-[--light-gray] checked:border-[--light-gray] checked:border-2 bg-[--light-gray] 
   bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
   after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['✔'] 
   checked:bg-[--dark-green] checked:after:opacity-100"
                    type="checkbox"
                    style={{
                      fontFamily: "FontAwesome",
                    }}
                    checked={isAcceptedPolicy ? true : false}
                    onChange={() => {
                      setIsAcceptedPolicy(!isAcceptedPolicy);
                    }}
                  />
                  <p
                    className="w-fit cursor-pointer text-left"
                    onClick={() => {
                      setIsAcceptedPolicy(!isAcceptedPolicy);
                    }}
                  >
                    By ticking the box, you acknowledge that you have read and
                    understood this Privacy Policy and consent to the collection
                    and processing of your personal data as described herein.
                  </p>
                </div>
                <div className="w-full flex justify-end">
                  <button
                    className={`${
                      isAcceptedPolicy
                        ? "hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green]"
                        : "opacity-50"
                    } bg-[--dark-green] border-[--dark-green]  rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 transition-all duration-300`}
                    disabled={isAcceptedPolicy ? false : true}
                    onClick={() => {
                      setIsOpenPolicyModal(false);
                      setIsInitial(false);
                    }}
                  >
                    Submit
                  </button>
                </div>
              </>
            ) : null}
          </Modal>
          <div className="flex items-center bg-[--light-brown] justify-center h-screen">
            <div className="flex items-center gap-32">
              <div className="relative">
                <img
                  src={katotoWatch}
                  alt="katoto"
                  className="h-[270px] absolute -top-[250px] right-1/2 translate-x-1/2"
                />
                <div className="h-max w-[350px] bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg pt-10 pb-5 px-5">
                  <p className="text-2xl font-extrabold flex justify-center mb-5">
                    Quote of the Day
                  </p>
                  <div className="bg-[--light-green] p-5 rounded-lg text-center text-base">
                    <p>{quote?.quote}</p>
                    <p className="font-semibold mt-2 italic">{quote?.author}</p>
                  </div>
                </div>
              </div>
              <div className="h-[510px] w-[600px] bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg">
                <div className="relative h-max">
                  <div className="h-20 rounded-t-xl flex bg-[--light-green] items-center justify-between px-8">
                    <div className="flex gap-5 py-3 items-center">
                      <img src={logo} alt="logo" className="h-[50px] z-20" />
                      <div className="flex flex-col justify-center">
                        <p className="text-xs font-medium z-20">
                          Tara kuwentuhan! kasama si
                        </p>
                        <p className="text-xl font-extrabold z-20">KATOTO</p>
                      </div>
                    </div>
                    <div className="z-30 flex gap-6 justify-center">
                      <button
                        className="bg-[--dark-green] rounded-full p-1 text-white p-2 border border-2 border-[--dark-green] 
                  hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                        onClick={() => {
                          descRef.current.value = "";
                          setDescRefLen(0);
                          setPopUpStandard(true);
                          setIsOpenNotificationModal(false);
                          setPreferredGC(
                            gcNames?.filter((i) =>
                              i?.assignedCollege?.includes(
                                auth?.userInfo?.mainDepartment
                              )
                            )[0]?.idNo
                          );
                        }}
                      >
                        <BsCalendarPlus size={24} />
                      </button>
                      <button
                        className="bg-[--red] rounded-full p-1 text-white border border-2 border-[--red] hover:bg-transparent 
                  hover:text-[--red] transition-all duration-300"
                        onClick={() => {
                          setPreferredGC(
                            gcNames?.filter((i) =>
                              i?.assignedCollege?.includes(
                                auth?.userInfo?.mainDepartment
                              )
                            )[0]?.idNo
                          );
                          setPopUpSOS(true);
                        }}
                      >
                        <MdSos size={34} />
                      </button>
                      <button
                        className="z-20"
                        onClick={() => {
                          setIsTyping(false);
                          setIsGuided(false);
                          setIsFriendly(false);
                          setIsInitial(true);
                          setFriendlyMessages([]);
                        }}
                      >
                        <AiOutlineCloseCircle size={26} />
                      </button>
                    </div>
                  </div>
                  <img src={wave} className="w-full absolute top-12" alt="" />
                </div>
                <div className="flex flex-col justify-between h-[430px]">
                  {isInitial ? (
                    <div className="px-5 pt-10 pb-5 h-full flex items-end justify-center relative">
                      <motion.div
                        variants={{
                          hidden: { opacity: 1, scale: 0 },
                          visible: {
                            opacity: 1,
                            scale: 1,
                            transition: {
                              delayChildren: 0.8,
                              staggerChildren: 0.2,
                            },
                          },
                        }}
                        initial="hidden"
                        animate="visible"
                        className="flex flex-col gap-3 items-center list-none mb-5"
                      >
                        <motion.li
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: {
                              y: 0,
                              opacity: 1,
                            },
                          }}
                        >
                          <p className="text-xs">Click to choose</p>
                        </motion.li>
                        <motion.li
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: {
                              y: 0,
                              opacity: 1,
                            },
                          }}
                        >
                          <button
                            className="text-sm px-5 py-2 rounded-full w-max font-medium cursor-pointer bg-[--dark-green] border-2 border-[--dark-green] 
                      text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green] transition-all duration-300"
                            onClick={() => {
                              handleGetConversation();
                              setIsOpenPolicyModal(true);
                              setIsAcceptedPolicy(false);
                              setIsGuided(true);
                              setIsFriendly(false);
                            }}
                          >
                            Counselor-Guided Mode
                          </button>
                        </motion.li>
                        <motion.li
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: {
                              y: 0,
                              opacity: 1,
                            },
                          }}
                        >
                          <button
                            className="text-sm px-5 py-2 rounded-full w-max font-medium cursor-pointer bg-[--dark-green] border-2 border-[--dark-green] 
                      text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green] transition-all duration-300"
                            onClick={() => {
                              setIsOpenPolicyModal(true);
                              setIsAcceptedPolicy(false);
                              setIsGuided(false);
                              setIsFriendly(true);
                            }}
                          >
                            Friendly Conversation Mode
                          </button>
                        </motion.li>
                        <motion.li
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: {
                              y: 0,
                              opacity: 1,
                            },
                          }}
                        >
                          <p className="text-xs">
                            {"Learn more about our "}
                            <span
                              onClick={() => {
                                setIsOpenPolicyModal(true);
                              }}
                              className="font-bold text-[--dark-green] hover:underline transition-all cursor-pointer"
                            >
                              Privacy Policy
                            </span>
                            .
                          </p>
                        </motion.li>
                        <motion.li
                          variants={{
                            hidden: { y: 20, opacity: 0 },
                            visible: {
                              y: 0,
                              opacity: 1,
                            },
                          }}
                        >
                          <p
                            className="text-xs"
                            onClick={() => {
                              setIsOpenFeedbackModal(true);
                            }}
                          >
                            <span className="font-bold text-[--dark-green] hover:underline transition-all cursor-pointer">
                              Please leave a feedback here
                            </span>
                            .
                          </p>
                        </motion.li>
                      </motion.div>
                    </div>
                  ) : (
                    <div className="px-5 mb-1 flex flex-col overflow-y-auto gap-3 pt-10">
                      {isGuided && isAcceptedPolicy
                        ? messages.map((i, k) => {
                            return i.sender === "Katoto" ? (
                              <motion.div
                                key={k}
                                variants={{
                                  hidden: { opacity: 1, scale: 0 },
                                  visible: {
                                    opacity: 1,
                                    scale: 1,
                                    transition: {
                                      delayChildren: 0.2,
                                      staggerChildren: 0.2,
                                    },
                                  },
                                }}
                                initial="hidden"
                                animate="visible"
                                className="flex w-full justify-start gap-3"
                              >
                                <motion.li
                                  variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: {
                                      y: 0,
                                      opacity: 1,
                                    },
                                  }}
                                  className="flex w-full justify-start gap-3 list-none"
                                >
                                  <img
                                    src={logo}
                                    alt="logo"
                                    className="h-[30px]"
                                  />
                                  <div className="bg-black/10 max-w-[50%] py-3 px-4 rounded-b-3xl rounded-tr-3xl text-sm flex items-center text-left mt-5">
                                    {i.message}
                                  </div>
                                </motion.li>
                              </motion.div>
                            ) : (
                              <motion.div
                                key={k}
                                variants={{
                                  hidden: { opacity: 1, scale: 0 },
                                  visible: {
                                    opacity: 1,
                                    scale: 1,
                                    transition: {
                                      delayChildren: 0.2,
                                      staggerChildren: 0.2,
                                    },
                                  },
                                }}
                                initial="hidden"
                                animate="visible"
                                className="flex w-full justify-end"
                              >
                                <motion.li
                                  variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: {
                                      y: 0,
                                      opacity: 1,
                                    },
                                  }}
                                  className="bg-[--light-green] max-w-[50%] py-3 px-4 rounded-t-3xl rounded-bl-3xl text-sm flex items-center text-left"
                                >
                                  {i.message}
                                </motion.li>
                              </motion.div>
                            );
                          })
                        : friendlyMessages.map((i, k) => {
                            return i.sender === "Katoto" ? (
                              <motion.div
                                key={k}
                                variants={{
                                  hidden: { opacity: 1, scale: 0 },
                                  visible: {
                                    opacity: 1,
                                    scale: 1,
                                    transition: {
                                      delayChildren: 0.2,
                                      staggerChildren: 0.2,
                                    },
                                  },
                                }}
                                initial="hidden"
                                animate="visible"
                                className="flex w-full justify-start gap-3"
                              >
                                <motion.li
                                  variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: {
                                      y: 0,
                                      opacity: 1,
                                    },
                                  }}
                                  className="flex w-full justify-start gap-3 list-none"
                                >
                                  <img
                                    src={logo}
                                    alt="logo"
                                    className="h-[30px]"
                                  />
                                  <div className="bg-black/10 max-w-[50%] py-3 px-4 rounded-b-3xl rounded-tr-3xl text-sm flex items-center text-left mt-5">
                                    {i.message}
                                  </div>
                                </motion.li>
                              </motion.div>
                            ) : (
                              <motion.div
                                key={k}
                                variants={{
                                  hidden: { opacity: 1, scale: 0 },
                                  visible: {
                                    opacity: 1,
                                    scale: 1,
                                    transition: {
                                      delayChildren: 0.2,
                                      staggerChildren: 0.2,
                                    },
                                  },
                                }}
                                initial="hidden"
                                animate="visible"
                                className="flex w-full justify-end"
                              >
                                <motion.li
                                  variants={{
                                    hidden: { y: 20, opacity: 0 },
                                    visible: {
                                      y: 0,
                                      opacity: 1,
                                    },
                                  }}
                                  className="bg-[--light-green] max-w-[50%] py-3 px-4 rounded-t-3xl rounded-bl-3xl text-sm flex items-center text-left"
                                >
                                  {i.message}
                                </motion.li>
                              </motion.div>
                            );
                          })}
                      {isTyping ? (
                        <motion.div
                          variants={{
                            hidden: { opacity: 1, scale: 0 },
                            visible: {
                              opacity: 1,
                              scale: 1,
                              transition: {
                                delayChildren: 0.2,
                                staggerChildren: 0.2,
                              },
                            },
                          }}
                          initial="hidden"
                          animate="visible"
                          className="flex w-full justify-start gap-3"
                        >
                          <motion.li
                            variants={{
                              hidden: { y: 20, opacity: 0 },
                              visible: {
                                y: 0,
                                opacity: 1,
                              },
                            }}
                            className="flex w-full justify-start gap-3 list-none"
                          >
                            <img src={logo} alt="logo" className="h-[30px]" />
                            <div className="bg-black/10 max-w-[50%] py-3 px-4 rounded-b-3xl rounded-tr-3xl text-sm flex items-center text-left mt-5">
                              <p className="dot-typing my-1 mx-3"></p>
                            </div>
                          </motion.li>
                        </motion.div>
                      ) : null}
                      <div ref={bottomRef} />
                    </div>
                  )}

                  <div className="w-full">
                    {isGuided && isAcceptedPolicy ? (
                      <motion.div
                        variants={{
                          hidden: { opacity: 1, scale: 0 },
                          visible: {
                            opacity: 1,
                            scale: 1,
                            transition: {
                              delayChildren: 0.3,
                              staggerChildren: 0.2,
                            },
                          },
                        }}
                        initial="hidden"
                        animate="visible"
                        className="px-5 py-3 list-none gap-2 justify-center flex w-full mb-3 flex-wrap"
                      >
                        {guidedButtons.map((i, k) => {
                          return (
                            <motion.li
                              key={k}
                              variants={{
                                hidden: { y: 20, opacity: 0 },
                                visible: {
                                  y: 0,
                                  opacity: 1,
                                },
                              }}
                            >
                              <button
                                className="text-sm px-5 py-2 rounded-full w-max font-medium cursor-pointer bg-[--dark-green] border-2 border-[--dark-green] 
              text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green] transition-all duration-300"
                                onClick={() => {
                                  handleSubmitMessage(auth.accessToken, i);
                                }}
                              >
                                {i.title}
                              </button>
                            </motion.li>
                          );
                        })}
                      </motion.div>
                    ) : null}
                    {isFriendly && isAcceptedPolicy ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmitMessage(auth.accessToken, inputFriendly);
                        }}
                      >
                        <motion.div
                          variants={{
                            hidden: { opacity: 1, scale: 0 },
                            visible: {
                              opacity: 1,
                              scale: 1,
                              transition: {
                                delayChildren: 0.3,
                                staggerChildren: 0.2,
                              },
                            },
                          }}
                          initial="hidden"
                          animate="visible"
                          className="px-3 py-3 list-none flex gap-5 w-full"
                        >
                          <motion.li
                            variants={{
                              hidden: { y: 20, opacity: 0 },
                              visible: {
                                y: 0,
                                opacity: 1,
                              },
                            }}
                            className="w-full"
                          >
                            <input
                              id="message"
                              className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-none placeholder-black/30 font-semibold w-full"
                              type="text"
                              placeholder="Aa..."
                              ref={friendlyMsgRef}
                              required
                            />
                          </motion.li>
                          <div className="w-[50px] h-[50px]">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ rotate: 360, scale: 1 }}
                              transition={{
                                type: "spring",
                                stiffness: 260,
                                damping: 20,
                                delay: 0.8,
                              }}
                            >
                              <button
                                className="w-[46px] h-[46px] rounded-full bg-[--dark-green] flex justify-center items-center text-[--light-brown] cursor-pointer border-2 
                      border-[--dark-green] hover:text-[--dark-green] hover:bg-[--light-brown] transition-all duration-300"
                                type="submit"
                              >
                                <IoSend />
                              </button>
                            </motion.div>
                          </div>
                        </motion.div>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
            <div className="pb-8">
              <img src={katoto} alt="katoto" className="h-[600px]" />
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default Chatbot;
