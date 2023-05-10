import axios from "../api/axios";

import { useState, useEffect } from "react";
import { BsUpload } from "react-icons/bs";
import { HiPlus } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";

import SideBar from "../components/SideBar";
import Modal from "../components/Modal";

function UserAccounts({ toast }) {
  const [users, setUsers] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idNo, setIdNo] = useState("");
  const [gender, setGender] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [birthday, setBirthday] = useState("");
  const [department, setDepartment] = useState("");
  const [userType, setUserType] = useState("");

  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);

  const courses = [
    "Bachelor of Early Childhood Education (BECED)",
    "Bachelor of Secondary Education Major in English (BSED English)",
    "Bachelor of Secondary Education Major in Filipino (BSED Filipino)",
    "Bachelor of Secondary Education Major in Mathematics (BSED Mathematics)",
    "Bachelor of Secondary Education Major in Science (BSED Science)",
    "Bachelor of Secondary Education Major in Social Studies (BSED Social Studies)",
    "Bachelor of Science in Civil Engineering (BSCE)",
    "Bachelor of Science in Electrical Engineering (BSEE)",
    "Bachelor of Science in Information Technology (BSIT)",
    "Bachelor of Arts in Communication (BAC)",
    "Bachelor of Science in Psychology (BSP)",
    "Bachelor of Science in Social Work (BSSW)",
    "Bachelor of Science in Accountancy (BSA)",
    "Bachelor of Science in Business Administration Major in Financial Management (BSBA FM)",
    "Bachelor of Science in Business Administration Major in Human Resource Development Management (BSBA HRDM)",
    "Bachelor of Science in Business Administration Major in Marketing Management (BSBA MM)",
    "Bachelor of Science in Public Administration (BSPA)",
  ];

  useEffect(() => {
    handleGetUsers();
  }, []);

  const handleChecked = (param) => {
    setUsers(
      users.map((i, k) => {
        return param === k ? { ...i, isChecked: !i.isChecked } : i;
      })
    );
  };

  const handleAllChecked = () => {
    setUsers(
      users.map((i) => {
        if (!isAllChecked) {
          setIsAllChecked(true);
          return { ...i, isChecked: true };
        } else {
          setIsAllChecked(false);
          return { ...i, isChecked: false };
        }
      })
    );
  };

  const handleGetUsers = async () => {
    try {
      await axios
        .get("/api/accounts/get")
        .then((res) => {
          setUsers(res?.data?.users);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleSubmitAddUser = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post("/api/accounts/add", {
          name,
          email,
          password,
          idNo,
          gender,
          contactNo,
          birthday,
          department,
          userType,
        })
        .then((res) => {
          toast.success(res?.data?.message);
          setName("");
          setEmail("");
          setPassword("");
          setIdNo("");
          setGender("");
          setContactNo("");
          setBirthday("");
          setDepartment("");
          setUserType("");
          setIsOpenAddModal(false);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  return (
    <div className="bg-[--light-brown] h-screen">
      {isOpenAddModal ? (
        <form
          className="w-full justify-between flex"
          onSubmit={handleSubmitAddUser}
        >
          <Modal>
            <div className="w-full justify-between flex">
              <p className="text-2xl font-extrabold">Add User</p>
              <button
                onClick={() => {
                  setIsOpenAddModal(false);
                }}
                type="button"
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-4 mt-5">
              <div className="flex gap-5 w-full">
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="name" className="font-semibold">
                    Name *
                  </label>
                  <input
                    id="name"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold mr-3"
                    type="text"
                    placeholder="Firstname Surname"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="usertype" className="font-semibold">
                    User Type *
                  </label>
                  <select
                    id="usertype"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={userType}
                    onChange={(e) => {
                      setUserType(e.target.value);
                    }}
                    required
                  >
                    <option
                      hidden
                      value=""
                      defaultValue
                      className="text-black/30"
                    ></option>
                    <option value="student">Student</option>
                    <option value="guidanceCounselor">
                      Guidance Counselor
                    </option>
                  </select>
                </div>
              </div>
              <div className="flex gap-5 w-full">
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="email" className="font-semibold">
                    Email *
                  </label>
                  <input
                    id="idNo"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    type="email"
                    placeholder="namesurname@plv.edu.ph"
                    pattern="[\w.%+-]+@plv\.edu\.ph"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                    }}
                    onInvalid={(e) =>
                      e.target.setCustomValidity(
                        "Please enter required domain: namesurname@plv.edu.ph"
                      )
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    required
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="password" className="font-semibold">
                    Password *
                  </label>
                  <input
                    id="password"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    type="password"
                    placeholder="mmddyyyy or other"
                    pattern=".{8}"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    onInvalid={(e) =>
                      e.target.setCustomValidity(
                        "Please enter 8 characters or more!"
                      )
                    }
                    onInput={(e) => e.target.setCustomValidity("")}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-5 w-full">
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="id-no" className="font-semibold">
                    Identification Number *
                  </label>
                  <input
                    id="id-no"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    type="text"
                    placeholder="xx-xxxx"
                    value={idNo}
                    onChange={(e) => {
                      setIdNo(e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="gender" className="font-semibold">
                    Gender *
                  </label>
                  <select
                    id="gender"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={gender}
                    onChange={(e) => {
                      setGender(e.target.value);
                    }}
                    required
                  >
                    <option
                      hidden
                      value=""
                      defaultValue
                      className="text-black/30"
                    ></option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-5 w-full">
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="contact-no" className="font-semibold">
                    Contact Number *
                  </label>
                  <input
                    id="contact-no"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    type="tel"
                    placeholder="09xxxxxxxxx"
                    pattern="[0]{1}[9]{1}[0-9]{9}"
                    value={contactNo}
                    onChange={(e) => {
                      setContactNo(e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="birthday" className="font-semibold">
                    Birthday *
                  </label>
                  <input
                    type="date"
                    id="birthday"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={birthday}
                    onChange={(e) => {
                      setBirthday(e.target.value);
                    }}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-5 w-full">
                <div className="w-full flex flex-col gap-2">
                  <label htmlFor="department" className="font-semibold">
                    Department/Courses *
                  </label>
                  <select
                    id="department"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                    }}
                    required
                  >
                    <option
                      hidden
                      defaultValue
                      value=""
                      className="text-black/30"
                    ></option>
                    {courses?.map((i) => {
                      return <option value={i}>{i}</option>;
                    })}
                  </select>
                </div>
              </div>
              <button
                className="bg-[--dark-green] w-full p-3 text-[--light-brown] text-sm rounded-lg border border-2 border-[--dark-green] 
            hover:bg-transparent hover:text-[--dark-green] transition-all duration-300 font-semibold"
                type="submit"
              >
                Submit
              </button>
            </div>
          </Modal>
        </form>
      ) : null}
      <SideBar />
      <div className="flex flex-col px-80">
        <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
          User Accounts
        </p>
        <div className="flex justify-end w-full items-center mb-5">
          <div className="flex gap-5">
            <button
              className="bg-black rounded-full text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
            border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
              onClick={() => {
                setIsOpenAddModal(true);
              }}
            >
              <HiPlus size={18} />
              Add
            </button>
            <button
              className="bg-black rounded-full text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
            border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
            >
              <BsUpload size={16} />
              Import
            </button>
          </div>
        </div>
        <table
          className="w-full h-full rounded-lg shadow-lg bg-[--light-green]"
          style={{ backgroundColor: "rgba(169, 230, 194, 0.2)" }}
        >
          <thead>
            <div className="flex justify-between px-5 py-3 text-sm text-[--light-brown] font-bold bg-[--dark-green] rounded-lg m-1">
              <div className="flex gap-5 items-center">
                <input
                  id="checkbox-1"
                  class="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 
     checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
     float-left cursor-pointer appearance-none border border-solid border-2  border-[--light-gray] bg-[--light-gray] 
     bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
     after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-[''] 
     checked:border-0 checked:border-transparent checked:bg-[--dark-green] checked:after:opacity-100"
                  type="checkbox"
                  style={{
                    fontFamily: "FontAwesome",
                  }}
                  onChange={handleAllChecked}
                />
                <div>Student ID</div>
              </div>
              <div>Name</div>
              <div>Email</div>
              <div>Password</div>
              <div>Gender</div>
              <div>Department/Course</div>
              <div>Contact Number</div>
              <div>Birthday</div>
              <div>User Type</div>
            </div>
          </thead>
          <tbody className="flex flex-col">
            {users?.map((i, k) => {
              return (
                <button
                  className={`flex justify-between font-medium mx-1 px-5 mb-1 py-3 text-sm ${
                    k % 2 ? "bg-[--light-green] rounded-lg" : null
                  } ${
                    i.isChecked
                      ? "relative bg-[--light-green] rounded-lg"
                      : null
                  }`}
                  key={k}
                  onClick={() => {
                    handleChecked(k);
                  }}
                >
                  {i.isChecked ? (
                    <div className="absolute w-[8px] h-full bg-[--dark-green] left-0 top-0 rounded-tl-lg rounded-bl-lg"></div>
                  ) : null}
                  <div className="flex gap-5 items-center">
                    <input
                      id="checkbox-1"
                      class="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 
     checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
     float-left cursor-pointer appearance-none border border-solid border-2  border-[--dark-green] bg-[--light-green] 
     bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
     after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-[''] 
     checked:border-0 checked:border-transparent checked:bg-[--dark-green] checked:after:opacity-100"
                      type="checkbox"
                      style={{
                        fontFamily: "FontAwesome",
                      }}
                      onChange={() => {
                        handleChecked(k);
                      }}
                      checked={i.isChecked ? true : false}
                    />
                    <p>{i?.id}</p>
                  </div>
                  <p>{i?.name}</p>
                  <p>{i?.email}</p>
                  <p>{i?.password}</p>
                  <p>{i?.gender}</p>
                  <div>{i?.department}</div>
                  <div>{i?.contactNumber}</div>
                  <div>{i?.userType}</div>
                </button>
              );
            })}

            {/* <div className="flex justify-between font-medium px-5 py-2 m-1 text-sm">
              <div className="flex gap-5 items-center">
                <input
                  id="checkbox-1"
                  class="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 
                  checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
                  float-left cursor-pointer appearance-none border border-solid border-2  border-[--dark-green] bg-[--light-green] 
                  bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
                  after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-[''] 
                  checked:border-0 checked:border-transparent checked:bg-[--dark-green] checked:after:opacity-100"
                  type="checkbox"
                  style={{
                    fontFamily: "FontAwesome",
                  }}
                />
                <p>20-1127</p>
              </div>
              <p>Alvin Panerio</p>
              <p>panerio.alvin18@gmail.com</p>
              <p>alvin123</p>
              <p>Male</p>
              <div>BSIT</div>
            </div> */}
            {/* <div className="flex justify-between font-medium px-5 py-3 bg-[--light-green] text-sm m-1 rounded-lg">
              <p>20-1127</p>
              <p>Alvin Panerio</p>
              <p>panerio.alvin18@gmail.com</p>
              <p>alvin123</p>
              <p>Male</p>
              <div>BSIT</div>
            </div> */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserAccounts;