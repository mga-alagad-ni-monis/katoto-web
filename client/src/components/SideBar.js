import axios from "../api/axios";
import { useState, useEffect } from "react";

import { Link, Outlet, useLocation } from "react-router-dom";

import logo from "../assets/logo/katoto-logo.png";
import NotificationContainer from "./NotificationContainer";

import { toHeaderCase } from "js-convert-case";

import {
  BsCardList,
  BsChatDots,
  BsMegaphone,
  BsPeople,
  BsRobot,
  BsBell,
  BsCalendar4Week,
  BsGrid1X2,
  BsChevronUp,
  BsChevronDown,
  BsPerson,
} from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";

function SideBar({ toast, logout, auth, socket }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [isOpenReportsModal, setIsOpenReportsModal] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const location = useLocation();

  useEffect(() => {
    getNotification();
  }, []);

  useEffect(() => {
    if (!isHovered) {
      setIsOpenReportsModal(false);
    }
  }, [isHovered]);

  useEffect(() => {
    setUnreadNotifications(0);
    countUnreadNotifications();
  }, [notifications]);

  useEffect(() => {
    if (socket) {
      socket.on("scheduleResponse", async () => {
        setTimeout(async () => {
          await getNotification();
        }, 200);
        toast.success("Appointment Added!");
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

  const countUnreadNotifications = () => {
    notifications.forEach((i) => {
      if (!i.isSeen) {
        setUnreadNotifications(
          (unreadNotifications) => unreadNotifications + 1
        );
      }
    });
  };

  const reportsPath = ["appointments", "users", "concerns", "feedbacks"];

  return (
    <>
      <div
        className="fixed left-0 top-0 w-[5%] hover:w-[15%] transtion-all duration-500 h-full bg-[--light-brown] shadow-lg z-40"
        onMouseOver={() => {
          setIsHovered(true);
        }}
        onMouseOut={() => {
          setIsHovered(false);
        }}
      >
        <div className="flex justify-between flex-col h-full py-12">
          <div>
            <div className="flex justify-center">
              {isHovered ? (
                <img
                  src={logo}
                  alt="logo"
                  className="h-[70px] z-20 bg-[--light-green] rounded-full"
                />
              ) : (
                <img
                  src={logo}
                  alt="logo"
                  className="h-[50px] z-20 bg-[--light-green] rounded-full"
                />
              )}
            </div>
            <div className="flex justify-center">
              <ul
                className={`flex flex-col ${
                  isHovered ? "gap-7" : "gap-7"
                } font-medium 2xl:mt-36`}
              >
                <li>
                  <Link
                    to={"/dashboard"}
                    className={`flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200 ${
                      location.pathname === "/dashboard"
                        ? "font-extrabold text-[--dark-green]"
                        : null
                    }`}
                  >
                    {isHovered ? (
                      <div className="flex gap-5 items-center">
                        <BsGrid1X2 size={20} />
                        <span className="word-in">Dashboard</span>
                      </div>
                    ) : (
                      <BsGrid1X2 size={24} />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    onClick={() => {
                      setIsOpenReportsModal(!isOpenReportsModal);
                    }}
                    className={`flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200 ${
                      location.pathname === "/reports/appointments" ||
                      location.pathname === "/reports/concerns" ||
                      location.pathname === "/reports/users" ||
                      location.pathname === "/reports/feedbacks"
                        ? "font-extrabold text-[--dark-green]"
                        : null
                    }`}
                  >
                    {isHovered ? (
                      <div className="flex gap-5 items-center">
                        <BsCardList size={20} />
                        <span className="word-in">Reports</span>

                        {isOpenReportsModal ? (
                          <BsChevronUp size={14} />
                        ) : (
                          <BsChevronDown size={14} />
                        )}
                      </div>
                    ) : (
                      <BsCardList size={24} />
                    )}
                  </Link>
                  {isOpenReportsModal ? (
                    <div className="mt-5 rounded-lg pl-10">
                      <ul
                        className={`flex flex-col ${
                          isHovered ? "gap-5" : "gap-5"
                        } font-medium`}
                      >
                        {reportsPath.map((i, k) => {
                          return (
                            <li key={k}>
                              <Link
                                to={`/reports/${i}`}
                                className="flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200"
                              >
                                <div className="flex gap-5 items-center">
                                  <span
                                    className={`word-in ${
                                      location.pathname === `/reports/${i}`
                                        ? "text-[--dark-green] font-bold"
                                        : null
                                    }`}
                                  >
                                    {toHeaderCase(i)}
                                  </span>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ) : null}
                </li>
                <li>
                  <Link
                    to={"/train"}
                    className={`flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200 ${
                      location.pathname === "/train"
                        ? "font-extrabold text-[--dark-green]"
                        : null
                    }`}
                  >
                    {isHovered ? (
                      <div className="flex gap-5 items-center">
                        <BsRobot size={20} />
                        <span className="word-in">Train</span>
                      </div>
                    ) : (
                      <BsRobot size={24} />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/appointments"}
                    className={`flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200 ${
                      location.pathname === "/appointments"
                        ? "font-extrabold text-[--dark-green]"
                        : null
                    }`}
                  >
                    {isHovered ? (
                      <div className="flex gap-5 items-center">
                        <BsCalendar4Week size={20} />
                        <span className="word-in">Appointments</span>
                      </div>
                    ) : (
                      <BsCalendar4Week size={24} />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/logs"}
                    className={`flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200 ${
                      location.pathname === "/logs"
                        ? "font-extrabold text-[--dark-green]"
                        : null
                    }`}
                  >
                    {isHovered ? (
                      <div className="flex gap-5 items-center">
                        <BsChatDots size={20} />
                        <span className=" word-in">Conversations</span>
                      </div>
                    ) : (
                      <BsChatDots size={24} />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/campaigns"}
                    className={`flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200 ${
                      location.pathname === "/campaigns"
                        ? "font-extrabold text-[--dark-green]"
                        : null
                    }`}
                  >
                    {isHovered ? (
                      <div className="flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200">
                        <BsMegaphone size={20} />
                        <span className=" word-in">Campaigns</span>
                      </div>
                    ) : (
                      <BsMegaphone size={24} />
                    )}
                  </Link>
                </li>
                <li>
                  {auth.roles !== undefined ? (
                    auth.roles[0] !== "systemAdministrator" ? null : (
                      <Link
                        to={"/accounts"}
                        className="flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200"
                      >
                        {isHovered ? (
                          <div className="flex gap-5 items-center">
                            <BsPeople size={20} />
                            <span className="word-in">User Accounts</span>
                          </div>
                        ) : (
                          <BsPeople size={24} />
                        )}
                      </Link>
                    )
                  ) : null}
                </li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="flex flex-col gap-7 font-medium 2xl:mt-36">
              <div>
                <Link
                  to={"/profile"}
                  className={`flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200 ${
                    location.pathname === "/profile"
                      ? "font-extrabold text-[--dark-green]"
                      : null
                  }`}
                >
                  {isHovered ? (
                    <div className="flex gap-5 items-center">
                      <BsPerson size={24} />
                      <span className="word-in">Profile</span>
                    </div>
                  ) : (
                    <BsPerson size={28} />
                  )}
                </Link>
              </div>
              <div
                onClick={() => {
                  setIsOpenNotifications(!isOpenNotifications);
                }}
                className="flex gap-7 items-center justify-start transition-all duration-200 cursor-pointer"
              >
                {isHovered ? (
                  <div className="flex gap-5 items-center text--black] font-medium relative">
                    <BsBell size={20} />
                    <div className="word-in relative">Notifications</div>
                    {unreadNotifications !== 0 ? (
                      <span className="absolute p-1 h-6 w-6 bg-[--dark-green] rounded-full -top-0 -right-8 text-xs text-center flex justify-center items-center text-white">
                        {unreadNotifications}
                      </span>
                    ) : null}
                  </div>
                ) : (
                  <div className="relative">
                    <BsBell size={24} className="text-black]" />
                    {unreadNotifications > 0 ? (
                      <span className="absolute p-1 w-full h-full min-w-6 min-h-6 bg-[--dark-green] rounded-full -top-3 -right-3 text-xs text-center flex justify-center items-center text-white">
                        {unreadNotifications}
                      </span>
                    ) : null}
                  </div>
                )}
              </div>
              <div
                onClick={logout}
                className="flex gap-5 items-center justify-start transition-all duration-200 cursor-pointer"
              >
                {isHovered ? (
                  <div className="flex gap-5 items-center text-[--red] font-medium">
                    <AiOutlineLogout size={20} />
                    <span className=" word-in">Log out</span>
                  </div>
                ) : (
                  <AiOutlineLogout size={24} className="text-[--red]" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <NotificationContainer
        toast={toast}
        auth={auth}
        isOpenNotifications={isOpenNotifications}
        setIsOpenNotifications={setIsOpenNotifications}
        notifications={notifications}
        setNotifications={setNotifications}
      />
      <Outlet />
    </>
  );
}

export default SideBar;
