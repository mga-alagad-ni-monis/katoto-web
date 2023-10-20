import { useEffect, useState } from "react";
import { HiOutlineUsers, HiOutlineCalendarDays } from "react-icons/hi2";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function UserNumberReport({ data, isGuided, selectedMode, selectedDateTime }) {
  const [dailyUsersCount, setDailyUsersCount] = useState(0);

  useEffect(() => {
    setDailyUsersCount(0);
    data?.forEach((i) => {
      if (isGuided) {
        i?.dailyUsers?.guided?.forEach((j) => {
          setDailyUsersCount((prevCount) => prevCount + 1);
        });
      } else {
        i?.dailyUsers?.friendly?.forEach((j) => {
          setDailyUsersCount((prevCount) => prevCount + 1);
        });
      }
    });
  }, [data, isGuided, selectedMode, selectedDateTime]);

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

  return (
    <div>
      <div className="">
        <div className="flex gap-5">
          <div className="flex bg-[--dark-green] text-[--light-brown] p-5 rounded-lg shadow-lg gap-5 w-fit mb-8 items-center">
            <HiOutlineUsers size={52} />
            <div className="flex flex-col justify-between">
              <p className="font-bold text-2xl">{dailyUsersCount}</p>
              <p className="text-sm">
                Number of{" "}
                {selectedMode === "Friendly Conversation"
                  ? "friendly conversation"
                  : "counselor-guided"}{" "}
                users in{" "}
                {selectedDateTime === "Year" ? "this year" : selectedDateTime}
              </p>
            </div>
          </div>
          <div className="flex bg-[--dark-green] text-[--light-brown] p-5 rounded-lg shadow-lg gap-5 w-fit mb-8 mr-10 items-center">
            <HiOutlineCalendarDays size={52} />
            <div className="flex flex-col justify-between">
              <p className=" font-bold">
                {convertDate(new Date(data[0]?.date))[1] +
                  " to " +
                  convertDate(new Date(data[data.length - 1]?.date))[1]}
              </p>
            </div>
          </div>
        </div>
        {/* <ResponsiveContainer width={"100%"} height={"95%"}>
          <AreaChart
            width={500}
            height={400}
            data={data}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickMargin={10} />
            <YAxis allowDecimals={false} tickMargin={10} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey={
                isGuided
                  ? "dailyUsers.guided.length"
                  : "dailyUsers.friendly.length"
              }
              name="Users"
              stroke="#2d757c"
              fill="#2d757c"
            />
          </AreaChart>
        </ResponsiveContainer> */}
      </div>
    </div>
  );
}

export default UserNumberReport;
