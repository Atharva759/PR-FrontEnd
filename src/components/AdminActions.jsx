import React, { useState } from "react";
import { createAdmin } from "../api/userApi";
const AdminActions = () => {
  const [formData, setFormData] = useState({
    role: "",
    tenantId: "",
    email: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "role" && value !== "tenant_admin"
        ? { tenantId: "" }
        : {}),
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.role) newErrors.role = "Role is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (formData.role === "tenant_admin" && !formData.tenantId) {
      newErrors.tenantId = "Tenant ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validate()) return;

  try {
    const payload = {
      email: formData.email,
      password: "Default@123", 
      role: formData.role,
      tenantId: formData.tenantId,
    };

    const res = await createAdmin(payload);

    alert(res.data.message);

    setFormData({
      role: "",
      tenantId: "",
      email: "",
    });
  } catch (err) {
    alert(err.error || "Something went wrong");
  }
};

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-10">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          Create Admin
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Role</option>
              <option value="super_admin">Super Admin</option>
              <option value="tenant_admin">Tenant Admin</option>
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          {/* Tenant ID */}
          {formData.role === "tenant_admin" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tenant ID
              </label>
              <input
                type="text"
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter Tenant ID"
              />
              {errors.tenantId && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.tenantId}
                </p>
              )}
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Create Admin
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminActions;