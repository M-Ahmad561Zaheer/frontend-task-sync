import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let socket;

    const loadNotifications = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/notifications`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        // Accurate Data Mapping: Backend direct array bhejta hai ya notifications key mein
        const data = Array.isArray(res.data) ? res.data : (res.data.notifications || []);
        setNotifications(data);
      } 
      catch (e) {
        console.error("Failed to load notifications:", e);
        setNotifications([]);
      } 
      finally {
        setLoading(false);
      }
    };

    loadNotifications();

 const userId = localStorage.getItem("userId");
    if (userId) {
      socket = io(import.meta.env.VITE_API_URL);
      socket.emit("join", userId);
      
      // ✅ Fix: Backend wale event name 'taskShared' ko sunien
      socket.on("taskShared", (n) => {
        console.log("Real-time notification:", n);
        if (n && n.message) {
          // Nayi notification ko foran top par add karna
          // Agar backend se createdAt nahi aa raha toh local date add karein
          const newNotif = { 
            ...n, 
            createdAt: n.date || new Date().toISOString(), 
            _id: n.id || Math.random().toString() 
          };
          setNotifications((prev) => [newNotif, ...prev]);
        }
      });
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 shadow-xl rounded-xl p-5 max-h-[400px] flex flex-col w-full transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">Notifications</h3>
        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-bold">
          {notifications.length}
        </span>
      </div>

      <div className="overflow-y-auto custom-scrollbar flex-1">
        {loading ? (
          <p className="text-center text-gray-400 py-4 text-sm">Loading...</p>
        ) : notifications.length > 0 ? (
          <ul className="space-y-3">
            {notifications.map((n) => (
              <li 
                key={n._id || Math.random()} 
                className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border-l-4 border-blue-500 hover:shadow-md transition-all animate-in fade-in slide-in-from-right-4"
              >
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {n.message}
                </p>
                <div className="flex justify-between items-center mt-2 text-[10px] text-gray-500 uppercase tracking-wider">
                  <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                  <span>{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <p className="text-sm text-gray-500 italic">No new notifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;