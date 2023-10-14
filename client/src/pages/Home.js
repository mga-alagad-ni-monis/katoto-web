function Home() {
  return (
    <div className="bg-[url('./assets/dots.webp')] w-screen h-screen flex flex-col items-center pt-44 h-screen bg-[--light-brown] px-96">
      <div className="text-md">
        <p className="font-medium text-black/60">
          Break the fucking stigma bro
        </p>
      </div>
      <div className="text-6xl text-center font-black leading-snug mt-5">
        <p className="">
          A{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-[--light-green] to-[#1cd8d2] text-shadow">
            chatbot that serves as a tool
          </span>{" "}
        </p>
        <p className="">for seeking mental health</p>
        <p className="text-black"> support </p>
        {/* <p className="text-black">of PLV students</p> */}
      </div>
      <div className="mt-10 text-md">
        <p className="font-medium text-black/60 text-center px-52">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet corporis
          et eos itaque esse id totam eum vero inventore! Possimus?
        </p>
      </div>
    </div>
  );
}

export default Home;
