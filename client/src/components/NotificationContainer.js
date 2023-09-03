import axios from "../api/axios";
import { useState } from "react";

import { motion } from "framer-motion";
import { MdSos } from "react-icons/md";
import { FaTimes } from "react-icons/fa";
import {
  BsCalendar4Week,
  BsClockHistory,
  BsFillTrash3Fill,
} from "react-icons/bs";

import Modal from "../components/Modal";

function NotificationContainer({
  toast,
  auth,
  isOpenNotifications,
  setIsOpenNotifications,
  notifications,
  setNotifications,
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
      <Modal isOpen={isOpenNotificationModal}>
        <div className="w-full justify-between flex">
          <p className="text-2xl font-extrabold">
            {(() => {
              if (notificationDetails.type === "sos") {
                return "SOS Emergency Appointment";
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
                        <td>{notificationDetails.details.userDetails.name}</td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Gender</td>
                        <td>
                          {notificationDetails.details.userDetails.gender}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Email</td>
                        <td>{notificationDetails.details.userDetails.email}</td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">
                          {" "}
                          ID Number
                        </td>
                        <td> {notificationDetails.details.userDetails.idNo}</td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">Course</td>
                        <td>
                          {notificationDetails.details.userDetails.department}
                        </td>
                      </tr>
                      <tr>
                        <td className="w-[150px] flex justify-start">
                          Year and Section
                        </td>
                        <td>
                          {notificationDetails.details.userDetails.yearSection}
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
                        <td className="w-[150px] flex justify-start">Phone</td>
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
            y: 300,
            transition: {
              type: "spring",
              stiffness: 500,
              damping: 40,
            },
          },
        }}
        animate={isOpenNotifications ? "show" : "hide"}
        initial={{ opacity: 0, y: 300 }}
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
          {notifications.map((i, k) => {
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
                  if (i.type == "sos") {
                    return (
                      <>
                        {k === 0 ? null : (
                          <motion.hr className="border-[1px] border-black/5 border-top w-full" />
                        )}
                        <motion.div className="flex gap-3 px-6 py-6">
                          <div className="bg-[--red] h-fit rounded-full p-1 text-white border border-2 border-[--red]">
                            <MdSos size={24} />
                          </div>
                          <motion.div className="flex flex-col gap-1 text-sm items-start">
                            <motion.div>
                              <span className="font-bold">
                                {i.details.userDetails.name}{" "}
                              </span>
                              has booked an{" "}
                              <span className="font-bold">
                                SOS Emergency appointment{" "}
                              </span>{" "}
                              on {convertDate(i.details.scheduledDate)[0]}
                            </motion.div>
                            <motion.div
                              className={`text-sm ${
                                !i.isSeen
                                  ? "font-bold text-[--dark-green]"
                                  : "text-black/60"
                              }`}
                            >
                              Now
                            </motion.div>
                          </motion.div>
                          <motion.div className="w-auto flex mt-1">
                            {!i.isSeen ? (
                              <motion.div className="w-3 h-3 rounded-full bg-[--dark-green]" />
                            ) : null}
                          </motion.div>
                        </motion.div>
                      </>
                    );
                  }
                  return null;
                })()}
              </motion.li>
            );
          })}
        </motion.ul>
      </motion.div>
    </>
  );
}

export default NotificationContainer;
