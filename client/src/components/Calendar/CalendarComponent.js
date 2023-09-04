import { Calendar, momentLocalizer } from "react-big-calendar";

import moment from "moment";

const localizer = momentLocalizer(moment);

function CalendarComponent({
  setIsOpenStandardAppoint,
  setPopUpStandard,
  setAppointmentDetails,
}) {
  const events = [
    {
      start: moment("2023-03-18T10:00:00").toDate(),
      end: moment("2023-03-18T11:00:00").toDate(),
      title: "MRI Registration",
      data: {
        type: "Reg",
      },
    },
    {
      start: moment("2023-09-04T14:00:00").toDate(),
      end: moment("2023-09-04T15:30:00").toDate(),
      title: "ENT Appointment",
      data: {
        type: "App",
      },
    },
  ];

  const components = {
    event: () => {
      const eventType = "App";
      switch (eventType) {
        case "Reg":
          return (
            <div
              style={{ background: "yellow", color: "white", height: "100%" }}
            >
              {"asdasd"}
            </div>
          );
        case "App":
          return (
            <div
              style={{
                background: "lightgreen",
                color: "white",
                height: "100%",
              }}
            >
              {"asdasdas"}
            </div>
          );
        default:
          return null;
      }
    },
  };
  return (
    <div>
      <Calendar
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        events={events}
        components={components}
        timeslots={8}
        selectable={true}
        onSelectSlot={(data) => {
          setPopUpStandard(false);
          setIsOpenStandardAppoint(true);
          setAppointmentDetails(data);
          console.log(data);
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
            16
          )
        }
        step={7.5}
      />
    </div>
  );
}

export default CalendarComponent;
