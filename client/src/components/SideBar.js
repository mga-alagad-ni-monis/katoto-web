import axios from "../api/axios";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

import logo from "../assets/katoto-logo.png";

import { BsCardList, BsChatDots, BsMegaphone, BsPeople } from "react-icons/bs";
import { AiOutlineLogout } from "react-icons/ai";

function SideBar({ toast }) {
  const [isHovered, setIsHovered] = useState(false);

  const { setAuth } = useAuth();

  const logout = async () => {
    setAuth({});
    try {
      await axios
        .get("/api/logout", { withCredentials: true })
        .then((res) => {
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      console.log(err);
    }
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
            <div className="flex justify-center ">
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
                    to={"/logs"}
                    className="flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200"
                  >
                    {isHovered ? (
                      <div className="flex gap-5 items-center">
                        <BsChatDots size={20} />
                        <span className=" word-in">Conversation</span>
                      </div>
                    ) : (
                      <BsChatDots size={24} />
                    )}
                  </Link>
                </li>
                <li>
                  <Link to={"/announcements"}>
                    {isHovered ? (
                      <div className="flex gap-5 items-center hover:text-[--dark-green] transition-all duration-200">
                        <BsMegaphone size={20} />
                        <span className=" word-in">Announcements</span>
                      </div>
                    ) : (
                      <BsMegaphone size={24} />
                    )}
                  </Link>
                </li>
                <li>
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
                </li>
              </ul>
            </div>
          </div>
          <div
            onClick={logout}
            className="flex gap-5 items-center justify-center transition-all duration-200 cursor-pointer"
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
      <Outlet />
    </>
  );
}

export default SideBar;
