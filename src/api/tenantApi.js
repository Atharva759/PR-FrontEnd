import axios from "axios";
import { auth } from "../../firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_BASE = import.meta.env.VITE_BACKEND_URL + "/api/devices";

/*
Utility function to get Firebase ID Token
*/
export const getAuthHeader = async () => {
  let user = auth.currentUser;

  if (!user) {
    user = await new Promise((resolve)=>{
      const unsubscribe = onAuthStateChanged(auth,u=>{
        unsubscribe();
        resolve(u);
      });
    });
  }
  if(!user){
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};


/*
REGISTER DEVICE
POST /api/devices/register
Body:
{
  mac,
  name
}
*/
export const registerDevice = async (deviceData) => {
  const config = await getAuthHeader();

  const res = await axios.post(`${API_BASE}/register`, deviceData, config);

  return res.data;
};


/*
GET TENANT DEVICES
GET /api/devices
*/
export const getTenantDevices = async () => {
  const config = await getAuthHeader();

  const res = await axios.get(`${API_BASE}`, config);

  return res.data;
};


/*
GET SINGLE DEVICE
GET /api/devices/:deviceId
*/
export const getDeviceById = async (deviceId) => {
  const config = await getAuthHeader();

  const res = await axios.get(`${API_BASE}/${deviceId}`, config);

  return res.data;
};


/*
UPDATE DEVICE NAME
PATCH /api/devices/:deviceId
Body:
{
  name
}
*/
export const updateDevice = async (deviceId, name) => {
  const config = await getAuthHeader();

  const res = await axios.patch(
    `${API_BASE}/${deviceId}`,
    { name },
    config
  );

  return res.data;
};


/*
DELETE DEVICE
DELETE /api/devices/:deviceId
*/
export const deleteDevice = async (deviceId) => {
  const config = await getAuthHeader();

  const res = await axios.delete(`${API_BASE}/${deviceId}`, config);

  return res.data;
};


/*
GET SENSOR DATA
GET /api/devices/:sensorType/:mac

sensorType = pzem | aqi
mac = device mac address
*/
export const getSensorData = async (sensorType,mac) => {
  const config = await getAuthHeader();
  
  const res = await axios.get(
    `${API_BASE}/${sensorType}/${mac}`,
    config
  );

  return res.data;
};