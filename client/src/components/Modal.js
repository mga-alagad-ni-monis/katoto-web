function Modal({ children, isClose, setIsClose }) {
  return (
    <div className="w-screen h-full bg-black/50 absolute z-50 flex justify-center items-center">
      <div className="w-4/12 h-max z-50 bg-[--light-brown] p-8 rounded-2xl">
        <div>{children}</div>
      </div>
    </div>
  );
}

export default Modal;
