import { useEffect } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const NotificationHandler = () => {
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    
    if (!userId) return; // Agar user login nahi toh kuch na karo

    // ✅ Socket connection sirf tab banega jab userId hogi
    const socket = io("https://task-sync-backend-weld.vercel.app", {
      transports: ['polling'],
      withCredentials: true
    });

    socket.emit("join", userId);
    console.log("Connected to notification room:", userId);

    // 🔔 Real-time listener
    socket.on("taskShared", (data) => {
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3"); // Test sound
        audio.play();
        toast.success(data.message);
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

    // Cleanup: Jab component band ho toh socket bhi band ho jaye
    return () => {
      socket.disconnect();
    };
  }, []);

  return null;
};

export default NotificationHandler;