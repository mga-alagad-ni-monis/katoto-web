import axios from "../api/axios";
import { useState } from "react";

import TimeAgo from "react-timeago";

import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import {
  BsCalendar4Week,
  BsClockHistory,
  BsFillTrash3Fill,
  BsCalendarPlus,
} from "react-icons/bs";

import { AiOutlineLike, AiOutlineSchedule } from "react-icons/ai";

import {
  MdOutlineCancel,
  MdSchedule,
  MdEdit,
  MdOutlineCheckCircleOutline,
  MdOutlinePending,
  MdSos,
} from "react-icons/md";

import Modal from "../components/Modal";
import NotificationItems from "./Notifications/NotificationItems";
import NotificationModal from "./Notifications/NotificationModal";

function NotificationContainer({
  toast,
  auth,
  isOpenNotifications,
  setIsOpenNotifications,
  notifications,
  setNotifications,
  isStudent,
}) {
  const [notificationDetails, setNotificationDetails] = useState({});
  const [isOpenNotificationModal, setIsOpenNotificationModal] = useState(false);

  const convertDate = (date) => {
    const formattedDate = new Date(date);

    const convertedDateTime = formattedDate.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Singapore",
    });

    const convertedDate = formattedDate.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Singapore",
    });

    const convertedTime = formattedDate.toLocaleString("en-PH", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Singapore",
    });

    return [convertedDateTime, convertedDate, convertedTime];
  };

  const markNotification = async (id, isSeen) => {
    try {
      await axios
        .post(
          "/api/notifications/mark",
          { id, isSeen },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {})
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleDeleteNotification = async (id) => {
    try {
      await axios
        .post(
          "/api/notifications/delete",
          { id },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleChangeSeen = (id, isSeen) => {
    const newNotifications = notifications.map((i) => {
      if (i.id === id) {
        i.isSeen = isSeen;
      }
      return i;
    });
    setNotifications(newNotifications);
  };

  const handleDeleteLocal = (id) => {
    const newNotifications = notifications.filter((i) => i.id !== id);
    setNotifications(newNotifications);
  };

  return (
    <>
      {isOpenNotificationModal ? (
        <motion.div
          className="bg-black/50 absolute w-screen h-screen z-50 overflow-hidden"
          variants={{
            show: {
              opacity: 1,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
            hide: {
              opacity: 0,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
          }}
          animate={isOpenNotificationModal ? "show" : "hide"}
          initial={{
            opacity: 0,
          }}
        ></motion.div>
      ) : null}
      {isStudent ? (
        <Modal isOpen={isOpenNotificationModal}>
          {(() => {
            if (notificationDetails.details?.status === "upcoming") {
              if (notificationDetails.type === "sos") {
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="SOS Appointment"
                    status={notificationDetails.details?.status}
                    icon={<MdSos size={48} />}
                    description={`<span style="font-weight: bold;">You </span>have successfully <span style="font-weight: bold;">booked </span>an <span style="font-weight: bold;">SOS appointment</span>. You can come to PLV Guidance Counseling Center anytime, and you will be entertained first.`}
                    appointmentDetails={notificationDetails}
                    dateTime={
                      "You can come anytime at PLV Guidance Counseling Center, and you will be entertained first"
                    }
                    isDisplay={true}
                    handleDeleteNotification={handleDeleteNotification}
                    handleDeleteLocal={handleDeleteLocal}
                  />
                );
              } else if (notificationDetails.type === "standard") {
                if (
                  notificationDetails?.details?.creator ===
                  notificationDetails?.details?.userDetails?.idNo
                ) {
                  return (
                    <NotificationModal
                      setIsOpenNotificationModal={setIsOpenNotificationModal}
                      title="Regular Appointment"
                      status={notificationDetails.details?.status}
                      icon={<AiOutlineLike size={40} />}
                      description={`<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">approved </span>your regular appointment on <span style="font-weight: bold;">${
                        convertDate(notificationDetails.details.start)[0]
                      } to ${
                        convertDate(notificationDetails.details.end)[2]
                      }</span>`}
                      appointmentDetails={notificationDetails}
                      dateTime={
                        <div className="flex gap-4">
                          {<BsCalendar4Week size={24} />}
                          <p>
                            {convertDate(notificationDetails.details.start)[1]}
                          </p>
                          <div className="border-[1px] border-black/20 border-right"></div>
                          {<BsClockHistory size={24} />}
                          <p>
                            {convertDate(notificationDetails.details.start)[2]}{" "}
                            to {convertDate(notificationDetails.details.end)[2]}
                          </p>
                          <p>45 mins</p>
                        </div>
                      }
                      isDisplay={true}
                      handleDeleteNotification={handleDeleteNotification}
                      handleDeleteLocal={handleDeleteLocal}
                    />
                  );
                } else {
                  return (
                    <NotificationModal
                      setIsOpenNotificationModal={setIsOpenNotificationModal}
                      title="Regular Appointment"
                      status={notificationDetails.details?.status}
                      icon={<AiOutlineSchedule size={40} />}
                      description={`<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">scheduled </span>your regular appointment on <span style="font-weight: bold;">${
                        convertDate(notificationDetails.details.start)[0]
                      } to ${
                        convertDate(notificationDetails.details.end)[2]
                      }</span>`}
                      appointmentDetails={notificationDetails}
                      dateTime={
                        <div className="flex gap-4">
                          {<BsCalendar4Week size={24} />}
                          <p>
                            {convertDate(notificationDetails.details.start)[1]}
                          </p>
                          <div className="border-[1px] border-black/20 border-right"></div>
                          {<BsClockHistory size={24} />}
                          <p>
                            {convertDate(notificationDetails.details.start)[2]}{" "}
                            to {convertDate(notificationDetails.details.end)[2]}
                          </p>
                          <p>45 mins</p>
                        </div>
                      }
                      isDisplay={true}
                      handleDeleteNotification={handleDeleteNotification}
                      handleDeleteLocal={handleDeleteLocal}
                    />
                  );
                }
              }
            } else if (notificationDetails.details?.status === "completed") {
              if (notificationDetails.type === "sos") {
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="Completed SOS Appointment"
                    status={notificationDetails.details?.status}
                    icon={<MdOutlineCheckCircleOutline size={48} />}
                    description={
                      '<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">marked</span> your <span style="font-weight: bold;">SOS appointment</span> as completed'
                    }
                    appointmentDetails={notificationDetails}
                    dateTime={null}
                    isDisplay={false}
                    handleDeleteNotification={handleDeleteNotification}
                    handleDeleteLocal={handleDeleteLocal}
                  />
                );
              } else if (notificationDetails.type === "standard") {
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="Completed Regular Appointment"
                    status={notificationDetails.details?.status}
                    icon={<MdOutlineCheckCircleOutline size={48} />}
                    description={
                      '<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">marked</span> your <span style="font-weight: bold;">regular appointment</span> as completed'
                    }
                    appointmentDetails={notificationDetails}
                    dateTime={
                      <div className="flex gap-4">
                        {<BsCalendar4Week size={24} />}
                        <p>
                          {convertDate(notificationDetails.details.start)[1]}
                        </p>
                        <div className="border-[1px] border-black/20 border-right"></div>
                        {<BsClockHistory size={24} />}
                        <p>
                          {convertDate(notificationDetails.details.start)[2]} to{" "}
                          {convertDate(notificationDetails.details.end)[2]}
                        </p>
                        <p>45 mins</p>
                      </div>
                    }
                    isDisplay={true}
                    handleDeleteNotification={handleDeleteNotification}
                    handleDeleteLocal={handleDeleteLocal}
                  />
                );
              }
            } else if (notificationDetails.details?.status === "cancelled") {
              if (notificationDetails.type === "sos") {
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="Cancelled SOS Appointment"
                    status={notificationDetails.details?.status}
                    icon={<MdOutlineCancel size={48} />}
                    description={
                      '<span style="font-weight: bold;">PLV Guidance Counselling Center </span> has <span style="font-weight: bold;">cancelled </span> your <span style="font-weight: bold;">SOS appointment</span>'
                    }
                    appointmentDetails={notificationDetails}
                    dateTime={null}
                    isDisplay={false}
                    handleDeleteNotification={handleDeleteNotification}
                    handleDeleteLocal={handleDeleteLocal}
                  />
                );
              } else if (notificationDetails.type === "standard") {
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="Cancelled Regular Appointment"
                    status={notificationDetails.details?.status}
                    icon={<MdOutlineCancel size={48} />}
                    description={
                      '<span style="font-weight: bold;">PLV Guidance Counselling Center </span> has <span style="font-weight: bold;">cancelled </span> your <span style="font-weight: bold;">regular appointment</span>'
                    }
                    appointmentDetails={notificationDetails}
                    dateTime={
                      <div className="flex gap-4">
                        {<BsCalendar4Week size={24} />}
                        <p>
                          {convertDate(notificationDetails.details.start)[1]}
                        </p>
                        <div className="border-[1px] border-black/20 border-right"></div>
                        {<BsClockHistory size={24} />}
                        <p>
                          {convertDate(notificationDetails.details.start)[2]} to{" "}
                          {convertDate(notificationDetails.details.end)[2]}
                        </p>
                        <p>45 mins</p>
                      </div>
                    }
                    isDisplay={true}
                    handleDeleteNotification={handleDeleteNotification}
                    handleDeleteLocal={handleDeleteLocal}
                  />
                );
              }
            } else if (notificationDetails.details?.status === "pending") {
              return (
                <NotificationModal
                  setIsOpenNotificationModal={setIsOpenNotificationModal}
                  title="Pending Regular Appointment"
                  status={notificationDetails.details?.status}
                  icon={<MdOutlinePending size={48} />}
                  description={`<span style="font-weight: bold;">You </span> have <span style="font-weight: bold;">pending </span> regular appointment on <span style="font-weight: bold;">${
                    convertDate(notificationDetails.details.start)[0]
                  } to ${
                    convertDate(notificationDetails.details.end)[2]
                  }</span>`}
                  appointmentDetails={notificationDetails}
                  dateTime={
                    <div className="flex gap-4">
                      {<BsCalendar4Week size={24} />}
                      <p>{convertDate(notificationDetails.details.start)[1]}</p>
                      <div className="border-[1px] border-black/20 border-right"></div>
                      {<BsClockHistory size={24} />}
                      <p>
                        {convertDate(notificationDetails.details.start)[2]} to{" "}
                        {convertDate(notificationDetails.details.end)[2]}
                      </p>
                      <p>45 mins</p>
                    </div>
                  }
                  isDisplay={true}
                  handleDeleteNotification={handleDeleteNotification}
                  handleDeleteLocal={handleDeleteLocal}
                />
              );
            } else if (notificationDetails.type === "edited") {
              console.log(notificationDetails);
              return (
                <NotificationModal
                  setIsOpenNotificationModal={setIsOpenNotificationModal}
                  title="Rescheduled/Edited Regular Appointment"
                  status={notificationDetails.details.type}
                  icon={<MdSchedule size={48} />}
                  description={`<span style="font-weight: bold;">PLV Guidance Counselling Center</span><span style="font-weight: bold;"> rescheduled/edited </span> your regular appointment`}
                  appointmentDetails={notificationDetails.details.new}
                  dateTime={
                    <div className="flex gap-4">
                      {<BsCalendar4Week size={24} />}
                      <p>
                        {convertDate(notificationDetails.details.new.start)[1]}
                      </p>
                      <div className="border-[1px] border-black/20 border-right"></div>
                      {<BsClockHistory size={24} />}
                      <p>
                        {convertDate(notificationDetails.details.new.start)[2]}{" "}
                        to {convertDate(notificationDetails.details.new.end)[2]}
                      </p>
                      <p>45 mins</p>
                    </div>
                  }
                  isDisplay={true}
                  handleDeleteNotification={handleDeleteNotification}
                  handleDeleteLocal={handleDeleteLocal}
                />
              );
            }
          })()}
        </Modal>
      ) : (
        <Modal isOpen={isOpenNotificationModal}>
          {(() => {
            if (notificationDetails.details?.status === "upcoming") {
              if (notificationDetails.type === "sos") {
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="SOS Appointment"
                    status={notificationDetails.details?.status}
                    icon={<MdSos size={48} />}
                    description={`<span style="font-weight: bold;">${notificationDetails?.details?.userDetails?.name} </span>have successfully <span style="font-weight: bold;">booked </span>an <span style="font-weight: bold;">SOS appointment</span>`}
                    appointmentDetails={notificationDetails}
                    dateTime={
                      "You can come anytime at PLV Guidance Counseling Center, and you will be entertained first"
                    }
                    isDisplay={true}
                    handleDeleteNotification={handleDeleteNotification}
                    handleDeleteLocal={handleDeleteLocal}
                  />
                );
              }
            } else if (notificationDetails.details?.status === "cancelled") {
              if (notificationDetails.type === "sos") {
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="Cancelled SOS Appointment"
                    status={notificationDetails.details?.status}
                    icon={<MdOutlineCancel size={48} />}
                    description={`<span style="font-weight: bold;">${notificationDetails?.details?.userDetails?.name} </span> has <span style="font-weight: bold;">cancelled </span><span style="font-weight: bold;">SOS appointment</span>`}
                    appointmentDetails={notificationDetails}
                    dateTime={null}
                    isDisplay={false}
                    handleDeleteNotification={handleDeleteNotification}
                    handleDeleteLocal={handleDeleteLocal}
                  />
                );
              } else if (notificationDetails.type === "standard") {
                return (
                  <NotificationModal
                    setIsOpenNotificationModal={setIsOpenNotificationModal}
                    title="Cancelled Regular Appointment"
                    status={notificationDetails.details?.status}
                    icon={<MdOutlineCancel size={48} />}
                    description={`<span style="font-weight: bold;">${notificationDetails?.details?.userDetails?.name} </span> has <span style="font-weight: bold;">cancelled </span><span style="font-weight: bold;">regular appointment</span>`}
                    appointmentDetails={notificationDetails}
                    dateTime={
                      <div className="flex gap-4">
                        {<BsCalendar4Week size={24} />}
                        <p>
                          {convertDate(notificationDetails.details.start)[1]}
                        </p>
                        <div className="border-[1px] border-black/20 border-right"></div>
                        {<BsClockHistory size={24} />}
                        <p>
                          {convertDate(notificationDetails.details.start)[2]} to{" "}
                          {convertDate(notificationDetails.details.end)[2]}
                        </p>
                        <p>45 mins</p>
                      </div>
                    }
                    isDisplay={true}
                    handleDeleteNotification={handleDeleteNotification}
                    handleDeleteLocal={handleDeleteLocal}
                  />
                );
              }
            } else if (notificationDetails.details?.status === "pending") {
              return (
                <NotificationModal
                  setIsOpenNotificationModal={setIsOpenNotificationModal}
                  title="Pending Regular Appointment"
                  status={notificationDetails.details?.status}
                  icon={<MdOutlinePending size={48} />}
                  description={`<span style="font-weight: bold;">${
                    notificationDetails?.details?.userDetails?.name
                  } </span> has a <span style="font-weight: bold;">pending </span> regular appointment on <span style="font-weight: bold;">${
                    convertDate(notificationDetails.details.start)[0]
                  } to ${
                    convertDate(notificationDetails.details.end)[2]
                  }</span>`}
                  appointmentDetails={notificationDetails}
                  dateTime={
                    <div className="flex gap-4">
                      {<BsCalendar4Week size={24} />}
                      <p>{convertDate(notificationDetails.details.start)[1]}</p>
                      <div className="border-[1px] border-black/20 border-right"></div>
                      {<BsClockHistory size={24} />}
                      <p>
                        {convertDate(notificationDetails.details.start)[2]} to{" "}
                        {convertDate(notificationDetails.details.end)[2]}
                      </p>
                      <p>45 mins</p>
                    </div>
                  }
                  isDisplay={true}
                  handleDeleteNotification={handleDeleteNotification}
                  handleDeleteLocal={handleDeleteLocal}
                />
              );
            } else if (notificationDetails.type === "edited") {
              return (
                <NotificationModal
                  setIsOpenNotificationModal={setIsOpenNotificationModal}
                  title="Rescheduled/Edited Regular Appointment"
                  status={notificationDetails.details.type}
                  icon={<MdSchedule size={48} />}
                  description={`<span style="font-weight: bold;">${notificationDetails?.details?.old?.userDetails?.name}</span><span style="font-weight: bold;"> rescheduled/edited </span> regular appointment`}
                  appointmentDetails={notificationDetails.details.new}
                  dateTime={
                    <div className="flex gap-4">
                      {<BsCalendar4Week size={24} />}
                      <p>
                        {convertDate(notificationDetails.details.new.start)[1]}
                      </p>
                      <div className="border-[1px] border-black/20 border-right"></div>
                      {<BsClockHistory size={24} />}
                      <p>
                        {convertDate(notificationDetails.details.new.start)[2]}{" "}
                        to {convertDate(notificationDetails.details.new.end)[2]}
                      </p>
                      <p>45 mins</p>
                    </div>
                  }
                  isDisplay={true}
                  handleDeleteNotification={handleDeleteNotification}
                  handleDeleteLocal={handleDeleteLocal}
                />
              );
            }
          })()}
        </Modal>
      )}
      {isStudent ? (
        <motion.div
          className="bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg w-1/5 h-[526px] top-[90px] right-[15%] fixed z-40"
          variants={{
            show: {
              opacity: 1,
              y: 0,
              transformOrigin: "top right",
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
            hide: {
              opacity: 0,
              y: 0,
              transformOrigin: "top right",
              scale: 0,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
          }}
          animate={isOpenNotifications ? "show" : "hide"}
          initial={{ opacity: 0, y: 0, scale: 0, transformOrigin: "top right" }}
        >
          <motion.div className="h-1/6 text-2xl font-extrabold py-6 px-6 flex justify-between items-center">
            <motion.p>Notifications</motion.p>
          </motion.div>
          <motion.hr className="border-[1px] border-black/5 border-top w-full" />
          <motion.ul className="overflow-auto h-5/6">
            <motion.p className="bg-black/5 px-6 py-2"> Today</motion.p>
            <motion.hr className="border-[1px] border-black/5 border-top w-full" />
            {notifications?.length !== 0 ? (
              notifications.map((i, k) => {
                return (
                  <motion.li
                    key={k}
                    className="hover:bg-black/5 cursor-pointer transition-all duration-100"
                    onClick={() => {
                      setNotificationDetails(i);
                      setIsOpenNotificationModal(true);
                      if (i.isSeen === false) {
                        markNotification(i.id, true);
                        handleChangeSeen(i.id, true);
                      }
                    }}
                  >
                    {(() => {
                      if (i.details?.status === "upcoming") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdSos size={24} />}
                              description={`<span style="font-weight: bold;">You </span>have successfully <span style="font-weight: bold;">booked </span>an <span style="font-weight: bold;">SOS appointment</span>`}
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        } else if (i.type === "standard") {
                          if (
                            i?.details?.creator ===
                            i?.details?.userDetails?.idNo
                          ) {
                            return (
                              <NotificationItems
                                status={i.details?.status}
                                k={k}
                                icon={<AiOutlineLike size={24} />}
                                description={`<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">approved </span>your regular appointment on <span style="font-weight: bold;">${
                                  convertDate(i.details.start)[0]
                                } to ${convertDate(i.details.end)[2]}</span>`}
                                isSeen={i.isSeen}
                                createdDate={i.createdDate}
                              />
                            );
                          } else {
                            return (
                              <NotificationItems
                                status={i.details?.status}
                                k={k}
                                icon={<AiOutlineSchedule size={24} />}
                                description={`<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">scheduled </span>your regular appointment on <span style="font-weight: bold;">${
                                  convertDate(i.details.start)[0]
                                } to ${convertDate(i.details.end)[2]}</span>`}
                                isSeen={i.isSeen}
                                createdDate={i.createdDate}
                              />
                            );
                          }
                        }
                      } else if (i.details?.status === "completed") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCheckCircleOutline size={24} />}
                              description={
                                '<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">marked</span> your <span style="font-weight: bold;">SOS appointment</span> as completed'
                              }
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        } else if (i.type === "standard") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCheckCircleOutline size={24} />}
                              description={
                                '<span style="font-weight: bold;">PLV Guidance Counselling Center </span><span style="font-weight: bold;">marked</span> your <span style="font-weight: bold;">regular appointment</span> as completed'
                              }
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        }
                      } else if (i.details?.status === "cancelled") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCancel size={24} />}
                              description={
                                '<span style="font-weight: bold;">PLV Guidance Counselling Center </span> has <span style="font-weight: bold;">cancelled </span> your <span style="font-weight: bold;">SOS appointment</span>'
                              }
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        } else if (i.type === "standard") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCancel size={24} />}
                              description={
                                '<span style="font-weight: bold;">PLV Guidance Counselling Center </span> has <span style="font-weight: bold;">cancelled </span> your <span style="font-weight: bold;">regular appointment</span>'
                              }
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        }
                      } else if (i.details?.status === "pending") {
                        return (
                          <NotificationItems
                            status={i.details?.status}
                            k={k}
                            icon={<MdOutlinePending size={24} />}
                            description={`<span style="font-weight: bold;">You </span> have <span style="font-weight: bold;">pending </span> regular appointment on <span style="font-weight: bold;">${
                              convertDate(i.details.start)[0]
                            } to ${convertDate(i.details.end)[2]}</span>`}
                            isSeen={i.isSeen}
                            createdDate={i.createdDate}
                          />
                        );
                      } else if (i.type === "edited") {
                        return (
                          <NotificationItems
                            status={i?.type}
                            k={k}
                            icon={<MdSchedule size={24} />}
                            description={`<span style="font-weight: bold;">PLV Guidance Counselling Center</span><span style="font-weight: bold;"> rescheduled/edited </span> your regular appointment`}
                            isSeen={i.isSeen}
                            createdDate={i.createdDate}
                          />
                        );
                      }
                      return null;
                    })()}
                  </motion.li>
                );
              })
            ) : (
              <div className="w-full flex justify-center items-center mt-20">
                No notifications
              </div>
            )}
          </motion.ul>
        </motion.div>
      ) : (
        <motion.div
          className="bg-[--light-brown] rounded-t-2xl border-2 border-black/10 shadow-lg w-1/5 h-[55%] fixed right-20 bottom-0 z-40"
          variants={{
            show: {
              opacity: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
            hide: {
              opacity: 0,
              y: 550,
              transition: {
                type: "spring",
                stiffness: 500,
                damping: 40,
              },
            },
          }}
          animate={isOpenNotifications ? "show" : "hide"}
          initial={{ opacity: 0, y: 550 }}
        >
          <motion.div className="h-1/6 text-2xl font-extrabold py-6 px-6 flex justify-between items-center">
            <motion.p>Notifications</motion.p>
            <motion.button
              onClick={() => {
                setIsOpenNotifications(false);
                setNotificationDetails({});
              }}
              type="button"
              className="text-black/40"
            >
              <FaTimes size={20} />
            </motion.button>
          </motion.div>
          <motion.hr className="border-[1px] border-black/5 border-top w-full" />
          <motion.ul className="overflow-auto h-5/6">
            <motion.p className="bg-black/5 px-6 py-2"> Today</motion.p>
            <motion.hr className="border-[1px] border-black/5 border-top w-full" />
            {notifications?.length !== 0 ? (
              notifications.map((i, k) => {
                return (
                  <motion.li
                    key={k}
                    className="hover:bg-black/5 cursor-pointer transition-all duration-100"
                    onClick={() => {
                      setNotificationDetails(i);
                      setIsOpenNotificationModal(true);
                      if (i.isSeen === false) {
                        markNotification(i.id, true);
                        handleChangeSeen(i.id, true);
                      }
                    }}
                  >
                    {(() => {
                      if (i.details?.status === "upcoming") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdSos size={24} />}
                              description={`<span style="font-weight: bold;">${i?.details?.userDetails?.name} </span>have successfully <span style="font-weight: bold;">booked </span>an <span style="font-weight: bold;">SOS appointment</span>`}
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        }
                      } else if (i.details?.status === "cancelled") {
                        if (i.type === "sos") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCancel size={24} />}
                              description={`<span style="font-weight: bold;">${i?.details?.userDetails?.name} </span> has <span style="font-weight: bold;">cancelled </span><span style="font-weight: bold;">SOS appointment</span>`}
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        } else if (i.type === "standard") {
                          return (
                            <NotificationItems
                              status={i.details?.status}
                              k={k}
                              icon={<MdOutlineCancel size={24} />}
                              description={`<span style="font-weight: bold;">${i?.details?.userDetails?.name} </span> has <span style="font-weight: bold;">cancelled </span><span style="font-weight: bold;">regular appointment</span>`}
                              isSeen={i.isSeen}
                              createdDate={i.createdDate}
                            />
                          );
                        }
                      } else if (i.details?.status === "pending") {
                        return (
                          <NotificationItems
                            status={i.details?.status}
                            k={k}
                            icon={<MdOutlinePending size={24} />}
                            description={`<span style="font-weight: bold;">${
                              i?.details?.userDetails?.name
                            } </span> has a <span style="font-weight: bold;">pending </span> regular appointment on <span style="font-weight: bold;">${
                              convertDate(i.details.start)[0]
                            } to ${convertDate(i.details.end)[2]}</span>`}
                            isSeen={i.isSeen}
                            createdDate={i.createdDate}
                          />
                        );
                      } else if (i.type === "edited") {
                        return (
                          <NotificationItems
                            status={i?.type}
                            k={k}
                            icon={<MdSchedule size={24} />}
                            description={`<span style="font-weight: bold;">${i?.details?.old?.userDetails?.name}</span><span style="font-weight: bold;"> rescheduled/edited </span> regular appointment`}
                            isSeen={i.isSeen}
                            createdDate={i.createdDate}
                          />
                        );
                      }
                      return null;
                    })()}
                  </motion.li>
                );
              })
            ) : (
              <div className="w-full flex justify-center items-center mt-20">
                No notifications
              </div>
            )}
          </motion.ul>
        </motion.div>
      )}
    </>
  );
}

export default NotificationContainer;
