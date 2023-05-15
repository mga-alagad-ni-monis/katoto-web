import axios from "../api/axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import useAuth from "../hooks/useAuth";

import plvImage from "../assets/plv.png";

function Login({ toast, loading, setLoading }) {
  const { setAuth } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await axios
        .post(
          `/api/login`,
          {
            email,
            password,
          },
          {
            headers: { "Content-Type": "application/json" },
            withCredentials: true,
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
          const roles = [res?.data?.role];
          const user = email;
          setAuth({ user, roles, accessToken: res?.data?.accessToken });
          setEmail("");
          setPassword("");
          if (roles[0] === "student") {
            setLoading(false);
            return navigate("/chat");
          } else if (
            roles[0] === "guidanceCounselor" ||
            "systemAdministrator"
          ) {
            setLoading(false);
            return navigate("/reports");
          }
        })
        .catch((err) => {
          toast.error(err?.response?.data);
          setEmail("");
          setPassword("");
          setLoading(false);
        });
    } catch (err) {
      toast.error(err?.response?.data);
      setEmail("");
      setPassword("");
      setLoading(false);
    }
  };

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
          <form className="flex flex-col" onSubmit={login}>
            <label htmlFor="email" className="text-sm font-bold">
              Email *
            </label>
            <input
              id="email"
              type="email"
              className="rounded-full border border-[--light-gray] bg-transparent w-full px-5 py-2 mt-4 mb-6"
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              value={email}
              required
            />
            <label htmlFor="password" className="text-sm font-bold">
              Password *
            </label>
            <input
              id="password"
              type="password"
              className="rounded-full border border-[--light-gray] bg-transparent w-full px-5 py-2 mt-4 mb-4"
              onChange={(e) => {
                setPassword(e.target.value);
              }}
              value={password}
              required
            />
            <p className="text-sm font-bold text-[--dark-green] flex justify-end mb-4">
              Forgot Password?
            </p>
            <button
              type="submit"
              className="font-semibold text-sm w-full rounded-full bg-black text-[--light-brown] py-[10px]"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
