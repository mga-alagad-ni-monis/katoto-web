import { useState, useEffect } from "react";

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

function UserDemographics({ data, isGuided }) {
  const [mainDeparmentData, setMainDeparmentData] = useState([]);
  const [deparmentData, setDeparmentData] = useState([]);
  const [ageData, setAgeData] = useState([]);
  const [genderData, setGenderData] = useState([]);

  useEffect(() => {
    getMainDepartmentData();
    getDepartmentData();
    getAgeData();
    getGenderData();
  }, [data, isGuided]);

  const COLORS = ["#000000", "#a9e6c2", "#f0ad4e", "#ff6961"];

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getMainDepartmentData = () => {
    if (data !== undefined) {
      let departments = [
        "College of Education",
        "College of Arts and Sciences",
        "College of Engineering and Information Technology",
        "College of Business Administration, Public Administration and Accountancy",
      ];

      let mainDepartment = [];

      departments.map((i) => mainDepartment.push({ name: i, value: 0 }));

      data.forEach((i) => {
        let demographicsArray = isGuided
          ? i.demographics.guided
          : i.demographics.friendly;

        if (demographicsArray !== undefined) {
          demographicsArray.forEach((j) => {
            mainDepartment.forEach((k) => {
              if (j.mainDepartment === k.name) {
                k.value++;
              }
            });
          });
        }
      });

      setMainDeparmentData(mainDepartment);
    }
  };

  const COLORS_DEPT = [
    "#000000",
    "#a9e6c2",
    "#f0ad4e",
    "#ff6961",
    "#00000033",
    "#2d757c",
    "#1cd8d2",
    "#b8918a",
    "#826",
    "#7f9bd4",
    "#e3bbbd",
    "#97976a",
    "#dc4d01",
    "#ffffff",
    "#effd5f",
    "#68b6ef",
    "#00008B",
  ];

  const department = [
    "Bachelor of Early Childhood Education (BECED)",
    "Bachelor of Secondary Education Major in English (BSED English)",
    "Bachelor of Secondary Education Major in Filipino (BSED Filipino)",
    "Bachelor of Secondary Education Major in Mathematics (BSED Mathematics)",
    "Bachelor of Secondary Education Major in Science (BSED Science)",
    "Bachelor of Secondary Education Major in Social Studies (BSED Soc Studies)",
    "Bachelor of Arts in Communication (BAC)",
    "Bachelor of Science in Psychology (BSP)",
    "Bachelor of Science in Social Work (BSSW)",
    "Bachelor of Science in Accountancy (BSA)",
    "Bachelor of Science in Civil Engineering (BSCE)",
    "Bachelor of Science in Electrical Engineering (BSEE)",
    "Bachelor of Science in Information Technology (BSIT)",
    "Bachelor of Science in Business Administration Major in Financial Management (BSBA FM)",
    "Bachelor of Science in Business Administration Major in Human Resource Development Management (BSBA HRDM)",
    "Bachelor of Science in Business Administration Major in Marketing Management (BSBA MM)",
    "Bachelor of Science in Public Administration (BSPA)",
  ];

  const getDepartmentData = () => {
    if (data !== undefined) {
      let departments = [
        "Bachelor of Early Childhood Education (BECED)",
        "Bachelor of Secondary Education Major in English (BSED English)",
        "Bachelor of Secondary Education Major in Filipino (BSED Filipino)",
        "Bachelor of Secondary Education Major in Mathematics (BSED Mathematics)",
        "Bachelor of Secondary Education Major in Science (BSED Science)",
        "Bachelor of Secondary Education Major in Social Studies (BSED Social Studies)",
        "Bachelor of Arts in Communication (BAC)",
        "Bachelor of Science in Psychology (BSP)",
        "Bachelor of Science in Social Work (BSSW)",
        "Bachelor of Science in Accountancy (BSA)",
        "Bachelor of Science in Civil Engineering (BSCE)",
        "Bachelor of Science in Electrical Engineering (BSEE)",
        "Bachelor of Science in Information Technology (BSIT)",
        "Bachelor of Science in Business Administration Major in Financial Management (BSBA FM)",
        "Bachelor of Science in Business Administration Major in Human Resource Development Management (BSBA HRDM)",
        "Bachelor of Science in Business Administration Major in Marketing Management (BSBA MM)",
        "Bachelor of Science in Public Administration (BSPA)",
      ];

      let department = [];

      departments.map((i) => department.push({ name: i, value: 0 }));

      data.forEach((i) => {
        let demographicsArray = isGuided
          ? i.demographics.guided
          : i.demographics.friendly;

        if (demographicsArray !== undefined) {
          demographicsArray.forEach((j) => {
            department.forEach((k) => {
              if (j.department === k.name) {
                k.value++;
              }
            });
          });
        }
      });

      setDeparmentData(department);
    }
  };

  const getAgeData = () => {
    if (data !== undefined) {
      let ages = ["18", "19", "20", "21", "22"];

      let age = [];

      ages.map((i) => age.push({ name: i, value: 0 }));

      data.forEach((i) => {
        let demographicsArray = isGuided
          ? i.demographics.guided
          : i.demographics.friendly;

        if (demographicsArray !== undefined) {
          demographicsArray.forEach((j) => {
            age.forEach((k) => {
              if (j.age.toString() === k.name) {
                k.value++;
              }
            });
          });
        }
      });

      setAgeData(age);
    }
  };

  const getGenderData = () => {
    if (data !== undefined) {
      let genders = ["Male", "Female", "Other"];

      let gender = [];

      genders.map((i) => gender.push({ name: i, value: 0 }));

      data.forEach((i) => {
        let demographicsArray = isGuided
          ? i.demographics.guided
          : i.demographics.friendly;

        if (demographicsArray !== undefined) {
          demographicsArray.forEach((j) => {
            gender.forEach((k) => {
              if (j.gender === k.name) {
                k.value++;
              }
            });
          });
        }
      });

      setGenderData(gender);
    }
  };

  const shortDept = ["COED", "CAS", "CEIT", "CABA"];
  const gender = ["Male", "Female", "Other"];

  return (
    <div>
      <div className="flex justify-between w-full items-center mb-8">
        <div className="flex flex-col gap-2">
          <p className="flex text-xl font-extrabold">User Demographics</p>
          <p className="text-black/50">
            The demographics of daily active users.
          </p>
        </div>
      </div>

      <div className="flex w-full justify-between">
        <div className="sh rounded-lg h-full pt-6 pr-12">
          <p className="font-bold ml-8">College</p>
          <div className="h-[230px] w-[330px] flex items-center">
            <ResponsiveContainer width={"100%"} height={"100%"}>
              <PieChart width={400} height={400}>
                <Pie
                  data={mainDeparmentData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {mainDeparmentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {shortDept.map((i, k) => {
                return (
                  <div key={k} className="flex gap-3 items-center">
                    <div
                      className={`w-5 h-5 rounded-lg`}
                      style={{ backgroundColor: COLORS[k] }}
                    ></div>
                    <p className="text-[12px]">{i}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="sh rounded-lg h-full pt-6 pr-12">
          <p className="font-bold ml-8">Department</p>
          <div className="h-[230px] w-[600px] flex items-center">
            <div className="w-[330px] h-full">
              <ResponsiveContainer width={"100%"} height={"100%"}>
                <PieChart width={400} height={400}>
                  <Pie
                    data={deparmentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deparmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_DEPT[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap w-1/2">
              {department.map((i, k) => {
                return (
                  <div key={k} className="flex gap-3 w-1/2 items-center">
                    <div
                      className={`w-3 h-3 rounded-lg`}
                      style={{ backgroundColor: COLORS_DEPT[k] }}
                    ></div>
                    <p className="text-[12px]">
                      {JSON.stringify(i.match(/\(([^)]+)\)/g)).slice(3, -3)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* <div className="h-[500px] w-full">
        <ResponsiveContainer width={"100%"} height={"100%"}>
          <BarChart
            width={500}
            height={300}
            data={ageData}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div> */}
        <div className="sh rounded-lg h-full pt-6 pr-12">
          <p className="font-bold ml-8">Gender</p>
          <div className="h-[230px]  w-[330px] flex items-center">
            <ResponsiveContainer width="75%" height="100%">
              <PieChart width={400} height={400}>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-3">
              {gender.map((i, k) => {
                return (
                  <div key={k} className="flex gap-3 items-center">
                    <div
                      className={`w-5 h-5 rounded-lg`}
                      style={{ backgroundColor: COLORS[k] }}
                    ></div>
                    <p className="text-[12px]">{i}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserDemographics;
