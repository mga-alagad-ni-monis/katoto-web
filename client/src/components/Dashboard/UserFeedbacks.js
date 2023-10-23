import { useEffect, useState } from "react";

import axios from "../../api/axios";

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

import satisfied from "../../assets/feedback-emoji/5.png";
import happy from "../../assets/feedback-emoji/4.png";
import neutral from "../../assets/feedback-emoji/3.png";
import disappointed from "../../assets/feedback-emoji/2.png";
import frustrated from "../../assets/feedback-emoji/1.png";

function UserFeedbacks({ data, isGuided, auth, toast, date }) {
  const [feedbackData, setFeedbackData] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    getFeedbackData();
  }, [data]);

  const feedbackDescriptions = [
    { str: "Frustated", img: frustrated },
    { str: "Disappointed", img: disappointed },
    { str: "Neutral", img: neutral },
    { str: "Happy", img: happy },
    { str: "Satisfied", img: satisfied },
  ];

  const feedbackDescriptionsLegends = [
    { str: "Satisfied", img: satisfied },
    { str: "Happy", img: happy },
    { str: "Neutral", img: neutral },
    { str: "Disappointed", img: disappointed },
    { str: "Frustated", img: frustrated },
  ];

  const getFeedbackData = () => {
    if (data !== undefined && feedbacks) {
      let feedback = [];

      feedbackDescriptions.map((i) =>
        feedback.push({ rating: i, "Number of Students": 0 })
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
                k["Number of Students"]++;
              }
            }
          });
        });
      });

      setFeedbackData(feedback);
    }
  };

  const CustomTick = ({ x, y, payload }) => {
    console.log(x, y);
    return (
      <g transform={`translate(${x - 50},${y})`}>
        <image
          xlinkHref={`${payload.value}`}
          width={100}
          height={100}
          style={{ filter: "drop-shadow(0px 0px 15px #f0ad4e)" }}
        />
      </g>
    );
  };

  return (
    <div className="sh rounded-xl p-8 mb-8">
      <div className="flex justify-between w-full items-center mb-1">
        <p className="flex text-xl font-extrabold">Feedbacks</p>
      </div>
      <p className="mb-8 text-black/50 mb-8">
        The number of students that have provided feedback on the system from{" "}
        {date}.
      </p>
      <div className="h-[650px] flex w-full gap-12">
        <div className="w-4/5">
          <ResponsiveContainer width={"100%"} height={"100%"}>
            <BarChart
              data={feedbackData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="rating.img"
                tick={CustomTick}
                height={100}
                offset={2}
                interval={0}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend
                wrapperStyle={{
                  marginLeft: "35px",
                  marginTop: "200px",
                }}
              />

              <Bar dataKey="Number of Students" fill="#2d757c" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex w-1/5 flex-col gap-3 items-start mt-24">
          {feedbackDescriptionsLegends?.map((i, k) => {
            return (
              <div className="flex gap-3 justify-center items-center">
                <img
                  src={i?.img}
                  alt="k"
                  className="w-16"
                  style={{ filter: "drop-shadow(0px 0px 10px #f0ad4e)" }}
                />
                <div key={k}>{i?.str}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default UserFeedbacks;
