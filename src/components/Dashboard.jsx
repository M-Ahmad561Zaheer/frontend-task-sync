import React, { useEffect, useState } from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { UserCircle, BarChart3, CheckCircle, Share2, ClipboardList, AlertCircle } from "lucide-react";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"];

// ✅ Fix: tasks = my owned tasks, sharedTasks = shared with me (alag props)
const Dashboard = ({ tasks = [], sharedTasks = [] }) => {
  const [userName, setUserName] = useState("User");

  // Owned tasks ki stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const overdueTasks = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "Completed"
  ).length;

  // Shared tasks count (accurate - alag array se)
  const sharedWithMeCount = sharedTasks.length;

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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 p-6 rounded-3xl shadow-xl text-white">
        <div className="relative z-10 flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-full backdrop-blur-md">
            <UserCircle size={40} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black italic">Hi, {userName}!</h2>
            <p className="text-blue-100 text-xs md:text-sm font-medium opacity-90">
              {pendingTasks + inProgressTasks > 0
                ? `You have ${pendingTasks + inProgressTasks} tasks to focus on today.`
                : "All caught up! Great work. 🎉"}
            </p>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      </div>

      {/* Stats Grid */}
      <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h3 className="font-black mb-6 text-sm uppercase tracking-widest flex items-center gap-2 text-gray-400">
          <BarChart3 size={18} /> Performance Overview
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <ClipboardList size={14} />
              <p className="text-[10px] font-bold uppercase tracking-tighter">My Tasks</p>
            </div>
            <p className="text-2xl font-black">{totalTasks}</p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <CheckCircle size={14} />
              <p className="text-[10px] font-bold uppercase tracking-tighter">Done</p>
            </div>
            <p className="text-2xl font-black">{completedTasks}</p>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <Share2 size={14} />
              {/* ✅ Fix: Accurate count from separate sharedTasks array */}
              <p className="text-[10px] font-bold uppercase tracking-tighter">Shared w/ Me</p>
            </div>
            <p className="text-2xl font-black">{sharedWithMeCount}</p>
          </div>

          <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/30">
            <p className="text-[10px] font-bold uppercase tracking-tighter opacity-80">Progress</p>
            <p className="text-2xl font-black">
              {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Overdue warning */}
        {overdueTasks > 0 && (
          <div className="mb-6 flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-400 font-semibold">
              {overdueTasks} task{overdueTasks > 1 ? "s are" : " is"} overdue!
            </p>
          </div>
        )}

        {/* Pie Chart */}
        <div className="h-[250px] w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={10}
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 italic bg-gray-50 dark:bg-gray-800/30 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
              <p className="text-sm">Create your first task to see stats!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;