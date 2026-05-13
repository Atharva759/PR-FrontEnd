import { useState, useEffect } from "react";

import {
  Plus,
  Trash2,
  Edit,
  Save,
  X,
  Building,
  CalendarDays,
} from "lucide-react";

import {
  createTenant,
  getAllTenants,
  updateTenant,
  deleteTenant,
} from "../api/adminApi";
import { FaCopy, FaCheck } from "react-icons/fa";

const TenantManagement = () => {
  const [tenants, setTenants] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);

  const [tenantName, setTenantName] = useState("");

  const [editTenant, setEditTenant] = useState(null);
  const [editName, setEditName] = useState("");

  const [loading, setLoading] = useState(false);

  const [copiedId, setCopiedId] = useState(null);

  

  const handleCopyTenantId = async (tenantId) => {
    try {
      await navigator.clipboard.writeText(tenantId);

      setCopiedId(tenantId);

      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };
  /* LOAD TENANTS*/

  const loadTenants = async () => {
    try {
      setLoading(true);

      const res = await getAllTenants();

      setTenants(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, []);

  /*CREATE TENANT */

  const handleCreateTenant = async () => {
    if (!tenantName.trim()) {
      return alert("Enter tenant name");
    }

    try {
      const res = await createTenant(tenantName);
      setTenants((prev) => [...prev, res.data]);
      setTenantName("");
      setShowCreateModal(false);
    } catch (err) {
      console.error(err);

      alert("Failed to create tenant");
    }
  };

  /*UPDATE TENANT*/

  const handleUpdateTenant = async () => {
    try {
      await updateTenant(editTenant, {
        name: editName,
      });

      setTenants((prev) =>
        prev.map((tenant) =>
          tenant.id === editTenant
            ? {
                ...tenant,
                name: editName,
              }
            : tenant,
        ),
      );

      setEditTenant(null);

      setEditName("");
    } catch (err) {
      console.error(err);

      alert("Failed to update tenant");
    }
  };

  /*DELETE TENANT*/

  const handleDeleteTenant = async (tenantId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this tenant?",
    );

    if (!confirmDelete) return;

    try {
      await deleteTenant(tenantId);

      setTenants((prev) => prev.filter((tenant) => tenant.id !== tenantId));
    } catch (err) {
      console.error(err);

      alert("Failed to delete tenant");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="bg-white border border-blue-100 rounded-3xl shadow-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <Building className="w-7 h-7 text-white" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Tenant Management
                </h1>

                <p className="text-slate-500 mt-1">
                  Create, edit and manage tenants
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition-all duration-300 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-lg cursor-pointer font-medium"
          >
            <Plus size={18} />
            Create Tenant
          </button>
        </div>

        {/* TENANT LIST */}

        <div className="bg-white rounded-3xl shadow-lg border border-blue-100 p-6">
          {/* TOP BAR */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">
                Existing Tenants
              </h2>

              <p className="text-slate-500 mt-1 text-sm">
                Manage all platform tenants
              </p>
            </div>

            

              {/* COUNT */}

              <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm whitespace-nowrap">
                {tenants.length} Tenants
              </div>
            
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>

              <p className="text-slate-500 mt-4">Loading tenants...</p>
            </div>
          ) : tenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Building className="w-14 h-14 mb-3 text-slate-300" />

              <p className="text-lg font-medium">No tenants found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {tenants.map((tenant) => (
                <div
                  key={tenant.id}
                  className="group bg-gradient-to-br from-white to-blue-50 border border-blue-100 rounded-3xl p-6 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                >
                  {editTenant === tenant.id ? (
                    <div className="space-y-5">
                      <div>
                        <label className="text-sm font-medium text-slate-600 mb-2 block">
                          Tenant Name
                        </label>

                        <input
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-blue-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleUpdateTenant}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
                        >
                          <Save size={16} />
                          Save
                        </button>

                        <button
                          onClick={() => {
                            setEditTenant(null);
                            setEditName("");
                          }}
                          className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-3 rounded-2xl flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* TOP */}

                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-4">
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-md">
                            <Building className="text-white w-6 h-6" />
                          </div>

                          <div>
                            <h3 className="text-2xl font-bold text-slate-800">
                              {tenant.name}
                            </h3>

                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <div className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-medium">
                                ID: {tenant.id}
                              </div>

                              <button
                                onClick={() => handleCopyTenantId(tenant.id)}
                                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs transition-all cursor-pointer
                              ${
                                copiedId === tenant.id
                                  ? "bg-green-100 text-green-700"
                                  : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                              }`}
                              >
                                {copiedId === tenant.id ? (
                                  <>
                                    <FaCheck size={11} />
                                    Copied
                                  </>
                                ) : (
                                  <>
                                    <FaCopy size={11} />
                                    Copy ID
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditTenant(tenant.id);
                              setEditName(tenant.name);
                            }}
                            className="bg-amber-100 hover:bg-amber-500 text-amber-600 hover:text-white p-3 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm"
                          >
                            <Edit size={17} />
                          </button>

                          <button
                            onClick={() => handleDeleteTenant(tenant.id)}
                            className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white p-3 rounded-2xl transition-all duration-300 cursor-pointer shadow-sm"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>

                      {/* CREATED */}

                      <div className="mt-6 bg-white border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                          <CalendarDays size={18} className="text-blue-600" />
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 font-medium">
                            Created At
                          </p>

                          <p className="text-sm font-semibold text-slate-700">
                            {tenant.createdAt
                              ? new Date(tenant.createdAt).toLocaleString()
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* SENSORS */}

                      <div className="mt-5">
                        <p className="text-sm font-semibold text-slate-600 mb-3">
                          Active Sensors
                        </p>

                        <div className="flex gap-3 flex-wrap">
                          {tenant?.aqi && (
                            <span className="bg-cyan-100 text-cyan-700 text-sm px-4 py-2 rounded-full font-medium shadow-sm">
                              🌫 AQI Sensor
                            </span>
                          )}

                          {tenant?.pzem && (
                            <span className="bg-purple-100 text-purple-700 text-sm px-4 py-2 rounded-full font-medium shadow-sm">
                              ⚡ PZEM Sensor
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CREATE MODAL */}

        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-3xl p-7 w-[450px] shadow-2xl border border-blue-100 animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                  <Plus className="text-white w-6 h-6" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Create Tenant
                  </h2>

                  <p className="text-slate-500 text-sm">
                    Add a new tenant to the platform
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-600 mb-2 block">
                  Tenant Name
                </label>

                <input
                  type="text"
                  placeholder="Enter tenant name"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  className="w-full border border-blue-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-7">
                <button
                  onClick={handleCreateTenant}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white px-5 py-3 rounded-2xl font-medium transition-all cursor-pointer shadow-md"
                >
                  Create Tenant
                </button>

                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setTenantName("");
                  }}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-3 rounded-2xl font-medium transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TenantManagement;
