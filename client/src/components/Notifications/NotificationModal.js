import { Markup } from "interweave";
import { FaTimes } from "react-icons/fa";
import { BsFillTrash3Fill } from "react-icons/bs";

function NotificationModal({
  title,
  status,
  setIsOpenNotificationModal,
  icon,
  description,
  appointmentDetails,
  dateTime,
  isDisplay,
  handleDeleteNotification,
  handleDeleteLocal,
}) {
  return (
    <>
      <div className="w-full justify-between flex">
        <p className="text-2xl font-extrabold">
          <Markup content={title} />
        </p>
        <button
          onClick={() => {
            setIsOpenNotificationModal(false);
          }}
          type="button"
        >
          <FaTimes size={20} />
        </button>
      </div>
      <div className="flex flex-col gap-4 mt-5">
        <div className="flex flex-col gap-5">
          <div className="flex gap-5 items-center">
            {(() => {
              if (status === "upcoming") {
                return (
                  <div className="bg-[--light-green] h-fit rounded-full p-2 text-black border border-2 border-[--light-green]">
                    {icon}
                  </div>
                );
              } else if (status === "completed") {
                return (
                  <div className="bg-[--dark-green] h-fit rounded-full p-2 text-white border border-2 border-[--dark-green]">
                    {icon}
                  </div>
                );
              } else if (status === "cancelled") {
                return (
                  <div className="bg-[--red] h-fit rounded-full p-2 text-white border border-2 border-[--red]">
                    {icon}
                  </div>
                );
              } else if (status === "pending") {
                return (
                  <div className="bg-[--yellow] h-fit rounded-full p-2 text-black border border-2 border-[--yellow]">
                    {icon}
                  </div>
                );
              } else if (status === "edited") {
                return (
                  <div className="bg-black/20 h-fit rounded-full p-2 text-black border border-2 border-black/20">
                    {icon}
                  </div>
                );
              }
            })()}
            <div className="flex flex-col gap-5">
              <Markup content={description} />
            </div>
          </div>
          <div>
            {isDisplay ? (
              <>
                <div className="flex items-center gap-5">
                  <p className="text-[--dark-green] font-bold flex items-center mb-3">
                    Appointment Details
                  </p>
                  {(() => {
                    if (
                      new Date(appointmentDetails?.details?.end) < new Date() &&
                      appointmentDetails?.details?.status === "upcoming"
                    ) {
                      return (
                        <div className="w-max p-2 rounded-lg bg-black/20 text-black text-xs mb-3 font-bold">
                          Ended
                        </div>
                      );
                    } else if (
                      appointmentDetails?.details?.status === "pending"
                    ) {
                      return (
                        <div className="w-max p-2 rounded-lg bg-[--yellow] text-black text-xs mb-3 font-bold">
                          Pending
                        </div>
                      );
                    } else if (
                      appointmentDetails?.details?.status === "upcoming"
                    ) {
                      return (
                        <div className="w-max p-2 rounded-lg bg-[--light-green] text-black text-xs mb-3 font-bold">
                          Upcoming
                        </div>
                      );
                    } else if (
                      appointmentDetails?.details?.status === "completed"
                    ) {
                      return (
                        <div className="w-max p-2 rounded-lg bg-[--dark-green] text-[--light-brown] text-xs mb-3 font-bold">
                          Completed
                        </div>
                      );
                    } else if (
                      appointmentDetails?.details?.status === "cancelled"
                    ) {
                      return (
                        <div className="w-max p-2 rounded-lg bg-[--red] text-[--light-brown] text-xs mb-3 font-bold">
                          Cancelled
                        </div>
                      );
                    } else if (status === "edited") {
                      return (
                        <div className="w-max p-2 rounded-lg bg-[--light-green] text-black text-xs mb-3 font-bold">
                          Upcoming
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="bg-black/10 w-full h-auto p-3 rounded-lg mb-5">
                  {dateTime}
                </div>
                <div className="flex gap-5 mb-5">
                  <div>
                    <p className="text-[--dark-green] font-bold flex items-center mb-3">
                      Concern Overview
                    </p>
                    {status === "edited"
                      ? appointmentDetails?.description
                      : appointmentDetails?.details?.description}
                  </div>
                  <div>
                    <p className="text-[--dark-green] font-bold flex items-center mb-3">
                      Guidance Counselor
                    </p>
                    {status === "edited"
                      ? appointmentDetails?.gc?.name
                      : appointmentDetails?.details?.gc?.name}
                  </div>
                  <div>
                    <p className="text-[--dark-green] font-bold flex items-center mb-3">
                      Mode
                    </p>
                    {status === "edited"
                      ? appointmentDetails?.mode === "facetoface"
                        ? "Face-to-face"
                        : "Virtual"
                      : appointmentDetails?.details?.mode === "facetoface"
                      ? "Face-to-face"
                      : "Virtual"}
                  </div>
                </div>
                <p className="text-[--dark-green] font-bold flex items-center w-full mb-3">
                  Your Details
                </p>
                <table className="mb-5 text-xs">
                  <tr>
                    <td className="w-[150px] flex justify-start">Name</td>
                    <td>
                      {status === "edited"
                        ? appointmentDetails?.userDetails.name
                        : appointmentDetails?.details?.userDetails.name}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">Gender</td>
                    <td>
                      {status === "edited"
                        ? appointmentDetails?.userDetails.gender
                        : appointmentDetails?.details?.userDetails.gender}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">Email</td>
                    <td>
                      {status === "edited"
                        ? appointmentDetails?.userDetails.email
                        : appointmentDetails?.details?.userDetails.email}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start"> ID Number</td>
                    <td>
                      {status === "edited"
                        ? appointmentDetails?.userDetails.idNo
                        : appointmentDetails?.details?.userDetails.idNo}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">Course</td>
                    <td>
                      {status === "edited"
                        ? appointmentDetails?.userDetails.department
                        : appointmentDetails?.details?.userDetails.department}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">
                      Year and Section
                    </td>
                    <td>
                      {status === "edited"
                        ? appointmentDetails?.userDetails.yearSection
                        : appointmentDetails?.details?.userDetails.yearSection}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">College</td>
                    <td>
                      {status === "edited"
                        ? appointmentDetails?.userDetails.mainDepartment
                        : appointmentDetails?.details?.userDetails
                            .mainDepartment}
                    </td>
                  </tr>
                  <tr>
                    <td className="w-[150px] flex justify-start">Phone</td>
                    <td>
                      {status === "edited"
                        ? appointmentDetails?.userDetails.contactNo
                        : appointmentDetails?.details?.userDetails.contactNo}
                    </td>
                  </tr>
                </table>
              </>
            ) : null}
            {handleDeleteLocal === null &&
            handleDeleteNotification === null ? null : (
              <div className="flex justify-end">
                <button
                  className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                  onClick={() => {
                    setIsOpenNotificationModal(false);
                    handleDeleteNotification(appointmentDetails.id);
                    handleDeleteLocal(appointmentDetails.id);
                  }}
                >
                  <BsFillTrash3Fill size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default NotificationModal;
