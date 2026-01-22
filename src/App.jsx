import React, { useEffect, useMemo, useState, useCallback } from "react";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard"; 
import { getTasks, createTask, updateTask, deleteTask } from "./services/taskService";
import { Toaster, toast } from 'react-hot-toast';
import { Moon, Sun, LogOut, LayoutDashboard, Search, Filter as FilterIcon } from "lucide-react";
import { io } from "socket.io-client";
import ProfileModal from "./components/ProfileModal";
import { updateProfile } from "./services/authService";

const socket = io(import.meta.env.VITE_API_URL || "http://localhost:5000");


const App = () => {
  //const notificationSound = useMemo(() => new Audio('/frontend/frontend/notify.mp3'), []);
  const notificationSound = useMemo(() => {
  const audio = new Audio("/notify.mp3");
  audio.load(); // File ko pre-load karega
  return audio;
}, []);
  const [userName, setUserName] = useState("User");
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("token")));
  const [showRegister, setShowRegister] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "1");
  const [showProfile, setShowProfile] = useState(false);

  const currentUser = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    return {
      id: localStorage.getItem("userId"),
      name: userName,
      email: user.email || "user@example.com"
    };
  }, [userName]);

  useEffect(() => {
    if (loggedIn) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        socket.emit("join", userId);
        socket.on("taskShared", (data) => {
          notificationSound.play().catch(err => console.log("Sound play error:", err));
         toast.success(data.message, { 
            icon: '🔔', 
            duration: 6000,
            style: {
              borderRadius: '15px',
              background: '#333',
              color: '#fff',
            },
          });
          fetchTasks();
        });
      }
    }
    return () => socket.off("taskShared");
  }, [loggedIn, notificationSound]);

  const logout = useCallback(() => {
    localStorage.clear();
    setLoggedIn(false);
    setTasks([]);
  }, []);

  const toggleAuth = () => setShowRegister((prev) => !prev);

  useEffect(() => {
    if (loggedIn) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUserName(storedUser?.name || "User");
    }
  }, [loggedIn]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark ? "1" : "0");
  }, [dark]);

  const fetchTasks = useCallback(async () => {
    if (!loggedIn) return;
    try {
      const res = await getTasks();
      const data = Array.isArray(res.data) ? res.data : res.data?.tasks || [];
      setTasks(data);
    } catch (err) { console.error(err); }
  }, [loggedIn]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreateTask = async (taskData) => {
    try { await createTask(taskData); fetchTasks(); } catch (err) { toast.error("Error saving task"); }
  };

  const handleUpdateTask = async (id, taskData) => {
    try { await updateTask(id, taskData); setEditingTask(null); fetchTasks(); } catch (err) { console.error(err); }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Delete this task?")) {
      try { await deleteTask(id); fetchTasks(); } catch (err) { console.error(err); }
    }
  };

  // ✅ Filter logic pachi muki didhi che
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const title = (task.title || "").toLowerCase();
      const query = search.toLowerCase();
      const matchesSearch = title.includes(query);
      const matchesFilter = filterStatus === "All" || task.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filterStatus]);

  if (!loggedIn) {
    return showRegister ? (
      <Register onSuccess={() => setLoggedIn(true)} toggle={toggleAuth} />
    ) : (
      <Login onSuccess={() => setLoggedIn(true)} toggle={toggleAuth} />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all duration-300 pb-12">
      <Toaster position="top-right" />
      
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <LayoutDashboard className="text-blue-600" size={24} />
            <h1 className="text-xl font-black uppercase tracking-tighter">TaskSync</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setShowProfile(true)} className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">{userName[0]?.toUpperCase()}</div>
              <span className="hidden sm:inline font-bold text-sm">{userName}</span>
            </button>
            <button onClick={() => setDark(!dark)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">{dark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}</button>
            <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><LogOut size={20} /></button>
          </div>
        </div>
      </header>

      {showProfile && (
        <ProfileModal 
          isOpen={showProfile} 
          onClose={() => setShowProfile(false)} 
          user={currentUser}
          onUpdate={async (newName) => {
            try {
              await updateProfile(newName); 
              setUserName(newName); 
              const user = JSON.parse(localStorage.getItem("user"));
              if (user) { user.name = newName; localStorage.setItem("user", JSON.stringify(user)); }
              toast.success("Profile updated!");
            } catch (err) { 
              console.error(err);
              toast.error("Update failed"); }
          }} 
        />
      )}

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* ✅ Search & Filter UI wapas muki didhi che */}
        <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border dark:border-gray-800 shadow-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input 
              type="text" placeholder="Search tasks..." 
              className="w-full bg-gray-50 dark:bg-gray-800/50 pl-10 pr-4 py-2.5 rounded-xl outline-none border-2 border-transparent focus:border-blue-500" 
              value={search} onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-xl border-2 border-transparent focus-within:border-blue-500">
            <FilterIcon size={18} className="text-gray-400" />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent outline-none font-bold text-sm min-w-[120px]">
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TaskForm onCreate={handleCreateTask} editingTask={editingTask} onUpdate={handleUpdateTask} />
          <Dashboard tasks={tasks} />
        </div>

        <TaskList tasks={filteredTasks} setEditingTask={setEditingTask} onDelete={handleDeleteTask} fetchTasks={fetchTasks} />
      </main>
      
      {/* --- Footer Section --- */}
      <footer className="mt-auto py-8 border-t dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex flex-col items-center gap-2">
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              &copy; {new Date().getFullYear()} <span className="text-blue-600 font-black">AZ Developers</span>. All rights reserved.
            </p>
            <div className="flex gap-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              <span className="hover:text-blue-500 cursor-pointer transition-colors">Privacy Policy</span>
              <span>•</span>
              <span className="hover:text-blue-500 cursor-pointer transition-colors">Terms of Service</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;