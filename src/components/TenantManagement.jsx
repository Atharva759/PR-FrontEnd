import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, Building, Server } from "lucide-react";

import {
  createTenant,
  inviteTenantAdmin,
  updateTenant,
  deleteTenant,
  
  getTenantDevicesRegistered,
  assignDeviceToTenant,
  removeDeviceFromTenant
} from "../api/adminApi";

import TenantDevices from "./TenantDevices";

const TenantManagement = () => {

  const [tenants, setTenants] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDevicesModal, setShowDevicesModal] = useState(false);

  const [selectedTenant, setSelectedTenant] = useState(null);

  const [tenantName, setTenantName] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [editTenant, setEditTenant] = useState(null);
  const [editName, setEditName] = useState("");

  const [tenantDevices, setTenantDevices] = useState([]);
  const [newDeviceId, setNewDeviceId] = useState("");



  /* LOAD TENANTS */

  const loadTenants = async () => {
    try {

      const data = await getAllTenants();
      setTenants(data || []);

    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);



  /* CREATE TENANT */

  const handleCreateTenant = async () => {

    if (!tenantName) return alert("Enter tenant name");

    try {

      const res = await createTenant(tenantName);
      const tenant = res.tenant;

      setTenants([...tenants, tenant]);

      if (adminEmail) {
        await inviteTenantAdmin(adminEmail, tenant.id);
      }

      setTenantName("");
      setAdminEmail("");
      setShowCreateModal(false);

    } catch (err) {

      console.error(err);
      alert("Failed to create tenant");

    }

  };



  /* UPDATE TENANT */

  const handleUpdateTenant = async () => {

    try {

      await updateTenant(editTenant, editName);

      setTenants((prev) =>
        prev.map((t) =>
          t.id === editTenant ? { ...t, name: editName } : t
        )
      );

      setEditTenant(null);

    } catch (err) {
      console.error(err);
    }

  };



  /* DELETE TENANT */

  const handleDeleteTenant = async (tenantId) => {

    if (!window.confirm("Delete tenant?")) return;

    try {

      await deleteTenant(tenantId);

      setTenants((prev) =>
        prev.filter((t) => t.id !== tenantId)
      );

    } catch (err) {
      console.error(err);
    }

  };



  /* OPEN DEVICES MODAL */

  const openDevices = async (tenantId) => {

    try {

      const devices = await getTenantDevicesRegistered(tenantId);

      setTenantDevices(devices);
      setSelectedTenant(tenantId);
      setShowDevicesModal(true);

    } catch (err) {

      console.error(err);

    }

  };



  /* ASSIGN DEVICE */

  const handleAssignDevice = async () => {

    if (!newDeviceId) return;

    try {

      await assignDeviceToTenant(selectedTenant, newDeviceId);

      const updated = await getTenantDevicesRegistered(selectedTenant);

      setTenantDevices(updated);
      setNewDeviceId("");

    } catch (err) {

      console.error(err);

    }

  };



  /* REMOVE DEVICE */

  const handleRemoveDevice = async (deviceId) => {

    try {

      await removeDeviceFromTenant(deviceId);

      const updated = await getTenantDevicesRegistered(selectedTenant);

      setTenantDevices(updated);

    } catch (err) {

      console.error(err);

    }

  };



  return (

    <div className="min-h-screen bg-gray-50 p-6">

      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="bg-white rounded-xl shadow p-6 mb-6 flex justify-between items-center">

          <div>

            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Building className="w-7 h-7 text-blue-600"/>
              Tenant Management
            </h1>

            <p className="text-gray-500 mt-1">
              Manage tenants and their devices
            </p>

          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18}/> Create Tenant
          </button>

        </div>



        {/* TENANT LIST */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold mb-4">
            Existing Tenants
          </h2>

          {tenants.length === 0 ? (

            <p className="text-gray-500 text-center">
              No tenants created yet
            </p>

          ) : (

            <div className="space-y-3">

              {tenants.map((tenant) => (

                <div
                  key={tenant.id}
                  className="flex justify-between items-center border p-4 rounded-lg"
                >

                  {editTenant === tenant.id ? (

                    <div className="flex gap-2 w-full">

                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="border p-2 rounded-lg w-full"
                      />

                      <button
                        onClick={handleUpdateTenant}
                        className="bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        <Save size={16}/>
                      </button>

                      <button
                        onClick={() => setEditTenant(null)}
                        className="bg-gray-400 text-white px-3 py-2 rounded"
                      >
                        <X size={16}/>
                      </button>

                    </div>

                  ) : (

                    <>

                      <span className="font-medium">
                        {tenant.name}
                      </span>

                      <div className="flex gap-2">

                        <button
                          onClick={() => {
                            setEditTenant(tenant.id);
                            setEditName(tenant.name);
                          }}
                          className="bg-yellow-500 text-white px-3 py-2 rounded"
                        >
                          <Edit size={16}/>
                        </button>

                        <button
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="bg-red-500 text-white px-3 py-2 rounded"
                        >
                          <Trash2 size={16}/>
                        </button>

                        <button
                          onClick={() => openDevices(tenant.id)}
                          className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-1"
                        >
                          <Server size={16}/> Devices
                        </button>

                      </div>

                    </>

                  )}

                </div>

              ))}

            </div>

          )}

        </div>



        {/* CREATE TENANT MODAL */}

        {showCreateModal && (

          <div className="fixed inset-0 bg-black/30 flex items-center justify-center">

            <div className="bg-white p-6 rounded-xl w-[450px]">

              <h2 className="text-xl font-semibold mb-4">
                Create New Tenant
              </h2>

              <div className="space-y-3">

                <input
                  type="text"
                  placeholder="Tenant Name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="border p-2 rounded-lg w-full"
                />

                <input
                  type="email"
                  placeholder="Invite Admin Email (optional)"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="border p-2 rounded-lg w-full"
                />

              </div>

              <div className="flex gap-3 mt-5">

                <button
                  onClick={handleCreateTenant}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                >
                  Create
                </button>

                <button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>

        )}



        {/* DEVICES MODAL */}

        {showDevicesModal && (

          <TenantDevices
            tenantId={selectedTenant}
            devices={tenantDevices}
            newDeviceId={newDeviceId}
            setNewDeviceId={setNewDeviceId}
            onAssignDevice={handleAssignDevice}
            onRemoveDevice={handleRemoveDevice}
            onClose={() => setShowDevicesModal(false)}
          />

        )}

      </div>

    </div>

  );

};

export default TenantManagement;