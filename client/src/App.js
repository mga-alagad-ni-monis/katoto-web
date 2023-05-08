import { BrowserRouter, Routes, Route } from "react-router-dom";

import RequiredAuth from "./components/RequiredAuth";
import useAuth from "./hooks/useAuth";

import Login from "./pages/Login";
import NavBar from "./components/NavBar";
import GuidanceCounselorHome from "./pages/GuidanceCounselorHome";
import StudentHome from "./pages/StudentHome";

function App() {
  const { auth } = useAuth();

  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/login" element={<Login />}></Route>
        {auth?.roles ? (
          auth?.roles[0] === "user" ? (
            <Route element={<RequiredAuth allowedRoles={["user"]} />}>
              <Route path="/" element={<StudentHome />}></Route>
            </Route>
          ) : (
            <Route
              element={<RequiredAuth allowedRoles={["guidanceCounselor"]} />}
            >
              <Route path="/" element={<GuidanceCounselorHome />}></Route>
            </Route>
          )
        ) : null}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
