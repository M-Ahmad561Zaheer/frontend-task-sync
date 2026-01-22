import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BASE_URL}/api/auth`;

// ✅ Register function (Jo missing tha)
export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  // Registration ke baad bhi agar aap token save karna chahte hain:
  if (res.data && res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data._id);
    localStorage.setItem("user", JSON.stringify(res.data));
  }
  return res.data;
};

// ✅ Login function
export const login = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  if (res.data && res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data._id);
    localStorage.setItem("user", JSON.stringify(res.data));
  }
  return res.data;
};

// ✅ Profile Update Function
export const updateProfile = async (newName) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(
    `${API_URL}/update-profile`, 
    { name: newName }, 
    { 
      headers: { 
        Authorization: `Bearer ${token}` 
      } 
    }
  );
  return res.data;
};