import axios from "../api/axios";
import useAuth from "../hooks/useAuth";

function Reports({ toast }) {
  const { setAuth } = useAuth();

  const logout = async () => {
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
    <div className="flex justify-center">
      <button onClick={logout} className="text-center">
        Logout
      </button>
    </div>
  );
}

export default Reports;
