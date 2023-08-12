import { useState } from "react";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Label,
} from "recharts";

import { FiChevronDown } from "react-icons/fi";

function UserNumberReport(data) {
  const [isGuidedDailyUsers, setIsGuidedDailyUsers] = useState(false);
  const [isOpenDailyUsers, setIsOpenDailyUsers] = useState(false);
  const [selectedMode, setSelectedMode] = useState("Counselor-Guided");

  const mode = ["Counselor-Guided", "Friendly Conversation"];

  return (
    <div>
      <div className="flex justify-between w-full items-center mb-5">
        <p className="flex text-xl font-extrabold">Daily Active Users</p>
        <div className="flex gap-5">
          <div className="hs-dropdown relative inline-flex gap-5">
            <button
              type="button"
              className="bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-3 pl-3 flex gap-2 items-center justify-center 
              border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
              onClick={() => {
                setIsOpenDailyUsers(!isOpenDailyUsers);
              }}
            >
              {selectedMode}
              <FiChevronDown size={16} />
            </button>
            <div
              className={`${
                isOpenDailyUsers ? "visible" : "hidden"
              } absolute top-9 right-0 transition-all duration-100 w-[12.6rem]
              z-10 mt-2 shadow-md rounded-lg p-2 bg-[--dark-green]`}
            >
              {mode.map((i, k) => {
                return (
                  <button
                    key={k}
                    className="w-full flex items-center gap-x-3.5 py-2 px-3 rounded-md text-sm font-semibold text-[--light-brown] hover:bg-[--light-brown] hover:text-[--dark-green]"
                    onClick={() => {
                      setIsGuidedDailyUsers(!isGuidedDailyUsers);
                      setIsOpenDailyUsers(!isOpenDailyUsers);
                      setSelectedMode(i);
                    }}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <div className="h-[500px] w-full">
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <AreaChart
            width={500}
            height={400}
            data={data.data}
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
                isGuidedDailyUsers
                  ? "dailyUsers.friendly.length"
                  : "dailyUsers.guided.length"
              }
              name="Users"
              stroke="#2d757c"
              fill="#2d757c"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserNumberReport;
