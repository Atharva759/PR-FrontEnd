import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Database,
  Server,
  Wifi,
  HardDrive,
  Users,
  Globe,
  Activity,
} from "lucide-react";

import {
  getBackendHealth,
  getFrontendHealth,
  getDevicesCount,
  getTenantsCount,
  getSystemStats,
} from "../api/adminApi";

const Monitoring = () => {
  const [userCount, setUserCount] = useState(0);
  const [realtimeConnections, setRealtimeConnections] = useState(0);
  const [storageUsage, setStorageUsage] = useState("N/A");
  const [storageStatus, setStorageStatus] = useState("Checking");
  const [frontendStatus, setFrontendStatus] = useState("Checking");
  const [backendHealth, setBackendHealth] = useState("Checking");
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [tenantCount, setTenantCount] = useState(0);

  const [timestamps, setTimestamps] = useState({});

  const updateTimestamp = (key) => {
    setTimestamps((prev) => ({
      ...prev,
      [key]: new Date().toLocaleTimeString(),
    }));
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const stats = await getSystemStats();

        setUserCount(stats.totalUsers || 0);
        setConnectedDevices(stats.totalDevices || 0);

        setBackendHealth(
          stats.backendStatus === "running" ? "Healthy" : "Unhealthy"
        );

        setFrontendStatus(
          stats.frontendStatus === "running" ? "Healthy" : "Unhealthy"
        );

        updateTimestamp("users");
        updateTimestamp("backend");
        updateTimestamp("frontend");

        const tenants = await getTenantsCount();
        setTenantCount(tenants.totalTenants || 0);

        const devices = await getDevicesCount();
        setRealtimeConnections(devices.totalDevices || 0);

        updateTimestamp("realtime");
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch system stats");
        setBackendHealth("Disconnected");
      }
    };

    fetchStats();

    const interval = setInterval(fetchStats, 10000);

    return () => clearInterval(interval);
  }, []);

  const StatusBadge = ({ status }) => {
    const colorMap = {
      Healthy: "bg-green-100 text-green-700",
      Unhealthy: "bg-yellow-100 text-yellow-700",
      Disconnected: "bg-red-100 text-red-700",
      Checking: "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${
          colorMap[status] || "bg-gray-100 text-gray-700"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">

    {/* HEADER */}

    <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

      <div className="flex items-center gap-4">

        <div className="w-16 h-16 rounded-3xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-xl">

          <Activity className="w-8 h-8 text-white" />

        </div>

        <div>

          <h1 className="text-4xl font-bold text-slate-800">
            System Monitoring
          </h1>

          <p className="text-slate-500 mt-1 text-lg">
            Real-time infrastructure and platform analytics
          </p>

        </div>

      </div>

      {/* LIVE BADGE */}

      <div className="bg-emerald-100 text-emerald-700 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-sm w-fit">

        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>

        <span className="font-semibold">
          Live Monitoring
        </span>

      </div>

    </div>

    {/* MAIN GRID */}

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

      <Card
        title="Total Users"
        icon={<Users className="w-7 h-7 text-indigo-600" />}
        value={userCount}
        footer={`Updated: ${timestamps.users || "..."}`}
        color="from-indigo-500 to-blue-500"
      />

      <Card
        title="Total Tenants"
        icon={<Database className="w-7 h-7 text-blue-600" />}
        value={tenantCount}
        footer={`Updated: ${timestamps.realtime || "..."}`}
        color="from-blue-500 to-cyan-500"
      />

      <Card
        title="Connected Devices"
        icon={<Wifi className="w-7 h-7 text-cyan-600" />}
        value={connectedDevices}
        footer={`Updated: ${timestamps.backend || "..."}`}
        color="from-cyan-500 to-sky-500"
      />

      <Card
        title="Frontend Status"
        icon={<Globe className="w-7 h-7 text-green-600" />}
        value={<StatusBadge status={frontendStatus} />}
        footer={`Updated: ${timestamps.frontend || "..."}`}
        color="from-emerald-500 to-green-500"
      />

      <Card
        title="Backend Health"
        icon={<Server className="w-7 h-7 text-rose-600" />}
        value={<StatusBadge status={backendHealth} />}
        footer={`Updated: ${timestamps.backend || "..."}`}
        color="from-rose-500 to-red-500"
      />

      

    </div>

  </div>
);
};

const Card = ({ title, icon, value, footer }) => (
  <div className="bg-white p-6 shadow-md rounded-xl flex flex-col justify-between text-center">
    <div>
      <div className="flex justify-center items-center gap-2">
        {icon}
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <div className="mt-3 text-2xl">{value}</div>
    </div>
    <p className="text-sm text-gray-500 mt-4">{footer}</p>
  </div>
);

export default Monitoring;