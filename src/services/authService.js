import axios from "axios";

// ✅ Auto-detect Backend URL (Local vs Live)
const isLocal = window.location.hostname === "localhost";
const BASE_URL = import.meta.env.VITE_API_URL || 
                 (isLocal ? "http://localhost:5000" : "https://tasksync-backend.vercel.app");

const API_URL = `${BASE_URL}/api/auth`;

// ✅ Register function
export const register = async (userData) => {
  const res = await axios.post(`${API_URL}/register`, userData);
  // Backend se token aur user data milte hi save kar lo
  if (res.data && res.data.token) {
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("userId", res.data._id);
    localStorage.setItem("user", JSON.stringify({ name: res.data.name, email: res.data.email }));
  }
  return res.data;
};

// ✅ Login function
export const login = async (userData) => {
  const res = await axios.post(`${API_URL}/login`, userData);
  
  // Destructure safely from res.data or res.data.user
  const user = res.data.user || res.data; 
  const token = res.data.token;

  if (token && user) {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", user._id);
    localStorage.setItem("user", JSON.stringify({ 
      name: user.name, 
      email: user.email 
    }));
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
  
  // Local storage mein user ka naam bhi update kar dein taake UI refresh ho jaye
  const currentUser = JSON.parse(localStorage.getItem("user"));
  if (currentUser) {
    currentUser.name = newName;
    localStorage.setItem("user", JSON.stringify(currentUser));
  }
  
  return res.data;
};