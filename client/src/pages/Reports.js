import { useEffect, useState } from "react";
import axios from "../api/axios";

import UserNumberReport from "../components/Reports/UserNumberReport";

function Reports({ auth, toast }) {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    handleGetReports();
  }, []);

  const handleGetReports = async () => {
    try {
      await axios
        .get("/api/reports/reports", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          setReports(res.data.reports);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  return (
    <div className="bg-[--light-brown] h-screen">
      <div className="flex flex-col px-80">
        <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
          Reports
        </p>

        <UserNumberReport data={reports}></UserNumberReport>
      </div>
    </div>
  );
}

export default Reports;
