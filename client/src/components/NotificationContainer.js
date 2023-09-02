import { motion } from "framer-motion";

function NotificationContainer({ isOpenNotifications, notifications }) {
  return (
    <motion.div
      className="bg-[--light-brown] rounded-2xl border-2 border-black/10 shadow-lg w-1/5 h-[55%] fixed right-20 bottom-0 z-40 p-8"
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
      <motion.p className="text-2xl font-extrabold">Notifications</motion.p>
      <motion.ul className="">
        {notifications.map((i, k) => {
          return <motion.li key={k}>{i.id}</motion.li>;
        })}
      </motion.ul>
    </motion.div>
  );
}

export default NotificationContainer;
