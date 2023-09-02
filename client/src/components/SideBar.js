import axios from "../api/axios";
import { useState, useEffect } from "react";
import { Link, Outlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import logo from "../assets/logo/katoto-logo.png";
import NotificationContainer from "./NotificationContainer";

import {
  BsCardList,
  BsChatDots,
  BsMegaphone,
  BsPeople,
  BsRobot,
  BsBell,
} from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";

function SideBar({ toast, logout, auth, socket }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotification();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("scheduleResponse", async () => {
        await getNotification();
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
          setNotifications(res?.data?.notifications);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleOpenNotification = () => {
    console.log("asdasdsadadads");
  };

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
              <img src={logo} alt="logo" className="w-[80px] h-[80px]" />
            </div>
            <div className="flex justify-center">
              <ul
                className={`flex flex-col ${
                  isHovered ? "gap-7" : "gap-7"
                } font-medium 2xl:mt-36`}
              >
                <li>
                  <Link
                    to={"/reports"}
                    className="flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200"
                  >
                    {isHovered ? (
                      <div className="flex gap-5 items-center">
                        <BsCardList size={20} />
                        <span className="word-in">Reports</span>
                      </div>
                    ) : (
                      <BsCardList size={24} />
                    )}
                  </Link>
                </li>
                <li>
                  <Link
                    to={"/train"}
                    className="flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200"
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
                    to={"/logs"}
                    className="flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200"
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
                  <Link to={"/campaigns"}>
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
              <div
                onClick={handleOpenNotification}
                className="flex gap-7 items-center justify-start transition-all duration-200 cursor-pointer"
              >
                {isHovered ? (
                  <div
                    className="flex gap-5 items-center text--black] font-medium"
                    onClick={() => {
                      setIsOpenNotifications(!isOpenNotifications);
                    }}
                  >
                    <BsBell size={20} />
                    <span className=" word-in">Notifications</span>
                  </div>
                ) : (
                  <BsBell size={24} className="text-black]" />
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
        isOpenNotifications={isOpenNotifications}
        notifications={notifications}
      />
      <Outlet />
    </>
  );
}

export default SideBar;
