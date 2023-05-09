import { useState } from "react";
import { Link } from "react-router-dom";
import "../index.css";

import { BsCardList, BsChatDots, BsMegaphone, BsPeople } from "react-icons/bs";

function SideBar() {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="fixed left-0 top-0 w-[5%] hover:w-[15%] transtion-all duration-500 h-full bg-[--light-brown] shadow-2xl"
      onMouseOver={() => {
        setIsHovered(true);
      }}
      onMouseOut={() => {
        setIsHovered(false);
      }}
    >
      <div className="flex justify-center mt-12">
        <p className="font-extrabold text-4xl w-max p-2 rounded-xl">K</p>
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
              className="flex gap-5 items-center hover:text-[--dark-green] transtion-all duration-200"
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
              className="flex gap-5 items-center hover:text-[--dark-green] transtion-all duration-200"
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
                <div className="flex gap-5 items-center hover:text-[--dark-green] transtion-all duration-200">
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
              className="flex gap-5 items-center hover:text-[--dark-green] transtion-all duration-200"
            >
              {isHovered ? (
                <div className="flex gap-5 items-center">
                  <BsPeople size={20} />
                  <span className=" word-in">User Accounts</span>
                </div>
              ) : (
                <BsPeople size={24} />
              )}
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default SideBar;
