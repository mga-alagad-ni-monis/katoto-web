function ReportsTd({ value }) {
  return (
    <p className="min-w-[100px] w-auto mr-5 flex justify-start truncate text-ellipsis tooltip-div">
      <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
        {value}
      </div>
      {value}
    </p>
  );
}

export default ReportsTd;
