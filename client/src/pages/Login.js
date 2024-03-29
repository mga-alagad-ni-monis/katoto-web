import axios from "../api/axios";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import useAuth from "../hooks/useAuth";

import plvImage from "../assets/plv.png";

function Login({ toast, loading, setLoading, auth }) {
  const { setAuth } = useAuth();

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");

  const [isForgotPw, setIsForgotPw] = useState(false);

  useEffect(() => {
    if (auth?.roles) {
      if (auth?.roles[0] === "student") {
        navigate("/chat");
      } else {
        navigate("/dashboard");
      }
    }
  }, []);

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
          setAuth({
            user,
            roles,
            accessToken: res?.data?.accessToken,
            userInfo: res?.data?.userInfo,
          });
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
            return navigate("/dashboard");
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

  const forgotPassword = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(
          `/api/forgot`,
          {
            forgotEmail,
          },
          {
            headers: { "Content-Type": "application/json" },
          }
        )
        .then((res) => {
          setForgotMessage(res?.data?.message);
        })
        .catch((err) => {
          console.log(err?.response?.data?.message);
          setForgotMessage(err?.response?.data?.message);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  return (
    <div className="flex bg-[--light-green] h-screen items-center">
      <div className="w-1/2 h-full bg-gradient-to-r from-[--light-green] to-[--light-brown]">
        <div className="w-full h-full flex justify-end items-center">
          <img src={plvImage} alt="" className="w-max h-max" />
        </div>
      </div>
      <div className="w-1/2 bg-[--light-brown] h-full flex items-center pl-28">
        {isForgotPw ? (
          <div className="w-max">
            <p className="text-4xl font-extrabold mb-14">Forgot Password</p>
            <div className="relative w-full mb-5">
              <hr className="bg-[--light-gray] h-[2px] w-[420px]" />
              <p className="absolute -bottom-2 w-max left-[16.5%] text-[--light-gray] font-bold text-sm bg-[--light-brown] px-5">
                Enter your PLV institutional email
              </p>
            </div>

            <form className="flex flex-col" onSubmit={forgotPassword}>
              <p
                className={`w-[420px] mb-5 mt-4 text-sm font-semibold ${
                  forgotMessage?.includes("not find")
                    ? "text-[--red]"
                    : "text-[--dark-green]"
                }`}
              >
                {forgotMessage}
              </p>
              <label htmlFor="email" className="text-sm font-bold">
                Email *
              </label>
              <input
                id="email"
                type="email"
                className="rounded-full border border-[--light-gray] bg-transparent w-full px-5 py-2 mt-4 mb-6"
                onChange={(e) => {
                  setForgotEmail(e.target.value);
                }}
                value={forgotEmail}
                required
              />
              <div className="flex gap-2 justify-end">
                <p className="text-sm">Already have an account?</p>
                <button
                  type="button"
                  onClick={() => {
                    setPassword("");
                    setEmail("");
                    setIsForgotPw(false);
                  }}
                  className="text-sm font-bold text-[--dark-green] flex justify-end mb-4 hover:underline"
                >
                  Sign in
                </button>
              </div>
              <button
                type="submit"
                className="font-semibold text-sm w-full rounded-full bg-black text-[--light-brown] py-[10px] border-black border border-2 hover:bg-transparent hover:text-black duration-300"
              >
                Submit
              </button>
            </form>
          </div>
        ) : (
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
              <button
                type="button"
                onClick={() => {
                  setForgotEmail("");
                  setForgotMessage("");
                  setIsForgotPw(true);
                }}
                className="text-sm font-bold text-[--dark-green] flex justify-end mb-4 hover:underline"
              >
                Forgot Password?
              </button>
              <button
                type="submit"
                className="font-semibold text-sm w-full rounded-full bg-black text-[--light-brown] py-[10px] border-black border border-2 hover:bg-transparent hover:text-black duration-300"
              >
                Login
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
