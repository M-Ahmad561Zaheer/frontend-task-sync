import { useEffect } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

// ✅ Fix: Localhost hata kar Environment Variable use karein
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const socket = io(SOCKET_URL);

const NotificationHandler = () => {
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    if (userId) {
      socket.emit("join", userId);
      console.log("Connected to notification room:", userId);
    }

    // 🔔 Real-time listener
    socket.on("taskShared", (data) => {
      console.log("Notification Received:", data);
      toast.success(data.message || "New Task Update!", {
        duration: 5000,
        position: "top-right",
        icon: '🚀',
        style: {
          borderRadius: '12px',
          background: '#333',
          color: '#fff',
        },
      });
    });

    return () => {
      socket.off("taskShared");
    };
  }, []);

  return null;
};

export default NotificationHandler;