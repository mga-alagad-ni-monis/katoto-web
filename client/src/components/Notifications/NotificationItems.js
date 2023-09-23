import { Markup } from "interweave";
import TimeAgo from "react-timeago";

import { motion } from "framer-motion";

function NotificationItems({
  status,
  k,
  icon,
  description,
  isSeen,
  createdDate,
}) {
  return (
    <>
      {k === 0 ? null : (
        <motion.hr className="border-[1px] border-black/5 border-top w-full" />
      )}
      <motion.div className="flex gap-3 px-6 py-6">
        {(() => {
          if (status === "upcoming") {
            return (
              <div className="bg-[--light-green] h-fit rounded-full p-1 text-black border border-2 border-[--light-green]">
                {icon}
              </div>
            );
          } else if (status === "completed") {
            return (
              <div className="bg-[--dark-green] h-fit rounded-full p-1 text-white border border-2 border-[--dark-green]">
                {icon}
              </div>
            );
          } else if (status === "cancelled") {
            return (
              <div className="bg-[--red] h-fit rounded-full p-1 text-white border border-2 border-[--red]">
                {icon}
              </div>
            );
          } else if (status === "pending") {
            return (
              <div className="bg-[--yellow] h-fit rounded-full p-1 text-black border border-2 border-[--yellow]">
                {icon}
              </div>
            );
          } else if (status === "edited") {
            return (
              <div className="bg-black/20 h-fit rounded-full p-1 text-black border border-2 border-black/20">
                {icon}
              </div>
            );
          }
        })()}
        <motion.div className="flex flex-col gap-1 text-sm items-start">
          <motion.div>
            <Markup content={description} />
          </motion.div>
          <motion.div
            className={`text-sm ${
              !isSeen ? "font-bold text-[--dark-green]" : "text-black/60"
            }`}
          >
            <TimeAgo date={createdDate} />
          </motion.div>
        </motion.div>
        <motion.div className="w-auto flex mt-1">
          {!isSeen ? (
            <motion.div className="w-3 h-3 rounded-full bg-[--dark-green]" />
          ) : null}
        </motion.div>
      </motion.div>
    </>
  );
}

export default NotificationItems;
