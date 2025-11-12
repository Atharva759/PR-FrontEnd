import { useState } from "react";
import { TbLogout } from "react-icons/tb";
import {
  MdAnalytics,
  MdPeople,
  MdPersonAdd,
  MdAdminPanelSettings,
  MdAssignment,
  MdLiveTv,
  MdMonitor,
  MdSettings,
  MdHelpOutline,
} from "react-icons/md";
import { Link } from "react-router-dom";
import ManageUsers from "../components/ManageUsers";
import FirebaseAnalytics from "../components/FirebaseAnalytics";
import Lock from "../components/Lock";
import Monitoring from "../components/Monitoring";
import Logs from "../components/Logs";
import ESP32Setup from "../components/ESP32Setup";

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState("analytics");

  const navs = [
    { name: "Analytics", icon: <MdAnalytics size={20} />, view: "analytics" },
    { name: "Manage Users", icon: <MdPeople size={20} />, view: "manage" },
    {
      name: "Admin Actions",
      icon: <MdAdminPanelSettings size={20} />,
      view: "adminActions",
    },
    {
      name: "ESP32 Configuration",
      icon: <MdSettings size={20} />,
      view: "config",
    },
    { name: "Logs", icon: <MdAssignment size={20} />, view: "logs" },
    { name: "Live Feed", icon: <MdLiveTv size={20} />, view: "liveFeed" },
    {
      name: "System Monitoring",
      icon: <MdMonitor size={20} />,
      view: "monitoring",
    },
    { name: "Help Support", icon: <MdHelpOutline size={20} />, view: "help" },
  ];

  return (
    <div className="min-h-screen bg-blue-200 flex p-8 gap-6">
      <div className="w-64 flex-shrink-0 flex flex-col gap-4">
        <div className="bg-blue-600 text-white p-6 font-bold text-xl rounded-xl shadow-md text-center">
          Admin Actions
        </div>

        <div className="flex flex-col gap-2 bg-blue-100 rounded-xl p-4 shadow-inner">
          {navs.map((item) => (
            <button
              key={item.view}
              onClick={() => setCurrentView(item.view)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all text-left font-medium hover:bg-blue-200 hover:shadow cursor-pointer ${
                currentView === item.view
                  ? "bg-blue-200 text-blue-700 shadow"
                  : "text-gray-700"
              }`}
            >
              {item.icon}
              <span>{item.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6">
        <div className="flex items-center justify-between bg-blue-600 text-white rounded-xl shadow-md p-5">
          <h2 className="font-bold text-3xl tracking-wide">Admin Dashboard</h2>
          <Link
            to="/"
            className="flex justify-center items-center gap-2 px-5 py-2 bg-blue-900 hover:bg-blue-800 transition-all rounded-lg font-medium shadow-md"
          >
            <TbLogout size={22} /> Logout
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 min-h-[550px]">
          {currentView === "analytics" && <FirebaseAnalytics />}
          {currentView === "manage" && <ManageUsers />}
          {currentView === "config" && <ESP32Setup />}
          {currentView === "adminActions" && <Lock />}

          {currentView === "logs" && <Logs />}
          {currentView === "liveFeed" && (
            <p className="text-gray-500 text-lg">Live feed </p>
          )}
          {currentView === "monitoring" && <Monitoring />}
          {currentView === "help" && (
            <p className="text-gray-500 text-lg">Help & support</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
