import { motion } from "framer-motion";

import logo from "../assets/katoto-logo.png";

function Loading() {
  return (
    <div className="w-full h-screen flex justify-center items-center bg-[--light-brown]">
      <div className="w-[150px] h-[150px]">
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
      </div>
    </div>
  );
}

export default Loading;
