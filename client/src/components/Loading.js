import { motion } from "framer-motion";

import logo from "../assets/logo/katoto-logo.png";

import katotoLoader from "../assets/katoto/katoto-loader.png";

function Loading() {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-[--light-brown]">
      {/* <div className="w-[150px] h-[150px]">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ rotate: 360, scale: 1 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.5,
            duration: 1,
          }}
        >
          <img src={logo} alt="loading..." className="logo-breath" />
        </motion.div>
      </div> */}
      {/* <div className="relative logo-breath">
        <img src={katotoLoader} alt="" className="h-[250px]" />
        <div class="absolute top-[20%] left-[30%]">
          <span class="loader"></span>
        </div>
      </div> */}
      <div className="lds-ring">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
}

export default Loading;
