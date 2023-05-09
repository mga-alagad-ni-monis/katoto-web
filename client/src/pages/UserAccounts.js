import { BsUpload } from "react-icons/bs";
import { HiPlus } from "react-icons/hi";

import SideBar from "../components/SideBar";

function UserAccounts() {
  return (
    <div className="bg-[--light-brown] h-screen -mt-[7.5rem]">
      <SideBar />
      <div className="flex flex-col px-80">
        <p className="mt-44 flex w-full text-3xl font-extrabold mb-8">
          User Accounts
        </p>
        <div className="flex justify-between w-full items-center mb-8">
          <p className="font-bold">Students</p>
          <div className="flex gap-5">
            <button className="bg-black rounded-lg font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center">
              <HiPlus size={18} />
              Add
            </button>
            <button className="bg-black rounded-lg font-bold text-[--light-brown] py-2 pr-5 pl-4 flex gap-3 items-center justify-center">
              <BsUpload size={16} />
              Import
            </button>
          </div>
        </div>
        <table
          className="w-full h-full rounded-lg shadow-lg"
          style={{ backgroundColor: "rgba(169, 230, 194, 0.1)" }}
        >
          <thead className="">
            <div className="flex justify-between px-5 py-3 text-sm text-black/60 font-bold bg-[--light-green] rounded-lg m-1">
              <div>Student ID</div>
              <div>Name</div>
              <div>Email</div>
              <div>Password</div>
              <div>Gender</div>
              <div>Department/Course</div>
            </div>
          </thead>
          <tbody className="flex flex-col">
            <div className="flex justify-between font-bold px-5 py-3 m-1">
              <p>20-1127</p>
              <p>Alvin Panerio</p>
              <p>panerio.alvin18@gmail.com</p>
              <p>alvin123</p>
              <p>Male</p>
              <div>BSIT</div>
            </div>
            <div className="flex justify-between font-bold px-5 py-3 bg-[--light-green] m-1 rounded-lg">
              <p>20-1127</p>
              <p>Alvin Panerio</p>
              <p>panerio.alvin18@gmail.com</p>
              <p>alvin123</p>
              <p>Male</p>
              <div>BSIT</div>
            </div>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserAccounts;
