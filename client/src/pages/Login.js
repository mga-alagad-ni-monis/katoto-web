import plvImage from "../assets/plv.png";

function Login() {
  return (
    <div className="flex bg-[--light-green] h-screen items-center">
      <div className="w-1/2 flex justify-end">
        <img src={plvImage} alt="" className="w-max h-max" />
      </div>
      <div className="w-1/2 bg-[--light-brown] h-full flex items-center pl-28">
        <div className="w-max">
          <p className="text-4xl font-extrabold mb-5">Login</p>
          <p className="font-bold mb-14">
            See your growth and get consulting support!
          </p>
          <div className="relative w-full mb-14">
            <hr className="bg-[--light-gray] h-[2px] w-[420px]" />
            <p className="absolute -bottom-2 w-max left-[16.5%] text-[--light-gray] font-bold text-sm bg-[--light-brown] px-5">
              Sign in with PLV institutional email
            </p>
          </div>
          <form className="flex flex-col">
            <label htmlFor="username" className="text-sm font-bold">
              Email *
            </label>
            <input
              id="username"
              type="text"
              className="rounded-full border border-[--light-gray] bg-transparent w-full px-5 py-2 mt-4 mb-6"
            />
            <label htmlFor="password" className="text-sm font-bold">
              Password *
            </label>
            <input
              id="password"
              type="text"
              className="rounded-full border border-[--light-gray] bg-transparent w-full px-5 py-2 mt-4 mb-4"
            />
          </form>
          <p className="text-sm font-bold text-[--dark-green] flex justify-end mb-4">
            Forgot Password?
          </p>
          <button className="font-semibold text-sm w-full rounded-full bg-black text-[--light-brown] py-[10px]">
            Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
