import React from "react";
import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import RequiredAuth from "./components/RequiredAuth";
import PersistLogin from "./components/PersistLogin";
import useAuth from "./hooks/useAuth";

import Login from "./pages/Login";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import UserAccounts from "./pages/UserAccounts";
import SideBar from "./components/SideBar";
import Loading from "./components/Loading";
import Chatbot from "./pages/Chatbot";
import Campaigns from "./pages/Campaigns";

function App() {
  const { auth } = useAuth();

  const [loading, setLoading] = useState(false);

  return (
    <BrowserRouter>
      {loading ? <Loading /> : null}

      <Routes>
        {/* login module*/}
        {/* <Route element={<NavBar />}> */}
        <Route
          path="/login"
          element={
            <Login toast={toast} loading={loading} setLoading={setLoading} />
          }
        ></Route>
        {/* </Route> */}
        {/* <Route path="/loading" element={<Loading />}></Route> */}

        <Route element={<PersistLogin />}>
          {/* navbar component */}
          <Route element={<NavBar />}>
            {/* home/chatbot module*/}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={[
                    "student",
                    "guidanceCounselor",
                    "systemAdministrator",
                  ]}
                />
              }
            >
              <Route path="/chat" element={<Chatbot />}></Route>
            </Route>
          </Route>

          {/* sidebar component */}
          <Route element={<SideBar toast={toast} auth={auth} />}>
            {/* reports module*/}
            <Route
              element={
                <RequiredAuth
                  allowedRoles={["guidanceCounselor", "systemAdministrator"]}
                />
              }
            >
              <Route
                path="/reports"
                element={<Reports toast={toast} />}
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
                element={<Campaigns toast={toast} />}
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
