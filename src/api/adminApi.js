import axios from "axios";
import { getAuthHeader } from "./tenantApi"; // same helper used in tenantApi

const API_BASE = import.meta.env.VITE_BACKEND_URL+"/api";

/* MONITOR APIs
*/
/* BACKEND HEALTH */
export const getBackendHealth = async () => {
  const res = await axios.get(`${API_BASE}/monitor/health`);
  return res.data;
};


/* FRONTEND HEALTH */
export const getFrontendHealth = async () => {
  const res = await axios.get(`${API_BASE}/monitor/frontend`);
  return res.data;
};


/* TOTAL DEVICES */
export const getDevicesCount = async () => {
  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/monitor/devices-count`,
    config
  );

  return res.data;
};


/* TOTAL TENANTS */
export const getTenantsCount = async () => {
  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/monitor/tenants-count`,
    config
  );

  return res.data;
};


/* SYSTEM STATS (BEST FOR DASHBOARD) */
export const getSystemStats = async () => {
  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/monitor/stats`,
    config
  );

  return res.data;
};

/* DEVICE MANAGEMENT APIs
*/
/* GET ALL DEVICES (SUPER ADMIN) */
export const getAllDevices = async () => {
  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/devices/all`,
    config
  );

  return res.data;
};


/* GET TENANT DEVICES (ADMIN VIEWING TENANT DATA) */
export const getTenantDevices = async () => {
  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/devices`,
    config
  );

  return res.data;
};


/* GET SINGLE DEVICE */
export const getDeviceById = async (deviceId) => {
  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/devices/${deviceId}`,
    config
  );

  return res.data;
};


/* UPDATE DEVICE NAME */
export const updateDevice = async (deviceId, name) => {
  const config = await getAuthHeader();

  const res = await axios.patch(
    `${API_BASE}/devices/${deviceId}`,
    { name },
    config
  );

  return res.data;
};


/* DELETE DEVICE */
export const deleteDevice = async (deviceId) => {
  const config = await getAuthHeader();

  const res = await axios.delete(
    `${API_BASE}/devices/${deviceId}`,
    config
  );

  return res.data;
};

/* USER MANAGEMENT APIs
*/

/* GET ALL USERS (SUPER ADMIN) */
export const getAllUsers = async () => {
  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/users`,
    config
  );

  return res.data;
};


/* GET USERS BY TENANT */
export const getUsersByTenant = async (tenantId) => {
  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/users/tenant/${tenantId}`,
    config
  );

  return res.data;
};


/* UPDATE USER ROLE */
export const updateUserRole = async (uid, role) => {
  const config = await getAuthHeader();

  const res = await axios.patch(
    `${API_BASE}/users/${uid}/role`,
    { role },
    config
  );

  return res.data;
};


/* UPDATE USER EMAIL */
export const updateUserEmail = async (uid, email) => {
  const config = await getAuthHeader();

  const res = await axios.patch(
    `${API_BASE}/users/${uid}/email`,
    { email },
    config
  );

  return res.data;
};


/* DELETE USER */
export const deleteUser = async (uid) => {
  const config = await getAuthHeader();

  const res = await axios.delete(
    `${API_BASE}/users/${uid}`,
    config
  );

  return res.data;
};


/* SET FIREBASE CUSTOM CLAIMS */
export const setUserClaims = async (uid) => {
  const res = await axios.post(
    `${API_BASE}/users/auth/setClaims`,
    { uid }
  );

  return res.data;
};

/*  TENANT MANAGEMENT APIs
*/
/* CREATE TENANT */
export const createTenant = async (name) => {
  const config = await getAuthHeader();

  const res = await axios.post(
    `${API_BASE}/tenants/create`,
    { name },
    config
  );

  return res.data;
};


/* INVITE TENANT ADMIN */
export const inviteTenantAdmin = async (email, tenantId) => {
  const config = await getAuthHeader();

  const res = await axios.post(
    `${API_BASE}/tenants/invite-admin`,
    {
      email,
      tenantId
    },
    config
  );

  return res.data;
};


/* GET ALL TENANTS */
export const getAllTenants = async () => {

  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/tenants`,
    config
  );

  return res.data;

};



/* GET SINGLE TENANT */
export const getTenantById = async (tenantId) => {

  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/tenants/${tenantId}`,
    config
  );

  return res.data;

};

/* UPDATE TENANT */
export const updateTenant = async (
  tenantId,
  updateData
) => {

  const config = await getAuthHeader();

  const res = await axios.patch(
    `${API_BASE}/tenants/${tenantId}`,
    updateData,
    config
  );

  return res.data;

};



/* DELETE TENANT */
export const deleteTenant = async (tenantId) => {

  const config = await getAuthHeader();

  const res = await axios.delete(
    `${API_BASE}/tenants/${tenantId}`,
    config
  );

  return res.data;

};

/* GET TENANT DEVICES */
export const getTenantDevicesRegistered = async (
  tenantId
) => {

  const config = await getAuthHeader();

  const res = await axios.get(
    `${API_BASE}/tenants/${tenantId}/devices`,
    config
  );

  return res.data;

};



/* ASSIGN DEVICE */
export const assignDeviceToTenant = async (
  tenantId,
  deviceId
) => {

  const config = await getAuthHeader();

  const res = await axios.post(
    `${API_BASE}/tenants/${tenantId}/devices/assign`,
    {
      deviceId
    },
    config
  );

  return res.data;

};



/* REMOVE DEVICE */
export const removeDeviceFromTenant = async (
  tenantId,
  deviceId
) => {

  const config = await getAuthHeader();

  const res = await axios.delete(
    `${API_BASE}/tenants/${tenantId}/devices/${deviceId}`,
    config
  );

  return res.data;

};
