import { useState, useEffect, useRef } from "react";

import axios from "../api/axios";
import { motion, AnimatePresence } from "framer-motion";

import { FiChevronDown } from "react-icons/fi";
import { RiFileExcel2Line } from "react-icons/ri";
import { HiOutlineArrowLongRight } from "react-icons/hi2";

import logo from "../assets/logo/katoto-logo.png";
import wave from "../assets/wave.png";
import Loading from "../components/Loading";

function Conversations({ auth, toast }) {
  const [conversations, setConversations] = useState([]);
  const [tempConversations, setTempConversations] = useState([]);
  const [messages, setMessages] = useState([]);

  const [email, setEmail] = useState("");
  const [time, setTime] = useState("");
  const [search, setSearch] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  const bottomRef = useRef(null);

  useEffect(() => {
    (async () => {
      await handleGetAllConversations();
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGetAllConversations = async () => {
    try {
      await axios
        .get("/api/logs/get/all", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setConversations(res?.data?.conversations);
          let uniqueArray = [];
          res?.data?.conversations
            ?.slice()
            .reverse()
            .forEach((i) => {
              if (!uniqueArray.some((j) => j.email === i?.email)) {
                uniqueArray.push(i);
              }
            });
          setTempConversations(uniqueArray);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleViewConversation = (email, time) => {
    setEmail(email);
    setTime(time);
    conversations.forEach((i) => {
      if (i.email === email) {
        let messageArr = [];
        i.conversation.forEach((j) => {
          messageArr.push({
            dateTime: j.dateTime,
            sender: j.studentMessage.sender,
            message: j.studentMessage.message,
          });
          messageArr.push({
            sender: j.katotoMessage.sender,
            message: j.katotoMessage.message,
          });
        });
        setMessages(messageArr);
      }
    });
  };

  const filteredConversations = () => {
    const newConversations = tempConversations?.filter((i) => {
      if (search?.toLowerCase().trim()) {
        return (
          i?.email.toLowerCase().includes(search.toLowerCase()) ||
          new Date(
            new Date(
              i?.conversation[i?.conversation.length - 1].dateTime?._seconds *
                1000 +
                i?.conversation[i?.conversation.length - 1].dateTime
                  ?._nanoseconds /
                  1000000
            )
              .toLocaleDateString()
              .split("/")[2],
            new Date(
              i?.conversation[i?.conversation.length - 1].dateTime?._seconds *
                1000 +
                i?.conversation[i?.conversation.length - 1].dateTime
                  ?._nanoseconds /
                  1000000
            )
              .toLocaleDateString()
              .split("/")[0] - 1,
            new Date(
              i?.conversation[i?.conversation.length - 1].dateTime?._seconds *
                1000 +
                i?.conversation[i?.conversation.length - 1].dateTime
                  ?._nanoseconds /
                  1000000
            )
              .toLocaleDateString()
              .split("/")[1]
          )
            .toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      } else {
        return i;
      }
    });
    return newConversations;
  };

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-[--light-brown] h-screen">
          <div className="flex flex-col px-52">
            <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
              Conversation Logs
            </p>
            <div className="flex">
              <div className="w-2/5">
                <div className="flex justify-between w-full items-center mb-5">
                  <div className="flex gap-5">
                    <div>
                      <p className="mb-3 font-bold text-xs">
                        What are you looking for?
                      </p>
                      <input
                        type="text"
                        placeholder="Search..."
                        className="py-2 px-5 bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                </div>
                <table
                  className="w-full rounded-lg shadow-lg bg-[--light-green] relative"
                  style={{ backgroundColor: "rgba(169, 230, 194, 0.2)" }}
                >
                  <tbody className="flex flex-col max-h-[624px] overflow-y-auto">
                    {filteredConversations()?.map((i, k) => {
                      return (
                        <tr key={k}>
                          <td
                            className={`flex font-medium mx-1 px-5 my-1 py-3 text-sm ${
                              k % 2 ? "bg-[--light-green] rounded-lg" : null
                            }`}
                          >
                            <div className="w-full flex truncate text-ellipsis">
                              <div className="flex justify-between w-full">
                                <div className="flex flex-col gap-2">
                                  <p className="text-sm font-bold">
                                    {i?.email}
                                  </p>
                                  <p className="font-semibold text-xs flex gap-2">
                                    Last message:
                                    <span>
                                      {new Date(
                                        new Date(
                                          i?.conversation[
                                            i?.conversation.length - 1
                                          ].dateTime?._seconds *
                                            1000 +
                                            i?.conversation[
                                              i?.conversation.length - 1
                                            ].dateTime?._nanoseconds /
                                              1000000
                                        )
                                          .toLocaleDateString()
                                          .split("/")[2],
                                        new Date(
                                          i?.conversation[
                                            i?.conversation.length - 1
                                          ].dateTime?._seconds *
                                            1000 +
                                            i?.conversation[
                                              i?.conversation.length - 1
                                            ].dateTime?._nanoseconds /
                                              1000000
                                        )
                                          .toLocaleDateString()
                                          .split("/")[0] - 1,
                                        new Date(
                                          i?.conversation[
                                            i?.conversation.length - 1
                                          ].dateTime?._seconds *
                                            1000 +
                                            i?.conversation[
                                              i?.conversation.length - 1
                                            ].dateTime?._nanoseconds /
                                              1000000
                                        )
                                          .toLocaleDateString()
                                          .split("/")[1]
                                      ).toLocaleDateString("en-US", {
                                        month: "long",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                    <span>
                                      {new Date(
                                        i?.conversation[
                                          i?.conversation.length - 1
                                        ].dateTime?._seconds * 1000
                                      ).getHours() %
                                        12 ===
                                      0
                                        ? new Date(
                                            i?.conversation[
                                              i?.conversation.length - 1
                                            ].dateTime?._seconds * 1000
                                          ).getHours()
                                        : new Date(
                                            i?.conversation[
                                              i?.conversation.length - 1
                                            ].dateTime?._seconds * 1000
                                          ).getHours() % 12}
                                      :
                                      {new Date(
                                        i?.conversation[
                                          i?.conversation.length - 1
                                        ].dateTime?._seconds * 1000
                                      ).getMinutes() < 10
                                        ? "0" +
                                          new Date(
                                            i?.conversation[
                                              i?.conversation.length - 1
                                            ].dateTime?._seconds * 1000
                                          ).getMinutes()
                                        : new Date(
                                            i?.conversation[
                                              i?.conversation.length - 1
                                            ].dateTime?._seconds * 1000
                                          ).getMinutes()}
                                      &nbsp;
                                      {new Date(
                                        i?.conversation[
                                          i?.conversation.length - 1
                                        ].dateTime?._seconds * 1000
                                      ).getHours() <= 12
                                        ? "A.M."
                                        : "P.M."}
                                    </span>
                                  </p>
                                </div>
                                <div className="flex h-full items-end">
                                  <button
                                    className="font-semibold text-xs flex gap-2 items-center bg-[--dark-green] text-[--light-brown] border-2 border border-[--dark-green] hover:bg-transparent p-1 rounded-md hover:text-[--dark-green] transition-all duration-300"
                                    onClick={() => {
                                      handleViewConversation(
                                        i?.email,
                                        i?.conversation[
                                          i?.conversation.length - 1
                                        ].dateTime
                                      );
                                    }}
                                  >
                                    View Conversation
                                    <HiOutlineArrowLongRight />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="w-3/5 flex justify-center mt-[3.5rem]">
                <div className="h-[560px] w-[680px] bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg">
                  {messages.length ? (
                    <>
                      <div className="relative h-max">
                        <div className="h-20 rounded-t-xl flex bg-[--light-green] items-center justify-between px-8">
                          <div className="flex gap-5 pb-3 pt-5 items-center">
                            <div className="flex flex-col justify-center">
                              <p className="text-xl font-extrabold z-20">
                                {email}
                              </p>
                              {time ? (
                                <p className="text-xs font-semibold z-20 flex gap-2">
                                  Last message:
                                  <span>
                                    {new Date(
                                      new Date(
                                        time._seconds * 1000 +
                                          time._nanoseconds / 1000000
                                      )
                                        .toLocaleDateString()
                                        .split("/")[2],
                                      new Date(
                                        time._seconds * 1000 +
                                          time._nanoseconds / 1000000
                                      )
                                        .toLocaleDateString()
                                        .split("/")[0] - 1,
                                      new Date(
                                        time._seconds * 1000 +
                                          time._nanoseconds / 1000000
                                      )
                                        .toLocaleDateString()
                                        .split("/")[1]
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span>
                                    {new Date(time._seconds * 1000).getHours() %
                                      12 ===
                                    0
                                      ? new Date(
                                          time._seconds * 1000
                                        ).getHours()
                                      : new Date(
                                          time._seconds * 1000
                                        ).getHours() % 12}
                                    :
                                    {new Date(
                                      time._seconds * 1000
                                    ).getMinutes() < 10
                                      ? "0" +
                                        new Date(
                                          time._seconds * 1000
                                        ).getMinutes()
                                      : new Date(
                                          time._seconds * 1000
                                        ).getMinutes()}
                                    &nbsp;
                                    {new Date(
                                      time._seconds * 1000
                                    ).getHours() <= 12
                                      ? "A.M."
                                      : "P.M."}
                                  </span>
                                </p>
                              ) : null}
                            </div>
                          </div>
                          <button
                            className="z-20"
                            // onClick={() => {
                            //   setIsTyping(false);
                            //   setIsGuided(false);
                            //   setIsFriendly(false);
                            //   setIsInitial(true);
                            // }}
                          >
                            {/* <IoIosSettings size={26} /> */}
                          </button>
                        </div>
                        <img
                          src={wave}
                          className="w-full absolute top-12"
                          alt=""
                        />
                      </div>
                      <div className="flex flex-col justify-between h-[430px]">
                        <div className="px-5 mb-1 flex flex-col overflow-y-auto gap-3 pt-10">
                          {messages?.map((i, k) => {
                            return i?.sender === "Katoto" ? (
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
                                  <img
                                    src={logo}
                                    alt="logo"
                                    className="h-[30px]"
                                  />
                                  <div className="bg-black/10 max-w-[50%] py-3 px-4 rounded-b-3xl rounded-tr-3xl text-sm flex items-center text-left mt-5">
                                    {i?.message}
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
                                className="flex w-full items-end flex-col"
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
                                  {i?.message}
                                </motion.li>
                                <p className="text-xs text-black/50 mt-1 flex gap-1 font-semibold">
                                  <span>
                                    {new Date(
                                      new Date(
                                        i?.dateTime?._seconds * 1000 +
                                          i?.dateTime?._nanoseconds / 1000000
                                      )
                                        .toLocaleDateString()
                                        .split("/")[2],
                                      new Date(
                                        i?.dateTime?._seconds * 1000 +
                                          i?.dateTime?._nanoseconds / 1000000
                                      )
                                        .toLocaleDateString()
                                        .split("/")[0] - 1,
                                      new Date(
                                        i?.dateTime?._seconds * 1000 +
                                          i?.dateTime?._nanoseconds / 1000000
                                      )
                                        .toLocaleDateString()
                                        .split("/")[1]
                                    ).toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                  <span>
                                    {new Date(
                                      i?.dateTime?._seconds * 1000
                                    ).getHours() %
                                      12 ===
                                    0
                                      ? new Date(
                                          i?.dateTime?._seconds * 1000
                                        ).getHours()
                                      : new Date(
                                          i?.dateTime?._seconds * 1000
                                        ).getHours() % 12}
                                    :
                                    {new Date(
                                      i?.dateTime?._seconds * 1000
                                    ).getMinutes() < 10
                                      ? "0" +
                                        new Date(
                                          i?.dateTime?._seconds * 1000
                                        ).getMinutes()
                                      : new Date(
                                          i?.dateTime?._seconds * 1000
                                        ).getMinutes()}
                                    &nbsp;
                                    {new Date(
                                      i?.dateTime?._seconds * 1000
                                    ).getHours() <= 12
                                      ? "A.M."
                                      : "P.M."}
                                  </span>
                                </p>
                              </motion.div>
                            );
                          })}
                          <div ref={bottomRef} />
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="h-full w-full flex justify-center items-center font-extrabold text-3xl">
                      Please select a conversation
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Conversations;
