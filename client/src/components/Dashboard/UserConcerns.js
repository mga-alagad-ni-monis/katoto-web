import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";
import axios from "../../api/axios";

function UserConcerns({ data, isGuided, auth, toast }) {
  const [concernData, setConcernData] = useState([]);
  const [concerns, setConcerns] = useState([]);

  useEffect(() => {
    handleGetConcerns();
    getConcernData();
  }, [data]);

  const getConcernData = () => {
    if (data !== undefined && concerns) {
      let concern = [];

      concerns.map((i) => concern.push({ name: i, "Number of students": 0 }));

      data.forEach((i) => {
        i?.concerns?.forEach((j) => {
          concern.forEach((k) => {
            if (auth?.userInfo?.assignedCollege?.includes(j.mainDepartment)) {
              if (j.concern.toString() === k.name) {
                k["Number of students"]++;
              }
            }
          });
        });
      });

      setConcernData(concern);
    }
  };

  const handleGetConcerns = async () => {
    try {
      await axios
        .get("/api/train/get-concerns", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setConcerns(res?.data?.concerns);
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
      <div className="flex justify-between w-full items-center mb-1">
        <p className="flex text-xl font-extrabold">Concerns</p>
      </div>
      <p className="mb-8 text-black/50 mb-8">
        The number of students who have concerns.
      </p>
      <div className="h-[500px] w-full">
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <BarChart
            width={500}
            height={300}
            data={concernData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar dataKey="Number of students" fill="#2d757c" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default UserConcerns;
