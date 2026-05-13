import { useEffect, useState } from "react";
import {
  getAllDevices,
  getTenantDevices,
  getDeviceById,
  updateDevice,
  deleteDevice,
} from "../api/adminApi";
import { useNavigate } from "react-router";

import { Server, Trash2, Edit, Save, X, Search } from "lucide-react";

const DeviceManagement = ({ role }) => {
  const navigate = useNavigate();

  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState([]);

  const [search, setSearch] = useState("");

  const [editDevice, setEditDevice] = useState(null);
  const [editName, setEditName] = useState("");

  const [selectedDevice, setSelectedDevice] = useState(null);

  /* LOAD DEVICES */

  const loadDevices = async () => {
    try {
      let data;

      if (role === "super_admin") {
        data = await getAllDevices();
      } else {
        data = await getTenantDevices();
      }

      setDevices(data || []);
      setFilteredDevices(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  /* SEARCH DEVICES */

  useEffect(() => {
    const filtered = devices.filter(
      (d) =>
        d.name?.toLowerCase().includes(search.toLowerCase()) ||
        d.mac?.toLowerCase().includes(search.toLowerCase()) ||
        d.deviceId?.toLowerCase().includes(search.toLowerCase()),
    );

    setFilteredDevices(filtered);
  }, [search, devices]);

  /* VIEW DEVICE DETAILS */

  const handleViewDevice = async (deviceId) => {
    navigate(`/device/${deviceId}`);
  };

  /* UPDATE DEVICE */

  const handleUpdateDevice = async () => {
    try {
      await updateDevice(editDevice, editName);
      setDevices((prev) =>
        prev.map((d) =>
          d.deviceId === editDevice ? { ...d, name: editName } : d,
        ),
      );

      setEditDevice(null);
    } catch (err) {
      console.error(err);
    }
  };

  /* DELETE DEVICE */

  const handleDeleteDevice = async (deviceId) => {
    if (!window.confirm("Delete this device?")) return;

    try {
      await deleteDevice(deviceId);

      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="bg-white rounded-3xl border border-blue-100 shadow-xl p-6">
        {/* HEADER */}

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg">
              <Server className="text-white w-7 h-7" />
            </div>

            <div>
              <h2 className="text-3xl font-bold text-slate-800">
                Device Management
              </h2>

              <p className="text-slate-500 mt-1">
                Monitor and manage all connected devices
              </p>
            </div>
          </div>

          {/* SEARCH */}

          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              placeholder="Search devices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-[300px] border border-blue-200 bg-white rounded-2xl pl-11 pr-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>

        {/* DEVICE COUNT */}

        <div className="flex items-center justify-between mb-6">
          <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
            {filteredDevices.length} Devices
          </div>
        </div>

        {/* DEVICE LIST */}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredDevices.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500">
              <Server className="w-16 h-16 text-slate-300 mb-4" />

              <p className="text-lg font-medium">No devices found</p>
            </div>
          ) : (
            filteredDevices.map((device) => (
              <div
                key={device.deviceId}
                className="group bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-3xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              >
                {editDevice === device.deviceId ? (
                  <div className="space-y-5">
                    <div>
                      <label className="text-sm font-medium text-slate-600 mb-2 block">
                        Device Name
                      </label>

                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full border border-blue-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleUpdateDevice}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-md cursor-pointer"
                      >
                        <Save size={16} />
                        Save
                      </button>

                      <button
                        onClick={() => setEditDevice(null)}
                        className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <X size={16} />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* TOP SECTION */}

                    <div className="flex justify-between items-start gap-4">
                      <div className="flex items-start gap-4">
                        {/* ICON */}

                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                          <Server className="text-white w-6 h-6" />
                        </div>

                        {/* INFO */}

                        <div>
                          <h3 className="text-2xl font-bold text-slate-800">
                            {device.name || "Unnamed Device"}
                          </h3>

                          <div className="flex flex-col gap-1 mt-2">
                            

                            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium w-fit">
                              MAC ID: {device.mac}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ACTIONS */}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDevice(device.deviceId)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-2xl text-sm font-medium transition-all shadow-md cursor-pointer"
                        >
                          View
                        </button>

                        <button
                          onClick={() => {
                            setEditDevice(device.deviceId);
                            setEditName(device.name);
                          }}
                          className="bg-amber-100 hover:bg-amber-500 text-amber-600 hover:text-white p-3 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          onClick={() => handleDeleteDevice(device.deviceId)}
                          className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white p-3 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </div>

                    {/* TENANT INFO */}

                    <div className="mt-6 bg-white border border-blue-100 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <Server size={18} className="text-blue-600" />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 font-medium">
                            Assigned Tenant
                          </p>

                          <p className="text-sm font-semibold text-slate-700">
                            {device.tenantId || "Unassigned"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* DEVICE DETAILS MODAL */}

        {selectedDevice && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-7 w-[500px] shadow-2xl border border-blue-100">
              {/* MODAL HEADER */}

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Server className="text-white w-6 h-6" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-800">
                    Device Details
                  </h3>

                  <p className="text-slate-500 text-sm">
                    Detailed information about this device
                  </p>
                </div>
              </div>

              {/* DETAILS */}

              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 font-medium">
                    Device Name
                  </p>

                  <p className="text-lg font-semibold text-slate-800 mt-1">
                    {selectedDevice.name}
                  </p>
                </div>

                <div className="bg-white border border-blue-100 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 font-medium">
                    Device ID
                  </p>

                  <p className="text-sm font-semibold text-slate-700 mt-1 break-all">
                    {selectedDevice.deviceId}
                  </p>
                </div>

                <div className="bg-white border border-blue-100 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 font-medium">
                    MAC Address
                  </p>

                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {selectedDevice.mac}
                  </p>
                </div>

                <div className="bg-white border border-blue-100 rounded-2xl p-4">
                  <p className="text-xs text-slate-500 font-medium">
                    Assigned Tenant
                  </p>

                  <p className="text-sm font-semibold text-slate-700 mt-1">
                    {selectedDevice.tenantId || "Unassigned"}
                  </p>
                </div>
              </div>

              {/* CLOSE */}

              <div className="flex justify-end mt-7">
                <button
                  onClick={() => setSelectedDevice(null)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-3 rounded-2xl font-medium transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeviceManagement;
