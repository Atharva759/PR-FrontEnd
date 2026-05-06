import { useState, useEffect } from "react";
import { TbLogout } from "react-icons/tb";
import { FaPlus, FaTrash, FaEdit, FaChartLine } from "react-icons/fa";
import { TbDeviceHeartMonitorFilled } from "react-icons/tb";
import {
  FcElectronics,
  FcBusinessman,
  FcOrganization,
  FcConferenceCall,
  FcFactory,
  FcEngineering ,
} from "react-icons/fc";

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
  createAdmin,
} from "../api/userApi";

import { getFacilities, createFacility } from "../api/facilityApi";

const TenantDashboard = () => {
  const navigate = useNavigate();
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "",
  });

  const [role, setRole] = useState("");

  /* VIEW SWITCH */
  const [activeView, setActiveView] = useState("users");

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
      const currentUserEmail = auth.currentUser.email;
      const loggedInUser = data.find((user) => user.email == currentUserEmail);
      const role = loggedInUser.role;
      setRole(role);

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

  /*  ADD NEW USER  */
  const handleCreateUser = async () => {
    if (!newUser.email) {
      toast.error("Email is required");
      return;
    }

    try {
      const tenantId = localStorage.getItem("tenantId");

      await toast.promise(
        createAdmin({
          email: newUser.email,
          password: "temp@123",
          role: newUser.role,
          tenantId,
        }),
        {
          loading: "Creating user...",
          success: "User created successfully",
          error: (err) => err.message || "Failed to create user",
        },
      );

      setShowAddUser(false);
      setNewUser({ email: "", password: "" });

      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDoorLock = () => {

  }

  return (
    <div className="min-h-screen flex overflow-x-hidden">
      {/* MOBILE TOP BAR */}
      <div className="md:hidden flex items-center justify-between p-4 bg-blue-600 text-white">
        <img
          className="w-8 h-8 bg-white rounded-xl p-1"
          src={logo}
          alt="logo"
        />
        <h2 className="font-bold">Enerlytics Cloud</h2>
        <button className="btn-primary" onClick={() => setIsSidebarOpen(true)}>
          ☰
        </button>
      </div>

      {/* SIDEBAR */}
      <div className="w-0 md:w-72 flex-shrink-0">
        <div
          className={`
          fixed md:relative top-0 left-0 h-screen z-50
          w-72 text-white
           shadow-2xl p-8 flex flex-col justify-between
          transform transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
          `}
          style={{
            background: `
    radial-gradient(ellipse at 60% 30%, rgba(30,136,229,0.25), transparent 60%),
    radial-gradient(ellipse at 25% 75%, rgba(126,87,194,0.3), transparent 55%),
    #111827
  `,
          }}
        >
          <div>
            {/* MOBILE CLOSE */}
            <div className="flex justify-between items-center mb-6 md:hidden">
              <h2 className="font-bold">Menu</h2>
              <button
                className="btn-primary"
                onClick={() => setIsSidebarOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* LOGO */}
            <div
              className="flex items-center gap-3 px-4 py-3 mb-10
  backdrop-blur-md bg-white/10
  border border-white/20
  shadow-md rounded-2xl
  hover:bg-white/20 transition-all duration-300"
            >
              <img className="w-10 h-10 rounded-xl p-1" src={logo} alt="logo" />
              <h2 className="text-xl font-bold">Enerlytics Cloud</h2>
            </div>

            {/* NAV */}
            <nav className="flex flex-col gap-4">

              <button
                onClick={() => {
                  setActiveView("devices");
                  setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                  activeView === "devices" ? "btn-primary" : "hover:bg-white/20"
                  }`}
                  >
                <FcElectronics className="text-2xl" /> Manage Devices
              </button>
                {role === "tenant_admin" && (
                  <>
                    <button
                      onClick={() => {
                        setActiveView("users");
                        setIsSidebarOpen(false);
                      }}
                      className={` flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        activeView === "users"
                          ? "btn-primary"
                          : "hover:bg-white/20"
                      }`}
                    >
                      <FcConferenceCall className="text-2xl" /> Manage Tenant
                      Users
                    </button>
  
                    <button
                      onClick={() => {
                        setActiveView("facilities");
                        setIsSidebarOpen(false);
                      }}
                      className={` flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        activeView === "facilities"
                          ? "btn-primary"
                          : "hover:bg-white/20"
                      }`}
                    >
                      <FcFactory className="text-2xl" /> Manage Facilities
                    </button>
{/**

 
                    <button
                      onClick={handleDoorLock()}
                      className={` flex items-center gap-3 p-3 rounded-lg cursor-pointer ${
                        activeView === "facilities"
                          ? "btn-primary"
                          : "hover:bg-white/20"
                      }`}
                    >
                      <FcEngineering className="text-2xl" /> Facility Actions
                    </button>
*/}
                  </>
                )}
            </nav>
          </div>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="btn-primary flex items-center justify-center gap-2 p-3 bg-white rounded-full font-semibold cursor-pointer"
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
      <div
        className=" flex-1 p-4 md:p-6 text-white shadow-2xl"
        style={{
          background: `
    radial-gradient(ellipse at top, rgba(30,136,229,0.25), transparent 60%),
    radial-gradient(ellipse at bottom, rgba(126,87,194,0.3), transparent 55%),
    #0d1321
  `,
        }}
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Tenant Dashboard</h1>
          <p>Manage your registered devices and tenant users.</p>
        </div>

        {/* DEVICES VIEW */}
        {activeView === "devices" && (
          <div className="bg-white backdrop-blur-lg p-5 md:p-8 rounded-3xl shadow-2xl border border-gray-100 h-[680px] overflow-y-auto transition-all">
            {/* HEADER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <h2 className="text-xl font-bold text-gray-800">
                Registered Devices
              </h2>

              <div className="flex gap-3 items-center">
                {/* ADD DEVICE */}
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-full shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
                  className=" bg-white p-5 rounded-xl border border-blue-100 hover:shadow-lg hover:border-blue-300 transition duration-200 cursor-pointer"
                >
                  {/* DEVICE HEADER */}
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-tr from-blue-100 to-blue-50 rounded-xl group-hover:scale-110 transition">
                      <FcElectronics className="text-blue-600 text-5xl" />
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
                  <div className="flex gap-3 mt-5">
                    {/* VIEW */}
                    <button
                      onClick={() => viewData(device)}
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl 
    bg-gradient-to-r from-green-400 to-green-500 text-white 
    shadow-md hover:shadow-lg hover:scale-105 active:scale-95 
    transition-all duration-200 cursor-pointer"
                    >
                      <FaChartLine className="text-xs" />
                      View
                    </button>

                    {/* EDIT */}
                    <button
                      onClick={() => handleEditDevice(device)}
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl 
    bg-gradient-to-r from-blue-500 to-indigo-500 text-white 
    shadow-md hover:shadow-lg hover:scale-105 active:scale-95 
    transition-all duration-200 cursor-pointer"
                    >
                      <FaEdit className="text-xs" />
                      Edit
                    </button>

                    {/* DELETE */}
                    <button
                      onClick={() => handleDeleteDevice(device.id)}
                      className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl 
    bg-gradient-to-r from-red-500 to-pink-500 text-white 
    shadow-md hover:shadow-lg hover:scale-105 active:scale-95 
    transition-all duration-200 cursor-pointer"
                    >
                      <FaTrash className="text-xs" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showAddUser && (
          <div className="bg-gray-50 p-4 rounded-xl mb-4 border">
            <h3 className="text-md font-semibold mb-3 text-gray-700">
              Create Tenant Admin
            </h3>

            <div className="flex gap-3 flex-wrap text-black">
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser({ ...newUser, email: e.target.value })
                }
                className="border px-3 py-2 rounded-lg text-sm "
              />
              <select
                value={newUser.role || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                className="border px-3 py-2 rounded-lg text-sm bg-white"
              >
                <option value="">Select Role</option>
                <option value="tenant_admin">Tenant Admin</option>
                <option value="facility_admin">Facility Admin</option>
              </select>

              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                className="border px-3 py-2 rounded-lg text-sm hidden"
              />

              <button
                onClick={handleCreateUser}
                className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm cursor-pointer"
              >
                Create
              </button>

              <button
                onClick={() => setShowAddUser(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* USERS VIEW */}
        {activeView === "users" && (
          <div className="bg-white p-4 md:p-6 rounded-2xl shadow-xl border h-[680px] overflow-auto">
            <h2 className="text-xl text-gray-800 font-semibold mb-6">
              Tenant Users
            </h2>
            <div className="justify-end flex mr-4">
              <button
                onClick={() => setShowAddUser(true)}
                className="btn-primary px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 cursor-pointer"
              >
                + Add User
              </button>
            </div>

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
                      user.role === "super_admin"
                        ? "bg-red-100 text-red-600"
                        : user.role === "tenant_admin"
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
                              <FcBusinessman className="text-blue-600 text-lg" />
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
                              onClick={() => handleDeleteUser(user.uid)}
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
          <div className="bg-white p-4 md:p-8 rounded-2xl shadow-xl border h-[680px] overflow-y-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl text-gray-800 font-semibold">
                Facilities
              </h2>

              <button
                onClick={() => setShowFacilityModal(true)}
                className="btn-primary flex items-center gap-2 px-5 py-2  text-white rounded-full shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition cursor-pointer"
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
                      <FcOrganization className="text-4xl" />
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
                      className="btn-primary px-3 py-1.5 text-sm font-medium text-white bg-blue-50 rounded-md transition cursor-pointer"
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
                        className="btn-primary px-3 py-1.5 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg text-white transition cursor-pointer"
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
                  className="btn-primary px-4 py-2.5 rounded-lg text-white  transition cursor-pointer"
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
                  className="text-gray-500 hover:text-red-500 cursor-pointer"
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
                  className="btn-primary px-4 py-2 bg-blue-600 text-white rounded-lg"
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
