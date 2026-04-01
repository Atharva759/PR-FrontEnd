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
import { TbDeviceHeartMonitorFilled } from "react-icons/tb";
import { MdDomainAdd } from "react-icons/md";

import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import toast from "react-hot-toast";
import logo from "../assets/logo.png";
import { BsBuildingFill } from "react-icons/bs";

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

import { getFacilities, createFacility } from "../api/facilityApi";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState("");
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [facilityName, setFacilityName] = useState("");
  const [showFacilityDevicesModal, setShowFacilityDevicesModal] =
    useState(false);
  const [facilityDevices, setFacilityDevices] = useState([]);
  const [selectedFacilityForView, setSelectedFacilityForView] = useState(null);

  const openFacilityDevices = async (facility) => {
    try {
      setSelectedFacilityForView(facility);

      const data = await getTenantDevices();

      let allDevices = [];
      if (Array.isArray(data)) allDevices = data;
      else if (data?.devices) allDevices = data.devices;

      const filtered = allDevices.filter((d) => d.facilityId === facility.id);

      setFacilityDevices(filtered);
      setShowFacilityDevicesModal(true);
    } catch (err) {
      toast.error("Failed to load devices");
    }
  };

  const fetchFacilities = async () => {
    try {
      const data = await getFacilities();
      setFacilities(data || []);
    } catch (err) {
      toast.error("Failed to load facilities");
    }
  };
  useEffect(() => {
    fetchFacilities();
  }, []);

  const openDeviceModal = async (device) => {
    setSelectedDevice(device);
    setLoadingSensor(true);

    try {
      const data = await getSensorData("pzem", device.macId);
      console.log(data);
      if (Array.isArray(data)) {
        setSensorData(data);
      } else {
        setSensorData([]);
      }
    } catch (err) {
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
    if (!selectedFacility) {
      toast.error("Please select a facility");
      return;
    }

    try {
      await toast.promise(
        registerDevice({
          name: deviceName,
          mac: macId,
          facilityId: selectedFacility,
        }),
        {
          loading: "Registering device...",
          success: "Device added",
          error: "Failed to add device",
        },
      );
      setShowModal(false);
      setDeviceName("");
      setMacId("");
      setSelectedFacility("");

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
    <div className="min-h-screen gap-4 flex flex-col md:flex-row overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-blue-600 text-white">
        <img
          className="w-8 h-8 bg-white rounded-xl p-1"
          src={logo}
          alt="logo"
        />
        <h2 className="font-bold">Enerlytics Cloud</h2>
        <button onClick={() => setIsSidebarOpen(true)}>☰</button>
      </div>

      {/* SIDEBAR */}
      <div className="w-0 md:w-64 flex-shrink-0">
        <div
          className={`
          fixed md:relative top-0 left-0 h-full md:h-screen z-50
          w-64 bg-gradient-to-b from-blue-600 to-green-500 text-white
          rounded-r-2xl md:rounded-2xl shadow-2xl p-6 flex flex-col justify-between
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          `}
        >
          <div>
            {/* MOBILE CLOSE */}
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="font-bold">Menu</h2>
              <button onClick={() => setIsSidebarOpen(false)}>✕</button>
            </div>

            {/* LOGO */}
            <div className="flex items-center gap-3 mb-10">
              <img
                className="w-10 h-10 bg-white rounded-xl p-1"
                src={logo}
                alt="logo"
              />
              <h2 className="text-xl font-bold">Enerlytics Cloud</h2>
            </div>

            {/* NAV */}
            <nav className="flex flex-col gap-4">
              <button
                onClick={() => {
                  setActiveView("users");
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  activeView === "users" ? "bg-white/20" : "hover:bg-white/20"
                }`}
              >
                <FaUsers /> Manage Tenant Users
              </button>

              <button
                onClick={() => {
                  setActiveView("devices");
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  activeView === "devices" ? "bg-white/20" : "hover:bg-white/20"
                }`}
              >
                <FaMicrochip /> Manage Devices
              </button>

              <button
                onClick={() => {
                  setActiveView("facilities");
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  activeView === "facilities"
                    ? "bg-white/20"
                    : "hover:bg-white/20"
                }`}
              >
                <BsBuildingFill /> Manage Facilities
              </button>
            </nav>
          </div>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 p-3 bg-white text-green-600 rounded-full font-semibold cursor-pointer"
          >
            <TbLogout size={20} /> Logout
          </button>
        </div>
      </div>

      {/* OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 md:p-8 bg-gradient-to-b from-blue-600 to-green-500 text-white rounded-2xl shadow-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tenant Dashboard</h1>
          <p>Manage your registered devices and tenant users.</p>
        </div>

        {/* DEVICES VIEW */}
        {activeView === "devices" && (
          <div className="bg-white/80 backdrop-blur-lg p-5 md:p-8 rounded-3xl shadow-2xl border border-gray-100 min-h-[calc(100vh-200px)] overflow-y-auto transition-all">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-xl font-bold text-gray-800">
                Registered Devices
              </h2>

              <div className="flex gap-3 items-center">
                {/* ADD DEVICE */}
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
                >
                  <FaPlus />
                  Add Device
                </button>
              </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <div
                  key={device.id}
                  className="group bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                  {/* DEVICE HEADER */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-blue-100 to-blue-50 rounded-xl group-hover:scale-110 transition">
                      <FaMicrochip className="text-blue-600 text-xl" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition">
                        {device.name}
                      </h3>
                      <p className="text-xs text-gray-500">MAC: {device.mac}</p>
                      <p className="text-xs text-gray-400">
                        Facility ID: {device.facilityId}
                      </p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex gap-2 mt-4">
                    {/* VIEW */}
                    <button
                      onClick={() => viewData(device)}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-all cursor-pointer"
                    >
                      <FaChartLine />
                      View
                    </button>

                    {/* EDIT */}
                    <button
                      onClick={() => handleEditDevice(device)}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"
                    >
                      <FaEdit />
                      Edit
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDeleteDevice(device.id)}
                      className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all cursor-pointer"
                    >
                      <FaTrash />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* USERS VIEW */}
        {activeView === "users" && (
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border h-[620px] overflow-auto">
            <h2 className="text-xl text-gray-800 font-semibold mb-6">
              Tenant Users
            </h2>

            <div className="w-full overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-2">
                {/* HEADER */}
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-6 py-2">User</th>
                    <th className="text-left px-6 py-2">Role</th>
                    <th className="text-center px-6 py-2">Actions</th>
                  </tr>
                </thead>

                {/* BODY */}
                <tbody>
                  {users.map((user) => {
                    // Role Color Logic
                    const roleColor =
                      user.role === "admin"
                        ? "bg-red-100 text-red-600"
                        : user.role === "manager"
                          ? "bg-green-100 text-green-600"
                          : "bg-blue-100 text-blue-600";

                    return (
                      <tr
                        key={user.uid}
                        className="bg-white shadow-sm hover:shadow-md transition rounded-xl"
                      >
                        {/* USER */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-11 h-11 flex items-center justify-center bg-blue-50 rounded-full">
                              <FaUsers className="text-blue-600 text-lg" />
                            </div>

                            <div>
                              <p className="font-semibold text-gray-800">
                                {user.email}
                              </p>
                              <p className="text-xs text-gray-400">
                                UID: {user.uid.slice(0, 10)}...
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* ROLE BADGE */}
                        <td className="px-6 py-4">
                          <span
                            className={`px-4 py-1 text-xs font-semibold rounded-full ${roleColor}`}
                          >
                            {user.role}
                          </span>
                        </td>

                        {/* ACTIONS */}
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-3">
                            <button
                              onClick={() => handleEditEmail(user)}
                              className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition text-xs font-medium cursor-pointer"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleChangeRole(user)}
                              className="px-3 py-1.5 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition text-xs font-medium cursor-pointer"
                            >
                              Change Role
                            </button>

                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="px-3 py-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition text-xs font-medium cursor-pointer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FACILITIES VIEW */}
        {activeView === "facilities" && (
          <div className="bg-white p-4 md:p-8 rounded-2xl shadow-xl border min-h-[calc(100vh-200px)] overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl text-gray-800 font-semibold">
                Facilities
              </h2>

              <button
                onClick={() => setShowFacilityModal(true)}
                className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-green-500 text-white rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition cursor-pointer"
              >
                <FaPlus className="text-sm" />
                Add Facility
              </button>
            </div>

            {/* FACILITY LIST */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="bg-white p-5 rounded-xl border border-blue-100 hover:shadow-lg hover:border-blue-300 transition duration-200"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 flex items-center justify-center bg-green-50 rounded-lg text-xl">
                      🏭
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {facility.name}
                      </h3>
                      <p className="text-xs text-gray-500">ID: {facility.id}</p>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-between mt-4">
                    {/* PRIMARY BUTTON */}
                    <button
                      onClick={() => openFacilityDevices(facility)}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 hover:text-blue-700 transition cursor-pointer"
                    >
                      View Devices
                    </button>

                    {/* SECONDARY BUTTON */}
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(facility.id);
                          toast.success("Facility ID copied");
                        } catch (err) {
                          toast.error("Failed to copy ID");
                          console.error(err);
                        }
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-gray-800 transition cursor-pointer"
                    >
                      Copy ID
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showFacilityDevicesModal && (
          <div
            onClick={() => setShowFacilityDevicesModal(false)}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-3xl p-6 rounded-2xl shadow-2xl space-y-5 max-h-[80vh] overflow-y-auto"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">
                  Devices in {selectedFacilityForView?.name}
                </h2>

                <button
                  onClick={() => setShowFacilityDevicesModal(false)}
                  className="text-gray-500 hover:text-red-500 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* DEVICE LIST */}
              {facilityDevices.length === 0 ? (
                <p className="text-gray-500 text-center">
                  No devices found for this facility
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {facilityDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-200"
                    >
                      {/* Left Section */}
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <TbDeviceHeartMonitorFilled className="text-blue-600 text-xl" />
                        </div>

                        <div>
                          <p className="font-semibold text-gray-800 text-sm md:text-base">
                            {device.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            MAC: <span className="font-mono">{device.mac}</span>
                          </p>
                        </div>
                      </div>

                      {/* Right Section */}
                      <button
                        onClick={() => navigate(`/device/${device.mac}`)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition cursor-pointer"
                      >
                        View Data
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {showModal && (
          <div
            onClick={() => setShowModal(false)}
            className="fixed inset-0 z-[999] flex items-start md:items-center justify-center pt-20 md:pt-0 bg-black/50 backdrop-blur-sm px-4 md:pl-64"
          >
            <form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleAddDevice}
              className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-5 animate-fadeIn"
            >
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">Add Device</h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-red-500 text-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Inputs */}
              <div className="space-y-4">
                <input
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 
  focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
  outline-none px-3 py-2.5 rounded-lg transition"
                  placeholder="Enter Device Name"
                  value={deviceName}
                  onChange={(e) => setDeviceName(e.target.value)}
                  required
                />

                <input
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 placeholder-gray-400 
  focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
  outline-none px-3 py-2.5 rounded-lg transition"
                  placeholder="Enter MAC ID"
                  value={macId}
                  onChange={(e) => setMacId(e.target.value)}
                  required
                />

                <select
                  value={selectedFacility}
                  onChange={(e) => setSelectedFacility(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 text-gray-800 
  focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
  outline-none px-3 py-2.5 rounded-lg transition"
                  required
                >
                  <option value="">Select Facility</option>

                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.name} ({facility.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-3 pt-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-green-500 text-white hover:opacity-90 transition cursor-pointer"
                >
                  Add Device
                </button>
              </div>
            </form>
          </div>
        )}

        {/** FACILITY MODAL */}
        {showFacilityModal && (
          <div
            onClick={() => setShowFacilityModal(false)}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md p-6 rounded-2xl shadow-2xl space-y-5"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800">
                  Create Facility
                </h2>
                <button
                  onClick={() => setShowFacilityModal(false)}
                  className="text-gray-500 hover:text-red-500"
                >
                  ✕
                </button>
              </div>

              {/* INPUT */}
              <input
                value={facilityName}
                onChange={(e) => setFacilityName(e.target.value)}
                placeholder="Facility Name"
                className="w-full border px-3 py-2 rounded-lg text-gray-800"
              />

              {/* BUTTONS */}
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowFacilityModal(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    if (!facilityName) {
                      toast.error("Enter facility name");
                      return;
                    }

                    await toast.promise(
                      createFacility({ name: facilityName }),
                      {
                        loading: "Creating...",
                        success: "Facility created",
                        error: "Failed",
                      },
                    );

                    setFacilityName("");
                    setShowFacilityModal(false);
                    fetchFacilities();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantDashboard;
