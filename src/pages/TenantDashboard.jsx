import { useState, useEffect } from "react";
import { TbLogout } from "react-icons/tb";
import {
  FaUsers,
  FaMicrochip,
  FaPlus,
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

const TenantDashboard = () => {
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("devices");

  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);

  const [deviceName, setDeviceName] = useState("");
  const [mac, setMac] = useState("");

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [loadingSensor, setLoadingSensor] = useState(false);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  /* FETCH DEVICES */
  const fetchDevices = async () => {
    setLoading(true);
    try {
      const data = await getTenantDevices();
      setDevices(Array.isArray(data) ? data : data?.devices || []);
    } catch (err) {
      toast.error("Failed to load devices");
    }
    setLoading(false);
  };

  /* FETCH USERS */
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const tenantId = localStorage.getItem("tenantId");
      const data = await getTenantUsers(tenantId);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error("Failed to load users");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (activeView === "devices") fetchDevices();
    else fetchUsers();
  }, [activeView]);

  /* LOGOUT */
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

  /* ADD DEVICE */
  const handleAddDevice = async (e) => {
    e.preventDefault();

    try {
      await toast.promise(
        registerDevice({ name: deviceName, mac }),
        {
          loading: "Registering device...",
          success: "Device added",
          error: "Failed to add device",
        }
      );

      setDeviceName("");
      setMac("");
      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  /* EDIT DEVICE */
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

  /* DELETE DEVICE */
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

  /* VIEW SENSOR */
  const openDeviceModal = async (device) => {
    setSelectedDevice(device);
    setLoadingSensor(true);

    try {
      const data = await getSensorData("pzem", device.mac);
      setSensorData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSensorData([]);
    }

    setLoadingSensor(false);
  };

  /* USER ACTIONS */
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
    const role = prompt("Enter role", user.role);
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
    <div className="min-h-screen flex bg-gray-100">
      {/* SIDEBAR */}
      <div className="w-64 bg-blue-600 text-white p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <img className="w-10 bg-white rounded p-1" src={logo} alt="logo" />
            <h2 className="text-xl font-bold">Enerlytics</h2>
          </div>

          <button onClick={() => setActiveView("devices")} className="block mb-4">
            <FaMicrochip /> Devices
          </button>

          <button onClick={() => setActiveView("users")}>
            <FaUsers /> Users
          </button>
        </div>

        <button onClick={logout} className="bg-white text-blue-600 p-2 rounded">
          <TbLogout /> Logout
        </button>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-6">
        {loading && <p>Loading...</p>}

        {/* DEVICES */}
        {activeView === "devices" && (
          <>
            <h2 className="text-xl mb-4">Devices</h2>

            <form onSubmit={handleAddDevice} className="mb-6 flex gap-2">
              <input
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                placeholder="Device Name"
                className="border p-2"
              />
              <input
                value={mac}
                onChange={(e) => setMac(e.target.value)}
                placeholder="MAC"
                className="border p-2"
              />
              <button className="bg-blue-600 text-white px-4">Add</button>
            </form>

            <div className="grid grid-cols-3 gap-4">
              {devices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => openDeviceModal(device)}
                  className="p-4 bg-white shadow cursor-pointer"
                >
                  <h3>{device.name}</h3>
                  <p>{device.mac}</p>

                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/device/${device.mac}`);
                      }}
                    >
                      <FaChartLine />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditDevice(device);
                      }}
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDevice(device.id);
                      }}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* SENSOR MODAL */}
            {selectedDevice && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white p-6 rounded">
                  <h2>{selectedDevice.name}</h2>

                  {loadingSensor ? (
                    <p>Loading...</p>
                  ) : (
                    <pre>{JSON.stringify(sensorData, null, 2)}</pre>
                  )}

                  <button onClick={() => setSelectedDevice(null)}>Close</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* USERS */}
        {activeView === "users" && (
          <>
            <h2 className="text-xl mb-4">Users</h2>

            <div className="grid grid-cols-3 gap-4">
              {users.map((user) => (
                <div key={user.uid} className="p-4 bg-white shadow">
                  <p>{user.email}</p>
                  <p>{user.role}</p>

                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleEditEmail(user)}>
                      Edit
                    </button>
                    <button onClick={() => handleChangeRole(user)}>
                      Role
                    </button>
                    <button onClick={() => handleDeleteUser(user.uid)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TenantDashboard;