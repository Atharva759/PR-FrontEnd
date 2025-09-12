import { useState } from "react";
import { TbLogout } from "react-icons/tb";
import { MdMenuOpen, MdClose } from "react-icons/md";
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

const AdminDashboard = () => {
  const [open, setOpen] = useState(false);
  const navs = [
    { name: "Analytics", icon: <MdAnalytics size={20} /> },
    { name: "Manage Users", icon: <MdPeople size={20} /> },
    { name: "Add Users", icon: <MdPersonAdd size={20} /> },
    { name: "Admin Actions", icon: <MdAdminPanelSettings size={20} /> },
    { name: "Logs", icon: <MdAssignment size={20} /> },
    { name: "Live Feed", icon: <MdLiveTv size={20} /> },
    { name: "System Monitoring", icon: <MdMonitor size={20} /> },
    { name: "Configuration", icon: <MdSettings size={20} /> },
    { name: "Help Support", icon: <MdHelpOutline size={20} /> },
  ];

  return (
    <div>
      <div className="flex items-center justify-between m-2 p-4 bg-blue-600 text-white rounded-xl shadow-md">
        <h2 className="font-bold text-2xl tracking-wide">Admin Dashboard</h2>
        <Link
          to="/"
          className="flex justify-center items-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 transition-all rounded-md font-medium cursor-pointer shadow-md"
        >
          <TbLogout size={22} /> Logout
        </Link>
      </div>

      <div className="relative p-4 bg-blue-100 shadow-md w-60 rounded-lg m-2">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-xl">Action Center</h4>
          <button
            onClick={() => setOpen(!open)}
            className="bg-blue-300 p-2 rounded-lg cursor-pointer shadow"
          >
            {open ? <MdClose size={28} /> : <MdMenuOpen size={28} />}
          </button>
        </div>

        <div
          className={`absolute top-full left-0 w-full bg-white shadow-lg rounded-lg mt-2 transform transition-transform duration-300 ${
            open
              ? "translate-y-0 opacity-100"
              : "-translate-y-5 opacity-0 pointer-events-none"
          }`}
        >
          <div className="flex flex-col space-y-2 p-4">
            {navs.map((item, index) => (
              <Link
                key={index}
                to={`/${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                className="flex items-center gap-3 p-3 rounded-lg shadow hover:bg-blue-50 transition"
                onClick={() => setOpen(false)}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
