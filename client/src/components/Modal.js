import { motion } from "framer-motion";

function Modal({ children, isOpen, isCalendar }) {
  return (
    <motion.div
      className="w-screen h-screen absolute z-50 flex justify-center items-center"
      variants={{
        show: {
          opacity: 1,
          scale: 0.99,
          transition: {
            type: "spring",
            stiffness: 500,
            damping: 40,
          },
        },
        hide: {
          opacity: 0,
          scale: 0,
          transition: {
            type: "spring",
            stiffness: 500,
            damping: 40,
          },
        },
      }}
      animate={isOpen ? "show" : "hide"}
      initial={{
        opacity: 0,
        scale: 0,
      }}
    >
      <motion.div
        className={`${
          isCalendar ? null : "w-[35%]"
        } h-max z-50 bg-[--light-brown] p-8 rounded-2xl`}
      >
        <motion.div>{children}</motion.div>
      </motion.div>
    </motion.div>
  );
}

export default Modal;
