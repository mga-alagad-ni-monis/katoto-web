import { useState, useEffect } from "react";
import { VscEdit, VscCheck, VscClose } from "react-icons/vsc";

import { toHeaderCase } from "js-convert-case";
import axios from "../api/axios";

import moment from "moment";

function Profile({ auth, toast }) {
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [yearSection, setYearSection] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [birthday, setBirthday] = useState("");
  const [department, setDepartment] = useState("");
  const [college, setCollege] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPwF, setnewPwF] = useState("");
  const [newPwS, setnewPwS] = useState("");

  const [isEdit, setIsEdit] = useState(false);
  const [isChangePw, setIsChangePw] = useState(false);

  useEffect(() => {
    setDetails();
  }, []);

  useEffect(() => {
    setDetails();
  }, [isEdit]);

  const setDetails = () => {
    setName(auth?.userInfo?.name);
    setYearSection(auth?.userInfo?.yearSection);
    setGender(auth?.userInfo?.gender);
    setBirthday(auth?.userInfo?.birthday);
    setContactNo(auth?.userInfo?.contactNo);
    setDepartment(auth?.userInfo?.department);
    setCollege(auth?.userInfo?.mainDepartment);
  };

  const editProfileDetails = async () => {
    try {
      await axios
        .post(
          "/api/accounts/edit-profile",
          {
            name,
            yearSection,
            gender,
            birthday,
            contactNo,
            department,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          setIsEdit(false);
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const changePassword = async () => {
    try {
      await axios
        .post(
          "/api/accounts/change-password",
          {
            currentPw,
            newPwF,
            newPwS,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          setIsChangePw(false);
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const convertDate = (date) => {
    const formattedDate = new Date(date);

    const convertedDateTime = formattedDate.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Singapore",
    });

    const convertedDate = formattedDate.toLocaleString("en-PH", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "Asia/Singapore",
    });

    const convertedTime = formattedDate.toLocaleString("en-PH", {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZone: "Asia/Singapore",
    });

    return [convertedDateTime, convertedDate, convertedTime];
  };

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

  let COED = [
    "Bachelor of Early Childhood Education (BECED)",
    "Bachelor of Secondary Education Major in English (BSED English)",
    "Bachelor of Secondary Education Major in Filipino (BSED Filipino)",
    "Bachelor of Secondary Education Major in Mathematics (BSED Mathematics)",
    "Bachelor of Secondary Education Major in Science (BSED Science)",
    "Bachelor of Secondary Education Major in Social Studies (BSED Social Studies)",
  ];

  let CAS = [
    "Bachelor of Arts in Communication (BAC)",
    "Bachelor of Science in Psychology (BSP)",
    "Bachelor of Science in Social Work (BSSW)",
  ];

  let CEIT = [
    "Bachelor of Science in Civil Engineering (BSCE)",
    "Bachelor of Science in Electrical Engineering (BSEE)",
    "Bachelor of Science in Information Technology (BSIT)",
  ];

  let CABA = [
    "Bachelor of Science in Accountancy (BSA)",
    "Bachelor of Science in Business Administration Major in Financial Management (BSBA FM)",
    "Bachelor of Science in Business Administration Major in Human Resource Development Management (BSBA HRDM)",
    "Bachelor of Science in Business Administration Major in Marketing Management (BSBA MM)",
    "Bachelor of Science in Public Administration (BSPA)",
  ];

  return (
    <div
      className={`${
        auth?.roles[0] === "student" ? "flex justify-center " : null
      } bg-[--light-brown] h-screen`}
    >
      <div className="flex flex-col px-52 w-full items-center ">
        {auth?.roles[0] === "student" ? null : (
          <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
            Profile
          </p>
        )}
        <div
          className={`${
            auth?.roles[0] === "student" ? "mt-32" : null
          } flex flex-col w-2/3 items-center sh p-12 rounded-2xl`}
        >
          <div className="flex justify-between w-full">
            {auth?.roles[0] === "student" ? (
              <p className="text-3xl font-extrabold mb-8">Profile</p>
            ) : null}

            {isEdit ? null : (
              <div
                className={`${
                  auth?.roles[0] === "student"
                    ? null
                    : "flex w-full justify-end"
                }`}
              >
                <button
                  className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                  onClick={() => {
                    setIsEdit(true);
                  }}
                >
                  <VscEdit size={14} />
                  Edit
                </button>
              </div>
            )}
          </div>
          <form
            className="w-full flex flex-col gap-8"
            onSubmit={editProfileDetails}
          >
            <div className="flex gap-5 w-full">
              <div className="w-1/2 flex flex-col gap-2">
                <label htmlFor="name" className="font-semibold">
                  Name
                </label>
                {isEdit ? (
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
                ) : (
                  <p>{name}</p>
                )}
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <label htmlFor="name" className="font-semibold">
                  Role
                </label>
                <p>
                  {toHeaderCase(auth?.userInfo?.credentials?.privilegeType)}
                </p>
              </div>
            </div>
            <div className="flex gap-5 w-full">
              <div className="w-1/2 flex flex-col gap-2">
                <label htmlFor="name" className="font-semibold">
                  Email
                </label>
                <p>{auth?.userInfo?.credentials?.email}</p>
              </div>
              {auth?.userInfo?.credentials?.privilegeType === "student" ? (
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="name" className="font-semibold">
                    Year and Section
                  </label>
                  {isEdit ? (
                    <input
                      id="year-sec"
                      className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                      type="tel"
                      placeholder="1-4"
                      pattern="[1-4]{1}[-]{1}[1-20]{1-2}"
                      value={yearSection}
                      onChange={(e) => {
                        setYearSection(e.target.value);
                      }}
                      required
                    />
                  ) : (
                    <p>{yearSection}</p>
                  )}
                </div>
              ) : null}
            </div>
            <div className="flex gap-5 w-full">
              <div className="w-1/2 flex flex-col gap-2">
                <label htmlFor="name" className="font-semibold">
                  Identification Number
                </label>
                <p>{auth?.userInfo?.idNo}</p>
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <label htmlFor="gender" className="font-semibold">
                  Gender
                </label>
                {isEdit ? (
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
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <p>{gender}</p>
                )}
              </div>
            </div>
            <div className="flex gap-5 w-full">
              <div className="w-1/2 flex flex-col gap-2">
                <label htmlFor="birthday" className="font-semibold">
                  Birthday
                </label>
                {isEdit ? (
                  <input
                    type="date"
                    id="birthday"
                    className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={birthday}
                    max={`${moment().year() - 18}-01-01`}
                    onChange={(e) => {
                      setBirthday(e.target.value);
                    }}
                    required
                  />
                ) : (
                  <p>{convertDate(birthday)[1]}</p>
                )}
              </div>
              <div className="w-1/2 flex flex-col gap-2">
                <label htmlFor="contact-no" className="font-semibold">
                  Contact Number
                </label>
                {isEdit ? (
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
                ) : (
                  <p>{contactNo}</p>
                )}
              </div>
            </div>
            {auth?.userInfo?.credentials?.privilegeType === "student" ? (
              <div className="flex gap-5 w-full">
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="department" className="font-semibold">
                    Department
                  </label>
                  {isEdit ? (
                    <select
                      id="department"
                      className="w-full bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                      value={department}
                      onChange={(e) => {
                        setDepartment(e.target.value);
                        if (COED.includes(e.target.value)) {
                          setCollege("College of Education");
                        } else if (CAS.includes(e.target.value)) {
                          setCollege("College of Arts and Sciences");
                        } else if (CEIT.includes(e.target.value)) {
                          setCollege(
                            "College of Engineering and Information Technology"
                          );
                        } else if (CABA.includes(e.target.value)) {
                          setCollege(
                            "College of Business Administration, Public Administration and Accountancy"
                          );
                        }
                      }}
                      required
                    >
                      <option
                        hidden
                        defaultValue
                        value=""
                        className="text-black/30"
                      ></option>
                      {courses?.map((i, k) => {
                        return (
                          <option value={i} key={k}>
                            {i}
                          </option>
                        );
                      })}
                    </select>
                  ) : (
                    <p>{department}</p>
                  )}
                </div>

                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="department" className="font-semibold">
                    College
                  </label>
                  <p>{college}</p>
                </div>
              </div>
            ) : null}
            {isEdit ? null : (
              <div className="flex gap-5 w-full">
                <div className="w-1/2 flex flex-col gap-2">
                  <label htmlFor="name" className="font-semibold">
                    Password
                  </label>
                  {isChangePw ? (
                    <div className="w-full flex gap-3 items-center">
                      <div className="w-2/3 flex flex-col gap-2">
                        <label htmlFor="name" className="font-semibold text-xs">
                          Current Password
                        </label>
                        <input
                          id="password"
                          className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                          type="password"
                          placeholder="Min of 8 characters..."
                          pattern=".{8}"
                          value={currentPw}
                          onChange={(e) => {
                            setCurrentPw(e.target.value);
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
                      <div className="w-2/3 flex flex-col gap-2">
                        <label htmlFor="name" className="font-semibold text-xs">
                          New Password
                        </label>
                        <input
                          id="password"
                          className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                          type="password"
                          placeholder="Min of 8 characters..."
                          pattern=".{8}"
                          value={newPwF}
                          onChange={(e) => {
                            setnewPwF(e.target.value);
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
                      <div className="w-2/3 flex flex-col gap-2">
                        <label htmlFor="name" className="font-semibold text-xs">
                          Confirm New Password
                        </label>
                        <input
                          id="password"
                          className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                          type="password"
                          placeholder="Min of 8 characters..."
                          pattern=".{8}"
                          value={newPwS}
                          onChange={(e) => {
                            setnewPwS(e.target.value);
                          }}
                          onInvalid={(e) =>
                            e.target.setCustomValidity(
                              "Please enter 8 characters or more!"
                            )
                          }
                          onInput={(e) => e.target.setCustomValidity("")}
                          required
                        />{" "}
                      </div>
                      <div>
                        <button
                          onClick={changePassword}
                          className="font-bold rounded-lg bg-[--dark-green] text-[--light-brown] p-1"
                          type="button"
                        >
                          <VscCheck size={22} />
                        </button>
                      </div>
                      <div>
                        <button
                          onClick={() => {
                            setIsChangePw(false);
                          }}
                          className="font-bold rounded-lg bg-[--red] text-[--light-brown] p-1"
                          type="button"
                        >
                          <VscClose size={22} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCurrentPw("");
                        setnewPwF("");
                        setnewPwS("");
                        setIsChangePw(true);
                      }}
                      type="button"
                      className="flex gap-1 items-center hover:underline font-bold text-[--dark-green]"
                    >
                      <VscEdit />
                      Change Password
                    </button>
                  )}
                </div>
              </div>
            )}
            {isEdit ? (
              <div className="flex gap-5 w-full justify-end">
                <button
                  className="bg-[--red] border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red]
                rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center 
                border border-2 transition-all duration-300"
                  type="button"
                  onClick={() => {
                    setIsEdit(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  className={
                    "hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] bg-[--dark-green] border-[--dark-green]  rounded-lg text-sm font-bold text-[--light-brown] py-2 px-3 flex gap-2 items-center justify-center border border-2 transition-all duration-300"
                  }
                  type="submit"
                >
                  Save Changes
                </button>
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;
