import { useState, useEffect } from "react";

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
  MdMenu,
} from "react-icons/md";
import logo from "../assets/logo.png";

import ManageUsers from "../components/ManageUsers";
import QuickActions from "../components/QuickActions";
import Monitoring from "../components/Monitoring";
import Logs from "../components/Logs";
import TenantManagement from "../components/TenantManagement";
import FaceDetection from "../components/FaceDetection";
import Support from "../components/Support";
import DeviceManagement from "../components/DeviceManagement";
import AdminActions from "../components/AdminActions";

import UserProfileDropdown from "../components/UserProfileDropdown";

const CAMURL = import.meta.env.VITE_ESP_FACE;

const AdminDashboard = () => {
  const [currentView, setCurrentView] = useState("quick-actions");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  /* PERSIST SIDEBAR */

  useEffect(() => {
    const saved = localStorage.getItem("collapsed");

    if (saved) {
      setCollapsed(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("collapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  /* NAVIGATION */

  const navs = [
    {
      name: "Quick Actions",
      icon: <MdAnalytics size={22} />,
      view: "quick-actions",
    },

    {
      name: "Manage Users",
      icon: <MdPeople size={22} />,
      view: "manage",
    },

    {
      name: "Tenant Management",
      icon: <MdSettings size={22} />,
      view: "tenantmanage",
    },

    {
      name: "Device Management",
      icon: <MdAdminPanelSettings size={22} />,
      view: "devicemanage",
    },

    {
      name: "System Monitoring",
      icon: <MdMonitor size={22} />,
      view: "monitoring",
    },

    {
      name: "Admin Actions",
      icon: <MdAdminPanelSettings size={22} />,
      view: "adminactions",
    },

    {
      name: "Logs",
      icon: <MdAssignment size={22} />,
      view: "logs",
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50 flex p-4 gap-4">
      {/* MOBILE OVERLAY */}

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}

      <div
        className={`
          fixed lg:relative z-50
          h-[calc(100vh-2rem)]
          ${collapsed ? "w-20" : "w-60"}
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }
          transition-all duration-300
          bg-white/80 backdrop-blur-2xl
          border border-white/20
          rounded-3xl
          shadow-2xl
          flex flex-col
          p-4
        `}
      >
        {/* LOGO */}

        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "justify-between"
          } mb-6`}
        >
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
                <img src={logo} alt="Enerlytics" className="bg-none" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-800">Enerlytics</h2>

                <p className="text-xs text-slate-500">Admin Panel</p>
              </div>
            </div>
          )}

          {/* TOGGLE */}

          <button
            onClick={() => {
              if (window.innerWidth < 1024) {
                setSidebarOpen(false);
              } else {
                setCollapsed(!collapsed);
              }
            }}
            className="w-10 h-10 rounded-2xl bg-blue-100 hover:bg-blue-200 flex items-center justify-center transition-all cursor-pointer text-blue-700"
          >
            {collapsed ? <MdMenu size={22} /> : <MdChevronLeft size={22} />}
          </button>
        </div>

        {/* NAVIGATION */}

        <div className="flex flex-col gap-2 flex-1">
          {navs.map((item) => (
            <button
              key={item.view}
              title={item.name}
              onClick={() => {
                setCurrentView(item.view);

                setSidebarOpen(false);
              }}
              className={`
                flex items-center
                ${collapsed ? "justify-center" : "gap-4"}
                px-4 py-3
                rounded-2xl
                transition-all duration-300
                font-medium
                cursor-pointer
                ${
                  currentView === item.view
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg"
                    : "text-slate-700 hover:bg-blue-100 hover:text-blue-700"
                }
              `}
            >
              <div className="text-xl">{item.icon}</div>

              {!collapsed && <span className="text-sm">{item.name}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* MOBILE TOPBAR */}

        <div className="lg:hidden flex items-center justify-between bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 shadow-lg">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700"
          >
            <MdMenu size={22} />
          </button>

          <h2 className="text-lg font-bold text-slate-800">Enerlytics</h2>

          <UserProfileDropdown />
        </div>

        {/* HEADER */}

        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-600 rounded-3xl shadow-2xl px-6 py-5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 border border-white/10">
          {/* LEFT */}

          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-3xl flex items-center justify-center">
              <img src={logo} alt="Enerlytics" className="bg-none" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>

              <p className="text-blue-100 mt-1">
                Smart Multi-Tenant IoT Cloud Platform
              </p>
            </div>
          </div>

          {/* RIGHT */}

          <div className="flex items-center justify-end">
            <UserProfileDropdown />
          </div>
        </div>

        {/* CONTENT */}

        <div className="flex-1 overflow-y-auto bg-white/80 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl p-5">
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
