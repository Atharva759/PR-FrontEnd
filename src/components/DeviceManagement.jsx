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
    <div className="bg-white rounded-xl shadow p-6">
      {/* HEADER */}

      <div className="flex justify-between items-center mb-5">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Server className="text-blue-600" />
          Device Management
        </h2>

        <div className="flex items-center border rounded-lg px-2">
          <Search size={16} />

          <input
            placeholder="Search devices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 outline-none"
          />
        </div>
      </div>

      {/* DEVICE LIST */}

      <div className="space-y-3">
        {filteredDevices.length === 0 ? (
          <p className="text-gray-500 text-center">No devices found</p>
        ) : (
          filteredDevices.map((device) => (
            <div
              key={device.deviceId}
              className="flex justify-between items-center border p-4 rounded-lg hover:bg-gray-50"
            >
              {editDevice === device.deviceId ? (
                <div className="flex gap-2 w-full">
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="border p-2 rounded w-full"
                  />

                  <button
                    onClick={handleUpdateDevice}
                    className="bg-blue-600 text-white px-3 py-2 rounded"
                  >
                    <Save size={16} />
                  </button>

                  <button
                    onClick={() => setEditDevice(null)}
                    className="bg-gray-400 text-white px-3 py-2 rounded"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="font-medium">
                      {device.name || "Unnamed Device"}
                    </p>

                    <p className="text-sm text-gray-500">MAC: {device.mac}</p>

                    {device.tenantId && (
                      <p className="text-xs text-gray-400">
                        Tenant: {device.tenantId}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDevice(device.deviceId)}
                      className="bg-blue-600 text-white px-3 py-2 rounded"
                    >
                      View
                    </button>

                    <button
                      onClick={() => {
                        setEditDevice(device.deviceId);
                        setEditName(device.name);
                      }}
                      className="bg-yellow-500 text-white px-3 py-2 rounded"
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      onClick={() => handleDeleteDevice(device.deviceId)}
                      className="bg-red-500 text-white px-3 py-2 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* DEVICE DETAILS MODAL */}

      {selectedDevice && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl w-[450px]">
            <h3 className="text-lg font-semibold mb-3">Device Details</h3>

            <div className="space-y-2">
              <p>
                <b>Name:</b> {selectedDevice.name}
              </p>

              <p>
                <b>Device ID:</b> {selectedDevice.deviceId}
              </p>

              <p>
                <b>MAC:</b> {selectedDevice.mac}
              </p>

              <p>
                <b>Tenant:</b> {selectedDevice.tenantId || "Unassigned"}
              </p>
            </div>

            <div className="flex justify-end mt-4">
              <button
                onClick={() => setSelectedDevice(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeviceManagement;
