import { BrowserRouter, Routes, Route } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

import RequiredAuth from "./components/RequiredAuth";
import PersistLogin from "./components/PersistLogin";

import Login from "./pages/Login";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Reports from "./pages/Reports";
import UserAccounts from "./pages/UserAccounts";

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        {/* login module*/}
        <Route path="/login" element={<Login toast={toast} />}></Route>

        {/* home/chatbot module*/}
        <Route element={<RequiredAuth allowedRoles={["student"]} />}>
          <Route path="/" element={<Home />}></Route>
        </Route>

        <Route element={<PersistLogin />}>
          {/* reports module*/}
          <Route
            element={
              <RequiredAuth
                allowedRoles={["guidanceCounselor", "systemAdministrator"]}
              />
            }
          >
            <Route path="/reports" element={<Reports toast={toast} />}></Route>
          </Route>
          {/* user-accounts module */}
          <Route
            element={<RequiredAuth allowedRoles={["systemAdministrator"]} />}
          >
            <Route
              path="/accounts"
              element={<UserAccounts toast={toast} />}
            ></Route>
          </Route>
        </Route>
      </Routes>
      <Toaster
        position="bottom-right"
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
