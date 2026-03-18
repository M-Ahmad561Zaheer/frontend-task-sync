import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

// ✅ Socket.IO bilkul nahi - sirf REST API se notifications fetch karo
const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const isLocal = window.location.hostname === "localhost";
      const BASE_URL = (
        isLocal
          ? import.meta.env.VITE_API_URL_LOCAL || "http://localhost:5000"
          : import.meta.env.VITE_API_URL || "https://tasksync-backend.vercel.app"
      ).replace(/\/$/, "");

      const res = await axios.get(`${BASE_URL}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data) ? res.data : res.data?.notifications || [];
      setNotifications(data);
    } catch (e) {
      console.error("Failed to load notifications:", e);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-xl rounded-2xl p-5 max-h-[400px] flex flex-col w-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">Notifications</h3>
        <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs px-2 py-1 rounded-full font-bold">
          {notifications.length}
        </span>
      </div>

      <div className="overflow-y-auto flex-1 space-y-3">
        {loading ? (
          <p className="text-center text-gray-400 py-4 text-sm">Loading...</p>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-blue-500"
            >
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {n.message}
              </p>
              <div className="flex justify-between items-center mt-2 text-[10px] text-gray-400 uppercase tracking-wider">
                <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-gray-400 italic">No notifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;