import { useNavigate } from "react-router-dom";

import { HiArrowLongRight } from "react-icons/hi2";

import katoto from "../assets/logo/katoto-logo.png";

function Error() {
  const navigate = useNavigate();
  return (
    <div className="bg-[url('./assets/dots.webp')] w-screen flex flex-col h-screen items-center pt-24 bg-[--light-brown]">
      <div className="font-extrabold  flex items-center gap-3">
        <p className="text-transparent text-5xl bg-clip-text bg-gradient-to-b from-[--light-green] to-[#1cd8d2] text-shadow">
          Oopss!
        </p>
        <p className="text-5xl">Nothing Here</p>
      </div>
      <div className="text-[22rem] font-black flex gap-3 items-center">
        <span className="text-transparent bg-clip-text bg-gradient-to-b from-[--light-green] to-[#1cd8d2] text-shadow">
          4
        </span>
        <div className="box rounded-full">
          <img
            src={katoto}
            className="h-[20rem] bg-gradient-to-b from-[--light-green] to-[#1cd8d2] rounded-full shadow-2xl shadow-[#1cd8d2]"
            alt=""
          />
        </div>
        <span className="text-transparent bg-clip-text bg-gradient-to-b from-[--light-green] to-[#1cd8d2]">
          4
        </span>
      </div>

      <div className="">
        <button
          className="font-semibold text-sm rounded-full bg-gradient-to-r from-[--light-green] to-[#1cd8d2] text-black p-[2px] shadow-xl shadow-[#1cd8d2]/30"
          onClick={() => {
            navigate(-1);
          }}
        >
          <div className="flex gap-3 items-center p-3 px-4 rounded-full bg-gradient-to-r from-[--light-green] to-[#1cd8d2] hover:bg-gradient-to-r hover:from-[--light-brown] hover:to-[--light-brown] hover:text-black transition-all duration-300">
            Return to previous page <HiArrowLongRight />
          </div>
        </button>
      </div>
    </div>
  );
}

export default Error;
