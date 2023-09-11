import axios from "../api/axios";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link, Outlet } from "react-router-dom";
import { motion } from "framer-motion";

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

  const [notifications, setNotifications] = useState([]);

  const [yourAppointment, setYourAppointment] = useState({});

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const location = useLocation();

  useEffect(() => {
    getNotification();
    getMyAppointment();
  }, []);

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

      socket.on("editAppointmentResponse", (appointmentDetails) => {
        setTimeout(async () => {
          await getNotification();
        }, 200);
      });
    }
  }, [socket]);

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
                    <span
                      className="absolute min-w-[50%] min-h-[50%] p-1 bg-[--dark-green] rounded-full -top-2 -right-2 
                    text-xs text-center flex justify-center items-center text-white"
                    >
                      1
                    </span>
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
                    <span
                      className="absolute min-w-[50%] min-h-[50%] p-1 bg-[--dark-green] rounded-full -top-2 -right-2 text-xs 
                    text-center flex justify-center items-center text-white"
                    >
                      {unreadNotifications}
                    </span>
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
          <motion.p>Your Appointment</motion.p>
        </motion.div>
        <motion.hr className="border-[1px] border-black/5 border-top w-full" />

        <motion.div className="overflow-auto h-5/6 px-5 py-5">
          <div className="flex gap-3 mb-5">
            <div className="bg-black/10 w-max h-auto p-3 rounded-lg">
              <div className="flex gap-4">
                <BsCalendar4Week size={24} />
                <p>{convertDate(yourAppointment?.start)[1]}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] h-max text-xs mb-3">
                Upcoming
              </div>
              <div className="w-max p-2 rounded-lg bg-black text-[--light-brown] h-max  text-xs mb-3">
                {yourAppointment?.mode}
              </div>
            </div>
          </div>
          <div className="bg-black/10 w-max h-auto p-3 rounded-lg mb-5">
            <div className="flex gap-4">
              <BsClockHistory size={24} />
              <p>{`${convertDate(yourAppointment?.start)[2]} to ${
                convertDate(yourAppointment?.end)[2]
              }`}</p>
              <p>45 mins</p>
            </div>
          </div>

          <div className="flex justify-between mb-3">
            {new Date(yourAppointment?.start) < new Date() ? null : (
              <>
                <button
                  className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                >
                  Cancel Appointment
                </button>
                <button
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] 
          transition-all duration-300"
                >
                  Edit Appointment
                </button>
              </>
            )}
          </div>
        </motion.div>
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
