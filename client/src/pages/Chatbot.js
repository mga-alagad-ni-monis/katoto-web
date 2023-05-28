import { useState, useRef, useEffect } from "react";
import axios from "../api/axios";
import axiosDef from "axios";
import { motion, AnimatePresence } from "framer-motion";

import { IoSend } from "react-icons/io5";
import { IoIosSettings } from "react-icons/io";

import katoto from "../assets/katoto/katoto-full.png";
import katotoWatch from "../assets/katoto/katoto-watch.png";
import logo from "../assets/logo/katoto-logo.png";
import wave from "../assets/wave.png";

function Chatbot({ toast, auth }) {
  const [isInitial, setIsInitial] = useState(true);
  const [isGuided, setIsGuided] = useState(false);
  const [isFriendly, setIsFriendly] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const [katotoMessage, setKatotoMessage] = useState("");
  const [inputFriendly, setInputFriendly] = useState("");

  const [guidedButtons, setGuidedButtons] = useState([]);

  const [messages, setMessages] = useState([]);

  const bottomRef = useRef(null);

  useEffect(() => {
    handleGetConversation();
    if (!isInitial) {
      handleSubmitMessage(auth.accessToken, "hi");
    }
  }, [isInitial]);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, guidedButtons]);

  const handleGetConversation = async (req, res) => {
    try {
      await axios
        .get("/api/logs/get/student", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setMessages(res?.data?.conversation);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleSubmitMessage = async (sender, inputMessage) => {
    try {
      setGuidedButtons([]);
      setInputFriendly("");
      setIsTyping(true);
      setMessages([...messages, { sender, message: inputMessage }]);

      axiosDef
        .post(process.env.REACT_APP_KATOTO_API_URI, {
          sender,
          message: inputMessage,
        })
        .then((res) => {
          const buttons = res.data[0].buttons.map((i) => {
            return i.title;
          });
          setKatotoMessage(res.data[0].text);
          setTimeout(() => {
            setMessages([
              ...messages,
              { sender, message: inputMessage },
              { sender: "Katoto", message: res.data[0].text },
            ]);
            setIsTyping(false);
            setTimeout(() => {
              setGuidedButtons(buttons);
            }, 1000);
          }, 900);

          return axios.post(
            "/api/logs/send",
            {
              studentMessage: { sender, message: inputMessage },
              katotoMessage: {
                sender: "Katoto",
                message: res.data[0].text,
              },
            },
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${auth?.accessToken}`,
              },
            }
          );
        })
        .then((res) => {
          setKatotoMessage("");
        })
        .catch((err) => {
          toast.error("Error");
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  return (
    <div className="flex items-center bg-[--light-brown] justify-center h-screen">
      <div className="flex items-center gap-32">
        <div className="relative">
          <img
            src={katotoWatch}
            alt="katoto"
            className="h-[270px] absolute -top-[250px] right-1/2 translate-x-1/2"
          />

          <div className="h-max w-[350px] bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg pt-10 pb-5 px-5">
            <p className="text-2xl font-extrabold flex justify-center mb-5">
              Quote of the Day
            </p>
            <div className="bg-[--light-green] px-5 py-8 rounded-lg text-center font-semibold text-lg">
              Sometimes you just need to take a deep breath.
            </div>
          </div>
        </div>
        <div className="h-[510px] w-[600px] bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg">
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
                  setIsTyping(false);
                  setIsGuided(false);
                  setIsFriendly(false);
                  setIsInitial(true);
                }}
              >
                <IoIosSettings size={26} />
              </button>
            </div>
            <img src={wave} className="w-full absolute top-12" alt="" />
          </div>
          <div className="flex flex-col justify-between h-[430px]">
            {isInitial ? (
              <div className="px-5 pt-10 pb-5 h-full flex items-end justify-center relative">
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
                      text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green] transition-all duration-300"
                      onClick={() => {
                        handleGetConversation();
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
                      text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green] transition-all duration-300"
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
              <div className="px-5 mb-1 flex flex-col overflow-y-auto gap-3 pt-10">
                {messages.map((i, k) => {
                  return i.sender === "Katoto" ? (
                    <motion.div
                      key={k}
                      variants={{
                        hidden: { opacity: 1, scale: 0 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          transition: {
                            delayChildren: 0.2,
                            staggerChildren: 0.2,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                      className="flex w-full justify-start gap-3"
                    >
                      <motion.li
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: {
                            y: 0,
                            opacity: 1,
                          },
                        }}
                        className="flex w-full justify-start gap-3 list-none"
                      >
                        <img src={logo} alt="logo" className="h-[30px]" />
                        <div className="bg-black/10 max-w-[50%] py-3 px-4 rounded-b-3xl rounded-tr-3xl text-sm flex items-center text-left mt-5">
                          {i.message}
                        </div>
                      </motion.li>
                    </motion.div>
                  ) : (
                    <motion.div
                      key={k}
                      variants={{
                        hidden: { opacity: 1, scale: 0 },
                        visible: {
                          opacity: 1,
                          scale: 1,
                          transition: {
                            delayChildren: 0.2,
                            staggerChildren: 0.2,
                          },
                        },
                      }}
                      initial="hidden"
                      animate="visible"
                      className="flex w-full justify-end"
                    >
                      <motion.li
                        variants={{
                          hidden: { y: 20, opacity: 0 },
                          visible: {
                            y: 0,
                            opacity: 1,
                          },
                        }}
                        className="bg-[--light-green] max-w-[50%] py-3 px-4 rounded-t-3xl rounded-bl-3xl text-sm flex items-center text-left"
                      >
                        {i.message}
                      </motion.li>
                    </motion.div>
                  );
                })}
                {isTyping ? (
                  <motion.div
                    variants={{
                      hidden: { opacity: 1, scale: 0 },
                      visible: {
                        opacity: 1,
                        scale: 1,
                        transition: {
                          delayChildren: 0.2,
                          staggerChildren: 0.2,
                        },
                      },
                    }}
                    initial="hidden"
                    animate="visible"
                    className="flex w-full justify-start gap-3"
                  >
                    <motion.li
                      variants={{
                        hidden: { y: 20, opacity: 0 },
                        visible: {
                          y: 0,
                          opacity: 1,
                        },
                      }}
                      className="flex w-full justify-start gap-3 list-none"
                    >
                      <img src={logo} alt="logo" className="h-[30px]" />
                      <div className="bg-black/10 max-w-[50%] py-3 px-4 rounded-b-3xl rounded-tr-3xl text-sm flex items-center text-left mt-5">
                        <p className="dot-typing my-1 mx-3"></p>
                      </div>
                    </motion.li>
                  </motion.div>
                ) : null}
                <div ref={bottomRef} />
              </div>
            )}

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
                        key={k}
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
                          onClick={() => {
                            handleSubmitMessage(auth.accessToken, i);
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
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmitMessage(auth.accessToken, inputFriendly);
                  }}
                >
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
                        value={inputFriendly}
                        onChange={(e) => {
                          setInputFriendly(e.target.value);
                        }}
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
                        <button
                          className="w-[46px] h-[46px] rounded-full bg-[--dark-green] flex justify-center items-center text-[--light-brown] cursor-pointer border-2 
                      border-[--dark-green] hover:text-[--dark-green] hover:bg-[--light-brown] transition-all duration-300"
                          type="submit"
                        >
                          <IoSend />
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                </form>
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
