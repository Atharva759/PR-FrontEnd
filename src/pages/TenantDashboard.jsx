import { useState, useEffect } from "react";
import { TbLogout } from "react-icons/tb";
import {
  FaUsers,
  FaMicrochip,
  FaPlus,
  FaTimes,
  FaTrash,
  FaEdit,
  FaChartLine,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";

/* DEVICE APIs */
import {
  getTenantDevices,
  registerDevice,
  updateDevice,
  deleteDevice,
  getSensorData,
} from "../api/tenantApi";

/* USER APIs */
import {
  getTenantUsers,
  updateUserRole,
  updateUserEmail,
  deleteUser,
} from "../api/userApi";

const GaugeCard = ({ label, value, max }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="bg-white p-4 rounded-xl shadow text-center">
      <h3 className="text-gray-700 font-semibold mb-2">{label}</h3>

      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className="bg-blue-500 h-3 rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-lg font-bold text-gray-800">{value ?? 0}</p>
    </div>
  );
};

const TenantDashboard = () => {
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("devices");

  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [macId, setMacId] = useState("");

  const [users, setUsers] = useState([]);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [loadingSensor, setLoadingSensor] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const openDeviceModal = async (device) => {
    setSelectedDevice(device);
    setLoadingSensor(true);

    try {
      const data = await getSensorData("pzem", device.mac); // FIXED
      if (Array.isArray(data)) setSensorData(data);
      else setSensorData([]);
    } catch (err) {
      console.error(err);
      setSensorData([]);
    }

    setLoadingSensor(false);
  };

  const closeModal = () => {
    setSelectedDevice(null);
  };

  const fetchDevices = async () => {
    try {
      const data = await getTenantDevices();

      if (Array.isArray(data)) setDevices(data);
      else if (data?.devices) setDevices(data.devices);
      else setDevices([]);
    } catch (err) {
      toast.error("Failed to load devices");
    }
  };

  const fetchUsers = async () => {
    try {
      const tenantId = localStorage.getItem("tenantId");
      const data = await getTenantUsers(tenantId);

      if (Array.isArray(data)) setUsers(data);
      else setUsers([]);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    if (activeView === "devices") fetchDevices();
    if (activeView === "users") fetchUsers();
  }, [activeView]);

  const logout = async () => {
    toast.promise(signOut(auth), {
      loading: "Logging out...",
      success: () => {
        navigate("/");
        return "Logged out successfully!";
      },
      error: (err) => `Logout failed: ${err.message}`,
    });
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();

    try {
      await toast.promise(
        registerDevice({ name: deviceName, mac: macId }),
        {
          loading: "Registering device...",
          success: "Device added",
          error: "Failed to add device",
        }
      );

      setShowModal(false);
      setDeviceName("");
      setMacId("");

      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditDevice = async (device) => {
    const newName = prompt("Enter new device name", device.name);
    if (!newName) return;

    try {
      await toast.promise(updateDevice(device.id, newName), {
        loading: "Updating device...",
        success: "Device updated",
        error: "Update failed",
      });
      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm("Delete this device?")) return;

    try {
      await toast.promise(deleteDevice(deviceId), {
        loading: "Deleting device...",
        success: "Device deleted",
        error: "Delete failed",
      });
      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  const viewData = (device) => {
    navigate(`/device/${device.mac}`); // FIXED
  };

  const handleEditEmail = async (user) => {
    const email = prompt("Enter new email", user.email);
    if (!email) return;

    try {
      await toast.promise(updateUserEmail(user.uid, email), {
        loading: "Updating email...",
        success: "Email updated",
        error: "Failed",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangeRole = async (user) => {
    const role = prompt("Enter role (tenant_admin / tenant_user)", user.role);
    if (!role) return;

    try {
      await toast.promise(updateUserRole(user.uid, role), {
        loading: "Updating role...",
        success: "Role updated",
        error: "Failed",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await toast.promise(deleteUser(uid), {
        loading: "Deleting user...",
        success: "User deleted",
        error: "Delete failed",
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* SAME UI — ONLY BUTTON FIX BELOW */}

      {/* DEVICES */}
      {activeView === "devices" && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {devices.map((device) => (
              <div
                key={device.id}
                onClick={() => openDeviceModal(device)}
                className="bg-white p-5 rounded-xl border border-blue-100 hover:shadow-lg transition"
              >
                <h3>{device.name}</h3>
                <p>MAC: {device.mac}</p>

                <div className="flex justify-between mt-4">
                  <button
                    className="text-green-600 flex items-center gap-1 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      viewData(device);
                    }}
                  >
                    <FaChartLine /> View
                  </button>

                  <button
                    className="text-blue-600 flex items-center gap-1 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditDevice(device);
                    }}
                  >
                    <FaEdit /> Edit
                  </button>

                  <button
                    className="text-red-600 flex items-center gap-1 text-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteDevice(device.id);
                    }}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TenantDashboard;