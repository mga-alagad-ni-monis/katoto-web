import axios from "../api/axios";

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Link, Outlet } from "react-router-dom";

import { BsFillBellFill } from "react-icons/bs";

import NotificationContainer from "./NotificationContainer";

function NavBar({ auth, logout, socket, toast }) {
  const [isOpenNotifications, setIsOpenNotifications] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [unreadNotifications, setUnreadNotifications] = useState(0);

  const location = useLocation();

  useEffect(() => {
    getNotification();
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
                      isOpenNotifications
                        ? "bg-[--light-green] text-[--dark-green]"
                        : "bg-black/20 text-black"
                    } rounded-lg font-semibold text-sm py-2 px-3
                    hover:bg-[--light-green] hover:text-[--dark-green] transition-all duration-300 relative`}
                    onClick={() => {
                      setIsOpenNotifications(!isOpenNotifications);
                    }}
                  >
                    <BsFillBellFill size={20} />
                    <span className="absolute p-1 bg-[--dark-green] rounded-full -top-2 -right-2 text-xs text-center flex justify-center items-center text-white">
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
