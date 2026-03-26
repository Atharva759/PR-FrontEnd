import { useState, useEffect } from "react";
import { TbLogout } from "react-icons/tb";
import {
  MdAnalytics,
  MdPeople,
  MdAdminPanelSettings,
  MdAssignment,
  MdLiveTv,
  MdMonitor,
  MdSettings,
  MdHelpOutline,
  MdChevronLeft,
  MdChevronRight,
  MdMenu,
} from "react-icons/md";
import { Link } from "react-router-dom";

import ManageUsers from "../components/ManageUsers";
import QuickActions from "../components/QuickActions";
import Monitoring from "../components/Monitoring";
import Logs from "../components/Logs";
import TenantManagement from "../components/TenantManagement";
import FaceDetection from "../components/FaceDetection";
import Support from "../components/Support";
import DeviceManagement from "../components/DeviceManagement";
import AdminActions from "../components/AdminActions";

const CAMURL = import.meta.env.VITE_ESP_FACE;

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState("quick-actions");
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile
  const [collapsed, setCollapsed] = useState(false); // desktop

  // Persist collapse state
  useEffect(() => {
    const saved = localStorage.getItem("collapsed");
    if (saved) setCollapsed(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("collapsed", collapsed);
  }, [collapsed]);

  const navs = [
    {
      name: "Quick Actions",
      icon: <MdAnalytics size={20} />,
      view: "quick-actions",
    },
    { name: "Manage Users", icon: <MdPeople size={20} />, view: "manage" },
    {
      name: "Tenant Management",
      icon: <MdSettings size={20} />,
      view: "tenantmanage",
    },
    {
      name: "Device Management",
      icon: <MdAdminPanelSettings size={20} />,
      view: "devicemanage",
    },
    {
      name: "System Monitoring",
      icon: <MdMonitor size={20} />,
      view: "monitoring",
    },
    {
      name: "Admin Actions",
      icon: <MdAdminPanelSettings size={20} />,
      view: "adminactions",
    },
    { name: "Logs", icon: <MdAssignment size={20} />, view: "logs" },
    { name: "Live Feed", icon: <MdLiveTv size={20} />, view: "liveFeed" },
    { name: "Help Support", icon: <MdHelpOutline size={20} />, view: "help" },
  ];

  return (
    <div className="h-screen bg-blue-200 flex flex-col md:flex-row p-4 md:p-6 gap-4 overflow-hidden">
      {/* 🔹 Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center bg-blue-600 text-white p-4 rounded-lg">
        <h2 className="font-bold">Admin</h2>
        <button onClick={() => setSidebarOpen(true)}>☰</button>
      </div>

      {/* 🔹 Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 🔹 Sidebar */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full md:h-auto
          ${collapsed ? "w-20" : "w-64"}
          bg-blue-100 z-50 transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 transition-all duration-300
          flex flex-col gap-4 p-4 rounded-xl shadow-lg md:shadow-none
        `}
      >
        {/* Header */}
        <div className={`flex items-center ${!collapsed ? "bg-blue-600 text-white" : "text-blue-600 right-1"} p-3 rounded-lg relative`}>
          <button
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            onClick={() => {
              if (window.innerWidth < 768) {
                setSidebarOpen(!sidebarOpen); // mobile
              } else {
                setCollapsed(!collapsed); // desktop
              }
            }}
            className="absolute left-3 p-1 rounded-lg hover:bg-blue-400 transition-all cursor-pointer"
          >
            {collapsed ? <MdMenu size={26} /> : <MdChevronLeft size={26} />}
          </button>

          {/* Title */}
          {!collapsed && (
            <span className="font-bold text-lg mx-auto">Enerlytics</span>
          )}
        </div>

        {/* Nav Items */}
        <div className="flex flex-col gap-2 mt-4">
          {navs.map((item) => (
            <button
              key={item.view}
              title={item.name}
              onClick={() => {
                setCurrentView(item.view);
                setSidebarOpen(false);
              }}
              className={`flex items-center cursor-pointer ${
                collapsed ? "justify-center" : "gap-3"
              } p-3 rounded-lg transition-all font-medium hover:bg-blue-200 hover:shadow ${
                currentView === item.view
                  ? "bg-blue-200 text-blue-700 shadow"
                  : "text-gray-700"
              }`}
            >
              {item.icon}
              {!collapsed && <span>{item.name}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 Main Content */}
      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-blue-600 text-white rounded-xl shadow-md p-4">
          <h2 className="font-bold text-xl md:text-2xl">Admin Dashboard</h2>

          <Link
            to="/"
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-900 hover:bg-blue-800 rounded-lg cursor-pointer"
          >
            <TbLogout size={20} /> Logout
          </Link>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg p-4 md:p-6 flex-1 overflow-y-auto">
          {currentView === "quick-actions" && (
            <QuickActions setCurrentView={setCurrentView} />
          )}
          {currentView === "manage" && <ManageUsers />}
          {currentView === "tenantmanage" && <TenantManagement />}
          {currentView === "devicemanage" && (
            <DeviceManagement role="super_admin" />
          )}
          {currentView === "logs" && <Logs />}
          {currentView === "adminactions" && (
            <AdminActions role="super_admin" />
          )}
          {currentView === "monitoring" && <Monitoring />}
          {currentView === "liveFeed" && <FaceDetection camUrl={CAMURL} />}
          {currentView === "help" && <Support />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
