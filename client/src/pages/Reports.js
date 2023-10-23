import ReportTable from "../components/Reports/ReportTable";

function Reports({ auth, toast, title, filters, tableCategories }) {
  return (
    <ReportTable
      toast={toast}
      filters={filters}
      tableCategories={tableCategories}
      title={title}
      auth={auth}
    />
  );
}

export default Reports;
