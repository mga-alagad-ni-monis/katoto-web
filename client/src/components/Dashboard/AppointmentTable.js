import { useEffect, useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import {
  MdSos,
  MdOutlineCheckCircleOutline,
  MdOutlinePending,
  MdCalendarMonth,
} from "react-icons/md";

import axios from "../../api/axios";

import moment from "moment";

const components = {
  event: (i) => {
    switch (i.event.data.status) {
      case "pending":
        return (
          <div className="sos-pending text-black font-bold p-1 text-xs rounded-md bg-[--yellow]">
            {`${i.event.title} (${i.event.data.status})`}
          </div>
        );
      case "upcoming":
        if (new Date(i.event.end) < new Date()) {
          return (
            <div className="sos-upcoming-1 text-black font-bold p-1 text-xs rounded-md bg-black/20">
              {`${i.event.title} (ended)`}
            </div>
          );
        }
        return (
          <div className="sos-upcoming-2 text-black font-bold p-1 text-xs rounded-md bg-[--light-green]">
            {`${i.event.title} (${i.event.data.status})`}
          </div>
        );

      case "completed":
        return (
          <div className="sos-complete text-[--light-brown] font-bold p-1 text-xs rounded-md bg-[--dark-green]">
            {`${i.event.title} (${i.event.data.status})`}
          </div>
        );
      case "cancelled":
        return (
          <div className="sos-cancel text-[--light-brown] font-bold p-1 text-xs rounded-md bg-[--red]">
            {`${i.event.title} (${i.event.data.status})`}
          </div>
        );
      default:
        return null;
    }
  },
};

const localizer = momentLocalizer(moment);

function AppointmentTable({ toast, auth }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getAppointments();
  }, []);

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
  return (
    <div className="sh rounded-xl p-8 mb-8">
      <div className="flex justify-between w-full items-center">
        <p className="flex text-xl font-extrabold">Current Appointments</p>
      </div>
      <div className="h-auto w-full mt-5">
        <div className="w-full flex gap-5">
          <div className="w-1/2">
            <div className="regular-calendar">
              <p className="font-extrabold text-md flex items-center">
                Regular Appointments
              </p>
            </div>
            <div className="flex gap-5 dashboard mt-5">
              <Calendar
                localizer={localizer}
                startAccessor="start"
                endAccessor="end"
                className="w-full second-calendar"
                style={{ height: 270 }}
                events={events.filter(
                  (i) =>
                    i.data.type === "standard" &&
                    (i.data.status === "upcoming" ||
                      i.data.status === "pending")
                )}
                components={components}
                selectable={true}
                views={{ month: true, week: false, day: false, agenda: true }}
                defaultView={"agenda"}
                onSelectEvent={(i) => {}}
              />
              <div className="flex flex-col justify-between w-auto">
                <div className="bg-[--yellow] p-3 rounded-xl flex gap-3 shadow-lg items-center">
                  <MdOutlinePending size={42} />
                  <div className="flex flex-col justify-between">
                    <p className="font-bold text-xl">
                      {
                        events.filter(
                          (i) =>
                            i?.data?.type === "standard" &&
                            i?.data?.status === "pending"
                        ).length
                      }
                    </p>
                    <p className="text-md">Pending</p>
                  </div>
                </div>
                <div className="bg-[--light-green] p-3 rounded-xl flex gap-3 shadow-lg items-center">
                  <MdCalendarMonth size={42} />
                  <div className="flex flex-col justify-between">
                    <p className="font-bold text-xl">
                      {
                        events.filter(
                          (i) =>
                            i?.data?.type === "standard" &&
                            i?.data?.status === "upcoming"
                        ).length
                      }
                    </p>
                    <p className="text-md">Upcoming</p>
                  </div>
                </div>
                <div className="bg-[--dark-green] text-[--light-brown] p-3 rounded-xl flex gap-3 shadow-lg items-center">
                  <MdOutlineCheckCircleOutline size={42} />
                  <div className="flex flex-col justify-between">
                    <p className="font-bold text-xl">
                      {
                        events.filter(
                          (i) =>
                            i?.data?.type === "standard" &&
                            i?.data?.status === "completed"
                        ).length
                      }
                    </p>
                    <p className="text-md">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-1/2 flex flex-col">
            <p className="font-extrabold text-md flex items-center">
              SOS Appointments
            </p>
            <div className="w-full sos-calendar flex gap-5 dashboard mt-5">
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
                onSelectEvent={(i) => {}}
              />
              <div className="flex flex-col justify-between w-auto">
                <div className="bg-[--light-green] p-3 rounded-xl flex gap-3 shadow-lg items-center">
                  <MdCalendarMonth size={42} />
                  <div className="flex flex-col justify-between">
                    <p className="font-bold text-xl">
                      {
                        events.filter(
                          (i) =>
                            i?.data?.type === "sos" &&
                            i?.data?.status === "upcoming"
                        ).length
                      }
                    </p>
                    <p className="text-md">Upcoming</p>
                  </div>
                </div>
                <div className="bg-[--dark-green] text-[--light-brown] p-3 rounded-xl flex gap-3 shadow-lg items-center">
                  <MdOutlineCheckCircleOutline size={42} />
                  <div className="flex flex-col justify-between">
                    <p className="font-bold text-xl">
                      {" "}
                      {
                        events.filter(
                          (i) =>
                            i?.data?.type === "sos" &&
                            i?.data?.status === "completed"
                        ).length
                      }
                    </p>
                    <p className="text-md">Completed</p>
                  </div>
                </div>
                <div className="bg-[--dark-green] text-[--light-brown] p-3 rounded-xl flex gap-3 shadow-lg items-center opacity-0">
                  <MdOutlineCheckCircleOutline size={42} />
                  <div className="flex flex-col justify-between">
                    <p className="font-bold text-xl">
                      {" "}
                      {
                        events.filter(
                          (i) =>
                            i?.data?.type === "sos" &&
                            i?.data?.status === "completed"
                        ).length
                      }
                    </p>
                    <p className="text-md">Completed</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AppointmentTable;
