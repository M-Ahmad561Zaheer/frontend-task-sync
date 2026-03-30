import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import TaskList from "./components/TaskList";
import TaskForm from "./components/TaskForm";
import Login from "./components/Login";
import LoginSuccess from "./components/LoginSuccess";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import Notifications from "./components/Notifications";
import ProfileModal from "./components/ProfileModal";
import ChatSidebar from "./components/ChatSidebar";
import { getTasks, getSharedTasks, createTask, updateTask, deleteTask } from "./services/taskService";
import { updateProfile } from "./services/authService";
import { setOnlineStatus } from "./services/chatService";
import { getTagColor } from "./components/TaskForm"; // ✅ Tag colors
import { Toaster, toast } from "react-hot-toast";
import { Moon, Sun, LogOut, LayoutDashboard, Search, Filter as FilterIcon, Bell, MessageCircle, Tag, X } from "lucide-react";

const App = () => {
  const notificationSound = useMemo(() => {
    const audio = new Audio("/notify.mp3");
    audio.load();
    return audio;
  }, []);

  const [userName, setUserName] = useState("User");
  const [tasks, setTasks] = useState([]);
  const [sharedTasks, setSharedTasks] = useState([]);
  const [activeTab, setActiveTab] = useState("my");
  const [editingTask, setEditingTask] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [activeTag, setActiveTag] = useState(null); // ✅ Tag filter state
  const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.getItem("token")));
  const [showRegister, setShowRegister] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem("dark") === "1");
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const pollingRef = useRef(null);
  const prevSharedCountRef = useRef(0);

  const currentUser = useMemo(() => {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    return {
      id: localStorage.getItem("userId"),
      name: userName,
      email: user.email || "",
    };
  }, [userName]);

  const fetchTasks = useCallback(async () => {
    if (!localStorage.getItem("token")) return;
    try {
      const [ownedRes, sharedRes] = await Promise.all([
        getTasks(),
        getSharedTasks(),
      ]);
      const owned = Array.isArray(ownedRes.data) ? ownedRes.data : [];
      const shared = Array.isArray(sharedRes.data) ? sharedRes.data : [];

      setTasks(owned);
      setSharedTasks(shared);

      if (prevSharedCountRef.current > 0 && shared.length > prevSharedCountRef.current) {
        const newCount = shared.length - prevSharedCountRef.current;
        notificationSound.play().catch(() => {});
        toast.success(`🔔 ${newCount} new task${newCount > 1 ? "s" : ""} shared with you!`, { duration: 5000 });
        setUnreadCount((prev) => prev + newCount);
      }
      prevSharedCountRef.current = shared.length;
    } catch (err) {
      console.error("Fetch tasks error:", err);
    }
  }, [notificationSound]);

  const chatUsers = useMemo(() => {
    const usersMap = new Map();
    sharedTasks.forEach((task) => {
      if (task.owner?._id && task.owner._id !== currentUser.id) {
        usersMap.set(task.owner._id, {
          id: task.owner._id,
          name: task.owner.name || "Unknown",
          email: task.owner.email || "",
        });
      }
    });
    tasks.forEach((task) => {
      if (task.sharedWith?.length) {
        task.sharedWith.forEach((user) => {
          const uid = user._id || user;
          if (uid && uid !== currentUser.id) {
            usersMap.set(uid, {
              id: uid,
              name: user.name || "Shared User",
              email: user.email || "",
            });
          }
        });
      }
    });
    return Array.from(usersMap.values());
  }, [tasks, sharedTasks, currentUser.id]);

  // ✅ Current tab ki saari unique tags
  const allTags = useMemo(() => {
    const displayTasks = activeTab === "my" ? tasks : sharedTasks;
    const tagSet = new Set();
    displayTasks.forEach((t) => t.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [tasks, sharedTasks, activeTab]);

  const handleAuthSuccess = useCallback(() => {
    setLoggedIn(true);
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUserName(storedUser?.name || "User");
    fetchTasks();
  }, [fetchTasks]);

  const logout = useCallback(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    localStorage.clear();
    setLoggedIn(false);
    setTasks([]);
    setSharedTasks([]);
    prevSharedCountRef.current = 0;
    toast.success("Logged out successfully");
  }, []);

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

  useEffect(() => {
    if (loggedIn) {
      const userId = localStorage.getItem("userId");
      if (userId) setOnlineStatus(userId);
    }
  }, [loggedIn]);

  useEffect(() => {
    if (!loggedIn) return;
    pollingRef.current = setInterval(fetchTasks, 15000);
    return () => { if (pollingRef.current) clearInterval(pollingRef.current); };
  }, [loggedIn, fetchTasks]);

  const handleCreateTask = async (data) => {
    try { await createTask(data); fetchTasks(); toast.success("Task created!"); }
    catch (err) { toast.error("Failed to create task"); }
  };

  const handleUpdateTask = async (id, data) => {
    try { await updateTask(id, data); setEditingTask(null); fetchTasks(); toast.success("Task updated!"); }
    catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure?")) {
      try { await deleteTask(id); fetchTasks(); toast.success("Task deleted"); }
      catch (err) { toast.error(err.response?.data?.message || "Failed to delete"); }
    }
  };

  const displayTasks = activeTab === "my" ? tasks : sharedTasks;

  const filteredTasks = useMemo(() => {
    return displayTasks.filter((task) => {
      const matchesSearch = (task.title || "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filterStatus === "All" || task.status === filterStatus;
      const matchesTag = !activeTag || task.tags?.includes(activeTag); // ✅ Tag filter
      return matchesSearch && matchesFilter && matchesTag;
    });
  }, [displayTasks, search, filterStatus, activeTag]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login-success" element={<LoginSuccess onSuccess={handleAuthSuccess} />} />
        <Route
          path="/login"
          element={
            loggedIn ? <Navigate to="/" /> :
            showRegister ?
              <Register onSuccess={handleAuthSuccess} toggle={() => setShowRegister(false)} /> :
              <Login onSuccess={handleAuthSuccess} toggle={() => setShowRegister(true)} />
          }
        />
        <Route
          path="/"
          element={
            !loggedIn ? <Navigate to="/login" /> : (
              <div className="min-h-screen bg-[#f8fafc] dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-all duration-300 pb-12">

                {/* Header */}
                <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b dark:border-gray-800 px-4 md:px-8 py-4">
                  <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <LayoutDashboard className="text-blue-600" size={24} />
                      <h1 className="text-xl font-black uppercase tracking-tighter">TaskSync</h1>
                    </div>
                    <div className="flex items-center gap-3">

                      <button
                        onClick={() => setShowChat(!showChat)}
                        className={`p-2 rounded-xl relative transition-all ${
                          showChat ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <MessageCircle size={20} />
                        {chatUsers.length > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                            {chatUsers.length}
                          </span>
                        )}
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => { setShowNotifications(!showNotifications); setUnreadCount(0); }}
                          className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 relative"
                        >
                          <Bell size={20} />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </button>
                        {showNotifications && (
                          <div className="absolute right-0 top-12 w-80 z-50 shadow-2xl">
                            <Notifications />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setShowProfile(true)}
                        className="flex items-center gap-2 p-1.5 pr-3 rounded-xl border dark:border-gray-800 bg-white dark:bg-gray-900"
                      >
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          {userName[0]?.toUpperCase()}
                        </div>
                        <span className="hidden sm:inline font-bold text-sm">{userName}</span>
                      </button>

                      <button onClick={() => setDark(!dark)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800">
                        {dark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
                      </button>

                      <button onClick={logout} className="p-2 text-red-500 hover:bg-red-50 rounded-xl">
                        <LogOut size={20} />
                      </button>
                    </div>
                  </div>
                </header>

                <ChatSidebar
                  isOpen={showChat}
                  onClose={() => setShowChat(false)}
                  currentUser={currentUser}
                  chatUsers={chatUsers}
                />

                {showProfile && (
                  <ProfileModal
                    isOpen={showProfile}
                    onClose={() => setShowProfile(false)}
                    user={currentUser}
                    onUpdate={async (newName) => {
                      try {
                        await updateProfile(newName);
                        setUserName(newName);
                        const storedUser = JSON.parse(localStorage.getItem("user")) || {};
                        storedUser.name = newName;
                        localStorage.setItem("user", JSON.stringify(storedUser));
                        toast.success("Profile updated!");
                      } catch (err) { toast.error("Update failed"); }
                    }}
                  />
                )}

                <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
                  <Dashboard tasks={tasks} sharedTasks={sharedTasks} />

                  {/* Tabs */}
                  <div className="flex gap-2 bg-white dark:bg-gray-900 p-2 rounded-2xl border dark:border-gray-800 w-fit shadow-sm">
                    <button
                      onClick={() => { setActiveTab("my"); setEditingTask(null); setActiveTag(null); }}
                      className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                        activeTab === "my" ? "bg-blue-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      My Tasks
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === "my" ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"}`}>
                        {tasks.length}
                      </span>
                    </button>
                    <button
                      onClick={() => { setActiveTab("shared"); setEditingTask(null); setActiveTag(null); }}
                      className={`px-5 py-2 rounded-xl font-bold text-sm transition-all ${
                        activeTab === "shared" ? "bg-purple-600 text-white shadow-md" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                    >
                      Shared with Me
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === "shared" ? "bg-white/20" : "bg-gray-100 dark:bg-gray-800"}`}>
                        {sharedTasks.length}
                      </span>
                    </button>
                  </div>

                  {/* Search & Filter */}
                  <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border dark:border-gray-800 shadow-sm">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                      <input
                        type="text"
                        placeholder={`Search ${activeTab === "my" ? "my" : "shared"} tasks...`}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 pl-10 pr-4 py-2.5 rounded-xl outline-none border-2 border-transparent focus:border-blue-500 transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-2 rounded-xl">
                      <FilterIcon size={18} className="text-gray-400" />
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-transparent outline-none font-bold text-sm min-w-[120px]"
                      >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* ✅ Tag Filter Bar - sirf tab dikhao jab tags hoon */}
                  {allTags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-gray-900 px-4 py-3 rounded-2xl border dark:border-gray-800 shadow-sm">
                      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider mr-1">
                        <Tag size={12} /> Tags:
                      </span>
                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                            activeTag === tag
                              ? "ring-2 ring-offset-1 ring-blue-500 scale-105 " + getTagColor(tag)
                              : getTagColor(tag) + " opacity-60 hover:opacity-100 hover:scale-105"
                          }`}
                        >
                          {tag}
                          {activeTag === tag && <X size={10} />}
                        </button>
                      ))}
                      {activeTag && (
                        <button
                          onClick={() => setActiveTag(null)}
                          className="text-xs text-gray-400 hover:text-red-500 font-medium transition-colors ml-1"
                        >
                          Clear ✕
                        </button>
                      )}
                    </div>
                  )}

                  {activeTab === "my" && (
                    <TaskForm onCreate={handleCreateTask} editingTask={editingTask} onUpdate={handleUpdateTask} />
                  )}

                  <TaskList
                    tasks={filteredTasks}
                    setEditingTask={activeTab === "my" ? setEditingTask : () => {}}
                    onDelete={activeTab === "my" ? handleDeleteTask : () => {}}
                    fetchTasks={fetchTasks}
                    isSharedView={activeTab === "shared"}
                    currentUser={currentUser}
                  />
                </main>

                <footer className="mt-auto py-8 text-center border-t dark:border-gray-800 opacity-60">
                  <p className="font-medium">© {new Date().getFullYear()} <span className="text-blue-600 font-black">AZ Developers</span>. All rights reserved.</p>
                </footer>
              </div>
            )
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;