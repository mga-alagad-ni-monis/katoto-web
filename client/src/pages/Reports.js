import { useEffect, useState } from "react";
import axios from "../api/axios";
import ReportTable from "../components/Reports/ReportTable";

function Reports({ auth, toast, title, filters, tableCategories }) {
  return (
    <div className="bg-[--light-brown] h-screen overflow-hidden">
      <div className="flex flex-col px-52">
        <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
          {`${title} Reports`}
        </p>
        <ReportTable
          toast={toast}
          filters={filters}
          tableCategories={tableCategories}
          title={title}
          auth={auth}
        />
      </div>
    </div>
  );
}

export default Reports;
