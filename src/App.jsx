import React, { useEffect, useMemo, useState, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import Login from "./components/Login";
import LoginSuccess from "./components/LoginSuccess";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import { getTasks, createTask, updateTask, deleteTask } from "./services/taskService";
import { Toaster, toast } from 'react-hot-toast';
import { Moon, Sun, LogOut, LayoutDashboard, Search, Filter as FilterIcon } from "lucide-react";
import { io } from "socket.io-client";
import ProfileModal from "./components/ProfileModal";
import { updateProfile } from "./services/authService";


// Socket connection
const socket = io(import.meta.env.VITE_API_URL || "https://tasksync-backend.vercel.app");

const App = () => {
  // Audio setup for notifications
  const notificationSound = useMemo(() => {
    const audio = new Audio("/notify.mp3");
    audio.load();
    return audio;
  }, []);

  // States
  const [userName, setUserName] = useState("User");
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("token")));
  const [showRegister, setShowRegister] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "1");
  const [showProfile, setShowProfile] = useState(false);

  // Memoized user data
  const currentUser = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    return {
      id: localStorage.getItem("userId"),
      name: userName,
      email: user.email || "user@example.com"
    };
  }, [userName]);

  // Fetch Tasks function
  const fetchTasks = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const res = await getTasks();
      const data = Array.isArray(res.data) ? res.data : res.data?.tasks || [];
      setTasks(data);
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = useCallback(() => {
    setLoggedIn(true);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUserName(storedUser?.name || "User");
    fetchTasks();
  }, [fetchTasks]);

  // Logout function
  const logout = useCallback(() => {
    localStorage.clear();
    setLoggedIn(false);
    setTasks([]);
    toast.success("Logged out successfully");
  }, []);

  // Sync dark mode and user name on mount/update
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark ? "1" : "0");
  }, [dark]);

  useEffect(() => {
    if (loggedIn) {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      setUserName(storedUser?.name || "User");
      fetchTasks();
    }
  }, [loggedIn, fetchTasks]);

  // Socket.io effect
  useEffect(() => {
    if (loggedIn) {
      const userId = localStorage.getItem("userId");
      if (userId) {
        socket.emit("join", userId);
        socket.on("taskShared", (data) => {
          notificationSound.play().catch(err => console.log("Audio play blocked"));
          toast.success(data.message, { icon: '🔔', duration: 5000 });
          fetchTasks();
        });
      }
    }
    return () => socket.off("taskShared");
  }, [loggedIn, notificationSound, fetchTasks]);

  // Task Handlers
  const handleCreateTask = async (data) => {
    try { await createTask(data); fetchTasks(); toast.success("Task created!"); } 
    catch (err) { toast.error("Failed to create task"); }
  };

  const handleUpdateTask = async (id, data) => {
    try { await updateTask(id, data); setEditingTask(null); fetchTasks(); toast.success("Task updated!"); } 
    catch (err) { toast.error("Update failed"); }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure?")) {
      try { await deleteTask(id); fetchTasks(); toast.success("Task deleted"); } 
      catch (err){
        console.error("Delete error:", err);
        toast.error("Failed to delete task");
      }
      
    }
  };

  // Filter Logic
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = (task.title || "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterStatus === "All" || task.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filterStatus]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Social Login Success Callback */}
        <Route path="/login-success" element={<LoginSuccess onSuccess={handleAuthSuccess} />} />

        {/* Auth Routes */}
        <Route 
          path="/login" 
          element={
            loggedIn ? <Navigate to="/" /> : 
            (showRegister ? 
              <Register onSuccess={handleAuthSuccess} toggle={() => setShowRegister(false)} /> : 
              <Login onSuccess={handleAuthSuccess} toggle={() => setShowRegister(true)} />
            )
          } 
        />

        {/* Main Application Route (Protected) */}
        <Route 
          path="/" 
          element={
            !loggedIn ? <Navigate to="/login" /> : (
              <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all duration-300 pb-12">
                
                {/* Header */}
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
                      <button onClick={() => setDark(!dark)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                        {dark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                      </button>
                      <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl"><LogOut size={20} /></button>
                    </div>
                  </div>
                </header>

                {/* Profile Modal */}
                {showProfile && (
                  <ProfileModal 
                    isOpen={showProfile} 
                    onClose={() => setShowProfile(false)} 
                    user={currentUser}
                    onUpdate={async (newName) => {
                      try {
                        await updateProfile(newName); 
                        setUserName(newName);
                        toast.success("Profile updated!");
                      } catch (err) { toast.error("Update failed"); }
                    }} 
                  />
                )}

                {/* Main Content */}
                <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                  {/* Search & Filter */}
                  <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input 
                        type="text" placeholder="Search tasks..." 
                        className="w-full bg-gray-50 dark:bg-gray-800/50 pl-10 pr-4 py-2.5 rounded-xl outline-none border-2 border-transparent focus:border-blue-500 transition-all" 
                        value={search} onChange={(e) => setSearch(e.target.value)} 
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-xl border-2 border-transparent">
                      <FilterIcon size={18} className="text-gray-400" />
                      <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-transparent outline-none font-bold text-sm min-w-[120px]">
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Form & Stats Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <TaskForm onCreate={handleCreateTask} editingTask={editingTask} onUpdate={handleUpdateTask} />
                    <Dashboard tasks={tasks} />
                  </div>

                  {/* Task List */}
                  <TaskList 
                    tasks={filteredTasks} 
                    setEditingTask={setEditingTask} 
                    onDelete={handleDeleteTask} 
                    fetchTasks={fetchTasks} 
                  />
                </main>

                {/* Footer */}
                <footer className="mt-auto py-8 text-center border-t dark:border-gray-800 opacity-60">
                   <p className="font-medium">© {new Date().getFullYear()} <span className="text-blue-600 font-black">AZ Developers</span>. All rights reserved.</p>
                </footer>
              </div>
            )
          } 
        />
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;