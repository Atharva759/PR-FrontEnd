import { useState, useEffect } from "react";
import { db, database, storage } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { ref as dbRef, onValue } from "firebase/database";
import { ref as storageRef, listAll, getMetadata } from "firebase/storage";
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

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Monitoring = () => {
  const [userCount, setUserCount] = useState(0);
  const [realtimeConnections, setRealtimeConnections] = useState(0);
  const [storageUsage, setStorageUsage] = useState("0 MB");
  const [storageStatus, setStorageStatus] = useState("Checking");
  const [frontendStatus, setFrontendStatus] = useState("Checking");
  const [backendHealth, setBackendHealth] = useState("Checking");
  const [connectedDevices, setConnectedDevices] = useState(0);
  const [timestamps, setTimestamps] = useState({});

  const updateTimestamp = (key) => {
    setTimestamps((prev) => ({
      ...prev,
      [key]: new Date().toLocaleTimeString(),
    }));
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnap = await getDocs(collection(db, "users"));
        setUserCount(usersSnap.size);
        updateTimestamp("users");
      } catch (err) {
        toast.error("Failed to fetch users");
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const connectionsRef = dbRef(database, ".info/connected");
    const unsubscribe = onValue(connectionsRef, (snapshot) => {
      setRealtimeConnections(snapshot.val() ? 1 : 0);
      updateTimestamp("realtime");
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkFrontend = async () => {
      try {
        const res = await fetch(FRONTEND_URL, { method: "HEAD" });
        setFrontendStatus(res.ok ? "Healthy" : "Unhealthy");
      } catch {
        setFrontendStatus("Unhealthy");
      }
      updateTimestamp("frontend");
    };
    checkFrontend();
    const interval = setInterval(checkFrontend, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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
        setStorageStatus("Healthy");
      } catch {
        setStorageUsage("-");
        setStorageStatus("Disconnected");
      }
      updateTimestamp("storage");
    };
    fetchStorageUsage();
  }, []);

  useEffect(() => {
    const fetchBackendHealth = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/health`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setBackendHealth(data.status === "ok" ? "Healthy" : "Unhealthy");
        setConnectedDevices(data.connectedDevices || 0);
      } catch {
        setBackendHealth("Disconnected");
      }
      updateTimestamp("backend");
    };
    fetchBackendHealth();
    const interval = setInterval(fetchBackendHealth, 10000);
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
          title="Firestore Users"
          icon={<Users className="w-6 h-6 text-indigo-600" />}
          value={userCount}
          footer={`Last Updated: ${timestamps.users || "..."}`}
        />
        <Card
          title="Realtime DB Connection"
          icon={<Database className="w-6 h-6 text-blue-600" />}
          value={realtimeConnections}
          footer={`Last Updated: ${timestamps.realtime || "..."}`}
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
          footer={`Last Updated: ${timestamps.storage || "..."}`}
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
          title="Connected Devices"
          icon={<Wifi className="w-6 h-6 text-cyan-600" />}
          value={connectedDevices}
          footer={`Last Updated: ${timestamps.backend || "..."}`}
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
