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

function UserFeedbacks({ data, isGuided, auth, toast }) {
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    getFeedbackData();
  }, [data]);

  const feedbackDescriptions = [
    "Frustated",
    "Disappointed",
    "Neutral",
    "Happy",
    "Satisfied",
  ];

  const getFeedbackData = () => {
    if (data !== undefined && feedbacks) {
      let feedback = [];

      feedbackDescriptions.map((i) =>
        feedback.push({ rating: i, "Number of students": 0 })
      );

      data.forEach((i) => {
        i?.feedbacks?.forEach((j) => {
          feedback.forEach((k, z) => {
            if (
              auth?.userInfo?.assignedCollege?.includes(
                j?.userDetails?.mainDepartment
              )
            ) {
              if (j.rating === z + 1) {
                k["Number of students"]++;
              }
            }
          });
        });
      });

      setFeedbackData(feedback);
    }
  };

  return (
    <div className="sh rounded-xl p-8 mb-8">
      <div className="flex justify-between w-full items-center mb-1">
        <p className="flex text-xl font-extrabold">Feedbacks</p>
      </div>
      <p className="mb-8 text-black/50 mb-8">
        The number of students that have provided feedback on the system.
      </p>
      <div className="h-[500px] w-full">
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <BarChart
            width={500}
            height={300}
            data={feedbackData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="rating" />
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

export default UserFeedbacks;
