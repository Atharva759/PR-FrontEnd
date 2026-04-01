// src/api/facilityApi.js
import axios from "axios";
import { auth } from "../../firebase";
const BASE_URL = import.meta.env.VITE_BACKEND_URL+"/api";

const getToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error("No user logged in");
  return await user.getIdToken();
};

/* CREATE FACILITY */
export const createFacility = async (data) => {
  const token = await getToken();

  const res = await axios.post(`${BASE_URL}/facilities`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

/* GET FACILITIES */
export const getFacilities = async () => {
  const token = await getToken();

  const res = await axios.get(`${BASE_URL}/facilities`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};