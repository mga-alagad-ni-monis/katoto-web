import axios from "../api/axios";
import { useEffect } from "react";

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

const localizer = momentLocalizer(moment);

function Appointments({ socket, toast, auth }) {
  const [events, setEvents] = useState([]);
  const [bookedAppointments, setBookedAppointments] = useState([]);

  const [appointmentDetails, setAppointmentDetails] = useState({});

  const [isOpenAppointmentSidebar, setIsOpenAppointmentSidebar] =
    useState(false);
  const [isEditAppointment, setIsEditAppointment] = useState(false);

  const [appointmentDateStart, setAppointmentDateStart] = useState("");
  const [appointmentDateEnd, setAppointmentDateEnd] = useState("");
  const [appointmentMode, setAppointmentMode] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    getAppointments();
    getBookedAppointments();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("scheduleResponse", async () => {
        await getAppointments();
      });
    }
  }, [socket]);

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
      return {
        title: i.title,
        start: moment(i.start).toDate(),
        end: moment(i.end).toDate(),
        data: i.data,
      };
    });

    return result;
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
            console.log("hahahaa tapos na");
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
                <div className="bg-black/10 w-max h-auto p-3 rounded-lg mb-5">
                  <div className="flex gap-4">
                    <BsCalendar4Week size={24} />
                    <p>{convertDate(appointmentDetails?.data?.start)[1]}</p>
                    {/* <div className="border-[1px] border-black/20 border-right"></div> */}
                    <BsClockHistory size={24} />
                    <p>{`${convertDate(appointmentDetails?.data?.start)[2]} - ${
                      convertDate(appointmentDetails?.data?.end)[2]
                    }`}</p>
                    <p>45 mins</p>
                  </div>
                </div>
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
              {new Date(appointmentDetails?.data?.end) < new Date() &&
              appointmentDetails?.data?.status === "upcoming" ? (
                <button
                  className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                  onClick={() => {
                    handleCompleteAppointment(appointmentDetails?.data?.id);
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
                    onClick={() => {}}
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
                  events={events}
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
                  events={events}
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
                events={events}
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
