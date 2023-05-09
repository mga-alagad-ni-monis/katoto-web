import { useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();

  return (
    <div className="bg-transparent">
      {console.log(location)}
      <nav
        className={`flex ${
          location.pathname === "/login" ? "justify-between" : "justify-end"
        } py-10 items-center container mx-auto bg-transparent 2xl:px-[2rem]`}
      >
        {location.pathname === "/login" ? (
          
          <p className="text-4xl font-extrabold w-1/2 z-50">Katoto</p>
        ) : null}
        <div className="flex pl-28 justify-between w-1/2 items-center z-50">
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
