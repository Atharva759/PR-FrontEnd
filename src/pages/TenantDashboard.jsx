import { useState } from "react";
import { TbLogout } from "react-icons/tb";
import { FaUsers, FaMicrochip, FaPlus, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [macId, setMacId] = useState("");

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

  const handleAddDevice = (e) => {
    e.preventDefault();
    setShowModal(false);
    setDeviceName("");
    setMacId("");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-green-50">

      {/*  Sidebar */}
      <div className="m-4 w-64 bg-gradient-to-b from-blue-600 to-green-500 text-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between">

        <div>
          <div className="flex items-center gap-3 mb-10">
            <img className="w-10 h-10 bg-white rounded-xl p-1" src={logo} alt="logo" />
            <h2 className="text-xl font-bold tracking-wide">
              Enerlytics Cloud
            </h2>
          </div>

          <nav className="flex flex-col gap-4">
            <Link
              to="/manage-users"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/20 transition-all duration-300 hover:translate-x-2"
            >
              <FaUsers /> Manage Tenant Users
            </Link>

            <Link
              to="/manage-devices"
              className="flex items-center gap-3 p-3 rounded-lg bg-white/20"
            >
              <FaMicrochip /> Manage Devices
            </Link>
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 p-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition shadow-md cursor-pointer"
        >
          <TbLogout size={20} /> Logout
        </button>
      </div>

      {/*  Main Content  */}
      <div className="flex-1 p-8 m-4 bg-gradient-to-b from-blue-600 to-green-500 text-white rounded-2xl shadow-2xl">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Tenant Dashboard
          </h1>
          <p className=" mt-1">
            Manage your registered devices and tenant users.
          </p>
        </div>

        {/*  Registered Devices  */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex-1 flex flex-col h-[620px] overflow-auto">

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-semibold text-gray-800">
              Registered Devices
            </h2>

            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-full shadow-md hover:scale-105 transition cursor-pointer"
            >
              <FaPlus /> Add New Device
            </button>
          </div>

          {/* Devices Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Device Card */}
            <div className="bg-white p-5 rounded-xl border border-blue-100 hover:shadow-lg transition flex items-start gap-4">

              <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-lg">
                <FaMicrochip className="text-blue-600 text-xl" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  DEV-001
                </h3>
                <p className="text-sm mt-1">
                  Status: <span className="text-green-600 font-medium">Active</span>
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Last Updated: 2 hours ago
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-green-100 hover:shadow-lg transition flex items-start gap-4">

              <div className="w-12 h-12 flex items-center justify-center bg-green-50 rounded-lg">
                <FaMicrochip className="text-green-600 text-xl" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  DEV-002
                </h3>
                <p className="text-sm mt-1">
                  Status: <span className="text-red-500 font-medium">Offline</span>
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Last Updated: 1 day ago
                </p>
              </div>
            </div>

            
          </div>
        </div>
      </div>

      {/*  Modal  */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative">

            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500 cursor-pointer"
            >
              <FaTimes />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Add New Device
            </h2>

            <form onSubmit={handleAddDevice} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Device Name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                required
              />

              <input
                type="text"
                placeholder="MAC ID"
                value={macId}
                onChange={(e) => setMacId(e.target.value)}
                className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                required
              />

              <button
                type="submit"
                className="mt-2 p-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg font-semibold hover:scale-105 transition cursor-pointer"
              >
                Add Device
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;