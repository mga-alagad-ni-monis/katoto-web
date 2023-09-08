import { Calendar, momentLocalizer } from "react-big-calendar";
import Holidays from "date-holidays";
import moment from "moment";

const localizer = momentLocalizer(moment);

function CalendarComponent({
  setIsOpenStandardAppoint,
  setPopUpStandard,
  setAppointmentDetails,
  toast,
}) {
  // const events = [
  //   {
  //     start: "9/6/2023, 1:00:00 PM",
  //     end: "9/6/2023, 1:00:00 PM",
  //     title: "MRI Registration",
  //     data: {
  //       type: "Reg",
  //     },
  //   },
  //   {
  //     start: moment("2023-09-04T14:00:00").toDate(),
  //     end: moment("2023-09-04T15:30:00").toDate(),
  //     title: "ENT Appointment",
  //     data: {
  //       type: "App",
  //     },
  //   },
  // ];

  // const components = {
  //   event: () => {
  //     const eventType = "App";
  //     switch (eventType) {
  //       case "Reg":
  //         return (
  //           <div
  //             style={{ background: "yellow", color: "white", height: "100%" }}
  //           >
  //             {"asdasd"}
  //           </div>
  //         );
  //       case "App":
  //         return (
  //           <div
  //             style={{
  //               background: "lightgreen",
  //               color: "white",
  //               height: "100%",
  //             }}
  //           >
  //             {"asdasdas"}
  //           </div>
  //         );
  //       default:
  //         return null;
  //     }
  //   },
  // };
  const holiday = new Holidays("PH");

  return (
    <div>
      <Calendar
        localizer={localizer}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        // events={events}
        // components={components}
        views={{
          month: true,
          week: false,
          day: false,
          agenda: true,
        }}
        selectable={true}
        onSelectSlot={(data) => {
          if (data.start < new Date()) {
            return toast.error("Not a valid date!");
          }

          if (holiday.isHoliday(data.start)) {
            return toast.error("The date is a holiday!");
          }

          if ([0].includes(data.start.getDay())) {
            return toast.error("No Appointment on Sundays!");
          }
          setPopUpStandard(false);
          setIsOpenStandardAppoint(true);
          setAppointmentDetails(data);
        }}
        min={new Date().toLocaleDateString}
        max={
          new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate()
          )
        }
        step={7.5}
      />
    </div>
  );
}

export default CalendarComponent;
