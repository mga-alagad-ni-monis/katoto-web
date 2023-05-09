import useLogout from "../hooks/useLogout";

function Home() {
  const logout = useLogout();

  return (
    <div>
      <button onClick={logout}>Logout </button>
    </div>
  );
}

export default Home;
