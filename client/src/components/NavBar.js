import { useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();

  return (
    <>
      {location.pathname === "/login" ? (
        <div
          className={`flex ${
            location.pathname === "/login"
              ? "bg-transparent"
              : "bg-[--light-brown]"
          } `}
        >
          <nav
            className={`flex ${
              location.pathname === "/login"
                ? "justify-between bg-transparent"
                : "justify-end bg-[--light-brown]"
            } py-10 items-center container mx-auto 2xl:px-[2rem]`}
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
      ) : null}
    </>
  );
}

export default NavBar;
