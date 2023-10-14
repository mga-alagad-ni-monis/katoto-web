import React from "react";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "./api/axios";
import io from "socket.io-client";

import RequiredAuth from "./components/RequiredAuth";
import PersistLogin from "./components/PersistLogin";
import useAuth from "./hooks/useAuth";

import Login from "./pages/Login";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Reports from "./pages/Reports";
import Train from "./pages/Train";
import UserAccounts from "./pages/UserAccounts";
import SideBar from "./components/SideBar";
import Loading from "./components/Loading";
import Chatbot from "./pages/Chatbot";
import Campaigns from "./pages/Campaigns";
import CampaignView from "./pages/CampaignView";
import Conversations from "./pages/Conversations";
import Appointments from "./pages/Appointments";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";

function App() {
  const { auth, setAuth } = useAuth();

  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    setSocket(io(process.env.REACT_APP_API_URI));
  }, []);

  useEffect(() => {
    if (auth?.accessToken !== undefined) {
      socket?.emit("newUser", auth?.accessToken);
    }
  }, [socket, email, auth]);

  const logout = async () => {
    socket?.emit("logout");
    setAuth({});
    try {
      await axios
        .get("/api/logout", { withCredentials: true })
        .then((res) => {
          toast.success(res?.data?.message);
        })
        .catch((err) => {
          toast.error(err?.response?.data);
        });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <BrowserRouter>
      {loading ? <Loading /> : null}
      <Routes>
        {/* login module*/}
        {/* <Route element={<NavBar />}> */}
        <Route element={<NavBar socket={socket} />}>
          <Route path="/" element={<Home />}></Route>
          <Route
            path="/login"
            element={
              <Login toast={toast} loading={loading} setLoading={setLoading} />
            }
          ></Route>
        </Route>
        <Route element={<NavBar socket={socket} />}>
          <Route
            path="/forgot/:resetToken"
            element={
              <ForgotPassword
                auth={auth}
                toast={toast}
                loading={loading}
                setLoading={setLoading}
              />
            }
          ></Route>
        </Route>
        {/* </Route> */}
        {/* <Route path="/loading" element={<Loading />}></Route> */}
        <Route element={<PersistLogin />}>
          {/* navbar component */}
          <Route
            element={
              <NavBar
                auth={auth}
                logout={logout}
                socket={socket}
                toast={toast}
              />
            }
          >
            {/* home/chatbot module*/}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={[
                    "student",
                    // "guidanceCounselor",
                    // "systemAdministrator",
                  ]}
                />
              }
            >
              <Route
                path="/chat"
                element={<Chatbot toast={toast} auth={auth} socket={socket} />}
              ></Route>
              <Route
                path="/view-campaigns"
                element={<CampaignView toast={toast} auth={auth} />}
              ></Route>
              {auth?.roles
                ? auth?.roles[0] === "student" && (
                    <Route
                      path="/profile"
                      element={
                        <Profile toast={toast} auth={auth} socket={socket} />
                      }
                    ></Route>
                  )
                : null}
            </Route>
          </Route>

          {/* sidebar component */}
          <Route
            element={
              <SideBar
                toast={toast}
                auth={auth}
                logout={logout}
                socket={socket}
              />
            }
          >
            {/*dashaboard module  */}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/dashboard"
                element={<Dashboard auth={auth} toast={toast} />}
              ></Route>
            </Route>
            {/* train module */}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/train"
                element={<Train auth={auth} toast={toast} socket={socket} />}
              ></Route>
            </Route>
            {/* appointments reports module*/}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/reports/appointments"
                element={
                  <Reports
                    key={"Appointment"}
                    auth={auth}
                    toast={toast}
                    title={"Appointment"}
                    filters={{
                      dateTime: true,
                      college: true,
                      department: true,
                      year: true,
                      section: true,
                      gender: true,
                    }}
                    tableCategories={{
                      date: true,
                      time: true,
                      idNo: true,
                      name: true,
                      email: true,
                      guidanceCounselor: true,
                      mode: true,
                      concernOverview: true,
                      type: true,
                      status: true,
                      notes: true,
                      phone: true,
                    }}
                  />
                }
              ></Route>
            </Route>
            {/* concerns reports module*/}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/reports/concerns"
                element={
                  <Reports
                    key={"Concern"}
                    auth={auth}
                    toast={toast}
                    title={"Concern"}
                    filters={{
                      dateTime: true,
                      college: true,
                      department: true,
                      year: true,
                      section: true,
                      gender: true,
                    }}
                    tableCategories={{
                      date: true,
                      time: true,
                      idNo: true,
                      name: true,
                      email: true,
                      age: true,
                      department: true,
                      gender: true,
                      yearSection: true,
                      concern: true,
                      phone: true,
                    }}
                  />
                }
              ></Route>
            </Route>
            {/* users reports module*/}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/reports/users"
                element={
                  <Reports
                    key={"Daily User"}
                    auth={auth}
                    toast={toast}
                    title={"Daily User"}
                    filters={{
                      dateTime: true,
                      college: true,
                      department: true,
                      year: true,
                      section: true,
                      gender: true,
                    }}
                    tableCategories={{
                      date: true,
                      time: true,
                      idNo: true,
                      name: true,
                      email: true,
                      age: true,
                      department: true,
                      gender: true,
                      yearSection: true,
                      type: true,
                      phone: true,
                    }}
                  />
                }
              ></Route>
            </Route>
            {/* feedback reports module*/}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/reports/feedbacks"
                element={
                  <Reports
                    key={"Feedback"}
                    auth={auth}
                    toast={toast}
                    title={"Feedback"}
                    filters={{
                      dateTime: true,
                      college: true,
                      department: true,
                      year: true,
                      section: true,
                      gender: true,
                    }}
                    tableCategories={{
                      date: true,
                      time: true,
                      idNo: true,
                      name: true,
                      email: true,
                      department: true,
                      yearSection: true,
                      rating: true,
                      feedback: true,
                    }}
                  />
                }
              ></Route>
            </Route>
            {/* train module */}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/train"
                element={<Train auth={auth} toast={toast} socket={socket} />}
              ></Route>
            </Route>
            {/* appointments module */}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/appointments"
                element={
                  <Appointments auth={auth} toast={toast} socket={socket} />
                }
              ></Route>
            </Route>
            {/* user-accounts module */}
            <Route
              element={<RequiredAuth allowedRoles={["systemAdministrator"]} />}
            >
              <Route
                path="/accounts"
                element={<UserAccounts toast={toast} auth={auth} />}
              ></Route>
            </Route>
            {/* conversation logs module */}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/logs"
                element={<Conversations toast={toast} auth={auth} />}
              ></Route>
            </Route>
            {/* campaigns module */}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/campaigns"
                element={<Campaigns toast={toast} auth={auth} />}
              ></Route>
            </Route>
            {/* profile module */}

            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/profile"
                element={<Profile toast={toast} auth={auth} socket={socket} />}
              ></Route>
            </Route>
          </Route>
        </Route>
      </Routes>
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        toastOptions={{
          style: {
            fontWeight: "600",
            textAlign: "center",
            border: "2px solid #000",
            backgroundColor: "#f5f3eb",
          },
        }}
      />
    </BrowserRouter>
  );
}

export default App;
