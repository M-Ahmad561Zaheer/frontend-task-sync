import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, Label } from "recharts";
import { UserCircle, BarChart3, CheckCircle, Share2, ClipboardList, AlertCircle, Rocket } from "lucide-react";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"];

const Dashboard = ({ tasks = [], sharedTasks = [] }) => {
  const [userName, setUserName] = useState("User");

  // Logic remains untouched
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed"
  ).length;

  const sharedWithMeCount = sharedTasks.length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const chartData = [
    { name: "Pending", value: pendingTasks },
    { name: "In Progress", value: inProgressTasks },
    { name: "Completed", value: completedTasks },
  ].filter((item) => item.value > 0);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUserName(userData.name || "User");
    }
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* 🚀 WOW FACTOR: Animated Glassmorphism Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 p-8 rounded-[2.5rem] shadow-2xl shadow-blue-200 dark:shadow-none text-white">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="bg-white/20 p-1 rounded-full backdrop-blur-xl border border-white/30 shadow-inner">
              <UserCircle size={56} className="text-white" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                Welcome back, <span className="text-yellow-300">{userName}!</span>
              </h2>
              <p className="text-blue-50 text-sm font-medium opacity-90 flex items-center gap-2 mt-1">
                {pendingTasks + inProgressTasks > 0 ? (
                  <> <Rocket size={16} /> You have {pendingTasks + inProgressTasks} tasks calling for action.</>
                ) : (
                  "You're at the top of your game! 🎉"
                )}
              </p>
            </div>
          </div>
          
          {/* Quick Progress Badge */}
          <div className="bg-black/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 hidden md:block">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] opacity-70">Daily Efficiency</p>
            <p className="text-3xl font-mono font-bold">{progressPercent}%</p>
          </div>
        </div>
        
        {/* Decorative Blobs */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute left-1/2 -top-12 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid with Hover Transitions */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-50 dark:border-gray-800">
        <div className="flex items-center justify-between mb-8">
            <h3 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 text-gray-400">
            <BarChart3 size={18} className="text-blue-500" /> Performance Analytics
            </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "My Tasks", val: totalTasks, icon: <ClipboardList size={18}/>, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Done", val: completedTasks, icon: <CheckCircle size={18}/>, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Shared", val: sharedWithMeCount, icon: <Share2 size={18}/>, color: "text-violet-600", bg: "bg-violet-50" },
          ].map((stat, i) => (
            <div key={i} className="group p-5 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-black tracking-tighter">{stat.val}</p>
            </div>
          ))}

          {/* Highlighted Progress Card */}
          <div className="p-5 bg-gray-900 dark:bg-blue-600 rounded-3xl text-white shadow-xl shadow-gray-200 dark:shadow-blue-900/20 transform hover:scale-105 transition-all">
             <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Completion</p>
             <div className="flex items-end justify-between">
                <p className="text-4xl font-mono font-black">{progressPercent}%</p>
                <div className="h-2 w-16 bg-white/20 rounded-full mb-2 overflow-hidden">
                    <div className="h-full bg-white" style={{ width: `${progressPercent}%` }}></div>
                </div>
             </div>
          </div>
        </div>

        {/* Overdue Alert with Pulse Effect */}
        {overdueTasks > 0 && (
          <div className="mb-8 flex items-center gap-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl animate-pulse">
            <div className="bg-red-500 p-2 rounded-lg text-white">
                <AlertCircle size={20} />
            </div>
            <p className="text-sm text-red-700 dark:text-red-400 font-bold">
              Action Required: {overdueTasks} task{overdueTasks > 1 ? "s are" : " is"} currently past the deadline.
            </p>
          </div>
        )}

        {/* Chart Area */}
        <div className="h-[300px] w-full pt-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                  ))}
                </Pie>
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: "20px",
                    border: "none",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)",
                    padding: "15px"
                  }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50/50 dark:bg-gray-800/20 rounded-[2rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
                <ClipboardList size={32} className="opacity-20" />
              </div>
              <p className="font-bold tracking-tight text-lg">Your dashboard is empty</p>
              <p className="text-xs opacity-60">Add tasks to visualize your productivity flow.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;