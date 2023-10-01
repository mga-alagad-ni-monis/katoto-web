import axios from "../api/axios";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

import moment from "moment";
import CalendarSmall from "react-calendar";
import Holidays from "date-holidays";

import {
  BsFillBellFill,
  BsFillCalendar2WeekFill,
  BsCalendar4Week,
  BsClockHistory,
} from "react-icons/bs";

import NotificationContainer from "./NotificationContainer";

function NavBar({ auth, logout, socket, toast }) {
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [isOpenAppointments, setIsOpenAppointments] = useState(false);
  const [isEditAppointment, setIsEditAppointment] = useState(false);

  const [notifications, setNotifications] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);

  const [yourAppointment, setYourAppointment] = useState({});

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const [appointmentDateStart, setAppointmentDateStart] = useState("");
  const [appointmentDateEnd, setAppointmentDateEnd] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [preferredMode, setPreferredMode] = useState("facetoface");

  const location = useLocation();

  const holiday = new Holidays("PH");

  useEffect(() => {
    if (auth?.userInfo) {
      getNotification();
      getMyAppointment();
      getBookedAppointments();
    }
  }, [auth]);

  useEffect(() => {
    setUnreadNotifications(0);
    countUnreadNotifications();
  }, [notifications]);

  useEffect(() => {
    if (socket) {
      socket.on("studentScheduleResponse", () => {
        setTimeout(async () => {
          await getNotification();
        }, 200);
      });

      socket.on("cancelAppointmentResponse", () => {
        setTimeout(async () => {
          await getNotification();
        }, 200);
      });

      socket.on("editAppointmentResponse", () => {
        setTimeout(async () => {
          await getNotification();
        }, 200);
      });

      socket.on("approveAppointmentResponse", () => {
        setTimeout(async () => {
          await getNotification();
        }, 200);
      });

      socket.on("completeAppointmentResponse", () => {
        setTimeout(async () => {
          await getNotification();
        }, 200);
      });
    }
  }, [socket]);

  const convertDateAppointment = (date, hours, minutes) => {
    const date_object = new Date(date);

    date_object.setHours(hours);
    date_object.setMinutes(minutes);
    date_object.setSeconds(0);

    return date_object.toLocaleString();
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
        });
      // .catch((err) => {
      //   toast.error(err?.response?.data);
      // });
    } catch (err) {
      toast.error(err);
      toast.error("Error");
    }
  };

  const convertToDateObject = (appointments) => {
    const result = appointments.map((i) => {
      if (i.data.type === "standard") {
        return {
          title: i.title,
          start: moment(i.start).toDate(),
          end: moment(i.end).toDate(),
          data: i.data,
        };
      }
      return {
        title: i.title,
        start: moment(i.scheduledDate).toDate(),
        end: moment(i.scheduledDate).toDate(),
        data: i.data,
      };
    });

    return result;
  };

  const getNotification = async () => {
    try {
      await axios
        .get("/api/notifications/get", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setNotifications(res?.data?.notifications?.reverse());
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const getMyAppointment = async () => {
    try {
      await axios
        .get("/api/appointments/mine", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setYourAppointment(res?.data?.appointment);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const countUnreadNotifications = () => {
    notifications.forEach((i) => {
      if (!i.isSeen) {
        setUnreadNotifications(
          (unreadNotifications) => unreadNotifications + 1
        );
      }
    });
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

  const cancelRealTime = async (appointment) => {
    try {
      socket.emit("cancelAppointmentRequest", {
        appointmentDetails: appointment,
        token: auth?.accessToken,
      });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleCancelAppointment = async (id, type) => {
    try {
      await axios
        .post(
          "/api/appointments/cancel",
          { id, type },
          {
            withCredentials: true,

            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          let newAppointment = {};
          newAppointment[`${type === "standard" ? "sos" : "standard"}`] =
            yourAppointment[`${type === "standard" ? "sos" : "standard"}`];
          setYourAppointment(newAppointment);
          toast.success(res?.data?.message);
          setTimeout(() => {
            let appointment = yourAppointment[`${type}`];
            appointment["status"] = "cancelled";
            cancelRealTime(appointment);
          }, 200);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const editAppointmentRealTime = async (appointment) => {
    try {
      socket.emit("editAppointmentRequest", {
        appointmentDetails: appointment,
        token: auth?.accessToken,
      });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleSaveChangesAppointment = async (id, type) => {
    try {
      await axios
        .post(
          "/api/appointments/edit",
          {
            id,
            type,
            appointmentDateStart,
            appointmentDateEnd,
            appointmentMode: preferredMode,
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
          editAppointmentRealTime(res?.data?.appointmentOldNew);
          // setTimeout(() => {
          //   getAppointments();
          //   getBookedAppointments();
          // }, 200);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const availableTime = [
    { no: "8", time: "8:00:00 AM" },
    { no: "9", time: "9:00:00 AM" },
    { no: "10", time: "10:00:00 AM" },
    { no: "11", time: "11:00:00 AM" },
    { no: "13", time: "1:00:00 PM" },
    { no: "14", time: "2:00:00 PM" },
  ];

  return (
    <>
      {location.pathname === "/login" || "/chat" ? (
        <div
          className={`fixed w-full z-40 ${
            location.pathname === "/login"
              ? "bg-transparent"
              : "bg-[--light-brown]"
          } `}
        >
          <nav
            className={`flex ${
              location.pathname === "/login"
                ? "justify-between bg-transparent"
                : "justify-end bg-[--light-brown]"
            } py-10 items-center container mx-auto 2xl:px-[2rem]`}
          >
            <p className="text-4xl font-extrabold w-1/2 z-50">Katoto</p>
            <div className="flex pl-28 justify-between w-1/2 items-center z-50">
              <li className="flex gap-10 font-bold">
                <ul>
                  <Link to={"/chat"}>Chatbot</Link>
                </ul>
                <ul>
                  <Link to={"/view-campaigns"}>Campaigns</Link>
                </ul>
              </li>
              {auth ? (
                <div className="flex gap-5">
                  <button
                    className={`${
                      isOpenAppointments
                        ? "bg-[--light-green] text-[--dark-green]"
                        : "bg-black/20 text-black"
                    } rounded-lg font-semibold text-sm py-2 px-3
                    hover:bg-[--light-green] hover:text-[--dark-green] transition-all duration-300 relative`}
                    onClick={() => {
                      setIsOpenNotifications(false);
                      setIsOpenAppointments(!isOpenAppointments);
                    }}
                  >
                    <BsFillCalendar2WeekFill size={20} />
                    {Object.keys(yourAppointment).length !== 0 ? (
                      <span
                        className="absolute min-w-[50%] min-h-[50%] p-1 bg-[--dark-green] rounded-full -top-2 -right-2 
                    text-xs text-center flex justify-center items-center text-white"
                      >
                        {Object.keys(yourAppointment).length}
                      </span>
                    ) : null}
                  </button>
                  <button
                    className={`${
                      isOpenNotifications
                        ? "bg-[--light-green] text-[--dark-green]"
                        : "bg-black/20 text-black"
                    } rounded-lg font-semibold text-sm py-2 px-3
                    hover:bg-[--light-green] hover:text-[--dark-green] transition-all duration-300 relative`}
                    onClick={() => {
                      setIsOpenAppointments(false);
                      setIsOpenNotifications(!isOpenNotifications);
                    }}
                  >
                    <BsFillBellFill size={20} />
                    {unreadNotifications !== 0 ? (
                      <span
                        className="absolute min-w-[50%] min-h-[50%] p-1 bg-[--dark-green] rounded-full -top-2 -right-2 text-xs 
                    text-center flex justify-center items-center text-white"
                      >
                        {unreadNotifications}
                      </span>
                    ) : null}
                  </button>
                  <button
                    className="bg-black rounded-full font-semibold text-[--light-brown] text-sm py-2 px-8 hover:bg-transparent hover:text-black border-2 border-black transition-all duration-300"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          </nav>
        </div>
      ) : null}
      <motion.div
        className="bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg w-auto h-auto top-[90px] right-[22%] fixed z-40"
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
        animate={isOpenAppointments ? "show" : "hide"}
        initial={{ opacity: 0, y: 0, scale: 0, transformOrigin: "top right" }}
      >
        <motion.div className="h-1/6 text-2xl font-extrabold py-6 px-6 flex justify-between items-center">
          <motion.p>
            {isEditAppointment ? "Edit Appointment" : "Your Appointment"}{" "}
          </motion.p>
        </motion.div>

        {isEditAppointment ? (
          <>
            <motion.hr className="border-[1px] border-black/5 border-top w-full" />
            <div className="w-full p-5">
              <p className="mb-3">{`Date: ${
                convertDate(appointmentDateStart)[0]
              } - ${convertDate(appointmentDateEnd)[2]}`}</p>
              <div className="flex justify-between gap-5 mb-5">
                <div className="flex flex-wrap gap-5 mb-5 gap-y-3 w-[123px]">
                  {availableTime.map((i, k) => {
                    return bookedAppointments.some(
                      (j) =>
                        `${new Date(selectedTime).toLocaleDateString()}, ${
                          i.time
                        }` === new Date(j.start).toLocaleString()
                    ) ? (
                      <button
                        key={k}
                        className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] transition-all duration-300 opacity-50 w-full"
                        disabled
                      >
                        {i.time}
                      </button>
                    ) : (
                      <button
                        key={k}
                        className="w-full bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                        onClick={() => {
                          setAppointmentDateStart(
                            convertDateAppointment(
                              new Date(selectedTime).toLocaleString(),
                              i.no,
                              0
                            )
                          );
                          setAppointmentDateEnd(
                            convertDateAppointment(
                              new Date(selectedTime).toLocaleString(),
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
                <CalendarSmall
                  onChange={(data) => {
                    setSelectedTime(data);
                  }}
                  value={selectedTime}
                  tileDisabled={({ date }) =>
                    [0].includes(date.getDay()) ||
                    holiday.isHoliday(date) ||
                    new Date(date) < new Date()
                  }
                />
              </div>
              <div>
                <p className="text-[--dark-green] font-bold flex items-center mb-3">
                  Change Mode
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
                  <option
                    hidden
                    value=""
                    defaultValue
                    className="text-black/30"
                  ></option>
                  <option value="virtual">Virtual</option>
                  <option value="facetoface">Face-to-face</option>
                </select>
              </div>
              <div className="flex w-full justify-end gap-5">
                <button
                  className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                  onClick={() => {
                    setIsEditAppointment(false);
                    setSelectedTime("");
                    setPreferredMode("");
                    setAppointmentDateStart("");
                    setAppointmentDateEnd("");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                  onClick={() => {
                    handleSaveChangesAppointment(
                      yourAppointment?.standard?.id,
                      yourAppointment?.standard?.type
                    );
                    setIsEditAppointment(false);
                    setSelectedTime("");
                    setPreferredMode("");
                    setAppointmentDateStart("");
                    setAppointmentDateEnd("");
                  }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <motion.p className="bg-black/5 px-6 py-2 font-bold">
              Regular
            </motion.p>
            <motion.div className="overflow-auto h-5/6 px-5 py-5">
              {yourAppointment?.standard ? (
                <>
                  <div className="flex justify-start gap-5">
                    <div
                      className={`w-max p-2 rounded-lg ${
                        yourAppointment?.standard?.status === "upcoming"
                          ? "bg-[--light-green]"
                          : "bg-[--yellow] "
                      }  text-black h-max text-xs mb-3`}
                    >
                      {yourAppointment?.standard?.status === "upcoming"
                        ? "Upcoming"
                        : "Pending"}
                    </div>
                    <div className="w-max p-2 rounded-lg bg-black text-[--light-brown] h-max  text-xs mb-3">
                      {yourAppointment?.standard?.mode === "facetoface"
                        ? "Face-to-face"
                        : "Virtual"}
                    </div>
                  </div>
                  <div className="flex gap-3 mb-5">
                    <div className="bg-black/10 w-full h-auto p-3 rounded-lg">
                      <div className="flex gap-4">
                        <BsCalendar4Week size={24} />
                        <p>
                          {convertDate(yourAppointment?.standard?.start)[1]}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/10 w-max h-auto p-3 rounded-lg mb-5">
                    <div className="flex gap-4">
                      <BsClockHistory size={24} />
                      <p>{`${
                        convertDate(yourAppointment?.standard?.start)[2]
                      } to ${
                        convertDate(yourAppointment?.standard?.end)[2]
                      }`}</p>
                      <p>45 mins</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-5">
                    {new Date(yourAppointment?.standard?.start) <
                    new Date() ? null : (
                      <>
                        <button
                          className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                          onClick={() => {
                            handleCancelAppointment(
                              yourAppointment?.standard?.id,
                              yourAppointment?.standard?.type
                            );
                          }}
                        >
                          Cancel
                        </button>

                        {yourAppointment?.standard?.creator ===
                        auth?.userInfo?.idNo ? (
                          <button
                            className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] 
          transition-all duration-300"
                            onClick={() => {
                              setIsEditAppointment(true);
                              setSelectedTime(yourAppointment?.standard?.start);
                              setAppointmentDateStart(
                                yourAppointment?.standard?.start
                              );
                              setAppointmentDateEnd(
                                yourAppointment?.standard?.end
                              );
                              setPreferredMode(yourAppointment?.standard?.mode);
                            }}
                          >
                            Reschedule
                          </button>
                        ) : null}
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div>No Regular Appointments</div>
              )}
            </motion.div>
            <motion.p className="bg-black/5 px-6 py-2 font-bold">SOS</motion.p>
            <motion.div className="overflow-auto h-5/6 px-5 py-5">
              {yourAppointment?.sos ? (
                <>
                  <div className="flex justify-start gap-5">
                    <div className="w-max p-2 rounded-lg bg-[--light-green] text-black h-max text-xs mb-3">
                      Upcoming
                    </div>
                    <div className="w-max p-2 rounded-lg bg-black text-[--light-brown] h-max  text-xs mb-3">
                      {yourAppointment?.sos?.mode === "facetoface"
                        ? "Face-to-face"
                        : "Virtual"}
                    </div>
                  </div>
                  <div className="flex gap-3 mb-5">
                    <div className="bg-black/10 w-full h-auto p-3 rounded-lg">
                      <div className="flex gap-4">
                        <BsCalendar4Week size={24} />
                        <p>Anytime</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-5">
                    {new Date(yourAppointment?.start) < new Date() ? null : (
                      <>
                        <button
                          className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                          onClick={() => {
                            handleCancelAppointment(
                              yourAppointment?.sos?.id,
                              yourAppointment?.sos?.type
                            );
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <div>No SOS Appointments</div>
              )}
            </motion.div>
          </>
        )}
      </motion.div>
      <NotificationContainer
        toast={toast}
        auth={auth}
        isOpenNotifications={isOpenNotifications}
        setIsOpenNotifications={setIsOpenNotifications}
        notifications={notifications}
        setNotifications={setNotifications}
        isStudent={true}
      />
      <Outlet />
    </>
  );
}

export default NavBar;
