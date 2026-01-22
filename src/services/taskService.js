import axios from "axios";

// ✅ Sahi Backend URL yahan set kar diya hai
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://task-sync-backend-weld.vercel.app",
});

// Axios instance with token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Task APIs
export const getTasks = (params = {}) => api.get("/api/tasks", { params });

// ✅ Shared Tasks List
export const getSharedTasks = () => api.get("/api/tasks/shared/list"); 

export const createTask = (task) => api.post("/api/tasks", task);
export const updateTask = (id, task) => api.put(`/api/tasks/${id}`, task);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);

// ✅ Share Task via Email
export const shareTask = (id, email) =>
  api.put(`/api/tasks/${id}/share`, { email }); 
  
// ✅ Attachments Upload
export const uploadAttachments = (id, files) => {
  const form = new FormData();
  // Files ko array form mein handle karne ke liye
  Array.from(files).forEach((f) => form.append("files", f));
  return api.post(`/api/tasks/${id}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;