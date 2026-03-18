import axios from "axios";

// ✅ Fix: isLocal check se sahi env var use karo + trailing slash hata do
const isLocal = window.location.hostname === "localhost";
const BASE_URL = (
  isLocal
    ? import.meta.env.VITE_API_URL_LOCAL || "http://localhost:5000"
    : import.meta.env.VITE_API_URL || "https://tasksync-backend.vercel.app"
).replace(/\/$/, "");

const API_URL = `${BASE_URL}/api/auth`;

export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  if (res.data && res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data._id);
    localStorage.setItem("user", JSON.stringify({ name: res.data.name, email: res.data.email }));
  }
  return res.data;
};

export const login = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  const user = res.data.user || res.data;
  const token = res.data.token;

  if (token && user) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", user._id);
    localStorage.setItem("user", JSON.stringify({ name: user.name, email: user.email }));
  }
  return res.data;
};

export const updateProfile = async (newName) => {
  const token = localStorage.getItem("token");
  const res = await axios.put(
    `${API_URL}/update-profile`,
    { name: newName },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (currentUser) {
    currentUser.name = newName;
    localStorage.setItem("user", JSON.stringify(currentUser));
  }
  return res.data;
};