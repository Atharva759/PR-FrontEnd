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
  getSensorData
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

      <p className="text-lg font-bold text-gray-800">
        {value ?? 0}
      </p>
    </div>
  );
};

const TenantDashboard = () => {
  const navigate = useNavigate();

  /* VIEW SWITCH */
  const [activeView, setActiveView] = useState("devices");

  /* DEVICE STATE */
  const [devices, setDevices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deviceName, setDeviceName] = useState("");
  const [macId, setMacId] = useState("");

  /* USER STATE */
  const [users, setUsers] = useState([]);

  const [selectedDevice, setSelectedDevice] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [loadingSensor, setLoadingSensor] = useState(false);

  const openDeviceModal = async (device) => {
    setSelectedDevice(device);
    setLoadingSensor(true)

    try{ 
      const data = await getSensorData("pzem",device.macId);
      console.log(data);
      if(Array.isArray(data)){
        setSensorData(data);
      }else{
        setSensorData([]);
      }
    }catch(err){
      console.error(err);
    }
    setLoadingSensor(false);

  };
  const closeModal = () => {
    setSelectedDevice(null);
  };

  /* FETCH DEVICES */
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

  /* FETCH USERS */
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

  /* LOAD DATA BASED ON VIEW */
  useEffect(() => {
    if (activeView === "devices") fetchDevices();
    if (activeView === "users") fetchUsers();
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
      await toast.promise(registerDevice({ name: deviceName, mac: macId }), {
        loading: "Registering device...",
        success: "Device added",
        error: "Failed to add device",
      });

      setShowModal(false);
      setDeviceName("");
      setMacId("");

      fetchDevices();
    } catch (err) {
      console.error(err);
    }
  };

  /* EDIT DEVICE */
  const handleEditDevice = async (device) => {
    const newName = prompt("Enter new device name", device.name);

    if (!newName) return;

    await toast.promise(updateDevice(device.id, newName), {
      loading: "Updating device...",
      success: "Device updated",
      error: "Update failed",
    });

    fetchDevices();
  };

  /* DELETE DEVICE */
  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm("Delete this device?")) return;

    await toast.promise(deleteDevice(deviceId), {
      loading: "Deleting device...",
      success: "Device deleted",
      error: "Delete failed",
    });

    fetchDevices();
  };

  /* VIEW SENSOR DATA */
  const viewData = (device) => {
    navigate(`/device/${device.mac}`);
  };

  /* EDIT USER EMAIL */
  const handleEditEmail = async (user) => {
    const email = prompt("Enter new email", user.email);

    if (!email) return;

    await toast.promise(updateUserEmail(user.uid, email), {
      loading: "Updating email...",
      success: "Email updated",
      error: "Failed",
    });

    fetchUsers();
  };

  /* CHANGE USER ROLE */
  const handleChangeRole = async (user) => {
    const role = prompt("Enter role (tenant_admin / tenant_user)", user.role);

    if (!role) return;

    await toast.promise(updateUserRole(user.uid, role), {
      loading: "Updating role...",
      success: "Role updated",
      error: "Failed",
    });

    fetchUsers();
  };

  /* DELETE USER */
  const handleDeleteUser = async (uid) => {
    if (!window.confirm("Delete this user?")) return;

    await toast.promise(deleteUser(uid), {
      loading: "Deleting user...",
      success: "User deleted",
      error: "Delete failed",
    });

    fetchUsers();
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* SIDEBAR */}

      <div className="m-4 w-64 bg-gradient-to-b from-blue-600 to-green-500 text-white rounded-2xl shadow-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <img
              className="w-10 h-10 bg-white rounded-xl p-1"
              src={logo}
              alt="logo"
            />
            <h2 className="text-xl font-bold">Enerlytics Cloud</h2>
          </div>

          <nav className="flex flex-col gap-4">
            <button
              onClick={() => setActiveView("users")}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                activeView === "users" ? "bg-white/20" : "hover:bg-white/20"
              }`}
            >
              <FaUsers /> Manage Tenant Users
            </button>

            <button
              onClick={() => setActiveView("devices")}
              className={`flex items-center gap-3 p-3 rounded-lg ${
                activeView === "devices" ? "bg-white/20" : "hover:bg-white/20"
              }`}
            >
              <FaMicrochip /> Manage Devices
            </button>
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 p-3 bg-white text-blue-600 rounded-lg font-semibold"
        >
          <TbLogout size={20} /> Logout
        </button>
      </div>

      {/* MAIN CONTENT */}

      <div className="flex-1 p-8 m-4 bg-gradient-to-b from-blue-600 to-green-500 text-white rounded-2xl shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tenant Dashboard</h1>
          <p>Manage your registered devices and tenant users.</p>
        </div>

        {/* DEVICES VIEW */}

        {activeView === "devices" && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border h-[620px] overflow-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl text-gray-800 font-semibold">
                Registered Devices
              </h2>

              <button
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-full"
              >
                <FaPlus /> Add Device
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <div
                  key={device.id}
                  onClick={() => openDeviceModal(device)}
                  className="bg-white p-5 rounded-xl border border-blue-100 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-lg">
                      <FaMicrochip className="text-blue-600 text-xl" />
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {device.name}
                      </h3>

                      <p className="text-xs text-gray-500">MAC: {device.mac}</p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => viewData(device)}
                      className="text-green-600 flex items-center gap-1 text-sm"
                    >
                      <FaChartLine /> View
                    </button>

                    <button
                      onClick={() => handleEditDevice(device)}
                      className="text-blue-600 flex items-center gap-1 text-sm"
                    >
                      <FaEdit /> Edit
                    </button>

                    <button
                      onClick={() => handleDeleteDevice(device.id)}
                      className="text-red-600 flex items-center gap-1 text-sm"
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/** DEVICE DETAILED VALUES MODAL */}
        {selectedDevice && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-gray-100 rounded-xl p-6 w-[1100px] max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {selectedDevice.name} Sensor Data
                </h2>

                <button
                  onClick={closeModal}
                  className="text-red-600 font-bold text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Gauges */}

              <div className="grid grid-cols-3 gap-6 mb-8">
                <GaugeCard
                  label="Voltage"
                  value={sensorData[sensorData.length - 1]?.voltage}
                  max={260}
                />

                <GaugeCard
                  label="Current"
                  value={sensorData[sensorData.length - 1]?.current}
                  max={10}
                />

                <GaugeCard
                  label="Power"
                  value={sensorData[sensorData.length - 1]?.power}
                  max={2000}
                />
              </div>

              {/* Graph */}

              <div className="bg-white p-6 rounded-xl shadow">
                <Line
                  data={{
                    labels: sensorData.map((d) =>
                      new Date(d.timestamp).toLocaleTimeString(),
                    ),
                    datasets: [
                      {
                        label: "Voltage",
                        data: sensorData.map((d) => d.voltage),
                        borderColor: "#2563eb",
                      },

                      {
                        label: "Current",
                        data: sensorData.map((d) => d.current),
                        borderColor: "#16a34a",
                      },

                      {
                        label: "Power",
                        data: sensorData.map((d) => d.power),
                        borderColor: "#dc2626",
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* USERS VIEW */}

        {activeView === "users" && (
          <div className="bg-white p-8 rounded-2xl shadow-xl border h-[620px] overflow-auto">
            <h2 className="text-xl text-gray-800 font-semibold mb-8">
              Tenant Users
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <div
                  key={user.uid}
                  className="bg-white p-5 rounded-xl border border-blue-100 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded-lg">
                      <FaUsers className="text-blue-600 text-xl" />
                    </div>

                    <div>
                      <h3 className="text-md font-bold text-gray-800">
                        {user.email}
                      </h3>

                      <p className="text-xs text-gray-500">Role: {user.role}</p>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <button
                      onClick={() => handleEditEmail(user)}
                      className="text-blue-600 text-sm"
                    >
                      Edit Email
                    </button>

                    <button
                      onClick={() => handleChangeRole(user)}
                      className="text-green-600 text-sm"
                    >
                      Change Role
                    </button>

                    <button
                      onClick={() => handleDeleteUser(user.uid)}
                      className="text-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD DEVICE MODAL */}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40">
          <div className="bg-white p-8 rounded-2xl shadow-2xl w-96 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-500"
            >
              <FaTimes />
            </button>

            <h2 className="text-2xl font-bold mb-6 text-gray-800">
              Add New Device
            </h2>

            <form onSubmit={handleAddDevice} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Device Name"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                className="p-3 border rounded-lg"
                required
              />

              <input
                type="text"
                placeholder="MAC ID"
                value={macId}
                onChange={(e) => setMacId(e.target.value)}
                className="p-3 border rounded-lg"
                required
              />

              <button
                type="submit"
                className="mt-2 p-3 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-lg"
              >
                Add Device
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


export default TenantDashboard;
