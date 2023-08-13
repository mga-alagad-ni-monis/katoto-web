import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function UserNumberReport({ data, isGuided }) {
  return (
    <div>
      <div className="flex justify-between w-full items-center mb-5">
        <p className="flex text-xl font-extrabold">Daily Active Users</p>
      </div>
      <div className="h-[500px] w-full">
        <ResponsiveContainer width={"100%"} height={"100%"}>
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
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserNumberReport;
