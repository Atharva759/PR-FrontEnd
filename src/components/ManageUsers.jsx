import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";
import { FiEdit, FiTrash, FiPlus, FiCheck, FiX } from "react-icons/fi";

const UserForm = ({ form, setForm, onSubmit, editId, onCancel }) => (
  <form
    onSubmit={onSubmit}
    className="flex flex-col md:flex-row gap-3 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm"
  >
    <input
      type="text"
      placeholder="Name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
      className="border border-gray-300 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
      required
    />
    <input
      type="email"
      placeholder="Email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
      className="border border-gray-300 p-2 rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
      required
    />
    <select
      value={form.role}
      onChange={(e) => setForm({ ...form, role: e.target.value })}
      className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
    >
      <option value="employee">Employee</option>
      <option value="admin">Admin</option>
    </select>
    <button
      type="submit"
      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer flex items-center gap-2"
    >
      {editId ? (
        <>
          <FiCheck /> Update
        </>
      ) : (
        <>
          <FiPlus /> Add
        </>
      )}
    </button>
    {editId && (
      <button
        type="button"
        onClick={onCancel}
        className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition cursor-pointer flex items-center gap-2"
      >
        <FiX /> Cancel
      </button>
    )}
  </form>
);

const UserRow = ({ user, onEdit, onDelete, onRoleChange }) => (
  <tr className="hover:bg-blue-50">
    <td className="p-3 border-b">{user.name}</td>
    <td className="p-3 border-b">{user.email}</td>
    <td className="p-3 border-b">
      <select
        value={user.role}
        onChange={(e) => onRoleChange(user.id, e.target.value)}
        className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 cursor-pointer"
      >
        <option value="employee">Employee</option>
        <option value="admin">Admin</option>
      </select>
    </td>
    <td className="p-3 border-b whitespace-nowrap">
      <div className="inline-flex gap-2">
        <button
          onClick={() => onEdit(user)}
          className="px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 cursor-pointer flex items-center gap-1"
        >
          <FiEdit /> Edit
        </button>
        <button
          onClick={() => onDelete(user.id)}
          className="px-3 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 cursor-pointer flex items-center gap-1"
        >
          <FiTrash /> Delete
        </button>
      </div>
    </td>
  </tr>
);

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "employee" });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        setUsers(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      },
      (error) => console.error("Error fetching users:", error)
    );

    return () => unsub();
  }, []);

  const resetForm = () => {
    setForm({ name: "", email: "", role: "employee" });
    setEditId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateDoc(doc(db, "users", editId), form);
      } else {
        await addDoc(collection(db, "users"), form);
      }
      resetForm();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateDoc(doc(db, "users", id), { role });
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (user) => {
    setEditId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role });
  };

  return (
    <div className="flex flex-col gap-6">
      <UserForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        editId={editId}
        onCancel={resetForm}
      />

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full border-collapse text-left">
          <thead className="bg-blue-100 rounded-t-2xl">
            <tr>
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Role</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <UserRow
                  key={user.id}
                  user={user}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onRoleChange={handleRoleChange}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4} className="p-3 text-center text-gray-500">
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
