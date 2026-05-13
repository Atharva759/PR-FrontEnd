import { useEffect, useState } from "react";

import {
  FiEdit2,
  FiTrash2,
  FiCheck,
  FiX,
  FiMail,
  FiUser,
} from "react-icons/fi";

import { MdAdminPanelSettings } from "react-icons/md";
import { HiOutlineOfficeBuilding } from "react-icons/hi";

import {
  getAllUsers,
  updateUserRole,
  updateUserEmail,
  deleteUser,
} from "../api/adminApi";

const UserRow = ({
  user,
  onEdit,
  onDelete,
  onRoleChange,
  showTenant,
}) => {
  const isTenant = user.role === "tenant_admin";

  return (
    <tr className="border-b border-blue-100 hover:bg-blue-50 transition-all duration-300">

      {/* USER */}
      <td className="p-4">

        <div className="flex items-center gap-3">

          {/* AVATAR */}
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold shadow-md">

            {user.email?.charAt(0).toUpperCase()}

          </div>

          <div>

            <p className="font-semibold text-gray-800">
              {user.email}
            </p>

            

          </div>

        </div>

      </td>

      {/* TENANT */}
      {showTenant && (
        <td className="p-4">

          <div className="flex items-center gap-2 text-gray-700">

            <HiOutlineOfficeBuilding className="text-blue-500" />

            {user.tenantId || "N/A"}

          </div>

        </td>
      )}

      {/* ROLE */}
      <td className="p-4">

        <div className="flex items-center gap-3 flex-wrap">

          {/* ROLE BADGE */}
          <div
            className={`px-4 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 border
            ${
              isTenant
                ? "bg-blue-100 text-blue-700 border-blue-200"
                : "bg-indigo-100 text-indigo-700 border-indigo-200"
            }`}
          >

            {isTenant ? (
              <FiUser />
            ) : (
              <MdAdminPanelSettings />
            )}

            {isTenant ? "Tenant Admin" : "Super Admin"}

          </div>

          {/* ROLE SELECT */}
          <select
            defaultValue=""
            onChange={(e) =>
              onRoleChange(user.uid, e.target.value)
            }
            className="border border-blue-200 bg-white text-gray-700 px-3 py-2 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
          >
            <option value="" disabled>
              Change Role
            </option>

            <option value="tenant_admin">
              Tenant Admin
            </option>

            <option value="super_admin">
              Super Admin
            </option>

          </select>

        </div>

      </td>

      {/* ACTIONS */}
      <td className="p-4">

        <div className="flex items-center gap-3">

          {/* EDIT */}
          <button
            onClick={() => onEdit(user)}
            className="bg-blue-100 hover:bg-blue-600 text-blue-700 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <FiEdit2 />
            Edit
          </button>

          {/* DELETE */}
          <button
            onClick={() => onDelete(user.uid)}
            className="bg-red-100 hover:bg-red-500 text-red-600 hover:text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-sm cursor-pointer"
          >
            <FiTrash2 />
            Delete
          </button>

        </div>

      </td>

    </tr>
  );
};

const ManageUsers = () => {

  const [users, setUsers] = useState([]);
  const [view, setView] = useState("tenant");

  const [editUser, setEditUser] = useState(null);
  const [email, setEmail] = useState("");

  const loadUsers = async () => {
    try {
      const data = await getAllUsers();
      setUsers(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (uid, role) => {
    try {
      await updateUserRole(uid, role);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (uid) => {
    try {
      await deleteUser(uid);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setEditUser(user);
    setEmail(user.email);
  };

  const handleEmailUpdate = async () => {
    try {
      await updateUserEmail(editUser.uid, email);
      setEditUser(null);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) =>
    view === "tenant"
      ? u.role === "tenant_admin"
      : u.role === "super_admin"
  );

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div>

        <h1 className="text-3xl font-bold text-blue-700">
          User Management
        </h1>

        <p className="text-gray-500 mt-1">
          Manage platform administrators & permissions
        </p>

      </div>

      {/* TOGGLE */}
      <div className="flex bg-blue-50 p-1 rounded-2xl w-fit border border-blue-100">

        <button
          onClick={() => setView("tenant")}
          className={`px-6 py-2 rounded-xl transition-all duration-300 font-medium cursor-pointer
          ${
            view === "tenant"
              ? "bg-blue-600 text-white shadow-md"
              : "text-blue-700 hover:bg-blue-100"
          }`}
        >
          Tenant Admins
        </button>

        <button
          onClick={() => setView("admin")}
          className={`px-6 py-2 rounded-xl transition-all duration-300 font-medium cursor-pointer
          ${
            view === "admin"
              ? "bg-blue-600 text-white shadow-md"
              : "text-blue-700 hover:bg-blue-100"
          }`}
        >
          Super Admins
        </button>

      </div>

      {/* EDIT MODAL */}
      {editUser && (

        <div className="bg-white border border-blue-100 p-5 rounded-2xl shadow-lg w-fit">

          <div className="flex items-center gap-3">

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-blue-200 px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-blue-400"
            />

            <button
              onClick={handleEmailUpdate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <FiCheck />
              Save
            </button>

            <button
              onClick={() => setEditUser(null)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              <FiX />
              Cancel
            </button>

          </div>

        </div>

      )}

      {/* TABLE */}
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-lg">

        <table className="w-full text-left">

          <thead className="bg-blue-50 border-b border-blue-100">

            <tr className="text-blue-800">

              <th className="p-5 font-semibold">User</th>

              {view === "tenant" && (
                <th className="p-5 font-semibold">
                  Tenant
                </th>
              )}

              <th className="p-5 font-semibold">Role</th>

              <th className="p-5 font-semibold">Actions</th>

            </tr>

          </thead>

          <tbody>

            {filteredUsers.length > 0 ? (

              filteredUsers.map((user) => (

                <UserRow
                  key={user.uid}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRoleChange={handleRoleChange}
                  showTenant={view === "tenant"}
                />

              ))

            ) : (

              <tr>

                <td
                  colSpan={view === "tenant" ? 5 : 4}
                  className="p-10 text-center text-gray-500"
                >
                  No users found
                </td>

              </tr>

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default ManageUsers;