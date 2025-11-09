import { useState, useEffect } from "react";
import { db, database, storage } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { ref as dbRef, onValue } from "firebase/database";
import { ref as storageRef, listAll, getMetadata } from "firebase/storage";
import toast from "react-hot-toast";
import {
  Database,
  Cloud,
  Server,
  Wifi,
  HardDrive,
  Users,
  Globe,
  Activity,
} from "lucide-react";

// ✅ Environment Variables (from .env)
const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Monitoring = () => {
  const [userCount, setUserCount] = useState(0);
  const [realtimeConnections, setRealtimeConnections] = useState(0);
  const [storageUsage, setStorageUsage] = useState("-");
  const [frontendStatus, setFrontendStatus] = useState("Checking...");
  const [backendHealth, setBackendHealth] = useState("Checking...");
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [webClients, setWebClients] = useState(0);
  const [lastHealthCheck, setLastHealthCheck] = useState(null);

  // 🔹 Firestore Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        setUserCount(usersSnap.size);
      } catch (err) {
        console.error("Error fetching users:", err);
        toast.error("Failed to fetch users count");
      }
    };
    fetchUsers();
  }, []);

  // 🔹 Realtime DB Connection
  useEffect(() => {
    const connectionsRef = dbRef(database, ".info/connected");
    const unsubscribe = onValue(connectionsRef, (snapshot) => {
      setRealtimeConnections(snapshot.val() ? 1 : 0);
    });
    return () => unsubscribe();
  }, []);

  // 🔹 Frontend Status Check
  useEffect(() => {
    const checkFrontend = async () => {
      try {
        const res = await fetch(FRONTEND_URL, { method: "HEAD" });
        setFrontendStatus(res.ok ? "Up" : "Down");
      } catch {
        setFrontendStatus("Down");
      }
    };
    checkFrontend();
    const interval = setInterval(checkFrontend, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // 🔹 Firebase Storage Usage
  useEffect(() => {
    const fetchStorageUsage = async () => {
      try {
        const rootRef = storageRef(storage, "/");
        const list = await listAll(rootRef);
        let totalBytes = 0;
        for (const itemRef of list.items) {
          const meta = await getMetadata(itemRef);
          totalBytes += meta.size || 0;
        }
        const sizeMB = (totalBytes / (1024 * 1024)).toFixed(2);
        setStorageUsage(`${sizeMB} MB`);
      } catch {
        setStorageUsage("Not available");
      }
    };
    fetchStorageUsage();
  }, []);

  // 🔹 Backend Health
  useEffect(() => {
    const fetchBackendHealth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBackendHealth(data.status === "ok" ? "Healthy" : "Unhealthy");
        setConnectedDevices(data.connectedDevices || 0);
        setWebClients(data.webClients || 0);
        setLastHealthCheck(new Date(data.timestamp).toLocaleTimeString());
      } catch {
        setBackendHealth("Unreachable");
      }
    };
    fetchBackendHealth();
    const interval = setInterval(fetchBackendHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  // 🔸 Helper for colored status badge
  const StatusBadge = ({ status }) => {
    const colorMap = {
      Up: "bg-green-100 text-green-700",
      Healthy: "bg-green-100 text-green-700",
      Down: "bg-red-100 text-red-700",
      Unhealthy: "bg-yellow-100 text-yellow-700",
      Unreachable: "bg-red-100 text-red-700",
      Checking: "bg-gray-100 text-gray-700",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${colorMap[status] || "bg-gray-100 text-gray-700"}`}
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
        {/* Firestore Users */}
        <Card
          title="Firestore Users"
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          value={userCount}
        />

        {/* Realtime DB */}
        <Card
          title="Realtime DB Connection"
          icon={<Database className="w-6 h-6 text-blue-600" />}
          value={realtimeConnections}
        />

        {/* Storage Usage */}
        <Card
          title="Storage Usage"
          icon={<HardDrive className="w-6 h-6 text-amber-600" />}
          value={storageUsage}
        />

        {/* Frontend Status */}
        <Card
          title="Frontend Status"
          icon={<Globe className="w-6 h-6 text-green-600" />}
          value={<StatusBadge status={frontendStatus} />}
        />

        {/* Backend Health */}
        <Card
          title="Backend Health"
          icon={<Server className="w-6 h-6 text-rose-600" />}
          value={<StatusBadge status={backendHealth} />}
          footer={lastHealthCheck && `Last Checked: ${lastHealthCheck}`}
        />

        {/* Connected Devices */}
        <Card
          title="Connected Devices"
          icon={<Wifi className="w-6 h-6 text-cyan-600" />}
          value={connectedDevices}
        />

        {/* Web Clients */}
        <Card
          title="Web Clients"
          icon={<Cloud className="w-6 h-6 text-purple-600" />}
          value={webClients}
        />
      </div>
    </div>
  );
};

// 🔹 Reusable Card Component
const Card = ({ title, icon, value, footer }) => (
  <div className="bg-white p-6 shadow-md rounded-xl text-center">
    <div className="flex justify-center items-center gap-2">
      {icon}
      <h3 className="font-semibold text-lg">{title}</h3>
    </div>
    <p className="text-3xl font-bold mt-3">{value}</p>
    {footer && <p className="text-sm text-gray-500 mt-2">{footer}</p>}
  </div>
);

export default Monitoring;
