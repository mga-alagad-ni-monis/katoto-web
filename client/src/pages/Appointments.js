import axios from "../api/axios";
import { useEffect } from "react";
import React from "react";

import CalendarSmall from "react-calendar";
import "react-calendar/dist/Calendar.css";
import Holidays from "date-holidays";
import moment from "moment";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { BsCalendar4Week, BsClockHistory } from "react-icons/bs";
import { HiPlus } from "react-icons/hi";

import { Calendar, momentLocalizer } from "react-big-calendar";
import { useState } from "react";

import Modal from "../components/Modal";
import CalendarComponent from "../components/Calendar/CalendarComponent";

const localizer = momentLocalizer(moment);

const MemoizedTextarea = React.memo(({ value, onChange }) => {
  return (
    <textarea
      className="w-full h-full bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 
        p-3 font-semibold resize-none"
      placeholder="Aa..."
      value={value}
      onChange={onChange}
    ></textarea>
  );
});

function Appointments({ socket, toast, auth }) {
  const [events, setEvents] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [gcNames, setGcNames] = useState([]);
  const [students, setStudents] = useState([]);

  const [appointmentDetails, setAppointmentDetails] = useState({});

  const [isOpenAppointmentSidebar, setIsOpenAppointmentSidebar] =
    useState(false);
  const [isEditAppointment, setIsEditAppointment] = useState(false);
  const [isOpenAddAppointment, setIsOpenAddAppointment] = useState(false);
  const [isOpenCalendar, setIsOpenCalendar] = useState(false);
  const [isOpenNotesModal, setIsOpenNotesModal] = useState(false);
  const [isViewNotes, setIsViewNotes] = useState(false);

  const [appointmentDateStart, setAppointmentDateStart] = useState("");
  const [appointmentDateEnd, setAppointmentDateEnd] = useState("");
  const [appointmentMode, setAppointmentMode] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [studentDetails, setStudentDetails] = useState({});
  const [preferredGC, setPreferredGC] = useState(auth?.userInfo?.idNo);
  const [description, setDescription] = useState("");
  const [preferredMode, setPreferredMode] = useState("facetoface");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    getAppointments();
    getBookedAppointments();
    getGCName();
    getStudents();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("scheduleResponse", async () => {
        await getAppointments();
      });
    }
  }, [socket]);

  const getGCName = async () => {
    try {
      await axios
        .get("/api/accounts/get-gc", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setGcNames(res?.data?.names);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const getBookedAppointments = async () => {
    try {
      await axios
        .get("/api/appointments/get-booked", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setBookedAppointments(convertToDateObject(res?.data?.appointments));
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const convertDateAppointment = (date, hours, minutes) => {
    const date_object = new Date(date);

    date_object.setHours(hours);
    date_object.setMinutes(minutes);
    date_object.setSeconds(0);

    return date_object.toLocaleString();
  };

  const getAppointments = async () => {
    try {
      await axios
        .get("/api/appointments/get", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setEvents(convertToDateObject(res?.data?.appointments));
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const getStudents = async () => {
    try {
      let college = auth?.userInfo?.assignedCollege;
      await axios
        .post(
          "/api/accounts/get-students",
          { college },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          setStudents(res?.data?.students);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleCancelAppointment = async (id, type) => {
    try {
      await axios
        .post(
          "/api/appointments/cancel",
          { id, type },
          {
            withCredentials: true,

            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
          updateStatus(id);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleDeleteAppointment = async (id, type) => {
    try {
      await axios
        .post(
          "/api/appointments/delete",
          { id, type },
          {
            withCredentials: true,

            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          updateDeleted(id);
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleApproveAppointment = async (id, type) => {
    try {
      await axios
        .post(
          "/api/appointments/approve",
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
          approveRealTime(res?.data?.appointmentDetails);
          setTimeout(() => {
            getAppointments();
          }, 200);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleCompleteAppointment = async (id, type) => {
    try {
      await axios
        .post(
          "/api/appointments/complete",
          { id, type },
          {
            withCredentials: true,

            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
          completeRealTime(res?.data?.appointmentDetails);
          setTimeout(() => {
            getAppointments();
          }, 200);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const approveRealTime = async (appointment) => {
    try {
      socket.emit("approveAppointmentRequest", {
        appointmentDetails: appointment,
        token: auth?.accessToken,
      });
    } catch (err) {
      toast.error("Error");
    }
  };

  const completeRealTime = async (appointment) => {
    try {
      socket.emit("completeAppointmentRequest", {
        appointmentDetails: appointment,
        token: auth?.accessToken,
      });
    } catch (err) {
      toast.error("Error");
    }
  };

  const cancelRealTime = async (appointment) => {
    try {
      socket.emit("cancelAppointmentRequest", {
        appointmentDetails: appointment,
        token: auth?.accessToken,
      });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleSaveChangesAppointment = async (id, type) => {
    try {
      await axios
        .post(
          "/api/appointments/edit",
          {
            id,
            type,
            appointmentDateStart,
            appointmentDateEnd,
            appointmentMode,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
          editAppointmentRealTime(res?.data?.appointmentOldNew);
          setTimeout(() => {
            getAppointments();
            getBookedAppointments();
          }, 200);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const editAppointmentRealTime = async (appointment) => {
    try {
      socket.emit("editAppointmentRequest", {
        appointmentDetails: appointment,
        token: auth?.accessToken,
      });
    } catch (err) {
      toast.error("Error");
    }
  };

  const convertToDateObject = (appointments) => {
    const result = appointments.map((i) => {
      if (i.data.type === "standard") {
        return {
          title: i.title,
          start: moment(i.start).toDate(),
          end: moment(i.end).toDate(),
          data: i.data,
        };
      }
      return {
        title: i.title,
        start: moment(i.scheduledDate).toDate(),
        end: moment(i.scheduledDate).toDate(),
        data: i.data,
      };
    });

    return result;
  };

  const updateDeleted = (id) => {
    const eventsArray = events.filter((i) => i.data.id !== id);
    setEvents(eventsArray);
  };

  const updateStatus = (id) => {
    const eventsArray = events.map((i) => {
      if (i.data.id === id) {
        return {
          start: i.start,
          end: i.end,
          title: i.title,
          data: {
            creator: i.data.creator,
            gc: i.data.gc,
            mode: i.data.mode,
            createdDate: i.data.createdDate,
            end: i.data.end,
            id: i.data.id,
            start: i.data.start,
            type: i.data.type,
            userDetails: i.data.userDetails,
            status: "cancelled",
          },
        };
      }
      return i;
    });

    setEvents(eventsArray);

    cancelRealTime(eventsArray.filter((i) => i.data.id === id)[0].data);
  };

  const handleSetStandardAppointment = async () => {
    try {
      if (
        appointmentDateStart !== "" &&
        appointmentDateEnd !== "" &&
        preferredGC !== "" &&
        preferredMode !== "" &&
        studentDetails["name"]
      ) {
        try {
          setAppointmentDateStart("");
          setAppointmentDateEnd("");
          setStudentDetails({});
          setDescription("");
          socket.emit("scheduleRequest", {
            id: socket.id,
            token: auth?.accessToken,
            type: "standard",
            start: appointmentDateStart,
            end: appointmentDateEnd,
            gc: gcNames.filter((i) => i.idNo === preferredGC)[0],
            mode: preferredMode,
            creator: auth?.userInfo?.idNo,
            description: description,
            studentId: studentDetails?.idNo,
          });
          setIsOpenAddAppointment(false);
          setIsOpenCalendar(false);
        } catch (err) {
          toast.error("Error");
        }
      } else {
        toast.error("Please check the details");
      }
    } catch (err) {}
  };

  const handleSaveNotes = async () => {
    try {
      if (notes !== "") {
        await axios
          .post(
            "/api/appointments/save-notes",
            {
              id: appointmentDetails?.data?.id,
              notes,
              type: appointmentDetails?.data?.type,
            },
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${auth?.accessToken}`,
              },
            }
          )
          .then((res) => {
            toast.success(res?.data?.message);
            // editAppointmentRealTime(res?.data?.appointmentOldNew);
            // setTimeout(() => {
            //   getAppointments();
            //   getBookedAppointments();
            // }, 200);
          })
          .catch((err) => {
            toast.error(err?.response?.data);
          });
      } else {
        toast.error("Please check the details!");
      }
    } catch (err) {
      toast.error("Error");
    }
  };

  const components = {
    event: (i) => {
      switch (i.event.data.status) {
        case "pending":
          return (
            <div className="text-black font-bold p-1 text-xs rounded-md bg-[--yellow]">
              {`${i.event.title} (${i.event.data.status})`}
            </div>
          );
        case "upcoming":
          if (new Date(i.event.end) < new Date()) {
            return (
              <div className="text-black font-bold p-1 text-xs rounded-md bg-black/20">
                {`${i.event.title} (ended)`}
              </div>
            );
          }
          return (
            <div className="text-black font-bold p-1 text-xs rounded-md bg-[--light-green]">
              {`${i.event.title} (${i.event.data.status})`}
            </div>
          );

        case "completed":
          return (
            <div className="text-[--light-brown] font-bold p-1 text-xs rounded-md bg-[--dark-green]">
              {`${i.event.title} (${i.event.data.status})`}
            </div>
          );
        case "cancelled":
          return (
            <div className="text-[--light-brown] font-bold p-1 text-xs rounded-md bg-[--red]">
              {`${i.event.title} (${i.event.data.status})`}
            </div>
          );
        default:
          return null;
      }
    },
  };

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

  const holiday = new Holidays("PH");

  const availableTime = [
    { no: "8", time: "8:00:00 AM" },
    { no: "9", time: "9:00:00 AM" },
    { no: "10", time: "10:00:00 AM" },
    { no: "11", time: "11:00:00 AM" },
    { no: "13", time: "1:00:00 PM" },
    { no: "14", time: "2:00:00 PM" },
  ];

  return (
    <>
      {isOpenCalendar || isOpenAddAppointment || isOpenNotesModal ? (
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
          animate={
            isOpenCalendar || isOpenAddAppointment || isOpenNotesModal
              ? "show"
              : "hide"
          }
          initial={{
            opacity: 0,
          }}
        ></motion.div>
      ) : null}
      <motion.div
        className="fixed right-0 bg-[--light-brown] shadow-2xl h-screen p-10 z-30 w-[635px]"
        variants={{
          show: {
            opacity: 1,
            x: 0,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 40,
            },
          },
          hide: {
            opacity: 1,
            x: 700,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 40,
            },
          },
        }}
        animate={isOpenAppointmentSidebar ? "show" : "hide"}
        initial={{ opacity: 1, x: 700 }}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between mb-10">
              <p className="text-2xl font-extrabold">Appointment Details</p>
              <button
                onClick={() => {
                  setIsOpenAppointmentSidebar(false);
                  setIsEditAppointment(false);
                  setAppointmentDetails({});
                  setSelectedTime("");
                  setAppointmentMode("");
                  setAppointmentDateStart("");
                  setAppointmentDateEnd("");
                }}
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <p className="text-lg font-bold mb-5">
              {appointmentDetails?.title}
            </p>

            <div className="flex items-center justify-between">
              <p className="text-[--dark-green] font-bold flex items-center mb-3">
                {isEditAppointment
                  ? "Change Appointment Date"
                  : "Appointment Details"}
              </p>

              {(() => {
                if (
                  new Date(appointmentDetails?.data?.end) < new Date() &&
                  appointmentDetails?.data?.status === "upcoming"
                ) {
                  return (
                    <div className="w-max p-2 rounded-lg bg-black/20 text-black text-xs mb-3 font-bold">
                      Ended
                    </div>
                  );
                } else if (appointmentDetails?.data?.status === "pending") {
                  return (
                    <div className="w-max p-2 rounded-lg bg-[--yellow] text-black text-xs mb-3 font-bold">
                      Pending
                    </div>
                  );
                } else if (appointmentDetails?.data?.status === "upcoming") {
                  return (
                    <div className="w-max p-2 rounded-lg bg-[--light-green] text-black text-xs mb-3 font-bold">
                      Upcoming
                    </div>
                  );
                } else if (appointmentDetails?.data?.status === "completed") {
                  return (
                    <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3 font-bold">
                      Completed
                    </div>
                  );
                } else if (appointmentDetails?.data?.status === "cancelled") {
                  return (
                    <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3 font-bold">
                      Cancelled
                    </div>
                  );
                }
              })()}
            </div>
            {isEditAppointment ? (
              <div>
                <p className="mb-3">{`Date: ${
                  convertDate(appointmentDateStart)[0]
                } - ${convertDate(appointmentDateEnd)[2]}`}</p>
                <div className="flex justify-between mb-5">
                  <div className="flex flex-wrap gap-5 mb-5 gap-y-3 w-[123px]">
                    {availableTime.map((i, k) => {
                      return bookedAppointments.some(
                        (j) =>
                          `${new Date(selectedTime).toLocaleDateString()}, ${
                            i.time
                          }` === new Date(j.start).toLocaleString()
                      ) ? (
                        <button
                          key={k}
                          className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] transition-all duration-300 opacity-50 w-full"
                          disabled
                        >
                          {i.time}
                        </button>
                      ) : (
                        <button
                          key={k}
                          className="w-full bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                          onClick={() => {
                            setAppointmentDateStart(
                              convertDateAppointment(
                                new Date(selectedTime).toLocaleString(),
                                i.no,
                                0
                              )
                            );
                            setAppointmentDateEnd(
                              convertDateAppointment(
                                new Date(selectedTime).toLocaleString(),
                                i.no,
                                45
                              )
                            );
                          }}
                        >
                          {i.time}
                        </button>
                      );
                    })}
                  </div>
                  <CalendarSmall
                    onChange={(data) => {
                      setSelectedTime(data);
                    }}
                    value={selectedTime}
                    tileDisabled={({ date }) =>
                      [0].includes(date.getDay()) ||
                      holiday.isHoliday(date) ||
                      new Date(date) < new Date()
                    }
                  />
                </div>
                <div>
                  <p className="text-[--dark-green] font-bold flex items-center mb-3">
                    Change Mode
                  </p>
                  <select
                    id="mode"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={appointmentMode}
                    onChange={(e) => {
                      setAppointmentMode(e.target.value);
                    }}
                    required
                  >
                    <option
                      hidden
                      value=""
                      defaultValue
                      className="text-black/30"
                    ></option>
                    <option value="virtual">Virtual</option>
                    <option value="facetoface">Face-to-face</option>
                  </select>
                </div>
              </div>
            ) : (
              <>
                {appointmentDetails?.data?.type === "sos" ? (
                  <div className="bg-black/10 w-max h-auto p-3 rounded-lg mb-5">
                    Anytime
                  </div>
                ) : (
                  <div className="bg-black/10 w-max h-auto p-3 rounded-lg mb-5">
                    <div className="flex gap-4">
                      <BsCalendar4Week size={24} />
                      <p>{convertDate(appointmentDetails?.data?.start)[1]}</p>
                      {/* <div className="border-[1px] border-black/20 border-right"></div> */}
                      <BsClockHistory size={24} />
                      <p>{`${
                        convertDate(appointmentDetails?.data?.start)[2]
                      } - ${convertDate(appointmentDetails?.data?.end)[2]}`}</p>
                      <p>45 mins</p>
                    </div>
                  </div>
                )}
                <div className="flex gap-5 mb-5">
                  <div>
                    <p className="text-[--dark-green] font-bold flex items-center mb-3">
                      Guidance Counselor
                    </p>
                    {appointmentDetails?.data?.gc?.name}
                  </div>
                  <div>
                    <p className="text-[--dark-green] font-bold flex items-center mb-3">
                      Mode
                    </p>
                    {appointmentDetails?.data?.mode === "facetoface"
                      ? "Face-to-face"
                      : "Virtual"}
                  </div>
                </div>
                <div className="w-auto break-words mb-5">
                  <p className="text-[--dark-green] font-bold flex items-center mb-3">
                    Concern Overview
                  </p>
                  {appointmentDetails?.data?.description}
                </div>
                <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                  Student Details
                </p>
                <table className="mb-5">
                  <tr>
                    <td className="w-[150px] flex justify-start">Name</td>
                    <td>{appointmentDetails?.data?.userDetails?.name}</td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">Gender</td>
                    <td>{appointmentDetails?.data?.userDetails?.gender}</td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">Email</td>
                    <td>{appointmentDetails?.data?.userDetails?.email}</td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start"> ID Number</td>
                    <td> {appointmentDetails?.data?.userDetails?.idNo}</td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">Course</td>
                    <td>{appointmentDetails?.data?.userDetails?.department}</td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">
                      Year and Section
                    </td>
                    <td>
                      {appointmentDetails?.data?.userDetails?.yearSection}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">College</td>
                    <td>
                      {appointmentDetails?.data?.userDetails?.mainDepartment}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">Phone</td>
                    <td>{appointmentDetails?.data?.userDetails?.contactNo}</td>
                  </tr>
                </table>
                <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                  Notes
                </p>
                {appointmentDetails?.data?.notes ? (
                  <>
                    <p className="max-h-[96px] text-ellipsis overflow-hidden">
                      {appointmentDetails?.data?.notes}
                    </p>
                    <button
                      className="font-bold text-[--dark-green] hover:underline transition-all duration-300 mt-1"
                      onClick={() => {
                        setNotes(appointmentDetails?.data?.notes);
                        setIsOpenNotesModal(true);
                        setIsViewNotes(true);
                      }}
                    >
                      See more...
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                    onClick={() => {
                      setIsOpenNotesModal(true);
                    }}
                  >
                    <HiPlus size={16} />
                    Add Notes
                  </button>
                )}
              </>
            )}
          </div>
          {isEditAppointment ? (
            <div className="flex gap-5 justify-end">
              <button
                className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                onClick={() => {
                  setIsEditAppointment(false);
                  setSelectedTime("");
                  setAppointmentMode("");
                  setAppointmentDateStart("");
                  setAppointmentDateEnd("");
                }}
              >
                Cancel
              </button>
              <button
                className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                onClick={() => {
                  handleSaveChangesAppointment(
                    appointmentDetails?.data?.id,
                    appointmentDetails?.data?.type
                  );
                  setIsEditAppointment(false);
                  setIsOpenAppointmentSidebar(false);
                  setAppointmentDetails({});
                  setSelectedTime("");
                  setAppointmentMode("");
                  setAppointmentDateStart("");
                  setAppointmentDateEnd("");
                }}
              >
                Save Changes
              </button>
            </div>
          ) : (
            <div className="flex gap-5 justify-end">
              {auth?.userInfo?.idNo === appointmentDetails?.data?.gc?.idNo ? (
                <button
                  className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                  onClick={() => {
                    handleDeleteAppointment(
                      appointmentDetails?.data?.id,
                      appointmentDetails?.data?.type
                    );
                    setIsOpenAppointmentSidebar(false);
                    setAppointmentDetails({});
                    setSelectedTime("");
                    setAppointmentMode("");
                    setAppointmentDateStart("");
                    setAppointmentDateEnd("");
                  }}
                >
                  Delete
                </button>
              ) : null}
              {auth?.userInfo?.idNo === appointmentDetails?.data?.gc?.idNo &&
              (appointmentDetails?.data?.status === "pending" ||
                appointmentDetails?.data?.status === "upcoming") &&
              !(new Date(appointmentDetails?.data?.end) < new Date()) ? (
                <button
                  className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                  onClick={() => {
                    handleCancelAppointment(
                      appointmentDetails?.data?.id,
                      appointmentDetails?.data?.type
                    );
                    setIsOpenAppointmentSidebar(false);
                    setAppointmentDetails({});
                    setSelectedTime("");
                    setAppointmentMode("");
                    setAppointmentDateStart("");
                    setAppointmentDateEnd("");
                  }}
                >
                  Cancel Appointment
                </button>
              ) : null}

              {(new Date(appointmentDetails?.data?.end) < new Date() &&
                appointmentDetails?.data?.status === "upcoming") ||
              (auth?.userInfo?.idNo === appointmentDetails?.data?.gc?.idNo &&
                appointmentDetails?.data?.type === "sos" &&
                appointmentDetails?.data?.status === "upcoming") ? (
                <button
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    handleCompleteAppointment(
                      appointmentDetails?.data?.id,
                      appointmentDetails?.data?.type
                    );
                    setIsOpenAppointmentSidebar(false);
                  }}
                >
                  Mark as Complete
                </button>
              ) : null}

              {appointmentDetails?.data?.creator === auth?.userInfo?.idNo ? (
                <button
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsEditAppointment(true);
                    setSelectedTime(appointmentDetails?.data?.start);
                    setAppointmentDateStart(appointmentDetails?.data?.start);
                    setAppointmentDateEnd(appointmentDetails?.data?.end);
                    setAppointmentMode(appointmentDetails?.data?.mode);
                  }}
                >
                  Edit Appointment
                </button>
              ) : null}
              {appointmentDetails?.data?.status === "pending" &&
              auth?.userInfo?.idNo === appointmentDetails?.data?.gc?.idNo ? (
                <button
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    handleApproveAppointment(appointmentDetails?.data?.id);
                    setIsOpenAppointmentSidebar(false);
                    setAppointmentDetails({});
                  }}
                >
                  Approve
                </button>
              ) : null}
            </div>
          )}
        </div>
      </motion.div>
      <Modal isOpen={isOpenCalendar} isCalendar={true}>
        <div className="w-full justify-between flex">
          <p className="text-2xl font-extrabold">Pick a date</p>
          <button
            onClick={() => {
              setIsOpenCalendar(false);
            }}
            type="button"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-4 mt-5 items-center text-center text-md">
          <CalendarComponent
            setIsOpenStandardAppoint={setIsOpenAddAppointment}
            setPopUpStandard={setIsOpenCalendar}
            setAppointmentDetails={setAppointmentDetails}
          ></CalendarComponent>
        </div>
      </Modal>
      <Modal isOpen={isOpenNotesModal} isCalendar={true}>
        <div className="w-full justify-between flex">
          <p className="text-2xl font-extrabold">Notes</p>
          <button
            onClick={() => {
              setIsOpenNotesModal(false);
              setIsViewNotes(false);
              setNotes("");
            }}
            type="button"
          >
            <FaTimes size={20} />
          </button>
        </div>
        <div className="flex flex-col gap-4 mt-5 items-center text-center text-md w-[600px] max-h-[600px]">
          {isViewNotes && notes ? (
            <>
              <div className="flex text-left w-full">
                <p className="w-full">{notes}</p>
              </div>
              <div className="w-full flex justify-end mt-4">
                <button
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setIsViewNotes(false);
                  }}
                >
                  Edit
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="h-[600px] w-full">
                <MemoizedTextarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                  }}
                />
              </div>
              <div className="w-full flex justify-end mt-4">
                <button
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    handleSaveNotes();
                    setIsViewNotes(true);
                    setNotes("");
                    setIsOpenNotesModal(false);
                  }}
                >
                  Save
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
      <Modal isOpen={isOpenAddAppointment}>
        <div className="w-full justify-between flex">
          <p className="text-2xl font-extrabold">Regular Appointment</p>
          <button
            onClick={() => {
              setIsOpenAddAppointment(false);
              setIsOpenCalendar(true);
              setAppointmentDateStart("");
              setAppointmentDateEnd("");
              setStudentDetails({});
              setDescription("");
              // setIsAppointmentChecked(false);
            }}
            type="button"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-5">
            <p className="text-[--dark-green] font-bold flex items-center mb-3">
              Appointment Details
            </p>
          </div>
          <div className="bg-black/10 w-full h-auto p-3 rounded-lg mb-5">
            <div className="flex gap-4">
              <BsCalendar4Week size={24} />
              <p>{convertDate(appointmentDetails?.start)[1]}</p>
              <div className="border-[1px] border-black/20 border-right"></div>
              <BsClockHistory size={24} />
              <p>
                {appointmentDateStart
                  ? `${new Date(
                      appointmentDateStart
                    ).toLocaleTimeString()} - ${new Date(
                      appointmentDateEnd
                    ).toLocaleTimeString()}`
                  : "00:00:00"}
              </p>
              <p>45 mins</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-5 mb-5 gap-y-3">
            {availableTime.map((i, k) => {
              return bookedAppointments.some(
                (j) =>
                  `${new Date(
                    appointmentDetails?.start
                  ).toLocaleDateString()}, ${i.time}` ===
                  new Date(j.start).toLocaleString()
              ) ? (
                <button
                  key={k}
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] transition-all duration-300 opacity-50"
                  disabled
                >
                  {i.time}
                </button>
              ) : (
                <button
                  key={k}
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    setAppointmentDateStart(
                      convertDateAppointment(
                        new Date(
                          convertDate(appointmentDetails?.start)[1]
                        ).toLocaleString(),
                        i.no,
                        0
                      )
                    );
                    setAppointmentDateEnd(
                      convertDateAppointment(
                        new Date(
                          convertDate(appointmentDetails?.start)[1]
                        ).toLocaleString(),
                        i.no,
                        45
                      )
                    );
                  }}
                >
                  {i.time}
                </button>
              );
            })}
          </div>
          <div className="flex gap-5 mb-5">
            <div>
              <p className="text-[--dark-green] font-bold flex items-center mb-3 justify-between  ">
                Concern{" "}
                <span className="text-[8px] text-[--red]">
                  {200 - description.length} character(s) left
                </span>
              </p>
              <textarea
                className="w-auto h-[46px] bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 
              p-3 font-semibold resize-none"
                placeholder="Describe your concern..."
                value={description}
                maxLength={200}
                onChange={(e) => {
                  setDescription(e.target.value);
                }}
              ></textarea>
            </div>
            <div>
              <p className="text-[--dark-green] font-bold flex items-center mb-3 ">
                Guidance Counselor
              </p>
              <select
                id="guidanceCounselors"
                className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                value={preferredGC}
                onChange={(e) => {
                  setPreferredGC(e.target.value);
                }}
                required
              >
                {gcNames.map((i, k) => {
                  return (
                    <option
                      defaultValue={i?.assignedCollege?.includes(
                        auth?.userInfo?.mainDepartment
                      )}
                      value={i.idNo}
                      key={k}
                    >
                      {i.name}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <p className="text-[--dark-green] font-bold flex items-center mb-3">
                Mode
              </p>
              <select
                id="mode"
                className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                value={preferredMode}
                onChange={(e) => {
                  setPreferredMode(e.target.value);
                }}
                required
              >
                <option value="facetoface" defaultValue>
                  Face-to-face
                </option>
                <option value="virtual">Virtual</option>
              </select>
            </div>
          </div>
          <div>
            <p className="text-[--dark-green] font-bold flex items-center mb-3 ">
              Student
            </p>
            <select
              id="students"
              className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
              // value={studentId}
              defaultValue=""
              onChange={(e) => {
                setStudentDetails(
                  students.filter((i) => i?.idNo === e.target.value)[0]
                );
              }}
              required
            >
              {students?.map((i, k) => {
                return (
                  <option value={i?.idNo} key={k}>
                    {i?.name}
                  </option>
                );
              })}
            </select>
          </div>
          {studentDetails["name"] ? (
            <>
              {" "}
              <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                Student Details
              </p>
              <table className="mb-5 text-xs">
                <tr>
                  <td className="w-[150px] flex justify-start">Name</td>
                  <td>{studentDetails?.name}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">Gender</td>
                  <td>{studentDetails?.gender}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">Email</td>
                  <td>{studentDetails?.email}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start"> ID Number</td>
                  <td> {studentDetails?.idNo}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">Course</td>
                  <td>{studentDetails?.department}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">
                    Year and Section
                  </td>
                  <td>{studentDetails?.yearSection}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">College</td>
                  <td>{studentDetails?.mainDepartment}</td>
                </tr>
                <tr>
                  <td className="w-[150px] flex justify-start">Phone</td>
                  <td>{studentDetails?.contactNo}</td>
                </tr>
              </table>
            </>
          ) : null}

          {/* <div className="flex gap-5 mb-5">
            <input
              id="checkbox-1"
              className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 mt-1
   checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
   float-left cursor-pointer appearance-none border border-solid border-2  border-[--light-gray] checked:border-[--light-gray] checked:border-2 bg-[--light-gray] 
   bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
   after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['✔'] 
   checked:bg-[--dark-green] checked:after:opacity-100"
              type="checkbox"
              style={{
                fontFamily: "FontAwesome",
              }}
              checked={isAppointmentChecked ? true : false}
              onChange={() => {
                setIsAppointmentChecked(!isAppointmentChecked);
              }}
            />
            <p
              className="w-fit cursor-pointer"
              onClick={() => {
                setIsAppointmentChecked(!isAppointmentChecked);
              }}
            >
              By ticking the box, you hereby acknowledge and consent to the use
              of your personal information for scheduling appointments with our
              mental health chatbot.
            </p>
          </div> */}
          <div className="flex justify-end gap-5">
            <button
              className="bg-[--red] border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red]
                rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
                border border-2 transition-all duration-300"
              onClick={() => {
                setIsOpenAddAppointment(false);
                setIsOpenCalendar(true);
                setAppointmentDateStart("");
                setAppointmentDateEnd("");
                setStudentDetails({});
                setDescription("");
              }}
            >
              Cancel
            </button>
            <button
              className="
               hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green]
               bg-[--dark-green] border-[--dark-green]  rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
border border-2 transition-all duration-300"
              onClick={handleSetStandardAppointment}
              // disabled={isAppointmentChecked ? false : true}
            >
              Submit
            </button>
          </div>
        </div>
      </Modal>

      <div className="bg-[--light-brown] h-screen">
        <div className="flex flex-col px-52">
          <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
            Appointments
          </p>
          <div className="flex gap-5 w-full">
            <div className="w-3/5 flex flex-col h-[624px]">
              <div>
                <div className="flex justify-between">
                  <p className="font-extrabold text-2xl flex items-center">
                    Regular Appointments
                  </p>
                  <button
                    className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                    onClick={() => {
                      setIsOpenCalendar(true);
                    }}
                  >
                    <HiPlus size={16} />
                    Add
                  </button>
                </div>
                <Calendar
                  localizer={localizer}
                  startAccessor="start"
                  endAccessor="end"
                  className="w-full second-calendar"
                  style={{ height: 270 }}
                  events={events.filter((i) => i.data.type === "standard")}
                  components={components}
                  selectable={true}
                  views={{ month: true, week: false, day: false, agenda: true }}
                  defaultView={"agenda"}
                  onSelectEvent={(i) => {
                    setAppointmentDetails(i);
                    setIsOpenAppointmentSidebar(true);
                  }}
                />
              </div>
              <div>
                <p className="font-extrabold text-2xl flex items-center mt-5">
                  SOS Appointments
                </p>
                {/* <div className="max-h-[226px] min-h-[20px] border-2 border-black/20 rounded-xl shadow-lg mt-5 p-3">
                  <p>No SOS Appointments</p>
                  <p>No SOS Appointments</p>
                  <p>No SOS Appointments</p>
                  <p>No SOS Appointments</p>
                </div> */}

                <Calendar
                  localizer={localizer}
                  startAccessor="start"
                  endAccessor="end"
                  className="w-full second-calendar"
                  style={{ height: 270 }}
                  events={events.filter((i) => i.data.type === "sos")}
                  components={components}
                  selectable={true}
                  views={{ month: true, week: false, day: false, agenda: true }}
                  defaultView={"agenda"}
                  onSelectEvent={(i) => {
                    setAppointmentDetails(i);
                    setIsOpenAppointmentSidebar(true);
                  }}
                />
              </div>
            </div>

            <div className="flex">
              <Calendar
                localizer={localizer}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 624, width: 873 }}
                events={events.filter((i) => i.data.type === "standard")}
                components={components}
                selectable={true}
                views={{ month: true, week: true, day: true, agenda: false }}
                onSelectSlot={(data) => {
                  console.log(typeof data.start);
                  if (data.start < new Date()) {
                    return toast.error("Not a valid date!");
                  }

                  if (holiday.isHoliday(data.start)) {
                    return toast.error("The date is a holiday!");
                  }

                  if ([0].includes(data.start.getDay())) {
                    return toast.error("No Appointment on Sundays!");
                  }

                  // setPopUpStandard(false);
                  // setIsOpenStandardAppoint(true);
                  // setAppointmentDetails(data);
                }}
                onSelectEvent={(i) => {
                  setAppointmentDetails(i);
                  setIsOpenAppointmentSidebar(true);
                }}
                min={
                  new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate(),
                    8
                  )
                }
                max={
                  new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate(),
                    15
                  )
                }
                step={30}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Appointments;
