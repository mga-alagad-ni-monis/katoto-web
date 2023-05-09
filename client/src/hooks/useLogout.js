import axios from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
  const { setAuth } = useAuth();

  const logout = async () => {
    setAuth({});
    try {
      await axios
        .get("/api/logout", { withCredentials: true })
        .then((res) => {
          console.log("sadasd");
        })
        .catch((err) => {
          console.log("asdadasd");
        });
    } catch (err) {
      console.log(err);
    }
  };

  return logout;
};

export default useLogout;
