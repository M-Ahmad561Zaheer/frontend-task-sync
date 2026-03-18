import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Bell, BellOff, RefreshCw, Calendar, Clock, Inbox } from "lucide-react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    setIsRefreshing(true);
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
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Helper to determine border color based on keywords in the message
  const getTypeStyles = (msg) => {
    const text = msg.toLowerCase();
    if (text.includes("overdue") || text.includes("urgent") || text.includes("deleted")) 
        return "border-red-500 bg-red-50/30 dark:bg-red-900/10";
    if (text.includes("completed") || text.includes("done") || text.includes("success")) 
        return "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10";
    if (text.includes("shared") || text.includes("invited")) 
        return "border-purple-500 bg-purple-50/30 dark:bg-purple-900/10";
    return "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10";
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-2xl rounded-[2rem] p-6 max-h-[500px] flex flex-col w-full transition-all duration-300">
      
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">
            <Bell size={18} className="text-white" />
          </div>
          <h3 className="font-black text-lg tracking-tight text-gray-800 dark:text-white">Updates</h3>
        </div>
        
        <div className="flex items-center gap-2">
            <button 
                onClick={loadNotifications}
                disabled={isRefreshing}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 active:rotate-180 duration-500"
            >
                <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            </button>
            <span className="bg-gray-900 dark:bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black uppercase tracking-tighter">
                {notifications.length} New
            </span>
        </div>
      </div>

      {/* Content Area */}
      <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar space-y-4">
        {loading ? (
          // Skeleton Loader
          [1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`group p-4 rounded-2xl border-l-[6px] transition-all duration-300 hover:translate-x-1 hover:shadow-md ${getTypeStyles(n.message)}`}
            >
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-relaxed">
                {n.message}
              </p>
              
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200/50 dark:border-gray-700/50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  {new Date(n.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Inbox size={32} className="text-gray-300 dark:text-gray-700" />
            </div>
            <p className="text-sm font-bold text-gray-500">All caught up!</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-[150px]">No new notifications at the moment.</p>
          </div>
        )}
      </div>

      {/* Footer / Hint */}
      {notifications.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
             <button className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400 hover:underline">
                 Mark all as read
             </button>
          </div>
      )}
    </div>
  );
};

export default Notifications;