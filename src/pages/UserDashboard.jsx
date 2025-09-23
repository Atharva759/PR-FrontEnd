import { TbLogout } from "react-icons/tb";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import Lock from "../components/Lock";

const UserDashboard = () => {
  const navigate = useNavigate();

  const logout = async () => {
    toast.promise(signOut(auth), {
      loading: "Logging out...",
      success: () => {
        navigate("/");
        return <p>Logged out successfully!</p>;
      },
      error: (err) => <b>Logout failed: {err.message}</b>,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 m-6 p-4 bg-blue-600 text-white rounded-xl shadow-md">
        <h2 className="font-bold text-2xl tracking-wide text-center sm:text-left">
          Smart Dashboard
        </h2>
        <Link
          onClick={logout}
          to="/"
          className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 transition-all rounded-md font-medium cursor-pointer shadow-md"
        >
          <TbLogout size={22} /> Logout
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 m-6">
        <Lock /> 
        
      </div>
    </div>
  );
};

export default UserDashboard;
