import axios from "axios";

// ✅ Fix: isLocal check se sahi env var use karo + trailing slash hata do
const isLocal = window.location.hostname === "localhost";
const BASE_URL = (
  isLocal
    ? import.meta.env.VITE_API_URL_LOCAL || "http://localhost:5000"
    : import.meta.env.VITE_API_URL || "https://tasksync-backend.vercel.app"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
}, (error) => Promise.reject(error));

export const getTasks = (params = {}) => api.get("/api/tasks", { params });
export const getSharedTasks = () => api.get("/api/tasks/shared/list");
export const createTask = (task) => api.post("/api/tasks", task);
export const updateTask = (id, task) => api.put(`/api/tasks/${id}`, task);

// ✅ Alag endpoint - owner + shared user dono use kar sakte hain
export const updateStatus = (id, status) => api.put(`/api/tasks/${id}/status`, { status });
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);
export const shareTask = (id, email) => api.put(`/api/tasks/${id}/share`, { email });

export default api;