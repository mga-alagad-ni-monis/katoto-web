function NavBar() {
  return (
    <div className="absolute w-full">
      <nav className="flex justify-between py-10 items-center container mx-auto bg-transparent">
        <p className="text-4xl font-extrabold w-1/2">Katoto</p>
        <div className="flex pl-28 justify-between w-1/2 items-center">
          <li className="flex gap-10 font-bold">
            <ul>Announcements</ul>
            <ul>Chatbot</ul>
          </li>
          <button className="bg-black rounded-full font-semibold text-[--light-brown] text-sm py-2 px-8">
            Login
          </button>
        </div>
      </nav>
    </div>
  );
}

export default NavBar;
