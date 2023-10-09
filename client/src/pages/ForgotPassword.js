import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import axios from "../api/axios";

function ForgotPassword({ toast, auth }) {
  const { resetToken } = useParams();

  const navigate = useNavigate();

  const [newPwF, setnewPwF] = useState("");
  const [newPwS, setnewPwS] = useState("");

  useEffect(() => {
    checkValidToken();
  }, []);

  const checkValidToken = async () => {
    await axios
      .get(`/api/forgot/${resetToken}`)
      .then((res) => {})
      .catch((err) => {
        navigate(`../${err?.response?.data?.redirect}`);
        toast.error("Error");
      });
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(`/api/reset/${resetToken}`, {
          newPwF,
          newPwS,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          if (res?.data?.redirect !== undefined) {
            navigate(`../${res?.data?.redirect}`);
          }
        })
        .catch((err) => {
          toast.error(err?.response?.data);
          if (err?.response?.data?.redirect !== undefined) {
            navigate(`../${err?.response?.data?.redirect}`);
          }
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  return (
    <div className="flex bg-[--light-brown] justify-center h-screen items-start pt-40">
      <div className="w-3/12 sh rounded-2xl flex items-center flex-col p-10">
        <div className="flex w-full justify-start">
          <p className="font-extrabold text-3xl mb-5"> Forgot Password</p>
        </div>
        <form className="flex flex-col w-full" onSubmit={changePassword}>
          <label htmlFor="password" className="text-sm font-bold">
            New Password <span className="text-[--red]">*</span>
          </label>
          <input
            id="password"
            type="password"
            className="rounded-full border border-[--light-gray] bg-transparent w-full px-5 py-2 mt-4 mb-4"
            onChange={(e) => {
              setnewPwF(e.target.value);
            }}
            value={newPwF}
            required
          />
          <label htmlFor="password" className="text-sm font-bold">
            Confirm New Password <span className="text-[--red]">*</span>
          </label>
          <input
            id="password"
            type="password"
            className="rounded-full border border-[--light-gray] bg-transparent w-full px-5 py-2 mt-4 mb-4"
            onChange={(e) => {
              setnewPwS(e.target.value);
            }}
            value={newPwS}
            required
          />
          {/* <button
            type="button"
            onClick={changePassword}
            className="text-sm font-bold text-[--dark-green] flex justify-end mb-4 hover:underline"
          >
            Forgot Password?
          </button> */}
          <button
            type="submit"
            className="font-semibold text-sm w-full rounded-full bg-black text-[--light-brown] py-[10px] mt-4"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
