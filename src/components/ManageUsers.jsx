import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../../firebase";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", role: "employee" });

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

  const addUser = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "users"), form);
      setForm({ name: "", email: "", role: "employee" });
    } catch (err) {
      console.error(err);
    }
  };

  const changeRole = async (id, role) => {
    try {
      const ref = doc(db, "users", id);
      await updateDoc(ref, { role });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={addUser}
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
          className="border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="employee">Employee</option>
          <option value="admin">Admin</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
        >
          Add
        </button>
      </form>
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
              users.map((u) => (
                <tr key={u.id} className="hover:bg-blue-50">
                  <td className="p-3 border-b">{u.name}</td>
                  <td className="p-3 border-b">{u.email}</td>
                  <td className="p-3 border-b">{u.role}</td>
                  <td className="p-3 border-b flex gap-2">
                    {["employee", "admin"].map((r) => (
                      <button
                        key={r}
                        onClick={() => changeRole(u.id, r)}
                        className={`px-3 py-1 rounded-lg cursor-pointer ${
                          u.role === r
                            ? r === "admin"
                              ? "bg-red-600 text-white"
                              : "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </td>
                </tr>
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
