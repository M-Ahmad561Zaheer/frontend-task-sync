import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const NotificationHandler = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    // ✅ Advanced Socket Configuration
    socketRef.current = io("https://task-sync-backend.vercel.app", {
      transports: ["polling", "websocket"], // Allow upgrade to websocket for speed
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join", userId);
      console.log("🚀 Real-time engine active for:", userId);
    });

    // 🔔 Enhanced Real-time listener
    socket.on("taskShared", (data) => {
      // 1. Play refined haptic-style sound
      const audio = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"); 
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play blocked by browser"));

      // 2. Browser Tab Flashing (UX Peak)
      const originalTitle = document.title;
      let isFlash = false;
      const t = setInterval(() => {
        document.title = isFlash ? "🔴 New Update!" : originalTitle;
        isFlash = !isFlash;
      }, 1000);
      
      // Stop flashing after 6 seconds or when user clicks window
      const stopFlash = () => {
        clearInterval(t);
        document.title = originalTitle;
        window.removeEventListener('focus', stopFlash);
      };
      window.addEventListener('focus', stopFlash);

      // 3. Premium Toast UI
      toast.custom((t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white dark:bg-gray-900 shadow-2xl rounded-[1.5rem] pointer-events-auto flex ring-1 ring-black ring-opacity-5 border-l-8 border-blue-600 overflow-hidden`}
        >
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5 text-2xl">
                {data.type === 'status' ? '📈' : '🚀'}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                   {data.type === 'status' ? 'Status Update' : 'New Task Shared'}
                </p>
                <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                  {data.message || "A task has been updated in your workspace."}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-gray-100 dark:border-gray-800">
            <button
              onClick={() => toast.dismiss(t.id)}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-xs font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      ), { duration: 6000 });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return null;
};

export default NotificationHandler;