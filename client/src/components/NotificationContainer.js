import { motion } from "framer-motion";
import { MdSos } from "react-icons/md";

function NotificationContainer({ isOpenNotifications, notifications }) {
  const convertDate = (date) => {
    const formattedDate = new Date(date);

    const convertedDate = formattedDate.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "GMT",
    });

    return convertedDate;
  };
  return (
    <motion.div
      className="bg-[--light-brown] rounded-t-2xl border-2 border-black/10 shadow-lg w-1/5 h-[55%] fixed right-20 bottom-0 z-40"
      variants={{
        show: {
          opacity: 1,
          // scale: 1,
          y: 0,
          transition: {
            type: "spring",
            stiffness: 500,
            damping: 40,
          },
        },
        hide: {
          opacity: 0,
          // scale: 0.8,
          y: 300,
          transition: {
            type: "spring",
            stiffness: 500,
            damping: 40,
          },
        },
      }}
      animate={isOpenNotifications ? "show" : "hide"}
    >
      <motion.p className="text-2xl font-extrabold py-6 px-6">
        Notifications
      </motion.p>
      <motion.hr className="border-[1px] border-black/5 border-top w-full" />
      <motion.ul className="overflow-x-auto h-full">
        <motion.hr className="border-[1px] border-black/5 border-top w-full" />
        <motion.p className="bg-black/5 px-6 py-2"> Today</motion.p>
        <motion.hr className="border-[1px] border-black/5 border-top w-full" />
        {notifications.map((i, k) => {
          let scheduledDate = i.details.scheduledDate;
          return (
            <motion.li key={k}>
              {(() => {
                if (i.type == "sos") {
                  return (
                    <>
                      {k === 0 ? null : (
                        <motion.hr className="border-[1px] border-black/5 border-top w-full" />
                      )}
                      <motion.div className="flex gap-3 px-6 py-6">
                        <div className="bg-[--red] h-fit rounded-full p-1 text-white border border-2 border-[--red]">
                          <MdSos size={24} />
                        </div>
                        <motion.dev className="text-sm">
                          <span className="font-bold">
                            {i.details.userDetails.name}{" "}
                          </span>
                          has booked an{" "}
                          <span className="font-bold">
                            SOS Emergency appointment{" "}
                          </span>{" "}
                          on {convertDate(i.details.scheduledDate)}
                        </motion.dev>
                        <motion.dev className="text-sm text-black/60">
                          Now
                        </motion.dev>
                      </motion.div>
                    </>
                  );
                }
                return null;
              })()}
            </motion.li>
          );
        })}
      </motion.ul>
    </motion.div>
  );
}

export default NotificationContainer;
