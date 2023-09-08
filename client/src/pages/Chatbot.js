import { useState, useRef, useEffect } from "react";
import axios from "../api/axios";
import axiosDef from "axios";
import { motion, AnimatePresence } from "framer-motion";
import moment from "moment";

import { IoSend } from "react-icons/io5";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { MdSos } from "react-icons/md";
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

  const [katotoMessage, setKatotoMessage] = useState("");
  const [inputFriendly, setInputFriendly] = useState("");
  const [appointmentDateStart, setAppointmentDateStart] = useState("");
  const [appointmentDateEnd, setAppointmentDateEnd] = useState("");

  const [guidedButtons, setGuidedButtons] = useState([]);
  const [messages, setMessages] = useState([]);
  const [friendlyMessages, setFriendlyMessages] = useState([]);

  const [sosDetails, setSosDetails] = useState({});
  const [standardDetails, setStandardDetails] = useState({});
  const [appointmentDetails, setAppointmentDetails] = useState({});

  const bottomRef = useRef(null);

  useEffect(() => {
    if (socket) {
      socket.on("studentScheduleResponse", (details) => {
        setPopUpSOS(false);
        setIsOpenStandardAppoint(false);
        if (details.appointmentDetails.type === "sos") {
          setSosDetails(details);
        } else if (details.appointmentDetails.type === "standard") {
          setStandardDetails(details);
        }
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
      handleSubmitMessage(auth.accessToken, "hi");
    }
  }, [isInitial]);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, guidedButtons, friendlyMessages]);

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
      setGuidedButtons([]);
      setInputFriendly("");
      setIsTyping(true);
      setMessages([...messages, { sender, message: inputMessage }]);
      setFriendlyMessages([
        ...friendlyMessages,
        { sender, message: inputMessage },
      ]);

      axiosDef
        .post(
          isGuided
            ? process.env.REACT_APP_KATOTO_CG_API_URI
            : process.env.REACT_APP_KATOTO_FC_API_URI,
          {
            sender,
            message: inputMessage,
          }
        )
        .then((res) => {
          res.data[0].text =
            res.data[0].custom !== undefined
              ? res.data[0].custom.text
              : res.data[0].text;

          if (isGuided) {
            const buttons = res.data[0].buttons.map((i) => {
              return i.title;
            });

            setKatotoMessage(res.data[0].text);
            setTimeout(() => {
              setMessages([
                ...messages,
                { sender, message: inputMessage },
                { sender: "Katoto", message: res.data[0].text },
              ]);
              setIsTyping(false);
              setTimeout(() => {
                setGuidedButtons(buttons);
              }, 1000);
            }, 900);

            return axios.post(
              "/api/logs/send",
              {
                studentMessage: { sender, message: inputMessage },
                katotoMessage: {
                  sender: "Katoto",
                  message: res.data[0].text,
                },
                isGuided,
              },
              {
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${auth?.accessToken}`,
                },
              }
            );
          } else {
            setKatotoMessage(res.data[0].text);
            setTimeout(() => {
              setFriendlyMessages([
                ...friendlyMessages,
                { sender, message: inputMessage },
                { sender: "Katoto", message: res.data[0].text },
              ]);
              setIsTyping(false);
              if (res.data[0].custom !== undefined) {
                setTimeout(() => {
                  setPopUpSOS(res.data[0].custom.opensos);
                }, 900);
              }
            }, 900);

            return axios.post(
              "/api/logs/send",
              {
                studentMessage: { sender },
                isGuided,
              },
              {
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${auth?.accessToken}`,
                },
              }
            );
          }
        })
        .then((res) => {
          setKatotoMessage("");
        })
        .catch((err) => {
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
        appointmentDateEnd !== ""
      ) {
        try {
          socket.emit("scheduleRequest", {
            id: socket.id,
            token: auth?.accessToken,
            type: "standard",
            start: appointmentDateStart,
            end: appointmentDateEnd,
          });
        } catch (err) {
          toast.error("Error");
        }
      } else {
        toast.error("Please select a time");
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

  const events = [
    {
      start: "9/5/2023, 1:00:00 PM",
      end: "9/5/2023, 1:00:00 PM",
      title: "MRI Registration",
      data: {
        type: "Reg",
      },
    },
    {
      start: moment("2023-09-04T14:00:00").toDate(),
      end: moment("2023-09-04T15:30:00").toDate(),
      title: "ENT Appointment",
      data: {
        type: "App",
      },
    },
  ];

  return (
    <>
      {isOpenNotificationModal ||
      popUpSOS ||
      popUpStandard ||
      isOpenStandardAppoint ? (
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
            isOpenStandardAppoint
              ? "show"
              : "hide"
          }
          initial={{
            opacity: 0,
          }}
        ></motion.div>
      ) : null}

      <Modal isOpen={isOpenNotificationModal}>
        <div className="w-full justify-between flex">
          <p className="text-2xl font-extrabold">
            {(() => {
              if (sosDetails?.appointmentDetails?.type === "sos") {
                return "SOS Emergency Appointment";
              } else if (
                standardDetails?.appointmentDetails?.type === "standard"
              ) {
                return "Standard Appointment";
              }
            })()}
          </p>
          <button
            onClick={() => {
              setIsOpenNotificationModal(false);
              handleSubmitMessage(
                auth?.accessToken,
                "Nakapag-iskedyul na ako ng Appointment, Salamat!"
              );
            }}
            type="button"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-4 mt-5">
          {(() => {
            if (standardDetails?.appointmentDetails?.type === "sos") {
              return (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-5 items-center">
                    <div className="bg-[--dark-green] h-fit rounded-full p-1 text-white border border-2 border-[--dark-green]">
                      <BsPatchCheck size={48} />
                    </div>
                    <div className="flex flex-col gap-5">
                      <p>
                        You have successfully booked an{" "}
                        <span className="font-bold">
                          SOS Emergency appointment{" "}
                        </span>{" "}
                        on{" "}
                        {
                          convertDate(
                            sosDetails?.appointmentDetails?.scheduledDate
                          )[0]
                        }
                        . This is received and acknowledged by PLV Guidance and
                        Counselling Center. Thank You!
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-5">
                      <p className="text-[--dark-green] font-bold flex items-center mb-3">
                        Appointment Details
                      </p>
                      {new Date(sosDetails?.appointmentDetails?.scheduledDate) >
                      new Date() ? (
                        <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3">
                          Upcoming
                        </div>
                      ) : (
                        <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3">
                          Overdue
                        </div>
                      )}
                    </div>
                    <div className="bg-black/10 w-max h-auto p-3 rounded-lg mb-5">
                      <div className="flex gap-4">
                        <BsCalendar4Week size={24} />
                        <p>
                          {
                            convertDate(
                              sosDetails?.appointmentDetails?.scheduledDate
                            )[1]
                          }
                        </p>
                        <div className="border-[1px] border-black/20 border-right"></div>
                        <BsClockHistory size={24} />
                        <p>
                          {
                            convertDate(
                              sosDetails?.appointmentDetails?.scheduledDate
                            )[2]
                          }
                        </p>
                        <p>45 mins</p>
                      </div>
                    </div>
                    <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                      Your Details
                    </p>
                    <table className="mb-5">
                      <tr>
                        <td className="w-[150px] flex justify-start">Name</td>
                        <td>
                          {sosDetails?.appointmentDetails?.userDetails?.name}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Gender</td>
                        <td>
                          {sosDetails?.appointmentDetails?.userDetails?.gender}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Email</td>
                        <td>
                          {sosDetails?.appointmentDetails?.userDetails?.email}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">
                          {" "}
                          ID Number
                        </td>
                        <td>
                          {" "}
                          {sosDetails?.appointmentDetails?.userDetails?.idNo}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Course</td>
                        <td>
                          {
                            sosDetails?.appointmentDetails?.userDetails
                              ?.department
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">
                          Year and Section
                        </td>
                        <td>
                          {
                            sosDetails?.appointmentDetails?.userDetails
                              ?.yearSection
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">
                          College
                        </td>
                        <td>
                          {
                            sosDetails?.appointmentDetails?.userDetails
                              ?.mainDepartment
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Phone</td>
                        <td>
                          {
                            sosDetails?.appointmentDetails?.userDetails
                              ?.contactNo
                          }
                        </td>
                      </tr>
                    </table>
                    <div className="flex justify-end">
                      {/* <button
                      className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
        border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                      onClick={() => {
                        setIsOpenNotificationModal(false);
                        // handleDeleteNotification(notificationDetails.id);
                        // handleDeleteLocal(notificationDetails.id);
                      }}
                    >
                      <BsFillTrash3Fill size={14} />
                      Delete
                    </button>  */}
                    </div>
                  </div>
                </div>
              );
            } else if (
              standardDetails?.appointmentDetails?.type === "standard"
            ) {
              return (
                <div className="flex flex-col gap-5">
                  <div className="flex gap-5 items-center">
                    <div className="bg-[--dark-green] h-fit rounded-full p-1 text-white border border-2 border-[--dark-green]">
                      <BsPatchCheck size={48} />
                    </div>
                    <div className="flex flex-col gap-5">
                      <p>
                        You have successfully booked an{" "}
                        <span className="font-bold">standard appointment </span>{" "}
                        on{" "}
                        {`${
                          convertDate(
                            standardDetails?.appointmentDetails?.start
                          )[0]
                        } to ${
                          convertDate(
                            standardDetails?.appointmentDetails?.end
                          )[2]
                        }`}
                        . This is received and acknowledged by PLV Guidance and
                        Counselling Center. Thank You!
                      </p>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-5">
                      <p className="text-[--dark-green] font-bold flex items-center mb-3">
                        Appointment Details
                      </p>
                      {new Date(standardDetails?.appointmentDetails?.end) >
                      new Date() ? (
                        <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3">
                          Upcoming
                        </div>
                      ) : (
                        <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3">
                          Overdue
                        </div>
                      )}
                    </div>
                    <div className="bg-black/10 w-max h-auto p-3 rounded-lg mb-5">
                      <div className="flex gap-4">
                        <BsCalendar4Week size={24} />
                        <p>
                          {
                            convertDate(
                              standardDetails?.appointmentDetails?.start
                            )[1]
                          }
                        </p>
                        <div className="border-[1px] border-black/20 border-right"></div>
                        <BsClockHistory size={24} />
                        <p>
                          {`${
                            convertDate(
                              standardDetails?.appointmentDetails?.start
                            )[2]
                          } to ${
                            convertDate(
                              standardDetails?.appointmentDetails?.end
                            )[2]
                          }`}
                        </p>
                        <p>45 mins</p>
                      </div>
                    </div>
                    <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                      Your Details
                    </p>
                    <table className="mb-5">
                      <tr>
                        <td className="w-[150px] flex justify-start">Name</td>
                        <td>
                          {
                            standardDetails?.appointmentDetails?.userDetails
                              ?.name
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Gender</td>
                        <td>
                          {
                            standardDetails?.appointmentDetails?.userDetails
                              ?.gender
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Email</td>
                        <td>
                          {
                            standardDetails?.appointmentDetails?.userDetails
                              ?.email
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">
                          {" "}
                          ID Number
                        </td>
                        <td>
                          {" "}
                          {
                            standardDetails?.appointmentDetails?.userDetails
                              ?.idNo
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Course</td>
                        <td>
                          {
                            standardDetails?.appointmentDetails?.userDetails
                              ?.department
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">
                          Year and Section
                        </td>
                        <td>
                          {
                            standardDetails?.appointmentDetails?.userDetails
                              ?.yearSection
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">
                          College
                        </td>
                        <td>
                          {
                            standardDetails?.appointmentDetails?.userDetails
                              ?.mainDepartment
                          }
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Phone</td>
                        <td>
                          {
                            standardDetails?.appointmentDetails?.userDetails
                              ?.contactNo
                          }
                        </td>
                      </tr>
                    </table>
                    <div className="flex justify-end">
                      {/* <button
                      className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
        border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                      onClick={() => {
                        setIsOpenNotificationModal(false);
                        // handleDeleteNotification(notificationDetails.id);
                        // handleDeleteLocal(notificationDetails.id);
                      }}
                    >
                      <BsFillTrash3Fill size={14} />
                      Delete
                    </button>  */}
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      </Modal>
      <Modal isOpen={popUpSOS}>
        <div className="w-full justify-between flex">
          <p className="text-2xl font-extrabold">SOS Emergency Button</p>

          <button
            onClick={() => {
              setPopUpSOS(false);
            }}
            type="button"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-4 mt-5 items-center text-center text-md">
          <p className="mb-5">
            <span className="text-black font-bold">TAKE NOTE:</span> If you are
            experiencing any{" "}
            <span className="text-black font-bold">emotional distress</span>,
            please know that you are not alone. PLV guidance counselors are
            available to provide support and guidance. You can reach them by
            clicking the SOS button below to set an{" "}
            <span className="text-black font-bold">
              immediate emergency appointment
            </span>
            .
          </p>
          <div className="w-auto">
            <button
              className="bg-[--red] rounded-full p-1 text-white border border-2 border-[--red] hover:bg-transparent hover:text-[--red] 
              transition-all duration-300"
              onClick={handleClickSOS}
            >
              <MdSos size={160} />
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={popUpStandard} isCalendar={true}>
        <div className="w-full justify-between flex">
          <p className="text-2xl font-extrabold">Standard Appointment</p>
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
            toast={toast}
          ></CalendarComponent>
        </div>
      </Modal>
      <Modal isOpen={isOpenStandardAppoint}>
        <div className="w-full justify-between flex">
          <p className="text-2xl font-extrabold">Standard Appointment</p>
          <button
            onClick={() => {
              setIsOpenStandardAppoint(false);
              setPopUpStandard(true);
              setAppointmentDateStart("");
              setAppointmentDateEnd("");
              setIsAppointmentChecked(false);
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
              return events.some(
                (j) => i.time === new Date(j.start).toLocaleTimeString()
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
          <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
            Your Details
          </p>

          <table className="mb-5">
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
              <td className="w-[150px] flex justify-start">Year and Section</td>
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
              By ticking the box, you hereby acknowledge and consent to the use
              of your personal information for scheduling appointments with our
              mental health chatbot.
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
              <div className="bg-[--light-green] px-5 py-8 rounded-lg text-center font-semibold text-lg">
                Sometimes you just need to take a deep breath.
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
                      setPopUpStandard(true);
                      setIsOpenNotificationModal(false);
                    }}
                  >
                    <BsCalendarPlus size={24} />
                  </button>
                  <button
                    className="bg-[--red] rounded-full p-1 text-white border border-2 border-[--red] hover:bg-transparent 
                  hover:text-[--red] transition-all duration-300"
                    onClick={() => {
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
                          setIsGuided(true);
                          setIsFriendly(false);
                          setIsInitial(false);
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
                          setIsGuided(false);
                          setIsFriendly(true);
                          setIsInitial(false);
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
                        <span className="font-bold text-[--dark-green] hover:underline transition-all cursor-pointer">
                          Privacy Policy
                        </span>
                        .
                      </p>
                    </motion.li>
                  </motion.div>
                </div>
              ) : (
                <div className="px-5 mb-1 flex flex-col overflow-y-auto gap-3 pt-10">
                  {isGuided
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
                              <img src={logo} alt="logo" className="h-[30px]" />
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
                              <img src={logo} alt="logo" className="h-[30px]" />
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
                {isGuided ? (
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
                            {i}
                          </button>
                        </motion.li>
                      );
                    })}
                  </motion.div>
                ) : null}
                {isFriendly ? (
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
                          value={inputFriendly}
                          onChange={(e) => {
                            setInputFriendly(e.target.value);
                          }}
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
  );
}

export default Chatbot;
