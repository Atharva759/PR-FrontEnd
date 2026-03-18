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
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Activity className="w-6 h-6 text-blue-600" />
        System Monitoring
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <Card
          title="Total Users"
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          value={userCount}
          footer={`Last Updated: ${timestamps.users || "..."}`}
        />

        <Card
          title="Total Tenants"
          icon={<Database className="w-6 h-6 text-blue-600" />}
          value={tenantCount}
          footer={`Last Updated: ${timestamps.realtime || "..."}`}
        />

        <Card
          title="Connected Devices"
          icon={<Wifi className="w-6 h-6 text-cyan-600" />}
          value={connectedDevices}
          footer={`Last Updated: ${timestamps.backend || "..."}`}
        />

        <Card
          title="Frontend Status"
          icon={<Globe className="w-6 h-6 text-green-600" />}
          value={<StatusBadge status={frontendStatus} />}
          footer={`Last Updated: ${timestamps.frontend || "..."}`}
        />

        <Card
          title="Backend Health"
          icon={<Server className="w-6 h-6 text-rose-600" />}
          value={<StatusBadge status={backendHealth} />}
          footer={`Last Updated: ${timestamps.backend || "..."}`}
        />

        <Card
          title="Storage Usage"
          icon={<HardDrive className="w-6 h-6 text-amber-600" />}
          value={
            <div className="flex flex-col items-center">
              <span className="text-2xl font-semibold">{storageUsage}</span>
              <StatusBadge status={storageStatus} />
            </div>
          }
          footer="Storage metrics coming from backend"
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