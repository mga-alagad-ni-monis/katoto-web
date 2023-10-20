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

  const getFeedbackData = () => {
    if (data !== undefined && feedbacks) {
      let feedback = [];

      feedbackDescriptions.map((i) => feedback.push({ rating: i, Number: 0 }));

      data.forEach((i) => {
        i?.feedbacks?.forEach((j) => {
          feedback.forEach((k, z) => {
            if (
              auth?.userInfo?.assignedCollege?.includes(
                j?.userDetails?.mainDepartment
              )
            ) {
              if (j.rating === z + 1) {
                k["Number"]++;
              }
            }
          });
        });
      });

      setFeedbackData(feedback);
    }
  };

  const CustomTick = ({ x, y, payload }) => {
    return (
      <g transform={`translate(${x},${y})`}>
        <image xlinkHref={`${payload.value}`} width={20} height={20} />
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
      <div className="h-[500px] flex flex-col w-full gap-12">
        {/* {feedbackDescriptions?.map((i, k) => {
          return (
            <div className="flex flex-col items-center gap-3" key={k}>
              <img src={i.img} alt="" className="w-40 h-40" />
              <p>{feedbackData[k]?.Number}</p>
              <p className="font-bold text-lg">{i.str}</p>
            </div>
          );
        })} */}

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
            <Bar dataKey="Number" fill="#2d757c" />
          </BarChart>
        </ResponsiveContainer>
        {/* <div className="flex justify-between pr-32 pl-[10.5rem]">
          {feedbackDescriptions?.map((i, k) => {
            return <img src={i.img} alt="" className="w-20 h-20" />;
          })}
        </div> */}
      </div>
    </div>
  );
}

export default UserFeedbacks;
