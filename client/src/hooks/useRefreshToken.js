import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    await axios
      .get("/api/refresh", {
        withCredentials: true,
      })
      .then((res) => {
        // console.log(res);
        setAuth((prev) => {
          const roles = [res?.data?.role];
          return {
            ...prev,
            roles,
            accessToken: res?.data?.accessToken,
            userInfo: res?.data?.userInfo,
          };
        });
        setTimeout(() => {
          return res?.data?.accessToken;
        }, 100);
      });
  };
  return refresh;
};

export default useRefreshToken;
