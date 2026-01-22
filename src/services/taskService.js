import axios from "axios";

// Axios instance with token interceptor
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Task APIs
export const getTasks = (params = {}) => api.get("/api/tasks", { params });

// ✅ Yahan path update kar diya backend se match karne ke liye
export const getSharedTasks = () => api.get("/api/tasks/shared/list"); 

export const createTask = (task) => api.post("/api/tasks", task);
export const updateTask = (id, task) => api.put(`/api/tasks/${id}`, task);
export const deleteTask = (id) => api.delete(`/api/tasks/${id}`);

// ✅ Yahan 'userIds' ko 'userId' kar diya backend se match karne ke liye
export const shareTask = (id, email) =>
  api.put(`/api/tasks/${id}/share`, { email }); // 'userId' ki jagah 'email'
  
export const uploadAttachments = (id, files) => {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  return api.post(`/api/tasks/${id}/attachments`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export default api; // Optional but good practice