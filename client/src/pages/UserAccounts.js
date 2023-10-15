import axios from "../api/axios";
import { FileUploader } from "react-drag-drop-files";
import { motion } from "framer-motion";

import { useState, useEffect, useRef } from "react";
import {
  BsUpload,
  BsCloudUploadFill,
  BsFiletypeCsv,
  BsFillTrash3Fill,
} from "react-icons/bs";
import { HiPlus } from "react-icons/hi";
import { FaTimes } from "react-icons/fa";
import { FiChevronDown } from "react-icons/fi";
import { VscEdit } from "react-icons/vsc";
import { RiFileExcel2Line } from "react-icons/ri";

import Modal from "../components/Modal";
import Loading from "../components/Loading";

function UserAccounts({ toast, auth }) {
  const [users, setUsers] = useState([]);
  const [errorMessages, setErrorMessages] = useState([]);
  const [deleteUsers, setDeleteUsers] = useState([]);
  const [editUser, setEditUser] = useState([]);
  const [assignedCollegeLen, setAssignedCollegeLen] = useState([""]);
  const [assignedCollege, setAssignedCollege] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [idNo, setIdNo] = useState("");
  const [gender, setGender] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [birthday, setBirthday] = useState("");
  const [department, setDepartment] = useState("");
  const [userType, setUserType] = useState("");
  const [yearSection, setYearSection] = useState("");
  const [file, setFile] = useState("");
  const [filterCategory, setFilterCategory] = useState("Category");
  const [search, setSearch] = useState("");

  const [isAllChecked, setIsAllChecked] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenImportModal, setIsOpenImportModal] = useState(false);
  const [reload, setReload] = useState(false);
  const [isOpenSearchButton, setIsOpenSearchButton] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const inputRef = useRef(null);

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

  const colleges = [
    "College of Education",
    "College of Arts and Sciences",
    "College of Engineering and Information Technology",
    "College of Business Administration, Public Administration and Accountancy",
  ];

  const categories = ["Email", "Department/Course", "User Type"];

  useEffect(() => {
    setTimeout(async () => {
      await handleGetUsers();
      setIsLoading(false);
    }, 500);
  }, [reload]);

  const handleChecked = (
    param,
    email,
    isCheckedParam,
    name,
    userType,
    idNo,
    gender,
    yrSec,
    contactNo,
    birthday,
    department,
    assignedCollege
  ) => {
    setUsers(
      users.map((i, k) => {
        return param === k ? { ...i, isChecked: !i.isChecked } : i;
      })
    );

    if (!isCheckedParam) {
      setDeleteUsers([...deleteUsers, email]);
      setEditUser([
        ...editUser,
        {
          email,
          name,
          userType,
          idNo,
          gender,
          yrSec,
          contactNo,
          birthday,
          department,
          assignedCollege,
        },
      ]);
    } else {
      setDeleteUsers(deleteUsers.filter((i) => i !== email));
      setEditUser(editUser.filter((i) => i.email !== email));
      setEmail("");
      setName("");
      setUserType("");
      setIdNo("");
      setGender("");
      setYearSection("");
      setContactNo("");
      setBirthday("");
      setDepartment("");
    }
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

    if (!isAllChecked) {
      const emails = users.map((i) => i.credentials.email);
      setDeleteUsers(emails);
    } else {
      setDeleteUsers([]);
    }
  };

  const handleAllUnchecked = () => {
    setIsAllChecked(false);
    setEditUser([]);
    setUsers(
      users.map((i) => {
        return { ...i, isChecked: false };
      })
    );
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

  const handleGetUsers = async () => {
    try {
      await axios
        .get("/api/accounts/get", {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          const newUsers = res?.data?.users?.map((i) => {
            i["birthday"] = convertDate(i["birthday"])[1];
            return i;
          });
          setUsers(newUsers);
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
        .post(
          "/api/accounts/add",
          {
            name,
            email,
            password,
            idNo,
            gender,
            contactNo,
            birthday,
            department,
            userType,
            yearSection,
            assignedCollege,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
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
          setYearSection("");
          setIsOpenAddModal(false);
          setReload(!reload);
          setAssignedCollege([]);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios
        .post("/api/accounts/import", formData, {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${auth?.accessToken}`,
          },
        })
        .then((res) => {
          toast.success(res?.data?.message);
          setFile(null);
          setIsOpenImportModal(false);
          setErrorMessages([]);
          setReload(!reload);
        })
        .catch((err) => {
          if (err?.response?.data?.errorMessages.length) {
            setErrorMessages(err?.response?.data?.errorMessages);
          } else {
            toast.error(err?.response?.data);
          }
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleFileChangeDragDrop = (file) => {
    setFile(file);
  };

  const handleFileChange = (e) => {
    const fileObj = e.target.files && e.target.files[0];
    setFile(fileObj);
    if (!fileObj) {
      setFile(null);
      return;
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post(
          "/api/accounts/edit",
          {
            name,
            email,
            idNo,
            gender,
            contactNo,
            birthday,
            department,
            userType,
            yearSection,
            assignedCollege,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
          setDeleteUsers([]);
          setEditUser([]);
          setIsOpenEditModal(false);
          setReload(!reload);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const handleDeleteUsers = async () => {
    try {
      await axios
        .post(
          "/api/accounts/delete",
          { deleteUsers },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${auth?.accessToken}`,
            },
          }
        )
        .then((res) => {
          toast.success(res?.data?.message);
          setDeleteUsers([]);
          setIsAllChecked(false);
          setReload(!reload);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      toast.error("Error");
    }
  };

  const filteredUsers = () => {
    const newUsers = users?.filter((i) => {
      if (search?.toLowerCase().trim()) {
        return (
          i?.idNo.toLowerCase().includes(search.toLowerCase()) ||
          i?.name.toLowerCase().includes(search.toLowerCase()) ||
          i?.credentials?.email.toLowerCase().includes(search.toLowerCase()) ||
          i?.gender.toLowerCase().startsWith(search.toLowerCase()) ||
          i?.department.toLowerCase().includes(search.toLowerCase()) ||
          i?.yearSection.toLowerCase().includes(search.toLowerCase()) ||
          i?.contactNo.toLowerCase().includes(search.toLowerCase()) ||
          i?.birthday.toLowerCase().includes(search.toLowerCase()) ||
          i?.credentials?.privilegeType
            .toLowerCase()
            .includes(search.toLowerCase())
        );
      } else {
        return i;
      }
    });

    return newUsers;
  };
  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="bg-[--light-brown] h-screen">
          {isOpenAddModal || isOpenEditModal || isOpenImportModal ? (
            <motion.div
              className="bg-black/50 absolute w-screen h-screen z-40"
              variants={{
                show: {
                  opacity: 1,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                  },
                },
                hide: {
                  opacity: 0,
                  transition: {
                    type: "spring",
                    stiffness: 500,
                    damping: 40,
                  },
                },
              }}
              animate={
                isOpenAddModal || isOpenEditModal || isOpenImportModal
                  ? "show"
                  : "hide"
              }
              initial={{
                opacity: 0,
              }}
            ></motion.div>
          ) : null}
          <form
            className="w-full justify-between flex"
            onSubmit={handleSubmitAddUser}
          >
            <Modal isOpen={isOpenAddModal}>
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
                      pattern="{8}"
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
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-5 w-full">
                  {userType === "guidanceCounselor" ? null : (
                    <div className="w-1/3 flex flex-col gap-2">
                      <label htmlFor="year-sec" className="font-semibold">
                        Year and Section *
                      </label>
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
                      />
                    </div>
                  )}
                  <div className="w-1/3 flex flex-col gap-2">
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
                  <div className="w-1/3 flex flex-col gap-2">
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
                  {userType === "guidanceCounselor" ? null : (
                    <div className="w-full flex flex-col gap-2">
                      <label htmlFor="department" className="font-semibold">
                        Department *
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
                        {courses?.map((i, k) => {
                          return (
                            <option value={i} key={k}>
                              {i}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}
                </div>
                {userType === "guidanceCounselor" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <label htmlFor="department" className="font-semibold">
                        Assigned College
                      </label>
                      <div
                        className="flex gap-1 items-center w-auto p-1 text-sm rounded-lg text-[--dark-green]
          hover:underline transition-all duration-300 font-semibold cursor-pointer"
                        onClick={() => {
                          if (assignedCollegeLen.length < 2) {
                            if (
                              assignedCollege.length !==
                              assignedCollegeLen.length
                            ) {
                              toast.error("Assigned college!");
                              return;
                            }
                            setAssignedCollegeLen([...assignedCollegeLen, ""]);
                          } else {
                            toast.error("Limit of assigned college reached!");
                          }
                        }}
                      >
                        <HiPlus size={12} />
                        Add
                      </div>
                    </div>
                    {assignedCollegeLen.map((i, k) => {
                      return (
                        <div className="flex gap-2 w-full" key={k}>
                          <div className="w-full flex flex-col gap-2">
                            <select
                              id="department"
                              className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                              value={assignedCollege[k]}
                              onChange={(e) => {
                                let array = [...assignedCollege];
                                array[k] = e.target.value;
                                setAssignedCollege(array);
                              }}
                              required
                            >
                              <option
                                hidden
                                defaultValue
                                value=""
                                className="text-black/30"
                              ></option>
                              {colleges?.map((i, k) => {
                                return (
                                  <option value={i} key={k}>
                                    {i}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div className="flex gap-5">
                            <div
                              className="flex gap-1 items-center w-auto p-1 text-sm rounded-lg text-[--red]
          hover:underline transition-all duration-300 font-semibold cursor-pointer"
                              onClick={() => {
                                let newArray = assignedCollege;
                                newArray.splice(k, 1);
                                setAssignedCollege(newArray);
                                setAssignedCollegeLen(newArray);
                              }}
                            >
                              Delete
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
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
          <form
            className="w-full justify-between flex"
            onSubmit={handleEditUser}
          >
            <Modal isOpen={isOpenEditModal}>
              <div className="w-full justify-between flex">
                <p className="text-2xl font-extrabold">Edit User</p>
                <button
                  onClick={() => {
                    setIsOpenEditModal(false);
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
                      className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold opacity-50 text-black/50"
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
                      disabled
                    />
                  </div>
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
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-5 w-full">
                  {userType === "guidanceCounselor" ? null : (
                    <div className="w-1/2 flex flex-col gap-2">
                      <label htmlFor="year-sec" className="font-semibold">
                        Year and Section *
                      </label>
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
                      />
                    </div>
                  )}
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
                {userType === "guidanceCounselor" ? null : (
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
                        {courses?.map((i, k) => {
                          return (
                            <option value={i} key={k}>
                              {i}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                )}
                {userType === "guidanceCounselor" ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between">
                      <label htmlFor="department" className="font-semibold">
                        Assigned College
                      </label>
                      <div
                        className="flex gap-1 items-center w-auto p-1 text-sm rounded-lg text-[--dark-green]
          hover:underline transition-all duration-300 font-semibold cursor-pointer"
                        onClick={() => {
                          if (assignedCollegeLen.length < 2) {
                            if (
                              assignedCollege.length !==
                              assignedCollegeLen.length
                            ) {
                              toast.error("Assigned college!");
                              return;
                            }
                            setAssignedCollegeLen([...assignedCollegeLen, ""]);
                          } else {
                            toast.error("Limit of assigned college reached!");
                          }
                        }}
                      >
                        <HiPlus size={12} />
                        Add
                      </div>
                    </div>
                    {assignedCollegeLen.map((i, k) => {
                      return (
                        <div className="flex gap-5 w-full" key={k}>
                          <div className="w-full flex flex-col gap-2">
                            <select
                              id="department"
                              className="bg-black/10 rounded-lg h-[46px] p-3 text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                              value={assignedCollege[k]}
                              onChange={(e) => {
                                let array = [...assignedCollege];
                                array[k] = e.target.value;
                                setAssignedCollege(array);
                              }}
                              required
                            >
                              <option
                                hidden
                                defaultValue
                                value=""
                                className="text-black/30"
                              ></option>
                              {colleges?.map((j, l) => {
                                return (
                                  <option value={j} key={l}>
                                    {j}
                                  </option>
                                );
                              })}
                            </select>
                          </div>
                          <div className="flex gap-5">
                            <div
                              className="flex gap-1 items-center w-auto p-1 text-sm rounded-lg text-[--red]
          hover:underline transition-all duration-300 font-semibold cursor-pointer"
                              onClick={() => {
                                console.log(
                                  assignedCollege,
                                  assignedCollegeLen
                                );
                                let newArray = assignedCollege;
                                newArray.splice(k, 1);
                                setAssignedCollege(newArray);
                                setAssignedCollegeLen(newArray);
                              }}
                            >
                              Delete
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : null}
                <button
                  className="bg-[--dark-green] w-full p-3 text-[--light-brown] text-sm rounded-lg border border-2 border-[--dark-green] 
          hover:bg-transparent hover:text-[--dark-green] transition-all duration-300 font-semibold"
                  type="submit"
                >
                  Save
                </button>
              </div>
            </Modal>
          </form>

          <form className="w-full justify-between flex" onSubmit={handleImport}>
            <Modal isOpen={isOpenImportModal}>
              <div className="w-full justify-between flex">
                <p className="text-2xl font-extrabold">Import CSV</p>
                <button
                  onClick={() => {
                    setIsOpenImportModal(false);
                    setFile(null);
                    setErrorMessages([]);
                  }}
                  type="button"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              {file ? (
                <div className="mt-5 p-5 border border-2 border-[--light-gray] w-full rounded-xl h-max flex justify-between">
                  <div className="flex gap-5">
                    <div className="border border-1 border-[--light-gray] w-max h-max p-3 rounded-xl">
                      <BsFiletypeCsv size={24} />
                    </div>
                    <div>
                      <p className="font-semibold">{file.name}</p>
                      <div className="mt-5 max-h-[140px] overflow-auto">
                        {errorMessages.map((i, k) => {
                          return (
                            <p
                              className="text-sm text-[--red] font-semibold"
                              key={k}
                            >
                              {i}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setFile(null);
                        setErrorMessages([]);
                      }}
                      type="button"
                    >
                      <BsFillTrash3Fill size={20} className="text-red-500" />
                    </button>
                  </div>
                </div>
              ) : (
                <FileUploader
                  handleChange={handleFileChangeDragDrop}
                  name="file"
                  types={["CSV"]}
                >
                  <div className="mt-5 border border-4 border-[--dark-green] rounded-xl border-dashed w-full h-max p-8">
                    <div className="flex flex-col gap-1 items-center font-semibold">
                      <BsCloudUploadFill
                        size={32}
                        className="text-[--dark-green]"
                      />
                      <p> Drag and Drop CSV File</p>
                      <p className="text-[--dark-green]">― OR ―</p>
                      <p>1. Click the "Attach File" button.</p>
                      <p>2. Locate the CSV file in your computer.</p>
                      <p>3. Click the "Import" button.</p>
                      <p>4. Wait for the successful/error confirmation.</p>
                    </div>
                  </div>
                </FileUploader>
              )}
              <div className="w-full flex gap-3 mt-10">
                <input
                  style={{ display: "none" }}
                  ref={inputRef}
                  type="file"
                  onChange={handleFileChange}
                />
                <button
                  className="w-1/2 bg-black w-full p-3 text-[--light-brown] text-sm rounded-lg border border-2 border-black
          hover:bg-transparent hover:text-black transition-all duration-300 font-semibold"
                  onClick={() => {
                    inputRef.current.click();
                  }}
                  type="button"
                >
                  Attach File
                </button>
                <button
                  className="w-1/2 bg-[--dark-green] w-full p-3 text-[--light-brown] text-sm rounded-lg border border-2 border-[--dark-green] 
          hover:bg-transparent hover:text-[--dark-green] transition-all duration-300 font-semibold"
                  type="submit"
                >
                  Import
                </button>
              </div>
            </Modal>
          </form>
          <div className="flex flex-col px-52">
            <p className="mt-16 flex w-full text-3xl font-extrabold mb-8">
              User Accounts
            </p>
            <div className="flex justify-between w-full mb-5">
              <div className="flex gap-5 items-end">
                <div>
                  <p className="mb-3 font-bold text-xs">
                    What are you looking for?
                  </p>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="py-2 px-5 bg-black/10 rounded-lg text-sm focus:outline-black/50 placeholder-black/30 font-semibold"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                </div>
                <div>
                  {/* <p className="mb-3 font-bold text-xs">
                    Spreadsheet template for bulk imports
                  </p> */}
                  <button
                    className="h-fit bg-[--dark-green] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--dark-green] hover:border-[--dark-green] hover:border-2 hover:bg-transparent hover:text-[--dark-green] transition-all duration-300"
                    onClick={() => {
                      window.open("/UserAccountTemplate.xlsx");
                    }}
                  >
                    <RiFileExcel2Line size={16} />
                    Download Template
                  </button>
                </div>
              </div>
              <div className="flex gap-5 items-end">
                {deleteUsers.length ? (
                  <button
                    className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] hover:border-[--red] hover:border-2 hover:bg-transparent hover:text-[--red] transition-all duration-300"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Do you want to proceed deleting the user account?"
                        )
                      ) {
                        handleDeleteUsers();
                      }
                    }}
                  >
                    <BsFillTrash3Fill size={14} />
                    Delete
                  </button>
                ) : (
                  <button
                    className="bg-[--red] rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-[--red] transition-all duration-300 opacity-50"
                    disabled
                  >
                    <BsFillTrash3Fill size={14} />
                    Delete
                  </button>
                )}
                {editUser.length === 1 ? (
                  <button
                    className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                    onClick={() => {
                      if (editUser.length === 1) {
                        setEmail(editUser[0].email);
                        setName(editUser[0].name);
                        setUserType(editUser[0].userType);
                        setIdNo(editUser[0].idNo);
                        setGender(editUser[0].gender);
                        setYearSection(editUser[0].yrSec);
                        setContactNo(editUser[0].contactNo);
                        setBirthday(editUser[0].birthday);
                        setDepartment(editUser[0].department);
                        setAssignedCollege(editUser[0]?.assignedCollege);
                        setAssignedCollegeLen(editUser[0]?.assignedCollege);
                      }
                      setIsOpenEditModal(true);
                    }}
                  >
                    <VscEdit size={14} />
                    Edit
                  </button>
                ) : (
                  <button
                    className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black transition-all duration-300 opacity-50"
                    disabled
                  >
                    <VscEdit size={14} />
                    Edit
                  </button>
                )}
                <button
                  className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-3 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                  onClick={() => {
                    setIsOpenAddModal(true);
                    handleAllUnchecked();
                    setEmail("");
                    setName("");
                    setUserType("");
                    setIdNo("");
                    setGender("");
                    setYearSection("");
                    setContactNo("");
                    setBirthday("");
                    setDepartment("");
                    setAssignedCollege([]);
                    setAssignedCollegeLen([""]);
                  }}
                >
                  <HiPlus size={16} />
                  Add
                </button>

                <button
                  className="bg-black rounded-lg text-sm font-bold text-[--light-brown] py-2 pr-5 pl-4 flex gap-2 items-center justify-center 
          border border-2 border-black hover:border-black hover:border-2 hover:bg-transparent hover:text-black transition-all duration-300"
                  onClick={() => {
                    setIsOpenImportModal(true);
                  }}
                >
                  <BsUpload size={14} />
                  Import
                </button>
              </div>
            </div>
            <table
              className="w-full rounded-lg shadow-lg bg-[--light-green] relative"
              style={{ backgroundColor: "rgba(169, 230, 194, 0.2)" }}
            >
              <thead className="flex px-5 py-3 text-sm text-[--light-brown] font-bold bg-[--dark-green] rounded-lg m-1">
                <tr>
                  <td className="flex gap-5 items-center">
                    <input
                      id="checkbox-1"
                      className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 
   checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
   float-left cursor-pointer appearance-none border border-solid border-2  border-[--light-gray] checked:border-[--light-gray] checked:border-2 bg-[--light-gray] 
   bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
   after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['✔'] 
   checked:bg-[--dark-green] checked:after:opacity-100"
                      type="checkbox"
                      style={{
                        fontFamily: "FontAwesome",
                      }}
                      checked={isAllChecked ? true : false}
                      onChange={handleAllChecked}
                    />
                    <p className="w-[80px] mr-5 flex justify-start truncate text-ellipsis">
                      ID No
                    </p>
                  </td>
                </tr>
                <tr>
                  <td className="w-[180px] mr-5 flex justify-start truncate text-ellipsis">
                    Name
                  </td>
                </tr>
                <tr>
                  <td className="w-[230px] mr-5 flex justify-start truncate text-ellipsis">
                    Email
                  </td>
                </tr>
                <tr>
                  <td className="w-[70px] mr-5 flex justify-start truncate text-ellipsis">
                    Gender
                  </td>
                </tr>
                <tr>
                  <td className="w-[295px] mr-5 flex justify-start truncate text-ellipsis">
                    Department/Course
                  </td>
                </tr>
                <tr>
                  <td className="w-[80px] ml-3 flex justify-start truncate text-ellipsis">
                    Yr/Sec
                  </td>
                </tr>
                <tr>
                  <td className="w-[110px] mr-5 flex justify-start truncate text-ellipsis">
                    Contact No
                  </td>
                </tr>
                <tr>
                  <td className="w-[85px] mr-5 flex justify-start truncate text-ellipsis">
                    Birthday
                  </td>
                </tr>
                <tr>
                  <td className="w-[100px] mr-5 flex justify-start truncate text-ellipsis">
                    User Type
                  </td>
                </tr>
              </thead>
              <tbody className="flex flex-col max-h-[624px] overflow-y-auto">
                {filteredUsers()?.length === 0 ? (
                  <p className="font-bold flex justify-center items-center min-h-[624px]">
                    No users...
                  </p>
                ) : null}
                {filteredUsers()?.map((i, k) => {
                  return (
                    <tr key={k}>
                      <td
                        className={`flex font-medium mx-1 px-5 mb-1 py-3 text-sm ${
                          k % 2 ? "bg-[--light-green] rounded-lg" : null
                        } ${
                          i.isChecked
                            ? "relative bg-[--light-green] rounded-lg"
                            : null
                        }`}
                        onClick={() => {
                          handleChecked(
                            k,
                            i?.credentials?.email,
                            i.isChecked,
                            i?.name,
                            i?.credentials?.privilegeType,
                            i?.idNo,
                            i?.gender,
                            i?.yearSection,
                            i?.contactNo,
                            i?.birthday,
                            i?.department,
                            i?.assignedCollege
                          );
                        }}
                      >
                        {i.isChecked ? (
                          <div className="absolute w-[8px] h-full bg-[--dark-green] left-0 top-0 rounded-tl-lg rounded-bl-lg"></div>
                        ) : null}
                        <div className="flex gap-5 items-center ">
                          <input
                            id="checkbox-1"
                            className="text-[--light-brown] w-5 h-5 ease-soft text-xs rounded-lg checked:bg-[--dark-green] checked:from-gray-900 
   checked:to-slate-800 after:text-xxs after:font-awesome after:duration-250 after:ease-soft-in-out duration-250 relative 
   float-left cursor-pointer appearance-none border border-solid border-2  border-[--dark-green] bg-[--light-green] 
   bg-contain bg-center bg-no-repeat align-top transition-all after:absolute after:flex after:h-full after:w-full 
   after:items-center after:justify-center after:text-white after:opacity-0 after:transition-all after:content-['✔'] 
   checked:border-0 checked:border-transparent checked:bg-[--dark-green] checked:after:opacity-100 mr-1"
                            type="checkbox"
                            style={{
                              fontFamily: "FontAwesome",
                            }}
                            onChange={() => {
                              handleChecked(
                                k,
                                i?.credentials?.email,
                                i.isChecked,
                                i?.name,
                                i?.credentials?.privilegeType,
                                i?.idNo,
                                i?.gender,
                                i?.yearSection,
                                i?.contactNo,
                                i?.birthday,
                                i?.department,
                                i?.assignedCollege
                              );
                            }}
                            checked={i.isChecked ? true : false}
                          />
                          <p className="w-[80px] mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                            <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white">
                              {i?.idNo}
                            </div>
                            {i?.idNo}
                          </p>
                        </div>
                        <p className="w-[180px] mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                          <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                            {i?.name}
                          </div>
                          {i?.name}
                        </p>
                        <p className="w-[230px] mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                          <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                            {i?.credentials?.email}
                          </div>
                          {i?.credentials?.email}
                        </p>
                        <p className="w-[70px] mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                          <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                            {i?.gender}
                          </div>
                          {i?.gender}
                        </p>
                        <p className="w-[295px] mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                          <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                            {i?.department}
                          </div>
                          {i?.department}
                        </p>
                        <p className="w-[80px] ml-3 flex justify-start truncate text-ellipsis tooltip-div">
                          {i?.yearSection ? (
                            <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                              {i?.yearSection}
                            </div>
                          ) : null}
                          {i?.yearSection}
                        </p>
                        <p className="w-[110px] mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                          <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                            {i?.contactNo}
                          </div>
                          {i?.contactNo}
                        </p>
                        <p className="w-[85px] mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                          <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                            {i?.birthday}
                          </div>
                          {i?.birthday}
                        </p>
                        <p className="w-[100px] mr-5 flex justify-start truncate text-ellipsis tooltip-div">
                          <div className="tooltip -mt-[40px] p-[10px] absolute bg-black rounded-lg text-white text-xs">
                            {i?.credentials?.privilegeType === "student"
                              ? "Student"
                              : i?.credentials?.privilegeType ===
                                "systemAdministrator"
                              ? "System Administrator"
                              : "Guidance Counselor"}
                          </div>
                          {i?.credentials?.privilegeType === "student"
                            ? "Student"
                            : i?.credentials?.privilegeType ===
                              "systemAdministrator"
                            ? "System Administrator"
                            : "Guidance Counselor"}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default UserAccounts;
