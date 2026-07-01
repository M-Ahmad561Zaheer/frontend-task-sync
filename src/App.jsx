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
import { getTagColor } from "./components/TaskForm";
import { Toaster, toast } from "react-hot-toast";
import {
  Moon,
  Sun,
  LogOut,
  LayoutDashboard,
  Search,
  Filter as FilterIcon,
  Bell,
  MessageCircle,
  Tag,
  X,
  Sparkles,
} from "lucide-react";

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
  const [activeTag, setActiveTag] = useState(null);
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
        toast.success(`🔔 ${newCount} new task${newCount > 1 ? "s" : ""} shared with you!`, {
          duration: 5000,
        });
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

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [loggedIn, fetchTasks]);

  const handleCreateTask = async (data) => {
    try {
      await createTask(data);
      fetchTasks();
      toast.success("Task created!");
    } catch (err) {
      toast.error("Failed to create task");
    }
  };

  const handleUpdateTask = async (id, data) => {
    try {
      await updateTask(id, data);
      setEditingTask(null);
      fetchTasks();
      toast.success("Task updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteTask(id);
        fetchTasks();
        toast.success("Task deleted");
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to delete");
      }
    }
  };

  const displayTasks = activeTab === "my" ? tasks : sharedTasks;

  const filteredTasks = useMemo(() => {
    return displayTasks.filter((task) => {
      const matchesSearch = (task.title || "")
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter = filterStatus === "All" || task.status === filterStatus;
      const matchesTag = !activeTag || task.tags?.includes(activeTag);

      return matchesSearch && matchesFilter && matchesTag;
    });
  }, [displayTasks, search, filterStatus, activeTag]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />

      <Routes>
        <Route
          path="/login-success"
          element={<LoginSuccess onSuccess={handleAuthSuccess} />}
        />

        <Route
          path="/login"
          element={
            loggedIn ? (
              <Navigate to="/" />
            ) : showRegister ? (
              <Register
                onSuccess={handleAuthSuccess}
                toggle={() => setShowRegister(false)}
              />
            ) : (
              <Login
                onSuccess={handleAuthSuccess}
                toggle={() => setShowRegister(true)}
              />
            )
          }
        />

        <Route
          path="/"
          element={
            !loggedIn ? (
              <Navigate to="/login" />
            ) : (
              <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-all duration-300">
                {/* Header */}
                <header className="sticky top-0 z-40 border-b border-white/60 dark:border-slate-800 bg-white/75 dark:bg-slate-950/75 backdrop-blur-2xl">
                  <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                        <LayoutDashboard className="text-white" size={22} />
                      </div>

                      <div>
                        <h1 className="text-xl md:text-2xl font-black tracking-tight">
                          TaskSync
                        </h1>
                        <p className="hidden sm:block text-xs font-semibold text-slate-500 dark:text-slate-400">
                          Smart task collaboration dashboard
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                      <button
                        onClick={() => setShowChat(!showChat)}
                        className={`relative p-2.5 rounded-2xl transition-all shadow-sm ${
                          showChat
                            ? "bg-blue-600 text-white shadow-blue-600/25"
                            : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                        }`}
                      >
                        <MessageCircle size={20} />
                        {chatUsers.length > 0 && (
                          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-emerald-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                            {chatUsers.length}
                          </span>
                        )}
                      </button>

                      <div className="relative">
                        <button
                          onClick={() => {
                            setShowNotifications(!showNotifications);
                            setUnreadCount(0);
                          }}
                          className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                        >
                          <Bell size={20} />
                          {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-950">
                              {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                          )}
                        </button>

                        {showNotifications && (
                          <div className="absolute right-0 top-14 w-80 z-50 rounded-3xl shadow-2xl">
                            <Notifications />
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setDark(!dark)}
                        className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
                      >
                        {dark ? (
                          <Sun size={20} className="text-amber-400" />
                        ) : (
                          <Moon size={20} />
                        )}
                      </button>

                      <button
                        onClick={() => setShowProfile(true)}
                        className="hidden sm:flex items-center gap-3 p-1.5 pr-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white font-black">
                          {userName[0]?.toUpperCase()}
                        </div>
                        <span className="font-bold text-sm max-w-[120px] truncate">
                          {userName}
                        </span>
                      </button>

                      <button
                        onClick={logout}
                        className="p-2.5 rounded-2xl text-rose-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all shadow-sm"
                      >
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

                        const storedUser =
                          JSON.parse(localStorage.getItem("user")) || {};

                        storedUser.name = newName;
                        localStorage.setItem("user", JSON.stringify(storedUser));
                        toast.success("Profile updated!");
                      } catch (err) {
                        toast.error("Update failed");
                      }
                    }}
                  />
                )}

                <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 space-y-6">
                  {/* Hero */}
                  <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 md:p-8 text-white shadow-xl shadow-blue-600/20">
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-cyan-300/20 rounded-full blur-3xl" />

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 backdrop-blur-md text-xs font-bold mb-4">
                          <Sparkles size={14} />
                          Productivity Workspace
                        </div>

                        <h2 className="text-2xl md:text-4xl font-black tracking-tight">
                          Welcome back, {userName}
                        </h2>

                        <p className="mt-2 text-sm md:text-base text-blue-100 max-w-2xl">
                          Manage your tasks, track progress, collaborate with your team,
                          and stay updated from one clean dashboard.
                        </p>
                      </div>

                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md p-4">
                          <p className="text-2xl font-black">{tasks.length}</p>
                          <p className="text-xs text-blue-100 font-semibold">My Tasks</p>
                        </div>

                        <div className="rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md p-4">
                          <p className="text-2xl font-black">{sharedTasks.length}</p>
                          <p className="text-xs text-blue-100 font-semibold">Shared</p>
                        </div>

                        <div className="rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md p-4">
                          <p className="text-2xl font-black">{filteredTasks.length}</p>
                          <p className="text-xs text-blue-100 font-semibold">Showing</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <Dashboard tasks={tasks} sharedTasks={sharedTasks} />

                  {/* Tabs */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="inline-flex bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm w-full sm:w-fit">
                      <button
                        onClick={() => {
                          setActiveTab("my");
                          setEditingTask(null);
                          setActiveTag(null);
                        }}
                        className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl font-black text-sm transition-all ${
                          activeTab === "my"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        My Tasks
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${
                            activeTab === "my"
                              ? "bg-white/20"
                              : "bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          {tasks.length}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveTab("shared");
                          setEditingTask(null);
                          setActiveTag(null);
                        }}
                        className={`flex-1 sm:flex-none px-5 py-3 rounded-2xl font-black text-sm transition-all ${
                          activeTab === "shared"
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-600/20"
                            : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        Shared with Me
                        <span
                          className={`ml-2 px-2 py-0.5 rounded-full text-[10px] font-black ${
                            activeTab === "shared"
                              ? "bg-white/20"
                              : "bg-slate-100 dark:bg-slate-800"
                          }`}
                        >
                          {sharedTasks.length}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Search & Filter */}
                  <section className="bg-white dark:bg-slate-900 rounded-[1.75rem] border border-slate-200 dark:border-slate-800 shadow-sm p-4 md:p-5">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="relative flex-1">
                        <Search
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          size={19}
                        />

                        <input
                          type="text"
                          placeholder={`Search ${
                            activeTab === "my" ? "my" : "shared"
                          } tasks...`}
                          className="w-full bg-slate-100 dark:bg-slate-800/70 pl-12 pr-4 py-3.5 rounded-2xl outline-none border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 transition-all font-semibold placeholder:text-slate-400"
                          value={search}
                          onChange={(e) => setSearch(e.target.value)}
                        />
                      </div>

                      <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/70 px-4 py-3 rounded-2xl border border-transparent focus-within:border-blue-500">
                        <FilterIcon size={19} className="text-slate-400" />

                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="bg-transparent outline-none font-black text-sm min-w-[150px] text-slate-700 dark:text-slate-200"
                        >
                          <option value="All">All Status</option>
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Tags */}
                  {allTags.length > 0 && (
                    <section className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 px-4 py-4 rounded-[1.75rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                      <span className="flex items-center gap-1.5 text-xs font-black text-slate-400 uppercase tracking-wider mr-1">
                        <Tag size={13} />
                        Tags
                      </span>

                      {allTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            setActiveTag(activeTag === tag ? null : tag)
                          }
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black transition-all border hover:scale-105 ${
                            activeTag === tag
                              ? "ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-950 scale-105 " +
                                getTagColor(tag)
                              : getTagColor(tag) + " opacity-70 hover:opacity-100"
                          }`}
                        >
                          {tag}
                          {activeTag === tag && <X size={11} />}
                        </button>
                      ))}

                      {activeTag && (
                        <button
                          onClick={() => setActiveTag(null)}
                          className="text-xs text-slate-400 hover:text-rose-500 font-bold transition-colors ml-1"
                        >
                          Clear ✕
                        </button>
                      )}
                    </section>
                  )}

                  {activeTab === "my" && (
                    <div className="rounded-[1.75rem]">
                      <TaskForm
                        onCreate={handleCreateTask}
                        editingTask={editingTask}
                        onUpdate={handleUpdateTask}
                      />
                    </div>
                  )}

                  <section className="bg-white/60 dark:bg-slate-900/40 rounded-[1.75rem] border border-slate-200 dark:border-slate-800 p-3 md:p-4 shadow-sm">
                    <TaskList
                      tasks={filteredTasks}
                      setEditingTask={
                        activeTab === "my" ? setEditingTask : () => {}
                      }
                      onDelete={activeTab === "my" ? handleDeleteTask : () => {}}
                      fetchTasks={fetchTasks}
                      isSharedView={activeTab === "shared"}
                      currentUser={currentUser}
                    />
                  </section>
                </main>

                <footer className="py-8 text-center border-t border-slate-200 dark:border-slate-800 text-slate-500">
                  <p className="font-semibold text-sm">
                    © {new Date().getFullYear()}{" "}
                    <span className="text-blue-600 font-black">AZ Developers</span>.
                    All rights reserved.
                  </p>
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