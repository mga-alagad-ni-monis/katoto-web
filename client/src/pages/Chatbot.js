import { useState } from "react";
import axios from "../api/axios";
import axiosDef from "axios";
import { motion, AnimatePresence } from "framer-motion";

import { IoSend } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";

import katoto from "../assets/katoto/katoto-full.png";
import katotoWatch from "../assets/katoto/katoto-watch.png";
import logo from "../assets/logo/katoto-logo.png";
import wave from "../assets/wave.png";

function Chatbot() {
  const [isInitial, setIsInitial] = useState(true);
  const [isGuided, setIsGuided] = useState(false);
  const [isFriendly, setIsFriendly] = useState(false);

  const [guidedButtons, setGuidedButtons] = useState([
    "Hello",
    "May problema ako",
    "Kailangan ko ng kausap",
  ]);

  const [messages, setMessages] = useState([]);

  const handleSubmitMessage = async (sender, inputMessage) => {
    try {
      setMessages([...messages, { sender, message: inputMessage }]);
      await axiosDef
        .post(
          "https://rasa-server-alvinpanerio.cloud.okteto.net/webhooks/rest/webhook",
          {
            sender,
            message: inputMessage,
          }
        )
        .then((res) => {
          setMessages([
            ...messages,
            { sender: "Katoto", message: res.data[0].text },
          ]);
        });
    } catch (err) {}
  };

  return (
    <div className="flex items-center bg-[--light-brown] justify-center h-screen">
      <div className="flex items-center gap-32 ">
        <div className="relative">
          <img
            src={katotoWatch}
            alt="katoto"
            className="h-[270px] absolute -top-[250px] right-1/2 translate-x-1/2"
          />
          <div className="h-[270px] w-[350px] bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg"></div>
        </div>
        <div className="h-[510px] w-[570px] bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg">
          <div className="relative h-max">
            <div className="h-20 rounded-t-xl flex bg-[--light-green] items-center justify-between px-8">
              <div className="flex gap-5 py-3 items-center">
                <img src={logo} alt="logo" className="h-[50px] z-20" />
                <div className="flex flex-col justify-center">
                  <p className="text-xs font-medium z-20">
                    Tara kuwentuhan! kasama si
                  </p>
                  <p className="text-xl font-extrabold z-20">KATOTO</p>
                </div>
              </div>
              <button
                className="z-20"
                onClick={() => {
                  setIsGuided(false);
                  setIsFriendly(false);
                  setIsInitial(true);
                }}
              >
                <IoIosSettings size={26} />
              </button>
            </div>
            <img src={wave} className="w-[570px] absolute top-12" alt="" />
          </div>
          <div className="flex flex-col justify-between h-[430px]">
            <div className="px-5 pt-10 pb-5 h-full flex items-end justify-center relative">
              {isInitial ? (
                <div className="flex flex-col gap-3 items-center">
                  <motion.div
                    variants={{
                      hidden: { opacity: 1, scale: 0 },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        transition: {
                          delayChildren: 0.8,
                          staggerChildren: 0.2,
                        },
                      },
                    }}
                    initial="hidden"
                    animate="visible"
                    className="flex flex-col gap-3 items-center list-none mb-5"
                  >
                    <motion.li
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: {
                          y: 0,
                          opacity: 1,
                        },
                      }}
                    >
                      <p className="text-xs">Click to choose</p>
                    </motion.li>
                    <motion.li
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: {
                          y: 0,
                          opacity: 1,
                        },
                      }}
                    >
                      <button
                        className="text-sm px-5 py-2 rounded-full w-max font-medium cursor-pointer bg-[--dark-green] border-2 border-[--dark-green] 
                      text-[--light-brown] hover:bg-white hover:text-[--dark-green] transition-all duration-300"
                        onClick={() => {
                          setIsGuided(true);
                          setIsFriendly(false);
                          setIsInitial(false);
                        }}
                      >
                        Counselor-Guided Mode
                      </button>
                    </motion.li>
                    <motion.li
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: {
                          y: 0,
                          opacity: 1,
                        },
                      }}
                    >
                      <button
                        className="text-sm px-5 py-2 rounded-full w-max font-medium cursor-pointer bg-[--dark-green] border-2 border-[--dark-green] 
                      text-[--light-brown] hover:bg-white hover:text-[--dark-green] transition-all duration-300"
                        onClick={() => {
                          setIsGuided(false);
                          setIsFriendly(true);
                          setIsInitial(false);
                        }}
                      >
                        Friendly Conversation Mode
                      </button>
                    </motion.li>
                    <motion.li
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: {
                          y: 0,
                          opacity: 1,
                        },
                      }}
                    >
                      <p className="text-xs">
                        {"Learn more about our "}
                        <span className="font-bold text-[--dark-green] hover:underline transition-all cursor-pointer">
                          Privacy Policy
                        </span>
                        .
                      </p>
                    </motion.li>
                  </motion.div>
                </div>
              ) : (
                <div>
                  {messages.map((i, k) => {
                    return <div key={k}>{i.message}</div>;
                  })}
                </div>
              )}
            </div>
            <div className="w-full">
              {isGuided ? (
                <motion.div
                  variants={{
                    hidden: { opacity: 1, scale: 0 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        delayChildren: 0.3,
                        staggerChildren: 0.2,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                  className="px-5 py-3 list-none justify-between flex w-full mb-3"
                >
                  {guidedButtons.map((i, k) => {
                    return (
                      <motion.li
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: {
                            y: 0,
                            opacity: 1,
                          },
                        }}
                      >
                        <button
                          className="text-sm px-5 py-2 rounded-full w-max font-medium cursor-pointer bg-[--dark-green] border-2 border-[--dark-green] 
              text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green] transition-all duration-300"
                          key={k}
                          onClick={() => {
                            handleSubmitMessage("Alvin", i);
                          }}
                        >
                          {i}
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.div>
              ) : null}
              {isFriendly ? (
                <motion.div
                  variants={{
                    hidden: { opacity: 1, scale: 0 },
                    visible: {
                      opacity: 1,
                      scale: 1,
                      transition: {
                        delayChildren: 0.3,
                        staggerChildren: 0.2,
                      },
                    },
                  }}
                  initial="hidden"
                  animate="visible"
                  className="px-3 py-3 list-none flex gap-5 w-full"
                >
                  <motion.li
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                      },
                    }}
                    className="w-full"
                  >
                    <input
                      id="message"
                      className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-none placeholder-black/30 font-semibold w-full"
                      type="text"
                      placeholder="Aa..."
                      required
                    />
                  </motion.li>
                  <div className="w-[50px] h-[50px]">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ rotate: 360, scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.8,
                      }}
                    >
                      <div
                        className="w-[46px] h-[46px] rounded-full bg-[--dark-green] flex justify-center items-center text-[--light-brown] cursor-pointer border-2 
                      border-[--dark-green] hover:text-[--dark-green] hover:bg-[--light-brown] transition-all duration-300"
                      >
                        <IoSend />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
      <div className="pb-8">
        <img src={katoto} alt="katoto" className="h-[600px]" />
      </div>
    </div>
  );
}

export default Chatbot;
