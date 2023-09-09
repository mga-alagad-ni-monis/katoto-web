import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

import Holidays from "date-holidays";

function CalendarComponent({
  setIsOpenStandardAppoint,
  setPopUpStandard,
  setAppointmentDetails,
}) {
  const holiday = new Holidays("PH");

  return (
    <Calendar
      onChange={(data) => {
        setAppointmentDetails({ start: data });
        setPopUpStandard(false);
        setIsOpenStandardAppoint(true);
      }}
      tileDisabled={({ date }) =>
        [0].includes(date.getDay()) ||
        holiday.isHoliday(date) ||
        new Date(date) < new Date()
      }
    />
  );
}

export default CalendarComponent;
