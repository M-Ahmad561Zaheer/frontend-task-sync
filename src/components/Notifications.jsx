import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Bell, RefreshCw, Calendar, Clock, Inbox, CheckCircle2 } from "lucide-react";

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

      const data = Array.isArray(res.data)
        ? res.data
        : res.data?.notifications || [];

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

  const getTypeStyles = (msg = "") => {
    const text = msg.toLowerCase();

    if (
      text.includes("overdue") ||
      text.includes("urgent") ||
      text.includes("deleted")
    ) {
      return {
        card: "border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20",
        icon: "bg-rose-500",
      };
    }

    if (
      text.includes("completed") ||
      text.includes("done") ||
      text.includes("success")
    ) {
      return {
        card: "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/20",
        icon: "bg-emerald-500",
      };
    }

    if (text.includes("shared") || text.includes("invited")) {
      return {
        card: "border-purple-200 dark:border-purple-900/50 bg-purple-50 dark:bg-purple-950/20",
        icon: "bg-purple-500",
      };
    }

    return {
      card: "border-blue-200 dark:border-blue-900/50 bg-blue-50 dark:bg-blue-950/20",
      icon: "bg-blue-500",
    };
  };

  return (
    <div className="w-full max-h-[520px] flex flex-col overflow-hidden rounded-[1.75rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl">
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center">
            <Bell size={18} />
          </div>

          <div>
            <h3 className="font-black text-slate-900 dark:text-white">
              Updates
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Recent task notifications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadNotifications}
            disabled={isRefreshing}
            className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all"
          >
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          </button>

          <span className="bg-slate-900 dark:bg-blue-600 text-white text-[10px] px-2.5 py-1 rounded-full font-black">
            {notifications.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          [1, 2, 3].map((i) => (
            <div
              key={i}
              className="animate-pulse p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
            >
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2 mt-3" />
            </div>
          ))
        ) : notifications.length > 0 ? (
          notifications.map((n) => {
            const styles = getTypeStyles(n.message);

            return (
              <div
                key={n._id}
                className={`group p-4 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md ${styles.card}`}
              >
                <div className="flex gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl text-white flex items-center justify-center shrink-0 ${styles.icon}`}
                  >
                    <Bell size={15} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed">
                      {n.message}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(n.createdAt).toLocaleDateString()}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex items-center justify-center mb-4">
              <Inbox size={30} className="text-slate-300 dark:text-slate-600" />
            </div>

            <p className="text-sm font-black text-slate-600 dark:text-slate-300">
              All caught up
            </p>

            <p className="text-xs text-slate-400 mt-1 max-w-[170px]">
              No new notifications at the moment.
            </p>
          </div>
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
          <button className="w-full py-2.5 rounded-xl text-xs font-black text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all flex items-center justify-center gap-2">
            <CheckCircle2 size={14} />
            Mark all as read
          </button>
        </div>
      )}
    </div>
  );
};

export default Notifications;