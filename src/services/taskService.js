import axios from "axios";

// ✅ Base URL configuration
const BASE_URL = import.meta.env.VITE_API_URL || "https://task-sync-backend-weld.vercel.app";

const api = axios.create({
  baseURL: BASE_URL,
});

// ✅ Axios instance with token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Task APIs ---

// 1. Get all tasks (Interceptors automatically add token)
export const getTasks = (params = {}) => api.get("/api/tasks", { params });

// 2. Shared Tasks List
export const getSharedTasks = () => api.get("/api/tasks/shared/list"); 

// 3. Create Task
export const createTask = (task) => api.post("/api/tasks", task);

// 4. Update Task
export const updateTask = (id, task) => api.put(`/api/tasks/${id}`, task);

// 5. Delete Task
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);

// 6. Share Task via Email
export const shareTask = (id, email) =>
  api.put(`/api/tasks/${id}/share`, { email }); 

// 7. Attachments Upload
export const uploadAttachments = (id, files) => {
  const form = new FormData();
  Array.from(files).forEach((f) => form.append("files", f));
  return api.post(`/api/tasks/${id}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api;