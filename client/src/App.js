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

function App() {
  const { auth } = useAuth();

  const [loading, setLoading] = useState(false);

  return (
    <BrowserRouter>
      {loading ? <Loading /> : null}
      <NavBar />
      <Routes>
        {/* login module*/}
        <Route
          path="/login"
          element={
            <Login toast={toast} loading={loading} setLoading={setLoading} />
          }
        ></Route>
        {/* <Route path="/loading" element={<Loading />}></Route> */}

        <Route element={<PersistLogin />}>
          {/* home/chatbot module*/}
          <Route element={<RequiredAuth allowedRoles={["student"]} />}>
            <Route path="/" element={<Home />}></Route>
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
