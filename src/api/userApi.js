import axios from "axios";
import { auth } from "../../firebase";

const API_BASE = import.meta.env.VITE_BACKEND_URL + "/api/users";

const getAuthHeader = async () => {
  const user = auth.currentUser;
  const token = await user.getIdToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};


/* GET USERS BY TENANT */
export const getTenantUsers = async (tenantId) => {

  const config = await getAuthHeader();

  const res = await axios.get(`${API_BASE}/tenant/${tenantId}`, config);

  return res.data;
};


/* UPDATE ROLE */
export const updateUserRole = async (uid, role) => {

  const config = await getAuthHeader();

  const res = await axios.patch(
    `${API_BASE}/${uid}/role`,
    { role },
    config
  );

  return res.data;
};


/* UPDATE EMAIL */
export const updateUserEmail = async (uid, email) => {

  const config = await getAuthHeader();

  const res = await axios.patch(
    `${API_BASE}/${uid}/email`,
    { email },
    config
  );

  return res.data;
};


/* DELETE USER */
export const deleteUser = async (uid) => {

  const config = await getAuthHeader();

  const res = await axios.delete(`${API_BASE}/${uid}`, config);

  return res.data;
};

// create admin 
export const createAdmin = async (data) => {
  try {
    if (data.role === "super_admin") {
      return await axios.post(`${API_BASE}/create-super-admin`, data);
    } else {
      return await axios.post(`${API_BASE}/create-tenant-admin`, data);
    }
  } catch (error) {
    throw error.response?.data || error.message;
  }
};