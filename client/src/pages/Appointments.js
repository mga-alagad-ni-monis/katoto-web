import axios from "../api/axios";
import { useEffect } from "react";
import Holidays from "date-holidays";
import moment from "moment";
import { motion } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import {
  BsCalendar4Week,
  BsClockHistory,
  BsCalendarPlus,
  BsPatchCheck,
} from "react-icons/bs";
import { HiPlus } from "react-icons/hi";

import { Calendar, momentLocalizer } from "react-big-calendar";
import { useState } from "react";

const localizer = momentLocalizer(moment);

function Appointments({ socket, toast, auth }) {
  const [events, setEvents] = useState([]);

  const [appointmentDetails, setAppointmentDetails] = useState({});

  const [isOpenAppointmentSidebar, setIsOpenAppointmentSidebar] =
    useState(false);

  useEffect(() => {
    getAppointments();
  }, []);

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

  const components = {
    event: (i) => {
      switch (i.event.data.type) {
        case "sos":
          return (
            <div className="bg-[--red] text-[--light-brown] p-1 text-[9px] rounded-md">
              {i.event.title}
            </div>
          );
        case "standard":
          return (
            <div className="bg-[--dark-green] text-[--light-brown] p-1 text-[9px] rounded-md">
              {i.event.title}
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

  return (
    <>
      <motion.div
        className="fixed right-0 bg-[--light-brown] shadow-2xl h-screen p-10 z-30"
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
            x: 500,
            transition: {
              type: "spring",
              stiffness: 300,
              damping: 40,
            },
          },
        }}
        animate={isOpenAppointmentSidebar ? "show" : "hide"}
        initial={{ opacity: 1, x: 500 }}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            <div className="flex justify-between mb-10">
              <p className="text-2xl font-extrabold">Appointment Details</p>
              <button
                onClick={() => {
                  setIsOpenAppointmentSidebar(false);
                  setAppointmentDetails({});
                }}
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>
            {console.log(appointmentDetails)}
            <p>{appointmentDetails?.title}</p>
            <div className="flex items-center justify-between">
              <p className="text-[--dark-green] font-bold flex items-center mb-3">
                Appointment Details
              </p>
              {new Date(appointmentDetails?.data?.end) > new Date() ? (
                <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3">
                  Upcoming
                </div>
              ) : (
                <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3">
                  Overdue
                </div>
              )}
            </div>
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
          </div>
          <div className="flex justify-between">
            <button
              className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
            >
              Cancel Appointment
            </button>
            <button
              className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
            >
              Reschedule
            </button>
          </div>
        </div>
      </motion.div>

      <div className="bg-[--light-brown] h-screen">
        <div className="flex flex-col px-52">
          <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
            Appointments
          </p>
          <div className="flex gap-5 w-full">
            <div className="w-3/5">
              <p className="font-extrabold text-2xl flex items-center pb-1">
                Upcoming
              </p>
              <Calendar
                localizer={localizer}
                startAccessor="start"
                endAccessor="end"
                className="w-full second-calendar"
                style={{ height: 588 }}
                events={events}
                components={components}
                selectable={true}
                views={{ month: true, week: false, day: false, agenda: true }}
                defaultView={"agenda"}
              />
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

                  console.log(data);
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
