import React, { useState } from "react";
import { createAdmin } from "../api/userApi";

import {
  ShieldCheck,
  Mail,
  Building2,
  UserCog,
  ChevronDown,
} from "lucide-react";

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

    if (
      formData.role === "tenant_admin" &&
      !formData.tenantId
    ) {
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

    <div className=" bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-6 py-10 flex items-center justify-center">

      <div className="w-full max-w-xl bg-white border border-blue-100 shadow-2xl rounded-3xl overflow-hidden">

        {/* TOP HEADER */}

        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-8 py-8 text-white">

          <div className="flex items-center gap-4">

            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg">

              <ShieldCheck className="w-8 h-8" />

            </div>

            <div>

              <h2 className="text-3xl font-bold">
                Create Admin
              </h2>

              <p className="text-blue-100 mt-1">
                Add and manage platform administrators
              </p>

            </div>

          </div>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="p-8 space-y-6"
        >

          {/* ROLE */}

          <div>

            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">

              <UserCog size={16} className="text-blue-600" />

              Select Role

            </label>

            <div className="relative">

              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full appearance-none border border-blue-200 bg-white rounded-2xl px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 shadow-sm"
              >

                <option value="">
                  Select Role
                </option>

                <option value="super_admin">
                  Super Admin
                </option>

                <option value="tenant_admin">
                  Tenant Admin
                </option>

              </select>

              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />

            </div>

            {errors.role && (
              <p className="text-red-500 text-sm mt-2">
                {errors.role}
              </p>
            )}

          </div>

          {/* TENANT ID */}

          {formData.role === "tenant_admin" && (

            <div>

              <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">

                <Building2
                  size={16}
                  className="text-blue-600"
                />

                Tenant ID

              </label>

              <input
                type="text"
                name="tenantId"
                value={formData.tenantId}
                onChange={handleChange}
                placeholder="Enter Tenant ID"
                className="w-full border border-blue-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />

              {errors.tenantId && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.tenantId}
                </p>
              )}

            </div>

          )}

          {/* EMAIL */}

          <div>

            <label className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">

              <Mail size={16} className="text-blue-600" />

              Email Address

            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              className="w-full border border-blue-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />

            {errors.email && (
              <p className="text-red-500 text-sm mt-2">
                {errors.email}
              </p>
            )}

          </div>

         

          {/* SUBMIT */}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:opacity-90 text-white py-3 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-300 cursor-pointer"
          >

            Create Admin

          </button>

        </form>

      </div>

    </div>

  );

};

export default AdminActions;