function ReportsTd({ value, width }) {
  return (
    <p
      className={`truncate mr-[20px] flex justify-start truncate text-ellipsis tooltip-div`}
    >
      <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
        {value === undefined ? " " : value}
      </div>
      {value === undefined ? " " : value}
    </p>
  );
}

export default ReportsTd;
