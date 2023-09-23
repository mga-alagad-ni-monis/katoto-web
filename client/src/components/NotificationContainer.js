import axios from "../api/axios";
import { useState } from "react";

import TimeAgo from "react-timeago";

import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import {
  BsCalendar4Week,
  BsClockHistory,
  BsFillTrash3Fill,
  BsCalendarPlus,
} from "react-icons/bs";

import { AiOutlineLike, AiOutlineSchedule } from "react-icons/ai";

import {
  MdOutlineCancel,
  MdSchedule,
  MdEdit,
  MdOutlineCheckCircleOutline,
  MdOutlinePending,
  MdSos,
} from "react-icons/md";

import Modal from "../components/Modal";
import NotificationItems from "./Notifications/NotificationItems";

function NotificationContainer({
  toast,
  auth,
  isOpenNotifications,
  setIsOpenNotifications,
  notifications,
  setNotifications,
  isStudent,
}) {
  const [notificationDetails, setNotificationDetails] = useState({});
  const [isOpenNotificationModal, setIsOpenNotificationModal] = useState(false);

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

  const markNotification = async (id, isSeen) => {
    try {
      await axios
        .post(
          "/api/notifications/mark",
          { id, isSeen },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {})
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios
        .post(
          "/api/notifications/delete",
          { id },
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

  const handleChangeSeen = (id, isSeen) => {
    const newNotifications = notifications.map((i) => {
      if (i.id === id) {
        i.isSeen = isSeen;
      }
      return i;
    });
    setNotifications(newNotifications);
  };

  const handleDeleteLocal = (id) => {
    const newNotifications = notifications.filter((i) => i.id !== id);
    setNotifications(newNotifications);
  };

  return (
    <>
      {isOpenNotificationModal ? (
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
          animate={isOpenNotificationModal ? "show" : "hide"}
          initial={{
            opacity: 0,
          }}
        ></motion.div>
      ) : null}
      {isStudent ? (
        <Modal isOpen={isOpenNotificationModal}>
          <div className="w-full justify-between flex">
            <p className="text-2xl font-extrabold">
              {(() => {
                if (notificationDetails.details?.status === "upcoming") {
                  if (notificationDetails.type === "sos") {
                    return "SOS Emergency Appointment";
                  } else if (notificationDetails.type === "standard") {
                    return "Regular Appointment";
                  }
                } else if (
                  notificationDetails.details?.status === "completed"
                ) {
                  return "Completed Appointment";
                } else if (
                  notificationDetails.details?.status === "cancelled"
                ) {
                  return "Cancelled Appointment";
                } else if (notificationDetails.type === "edited") {
                  return "Updated Appointment";
                }
              })()}
            </p>
            <button
              onClick={() => {
                setIsOpenNotificationModal(false);
              }}
              type="button"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-4 mt-5">
            {(() => {
              if (notificationDetails.details?.status === "upcoming") {
                if (notificationDetails.type === "sos") {
                  return (
                    <div className="flex flex-col gap-5">
                      <div className="flex gap-5 items-center">
                        <div className="bg-[--red] h-fit rounded-full p-1 text-white border border-2 border-[--red]">
                          <MdSos size={48} />
                        </div>
                        <div className="flex flex-col gap-5">
                          <p>
                            {" "}
                            <span className="font-bold">You </span>
                            have booked an{" "}
                            <span className="font-bold">
                              SOS Emergency appointment{" "}
                            </span>{" "}
                            on{" "}
                            {
                              convertDate(
                                notificationDetails.details.scheduledDate
                              )[0]
                            }
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-5">
                          <p className="text-[--dark-green] font-bold flex items-center mb-3">
                            Appointment Details
                          </p>
                          {new Date(notificationDetails.details.scheduledDate) >
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
                                  notificationDetails.details.scheduledDate
                                )[1]
                              }
                            </p>
                            <div className="border-[1px] border-black/20 border-right"></div>
                            <BsClockHistory size={24} />
                            <p>
                              {
                                convertDate(
                                  notificationDetails.details.scheduledDate
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
                            <td className="w-[150px] flex justify-start">
                              Name
                            </td>
                            <td>
                              {notificationDetails.details.userDetails.name}
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Gender
                            </td>
                            <td>
                              {notificationDetails.details.userDetails.gender}
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Email
                            </td>
                            <td>
                              {notificationDetails.details.userDetails.email}
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              {" "}
                              ID Number
                            </td>
                            <td>
                              {" "}
                              {notificationDetails.details.userDetails.idNo}
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Course
                            </td>
                            <td>
                              {
                                notificationDetails.details.userDetails
                                  .department
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Year and Section
                            </td>
                            <td>
                              {
                                notificationDetails.details.userDetails
                                  .yearSection
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              College
                            </td>
                            <td>
                              {
                                notificationDetails.details.userDetails
                                  .mainDepartment
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Phone
                            </td>
                            <td>
                              {
                                notificationDetails.details.userDetails
                                  .contactNo
                              }
                            </td>
                          </tr>
                        </table>
                        <div className="flex justify-end">
                          <button
                            className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                            onClick={() => {
                              setIsOpenNotificationModal(false);
                              handleDeleteNotification(notificationDetails.id);
                              handleDeleteLocal(notificationDetails.id);
                            }}
                          >
                            <BsFillTrash3Fill size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else if (notificationDetails.type === "standard") {
                  return (
                    <div className="flex flex-col gap-5">
                      <div className="flex gap-5 items-center">
                        <div className="bg-[--dark-green] h-fit rounded-full p-2 text-white border border-2 border-[--dark-green]">
                          <MdOutlineCheckCircleOutline size={40} />
                        </div>
                        <div className="flex flex-col gap-5">
                          <p>
                            {" "}
                            <span className="font-bold">
                              {notificationDetails.details.gc.name}{" "}
                            </span>
                            approved your{" "}
                            <span className="font-bold">
                              regular appointment
                            </span>{" "}
                            on{" "}
                            {`${
                              convertDate(notificationDetails.details.start)[0]
                            } to ${
                              convertDate(notificationDetails.details.end)[2]
                            }`}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-5">
                          <p className="text-[--dark-green] font-bold flex items-center mb-3">
                            Appointment Details
                          </p>
                          {(() => {
                            if (
                              new Date(notificationDetails.details.data?.end) <
                              new Date()
                            ) {
                              return (
                                <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3 font-bold">
                                  Ended
                                </div>
                              );
                            } else if (
                              notificationDetails.details.status === "pending"
                            ) {
                              return (
                                <div className="w-max p-2 rounded-lg bg-[--yellow] text-black text-xs mb-3 font-bold">
                                  Pending
                                </div>
                              );
                            } else if (
                              notificationDetails.details.status === "upcoming"
                            ) {
                              return (
                                <div className="w-max p-2 rounded-lg bg-[--light-green] text-black text-xs mb-3 font-bold">
                                  Upcoming
                                </div>
                              );
                            } else if (
                              notificationDetails.details.status === "completed"
                            ) {
                              return (
                                <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3 font-bold">
                                  Completed
                                </div>
                              );
                            } else if (
                              notificationDetails.details.status === "cancelled"
                            ) {
                              return (
                                <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3 font-bold">
                                  Cancelled
                                </div>
                              );
                            }
                          })()}
                        </div>
                        <div className="bg-black/10 w-max h-auto p-3 rounded-lg mb-5">
                          <div className="flex gap-4">
                            <BsCalendar4Week size={24} />
                            <p>
                              {
                                convertDate(
                                  notificationDetails.details.start
                                )[1]
                              }
                            </p>
                            <div className="border-[1px] border-black/20 border-right"></div>
                            <BsClockHistory size={24} />
                            <p>
                              {`${
                                convertDate(
                                  notificationDetails.details.start
                                )[2]
                              } to ${
                                convertDate(notificationDetails.details.end)[2]
                              }`}
                            </p>
                            <p>45 mins</p>
                          </div>
                        </div>
                        <div className="flex gap-5 mb-5">
                          <div>
                            <p className="text-[--dark-green] font-bold flex items-center mb-3">
                              Guidance Counselor
                            </p>
                            {notificationDetails.details.gc?.name}
                          </div>
                          <div>
                            <p className="text-[--dark-green] font-bold flex items-center mb-3">
                              Mode
                            </p>
                            {notificationDetails.details.mode === "facetoface"
                              ? "Face-to-face"
                              : "Virtual"}
                          </div>
                        </div>
                        <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                          Your Details
                        </p>
                        <table className="mb-5">
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Name
                            </td>
                            <td>
                              {notificationDetails.details.userDetails.name}
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Gender
                            </td>
                            <td>
                              {notificationDetails.details.userDetails.gender}
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Email
                            </td>
                            <td>
                              {notificationDetails.details.userDetails.email}
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              {" "}
                              ID Number
                            </td>
                            <td>
                              {" "}
                              {notificationDetails.details.userDetails.idNo}
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Course
                            </td>
                            <td>
                              {
                                notificationDetails.details.userDetails
                                  .department
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Year and Section
                            </td>
                            <td>
                              {
                                notificationDetails.details.userDetails
                                  .yearSection
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              College
                            </td>
                            <td>
                              {
                                notificationDetails.details.userDetails
                                  .mainDepartment
                              }
                            </td>
                          </tr>
                          <tr>
                            <td className="w-[150px] flex justify-start">
                              Phone
                            </td>
                            <td>
                              {
                                notificationDetails.details.userDetails
                                  .contactNo
                              }
                            </td>
                          </tr>
                        </table>
                        <div className="flex justify-end">
                          <button
                            className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                            onClick={() => {
                              setIsOpenNotificationModal(false);
                              handleDeleteNotification(notificationDetails.id);
                              handleDeleteLocal(notificationDetails.id);
                            }}
                          >
                            <BsFillTrash3Fill size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              } else if (notificationDetails.details?.status === "pending") {
                return (
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-5 items-center">
                      <div className="bg-[--red] h-fit rounded-full p-2 text-white border border-2 border-[--red]">
                        <MdOutlineCancel size={40} />
                      </div>
                      <div className="flex flex-col gap-5">
                        <p>
                          <span className="font-bold">
                            {notificationDetails.details?.gc?.name}{" "}
                          </span>
                          <span className="font-bold">marked </span>
                          your appointment on{" "}
                          {`${
                            convertDate(notificationDetails.details.start)[0]
                          } to ${
                            convertDate(notificationDetails.details.end)[2]
                          }`}
                          <span className="font-bold">as completed </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-5">
                        <p className="text-[--dark-green] font-bold flex items-center mb-3">
                          Appointment Details
                        </p>
                        {new Date(notificationDetails.details.end) >
                          new Date() &&
                        notificationDetails.details.status === "upcoming" ? (
                          <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3">
                            Upcoming
                          </div>
                        ) : notificationDetails.details.status ===
                          "cancelled" ? (
                          <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3">
                            Cancelled
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
                            {convertDate(notificationDetails.details.start)[1]}
                          </p>
                          <div className="border-[1px] border-black/20 border-right"></div>
                          <BsClockHistory size={24} />
                          <p>
                            {`${
                              convertDate(notificationDetails.details.start)[2]
                            } to ${
                              convertDate(notificationDetails.details.end)[2]
                            }`}
                          </p>
                          <p>45 mins</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
        border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                          onClick={() => {
                            setIsOpenNotificationModal(false);
                            handleDeleteNotification(notificationDetails.id);
                            handleDeleteLocal(notificationDetails.id);
                          }}
                        >
                          <BsFillTrash3Fill size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else if (notificationDetails.details?.status === "completed") {
                return (
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-5 items-center">
                      <div className="bg-[--red] h-fit rounded-full p-2 text-white border border-2 border-[--red]">
                        <MdOutlineCancel size={40} />
                      </div>
                      <div className="flex flex-col gap-5">
                        <p>
                          <span className="font-bold">
                            {notificationDetails.details?.gc?.name}{" "}
                          </span>
                          <span className="font-bold">marked </span>
                          your appointment on{" "}
                          {`${
                            convertDate(notificationDetails.details.start)[0]
                          } to ${
                            convertDate(notificationDetails.details.end)[2]
                          }`}
                          <span className="font-bold">as completed </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-5">
                        <p className="text-[--dark-green] font-bold flex items-center mb-3">
                          Appointment Details
                        </p>
                        {new Date(notificationDetails.details.end) >
                          new Date() &&
                        notificationDetails.details.status === "upcoming" ? (
                          <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3">
                            Upcoming
                          </div>
                        ) : notificationDetails.details.status ===
                          "cancelled" ? (
                          <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3">
                            Cancelled
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
                            {convertDate(notificationDetails.details.start)[1]}
                          </p>
                          <div className="border-[1px] border-black/20 border-right"></div>
                          <BsClockHistory size={24} />
                          <p>
                            {`${
                              convertDate(notificationDetails.details.start)[2]
                            } to ${
                              convertDate(notificationDetails.details.end)[2]
                            }`}
                          </p>
                          <p>45 mins</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
        border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                          onClick={() => {
                            setIsOpenNotificationModal(false);
                            handleDeleteNotification(notificationDetails.id);
                            handleDeleteLocal(notificationDetails.id);
                          }}
                        >
                          <BsFillTrash3Fill size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else if (notificationDetails.details?.status === "cancelled") {
                return (
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-5 items-center">
                      <div className="bg-[--red] h-fit rounded-full p-2 text-white border border-2 border-[--red]">
                        <MdOutlineCancel size={40} />
                      </div>
                      <div className="flex flex-col gap-5">
                        <p>
                          <span className="font-bold">
                            PLV Guidance Counselling Center{" "}
                          </span>
                          <span className="font-bold">cancelled </span>
                          your appointment on{" "}
                          {`${
                            convertDate(notificationDetails.details.start)[0]
                          } to ${
                            convertDate(notificationDetails.details.end)[2]
                          }`}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-5">
                        <p className="text-[--dark-green] font-bold flex items-center mb-3">
                          Appointment Details
                        </p>
                        {new Date(notificationDetails.details.end) >
                          new Date() &&
                        notificationDetails.details.status === "upcoming" ? (
                          <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3">
                            Upcoming
                          </div>
                        ) : notificationDetails.details.status ===
                          "cancelled" ? (
                          <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3">
                            Cancelled
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
                            {convertDate(notificationDetails.details.start)[1]}
                          </p>
                          <div className="border-[1px] border-black/20 border-right"></div>
                          <BsClockHistory size={24} />
                          <p>
                            {`${
                              convertDate(notificationDetails.details.start)[2]
                            } to ${
                              convertDate(notificationDetails.details.end)[2]
                            }`}
                          </p>
                          <p>45 mins</p>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
        border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                          onClick={() => {
                            setIsOpenNotificationModal(false);
                            handleDeleteNotification(notificationDetails.id);
                            handleDeleteLocal(notificationDetails.id);
                          }}
                        >
                          <BsFillTrash3Fill size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else if (notificationDetails.type === "edited") {
                if (
                  notificationDetails?.details?.old?.start !==
                    notificationDetails?.details?.new?.start &&
                  notificationDetails?.details?.old?.mode ===
                    notificationDetails?.details?.new?.mode
                ) {
                  return (
                    <div className="flex flex-col gap-5">
                      <div className="flex gap-5 items-center">
                        <div className="bg-[--dark-green] h-fit rounded-full p-2 text-white border border-2 border-[--dark-green]">
                          <MdSchedule size={40} />
                        </div>
                        <div className="flex flex-col gap-5">
                          <p>
                            <span className="font-bold">
                              PLV Guidance Counselling Center{" "}
                            </span>
                            <span className="font-bold">rescheduled </span>
                            your appointment from{" "}
                            <span className="font-bold">
                              {
                                convertDate(
                                  notificationDetails?.details?.old?.start
                                )[0]
                              }{" "}
                              -{" "}
                              {
                                convertDate(
                                  notificationDetails?.details?.old?.end
                                )[2]
                              }
                            </span>{" "}
                            to{" "}
                            <span className="font-bold">
                              {
                                convertDate(
                                  notificationDetails?.details?.new?.start
                                )[0]
                              }{" "}
                              -{" "}
                              {
                                convertDate(
                                  notificationDetails?.details?.new?.end
                                )[2]
                              }
                            </span>{" "}
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-5">
                          <p className="text-[--dark-green] font-bold flex items-center mb-3">
                            Appointment Details
                          </p>
                          {new Date(notificationDetails.details.new.end) >
                            new Date() &&
                          notificationDetails.details.new.status ===
                            "upcoming" ? (
                            <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3">
                              Upcoming
                            </div>
                          ) : notificationDetails.details.new.status ===
                            "cancelled" ? (
                            <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3">
                              Cancelled
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
                                  notificationDetails.details.new.start
                                )[1]
                              }
                            </p>
                            <div className="border-[1px] border-black/20 border-right"></div>
                            <BsClockHistory size={24} />
                            <p>
                              {`${
                                convertDate(
                                  notificationDetails.details.new.start
                                )[2]
                              } to ${
                                convertDate(
                                  notificationDetails.details.new.end
                                )[2]
                              }`}
                            </p>
                            <p>45 mins</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                            onClick={() => {
                              setIsOpenNotificationModal(false);
                              handleDeleteNotification(notificationDetails.id);
                              handleDeleteLocal(notificationDetails.id);
                            }}
                          >
                            <BsFillTrash3Fill size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else if (
                  notificationDetails?.details?.old?.start ==
                    notificationDetails?.details?.new?.start &&
                  notificationDetails?.details?.old?.mode !==
                    notificationDetails?.details?.new?.mode
                ) {
                  return (
                    <div className="flex flex-col gap-5">
                      <div className="flex gap-5 items-center">
                        <div className="bg-[--dark-green] h-fit rounded-full p-2 text-white border border-2 border-[--dark-green]">
                          <MdEdit size={40} />
                        </div>
                        <div className="flex flex-col gap-5">
                          <p>
                            <span className="font-bold">
                              PLV Guidance Counselling Center{" "}
                            </span>
                            <span className="font-bold">changed </span>
                            mode of the your appointment from{" "}
                            <span className="font-bold">
                              {notificationDetails?.details?.old?.mode ===
                              "facetoface"
                                ? "face-to-face"
                                : "virtual"}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold">
                              {notificationDetails?.details?.new?.mode ===
                              "facetoface"
                                ? "face-to-face"
                                : "virtual"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-end">
                          <button
                            className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                            onClick={() => {
                              setIsOpenNotificationModal(false);
                              handleDeleteNotification(notificationDetails.id);
                              handleDeleteLocal(notificationDetails.id);
                            }}
                          >
                            <BsFillTrash3Fill size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else if (
                  notificationDetails?.details?.old?.start !==
                    notificationDetails?.details?.new?.start &&
                  notificationDetails?.details?.old?.mode !==
                    notificationDetails?.details?.new?.mode
                ) {
                  return (
                    <div className="flex flex-col gap-5">
                      <div className="flex gap-5 items-center">
                        <div className="bg-[--dark-green] h-fit rounded-full p-2 text-white border border-2 border-[--dark-green]">
                          <MdSchedule size={40} />
                        </div>
                        <div className="flex flex-col gap-5">
                          <p>
                            <span className="font-bold">
                              PLV Guidance Counselling Center{" "}
                            </span>
                            <span className="font-bold">rescheduled </span>
                            your appointment from{" "}
                            <span className="font-bold">
                              {
                                convertDate(
                                  notificationDetails?.details?.old?.start
                                )[0]
                              }{" "}
                              -{" "}
                              {
                                convertDate(
                                  notificationDetails?.details?.old?.end
                                )[2]
                              }
                            </span>{" "}
                            to{" "}
                            <span className="font-bold">
                              {
                                convertDate(
                                  notificationDetails?.details?.new?.start
                                )[0]
                              }{" "}
                              -{" "}
                              {
                                convertDate(
                                  notificationDetails?.details?.new?.end
                                )[2]
                              }
                            </span>{" "}
                            and <span className="font-bold">changed </span>
                            mode from{" "}
                            <span className="font-bold">
                              {notificationDetails?.details?.old?.mode ===
                              "facetoface"
                                ? "face-to-face"
                                : "virtual"}
                            </span>{" "}
                            to{" "}
                            <span className="font-bold">
                              {notificationDetails?.details?.new?.mode ===
                              "facetoface"
                                ? "face-to-face"
                                : "virtual"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-5">
                          <p className="text-[--dark-green] font-bold flex items-center mb-3">
                            Appointment Details
                          </p>
                          {new Date(notificationDetails.details.new.end) >
                            new Date() &&
                          notificationDetails.details.new.status ===
                            "upcoming" ? (
                            <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3">
                              Upcoming
                            </div>
                          ) : notificationDetails.details.new.status ===
                            "cancelled" ? (
                            <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3">
                              Cancelled
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
                                  notificationDetails.details.new.start
                                )[1]
                              }
                            </p>
                            <div className="border-[1px] border-black/20 border-right"></div>
                            <BsClockHistory size={24} />
                            <p>
                              {`${
                                convertDate(
                                  notificationDetails.details.new.start
                                )[2]
                              } to ${
                                convertDate(
                                  notificationDetails.details.new.end
                                )[2]
                              }`}
                            </p>
                            <p>45 mins</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                            onClick={() => {
                              setIsOpenNotificationModal(false);
                              handleDeleteNotification(notificationDetails.id);
                              handleDeleteLocal(notificationDetails.id);
                            }}
                          >
                            <BsFillTrash3Fill size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              }
            })()}
          </div>
        </Modal>
      ) : (
        <Modal isOpen={isOpenNotificationModal}>
          <div className="w-full justify-between flex">
            <p className="text-2xl font-extrabold">
              {(() => {
                if (notificationDetails.type === "sos") {
                  return "SOS Emergency Appointment";
                } else if (notificationDetails.type === "standard") {
                  return "Regular Appointment";
                }
              })()}
            </p>
            <button
              onClick={() => {
                setIsOpenNotificationModal(false);
              }}
              type="button"
            >
              <FaTimes size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-4 mt-5">
            {(() => {
              if (notificationDetails.type === "sos") {
                return (
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-5 items-center">
                      <div className="bg-[--red] h-fit rounded-full p-1 text-white border border-2 border-[--red]">
                        <MdSos size={48} />
                      </div>
                      <div className="flex flex-col gap-5">
                        <p>
                          {" "}
                          <span className="font-bold">
                            {notificationDetails.details.userDetails.name}{" "}
                          </span>
                          has booked an{" "}
                          <span className="font-bold">
                            SOS Emergency appointment{" "}
                          </span>{" "}
                          on{" "}
                          {
                            convertDate(
                              notificationDetails.details.scheduledDate
                            )[0]
                          }
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-5">
                        <p className="text-[--dark-green] font-bold flex items-center mb-3">
                          Appointment Details
                        </p>
                        {new Date(notificationDetails.details.scheduledDate) >
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
                                notificationDetails.details.scheduledDate
                              )[1]
                            }
                          </p>
                          <div className="border-[1px] border-black/20 border-right"></div>
                          <BsClockHistory size={24} />
                          <p>
                            {
                              convertDate(
                                notificationDetails.details.scheduledDate
                              )[2]
                            }
                          </p>
                          <p>45 mins</p>
                        </div>
                      </div>
                      <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                        Student Details
                      </p>
                      <table className="mb-5">
                        <tr>
                          <td className="w-[150px] flex justify-start">Name</td>
                          <td>
                            {notificationDetails.details.userDetails.name}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Gender
                          </td>
                          <td>
                            {notificationDetails.details.userDetails.gender}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Email
                          </td>
                          <td>
                            {notificationDetails.details.userDetails.email}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            {" "}
                            ID Number
                          </td>
                          <td>
                            {" "}
                            {notificationDetails.details.userDetails.idNo}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Course
                          </td>
                          <td>
                            {notificationDetails.details.userDetails.department}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Year and Section
                          </td>
                          <td>
                            {
                              notificationDetails.details.userDetails
                                .yearSection
                            }
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            College
                          </td>
                          <td>
                            {
                              notificationDetails.details.userDetails
                                .mainDepartment
                            }
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Phone
                          </td>
                          <td>
                            {notificationDetails.details.userDetails.contactNo}
                          </td>
                        </tr>
                      </table>
                      <div className="flex justify-end">
                        <button
                          className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                          onClick={() => {
                            setIsOpenNotificationModal(false);
                            handleDeleteNotification(notificationDetails.id);
                            handleDeleteLocal(notificationDetails.id);
                          }}
                        >
                          <BsFillTrash3Fill size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else if (notificationDetails.type === "standard") {
                return (
                  <div className="flex flex-col gap-5">
                    <div className="flex gap-5 items-center">
                      <div className="bg-[--dark-green] h-fit rounded-full p-3 text-white border border-2 border-[--dark-green]">
                        <BsCalendarPlus size={32} />
                      </div>
                      <div className="flex flex-col gap-5">
                        <p>
                          {" "}
                          <span className="font-bold">
                            {notificationDetails.details.userDetails.name}{" "}
                          </span>
                          has booked an{" "}
                          <span className="font-bold">regular appointment</span>{" "}
                          on{" "}
                          {`${
                            convertDate(notificationDetails.details.start)[0]
                          } to ${
                            convertDate(notificationDetails.details.end)[2]
                          }`}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-5">
                        <p className="text-[--dark-green] font-bold flex items-center mb-3">
                          Appointment Details
                        </p>
                        {new Date(notificationDetails.details.end) >
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
                            {convertDate(notificationDetails.details.start)[1]}
                          </p>
                          <div className="border-[1px] border-black/20 border-right"></div>
                          <BsClockHistory size={24} />
                          <p>
                            {`${
                              convertDate(notificationDetails.details.start)[2]
                            } to ${
                              convertDate(notificationDetails.details.end)[2]
                            }`}
                          </p>
                          <p>45 mins</p>
                        </div>
                      </div>
                      <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                        Student Details
                      </p>
                      <table className="mb-5">
                        <tr>
                          <td className="w-[150px] flex justify-start">Name</td>
                          <td>
                            {notificationDetails.details.userDetails.name}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Gender
                          </td>
                          <td>
                            {notificationDetails.details.userDetails.gender}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Email
                          </td>
                          <td>
                            {notificationDetails.details.userDetails.email}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            {" "}
                            ID Number
                          </td>
                          <td>
                            {" "}
                            {notificationDetails.details.userDetails.idNo}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Course
                          </td>
                          <td>
                            {notificationDetails.details.userDetails.department}
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Year and Section
                          </td>
                          <td>
                            {
                              notificationDetails.details.userDetails
                                .yearSection
                            }
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            College
                          </td>
                          <td>
                            {
                              notificationDetails.details.userDetails
                                .mainDepartment
                            }
                          </td>
                        </tr>
                        <tr>
                          <td className="w-[150px] flex justify-start">
                            Phone
                          </td>
                          <td>
                            {notificationDetails.details.userDetails.contactNo}
                          </td>
                        </tr>
                      </table>
                      <div className="flex justify-end">
                        <button
                          className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                          onClick={() => {
                            setIsOpenNotificationModal(false);
                            handleDeleteNotification(notificationDetails.id);
                            handleDeleteLocal(notificationDetails.id);
                          }}
                        >
                          <BsFillTrash3Fill size={14} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        </Modal>
      )}
      {isStudent ? (
        <motion.div
          className="bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg w-1/5 h-[526px] top-[90px] right-[18.7%] fixed z-40"
          variants={{
            show: {
              opacity: 1,
              y: 0,
              transformOrigin: "top right",
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
            hide: {
              opacity: 0,
              y: 0,
              transformOrigin: "top right",
              scale: 0,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
          }}
          animate={isOpenNotifications ? "show" : "hide"}
          initial={{ opacity: 0, y: 0, scale: 0, transformOrigin: "top right" }}
        >
          <motion.div className="h-1/6 text-2xl font-extrabold py-6 px-6 flex justify-between items-center">
            <motion.p>Notifications</motion.p>
          </motion.div>
          <motion.hr className="border-[1px] border-black/5 border-top w-full" />
          <motion.ul className="overflow-auto h-5/6">
            <motion.p className="bg-black/5 px-6 py-2"> Today</motion.p>
            <motion.hr className="border-[1px] border-black/5 border-top w-full" />
            {notifications?.length !== 0 ? (
              notifications.map((i, k) => {
                return (
                  <motion.li
                    key={k}
                    className="hover:bg-black/5 cursor-pointer transition-all duration-100"
                    onClick={() => {
                      setNotificationDetails(i);
                      setIsOpenNotificationModal(true);
                      if (i.isSeen === false) {
                        markNotification(i.id, true);
                        handleChangeSeen(i.id, true);
                      }
                    }}
                  >
                    {(() => {
                      if (i.details?.status === "upcoming") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdSos size={24} />}
                              description={`<span style="font-weight: bold;">You </span>have successfully <span style="font-weight: bold;">booked </span>an <span style="font-weight: bold;">SOS appointment</span>`}
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        } else if (i.type === "standard") {
                          if (
                            i?.details?.creator ===
                            i?.details?.userDetails?.idNo
                          ) {
                            return (
                              <NotificationItems
                                status={i.details?.status}
                                k={k}
                                icon={<AiOutlineLike size={24} />}
                                description={`<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">approved </span>your regular appointment on <span style="font-weight: bold;">${
                                  convertDate(i.details.start)[0]
                                } to ${convertDate(i.details.end)[2]}</span>`}
                                isSeen={i.isSeen}
                                createdDate={i.createdDate}
                              />
                            );
                          } else {
                            return (
                              <NotificationItems
                                status={i.details?.status}
                                k={k}
                                icon={<AiOutlineSchedule size={24} />}
                                description={`<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">scheduled </span>your regular appointment on <span style="font-weight: bold;">${
                                  convertDate(i.details.start)[0]
                                } to ${convertDate(i.details.end)[2]}</span>`}
                                isSeen={i.isSeen}
                                createdDate={i.createdDate}
                              />
                            );
                          }
                        }
                      } else if (i.details?.status === "completed") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCheckCircleOutline size={24} />}
                              description={
                                '<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">marked</span> your <span style="font-weight: bold;">SOS appointment</span> as completed'
                              }
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        } else if (i.type === "standard") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCheckCircleOutline size={24} />}
                              description={
                                '<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">marked</span> your <span style="font-weight: bold;">Regular appointment</span> as completed'
                              }
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        }
                      } else if (i.details?.status === "cancelled") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCancel size={24} />}
                              description={
                                '<span style="font-weight: bold;">PLV Guidance Counselling Center </span> has <span style="font-weight: bold;">cancelled </span> your <span style="font-weight: bold;">SOS appointment</span>'
                              }
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        } else if (i.type === "standard") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCancel size={24} />}
                              description={
                                '<span style="font-weight: bold;">PLV Guidance Counselling Center </span> has <span style="font-weight: bold;">cancelled </span> your <span style="font-weight: bold;">regular appointment</span>'
                              }
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        }
                      } else if (i.details?.status === "pending") {
                        return (
                          <NotificationItems
                            status={i.details?.status}
                            k={k}
                            icon={<MdOutlinePending size={24} />}
                            description={`<span style="font-weight: bold;">You </span> have <span style="font-weight: bold;">pending </span> appointment on <span style="font-weight: bold;">${
                              convertDate(i.details.start)[0]
                            } to ${convertDate(i.details.end)[2]}</span>`}
                            isSeen={i.isSeen}
                            createdDate={i.createdDate}
                          />
                        );
                      } else if (i.type === "edited") {
                        return (
                          <NotificationItems
                            status={i?.type}
                            k={k}
                            icon={<MdSchedule size={24} />}
                            description={`<span style="font-weight: bold;">PLV Guidance Counselling Center</span><span style="font-weight: bold;"> rescheduled/edited </span> your appointment`}
                            isSeen={i.isSeen}
                            createdDate={i.createdDate}
                          />
                        );
                      }
                      return null;
                    })()}
                  </motion.li>
                );
              })
            ) : (
              <div className="w-full flex justify-center items-center mt-20">
                No notifications
              </div>
            )}
          </motion.ul>
        </motion.div>
      ) : (
        <motion.div
          className="bg-[--light-brown] rounded-t-2xl border-2 border-black/10 shadow-lg w-1/5 h-[55%] fixed right-20 bottom-0 z-40"
          variants={{
            show: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
            hide: {
              opacity: 0,
              y: 550,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
          }}
          animate={isOpenNotifications ? "show" : "hide"}
          initial={{ opacity: 0, y: 550 }}
        >
          <motion.div className="h-1/6 text-2xl font-extrabold py-6 px-6 flex justify-between items-center">
            <motion.p>Notifications</motion.p>
            <motion.button
              onClick={() => {
                setIsOpenNotifications(false);
                setNotificationDetails({});
              }}
              type="button"
              className="text-black/40"
            >
              <FaTimes size={20} />
            </motion.button>
          </motion.div>
          <motion.hr className="border-[1px] border-black/5 border-top w-full" />
          <motion.ul className="overflow-auto h-5/6">
            <motion.p className="bg-black/5 px-6 py-2"> Today</motion.p>
            <motion.hr className="border-[1px] border-black/5 border-top w-full" />
            {notifications?.length !== 0 ? (
              notifications.map((i, k) => {
                return (
                  <motion.li
                    key={k}
                    className="hover:bg-black/5 cursor-pointer transition-all duration-100"
                    onClick={() => {
                      setNotificationDetails(i);
                      setIsOpenNotificationModal(true);
                      if (i.isSeen === false) {
                        markNotification(i.id, true);
                        handleChangeSeen(i.id, true);
                      }
                    }}
                  >
                    {(() => {
                      if (i.details?.status === "upcoming") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdSos size={24} />}
                              description={`<span style="font-weight: bold;">${i?.details?.userDetails?.name} </span>have successfully <span style="font-weight: bold;">booked </span>an <span style="font-weight: bold;">SOS appointment</span>`}
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        }
                      } else if (i.details?.status === "cancelled") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCancel size={24} />}
                              description={`<span style="font-weight: bold;">${i?.details?.userDetails?.name} </span> has <span style="font-weight: bold;">cancelled </span><span style="font-weight: bold;">SOS appointment</span>`}
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        } else if (i.type === "standard") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCancel size={24} />}
                              description={`<span style="font-weight: bold;">${i?.details?.userDetails?.name} </span> has <span style="font-weight: bold;">cancelled </span><span style="font-weight: bold;">regular appointment</span>`}
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        }
                      } else if (i.details?.status === "pending") {
                        return (
                          <NotificationItems
                            status={i.details?.status}
                            k={k}
                            icon={<MdOutlinePending size={24} />}
                            description={`<span style="font-weight: bold;">${
                              i?.details?.userDetails?.name
                            } </span> has a <span style="font-weight: bold;">pending </span> appointment on <span style="font-weight: bold;">${
                              convertDate(i.details.start)[0]
                            } to ${convertDate(i.details.end)[2]}</span>`}
                            isSeen={i.isSeen}
                            createdDate={i.createdDate}
                          />
                        );
                      } else if (i.type === "edited") {
                        console.log(i);
                        return (
                          <NotificationItems
                            status={i?.type}
                            k={k}
                            icon={<MdSchedule size={24} />}
                            description={`<span style="font-weight: bold;">${i?.details?.old?.userDetails?.name}</span><span style="font-weight: bold;"> rescheduled/edited </span> appointment`}
                            isSeen={i.isSeen}
                            createdDate={i.createdDate}
                          />
                        );
                      }
                      return null;
                    })()}
                  </motion.li>
                );
              })
            ) : (
              <div className="w-full flex justify-center items-center mt-20">
                No notifications
              </div>
            )}
          </motion.ul>
        </motion.div>
      )}
    </>
  );
}

export default NotificationContainer;
