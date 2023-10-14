import { useNavigate } from "react-router-dom";

import { HiArrowLongRight } from "react-icons/hi2";
import plvGCLogo from "../assets/plv-gc-logo.png";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-[url('./assets/dots.webp')] w-screen h-screen flex flex-col items-center pt-44 h-screen bg-[--light-brown] px-96">
      <div className="text-md">
        <p className="font-medium text-black/60">Break the stigma</p>
      </div>
      <div className="text-6xl text-center font-black leading-snug mt-5">
        <p className="">
          A{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[--light-green] to-[#1cd8d2] text-shadow">
            chatbot that serves as a tool
          </span>{" "}
        </p>
        <p className="">for seeking mental health</p>
        <p className="text-black"> support </p>
        {/* <p className="text-black">of PLV students</p> */}
      </div>
      <div className="mt-8 text-md">
        <p className="font-medium text-black/60 text-center px-72">
          Designed to help Pamantasan ng Lungsod ng Valenzuela students to
          bridge the gap between guidance counselors.
        </p>
      </div>
      <div className="mt-10">
        <button
          className="font-semibold text-sm rounded-full bg-gradient-to-r from-[--light-green] to-[#1cd8d2] text-black p-[2px] shadow-xl shadow-[#1cd8d2]/30"
          onClick={() => {
            navigate("/login");
          }}
        >
          <div className="flex gap-3 items-center p-3 px-4 rounded-full bg-gradient-to-r from-[--light-green] to-[#1cd8d2] hover:bg-gradient-to-r hover:from-[--light-brown] hover:to-[--light-brown] hover:text-black transition-all duration-300">
            Redirect to chatbot <HiArrowLongRight />
          </div>
        </button>
      </div>
      <div className="font-medium text-black/60 mt-32 items-center flex flex-col">
        <p className="mb-5">Guided by</p>
        <div className="flex gap-3">
          <img src={plvGCLogo} alt="" className="h-32" />
        </div>
      </div>
    </div>
  );
}

export default Home;
