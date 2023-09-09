import axios from "../api/axios";
import { useEffect } from "react";
import Holidays from "date-holidays";
import moment from "moment";

import { Calendar, momentLocalizer } from "react-big-calendar";
import { useState } from "react";

const localizer = momentLocalizer(moment);

function Appointments({ socket, toast, auth }) {
  const [events, setEvents] = useState([]);

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

  const holiday = new Holidays("PH");

  return (
    <div className="bg-[--light-brown] h-screen">
      <div className="flex flex-col px-52">
        <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
          Appointments
        </p>
        <div className="flex gap-5 w-full">
          <div>
            <Calendar
              localizer={localizer}
              startAccessor="start"
              endAccessor="end"
              style={{ height: 624, width: 873 }}
              events={events}
              components={components}
              selectable={true}
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
                console.log(i);
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
  );
}

export default Appointments;
