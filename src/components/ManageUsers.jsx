import { useEffect, useState } from "react";
import { FiEdit, FiTrash, FiCheck, FiX } from "react-icons/fi";

import {
  getAllUsers,
  updateUserRole,
  updateUserEmail,
  deleteUser
} from "../api/adminApi";


const UserRow = ({ user, onEdit, onDelete, onRoleChange, showTenant }) => {

  const roleColor =
    user.role === "tenant_admin"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  const roleLabel =
    user.role === "tenant_admin"
      ? "Tenant Admin"
      : "Super Admin";

  return (
    <tr className="hover:bg-blue-50">

      <td className="p-3 border-b">{user.name || "N/A"}</td>

      <td className="p-3 border-b">{user.email}</td>

      {showTenant && (
        <td className="p-3 border-b">{user.tenantId || "N/A"}</td>
      )}

      <td className="p-3 border-b">

        <div className="flex items-center gap-3">

          {/* ROLE BADGE */}
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColor}`}>
            {roleLabel}
          </span>

          {/* CHANGE ROLE */}
          <select
            value="Change Role"
            onChange={(e) => onRoleChange(user.uid, e.target.value)}
            className="border border-gray-300 p-1 rounded-lg text-sm"
          >
            <option>Change Role</option>
            <option value="tenant_admin">Tenant Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

        </div>

      </td>

      <td className="p-3 border-b">

        <div className="flex gap-2">

          <button
            onClick={() => onEdit(user)}
            className="px-3 py-1 rounded-lg bg-green-500 text-white flex items-center gap-1"
          >
            <FiEdit /> Edit
          </button>

          <button
            onClick={() => onDelete(user.uid)}
            className="px-3 py-1 rounded-lg bg-red-500 text-white flex items-center gap-1"
          >
            <FiTrash /> Delete
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

      {/* VIEW TOGGLE */}

      <div className="flex gap-4">

        <button
          onClick={() => setView("tenant")}
          className={`px-4 py-2 rounded-lg ${
            view === "tenant"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Tenant Admins
        </button>

        <button
          onClick={() => setView("admin")}
          className={`px-4 py-2 rounded-lg ${
            view === "admin"
              ? "bg-blue-600 text-white"
              : "bg-gray-200"
          }`}
        >
          Super Admins
        </button>

      </div>


      {/* EDIT EMAIL MODAL */}

      {editUser && (

        <div className="bg-white border p-4 rounded-xl shadow w-fit">

          <div className="flex gap-2 items-center">

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border p-2 rounded-lg"
            />

            <button
              onClick={handleEmailUpdate}
              className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-1"
            >
              <FiCheck /> Save
            </button>

            <button
              onClick={() => setEditUser(null)}
              className="bg-gray-400 text-white px-3 py-2 rounded-lg flex items-center gap-1"
            >
              <FiX /> Cancel
            </button>

          </div>

        </div>

      )}


      {/* USERS TABLE */}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">

        <table className="w-full border-collapse text-left">

          <thead className="bg-blue-100">

            <tr>

              <th className="p-3 border-b">Name</th>

              <th className="p-3 border-b">Email</th>

              {view === "tenant" && (
                <th className="p-3 border-b">Tenant ID</th>
              )}

              <th className="p-3 border-b">Role</th>

              <th className="p-3 border-b">Actions</th>

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
                  className="p-3 text-center text-gray-500"
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