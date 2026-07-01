import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

const NotificationHandler = () => {
  const socketRef = useRef(null);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    socketRef.current = io("https://task-sync-backend.vercel.app", {
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("join", userId);
      console.log("🚀 Real-time engine active for:", userId);
    });

    socket.on("taskShared", (data) => {
      const audio = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3"
      );

      audio.volume = 0.45;
      audio.play().catch(() => console.log("Audio play blocked by browser"));

      const originalTitle = document.title;
      let isFlash = false;

      const titleInterval = setInterval(() => {
        document.title = isFlash ? "🔔 New Update!" : originalTitle;
        isFlash = !isFlash;
      }, 1000);

      const stopFlash = () => {
        clearInterval(titleInterval);
        document.title = originalTitle;
        window.removeEventListener("focus", stopFlash);
      };

      window.addEventListener("focus", stopFlash);

      setTimeout(stopFlash, 6000);

      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } w-full max-w-md overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl pointer-events-auto`}
          >
            <div className="flex">
              <div className="w-1.5 bg-blue-600" />

              <div className="flex-1 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-xl">
                    {data.type === "status" ? "📈" : "🚀"}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 dark:text-white">
                      {data.type === "status"
                        ? "Status Update"
                        : "New Task Shared"}
                    </p>

                    <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                      {data.message ||
                        "A task has been updated in your workspace."}
                    </p>
                  </div>

                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-white transition-all"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          </div>
        ),
        { duration: 6000 }
      );
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