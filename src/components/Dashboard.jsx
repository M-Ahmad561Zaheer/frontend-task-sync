import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  UserCircle,
  BarChart3,
  CheckCircle,
  Share2,
  ClipboardList,
  AlertCircle,
  Rocket,
  Clock3,
  TrendingUp,
} from "lucide-react";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"];

const Dashboard = ({ tasks = [], sharedTasks = [] }) => {
  const [userName, setUserName] = useState("User");

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "Completed").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const pendingTasks = tasks.filter((t) => t.status === "Pending").length;
  const overdueTasks = tasks.filter(
    (t) =>
      t.dueDate &&
      new Date(t.dueDate) < new Date() &&
      t.status !== "Completed"
  ).length;

  const sharedWithMeCount = sharedTasks.length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

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

  const stats = [
    {
      label: "My Tasks",
      value: totalTasks,
      icon: <ClipboardList size={20} />,
      iconBox: "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: <CheckCircle size={20} />,
      iconBox:
        "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: <Clock3 size={20} />,
      iconBox:
        "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400",
    },
    {
      label: "Shared",
      value: sharedWithMeCount,
      icon: <Share2 size={20} />,
      iconBox:
        "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-6 md:p-8 text-white shadow-xl shadow-blue-600/20">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-cyan-300/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-3xl bg-white/15 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-inner">
              <UserCircle size={46} strokeWidth={1.5} />
            </div>

            <div>
              <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-100 mb-2">
                <Rocket size={14} />
                Productivity Overview
              </p>

              <h2 className="text-2xl md:text-4xl font-black tracking-tight">
                Welcome back, {userName}
              </h2>

              <p className="mt-2 text-sm text-blue-100 font-medium max-w-xl">
                {pendingTasks + inProgressTasks > 0
                  ? `You have ${
                      pendingTasks + inProgressTasks
                    } active task${
                      pendingTasks + inProgressTasks > 1 ? "s" : ""
                    } waiting for your attention.`
                  : "Great work! You are currently clear of active tasks."}
              </p>
            </div>
          </div>

          <div className="rounded-3xl bg-white/15 border border-white/20 backdrop-blur-xl px-6 py-5 min-w-[180px]">
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-100">
              Completion Rate
            </p>

            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="text-4xl font-black">{progressPercent}%</p>
              <TrendingUp size={28} className="text-blue-100" />
            </div>

            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-700"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats + Chart */}
      <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-7">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 text-slate-400">
            <BarChart3 size={18} className="text-blue-500" />
            Performance Analytics
          </h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 p-5 hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${stat.iconBox}`}
              >
                {stat.icon}
              </div>

              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                {stat.label}
              </p>

              <p className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {overdueTasks > 0 && (
          <div className="mb-6 flex items-center gap-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-2xl">
            <div className="bg-rose-500 p-2 rounded-xl text-white">
              <AlertCircle size={20} />
            </div>

            <p className="text-sm text-rose-700 dark:text-rose-400 font-bold">
              Action required: {overdueTasks} task
              {overdueTasks > 1 ? "s are" : " is"} past the deadline.
            </p>
          </div>
        )}

        <div className="h-[310px] w-full rounded-[1.75rem] bg-slate-50/70 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius={75}
                  outerRadius={108}
                  paddingAngle={7}
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1200}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity outline-none"
                    />
                  ))}
                </Pie>

                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    borderRadius: "18px",
                    border: "none",
                    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.18)",
                    padding: "14px",
                  }}
                />

                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
              <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl shadow-sm mb-4 border border-slate-100 dark:border-slate-700">
                <ClipboardList size={34} className="opacity-40" />
              </div>

              <p className="font-black text-lg text-slate-600 dark:text-slate-300">
                Your dashboard is empty
              </p>

              <p className="text-xs opacity-70 mt-1">
                Add tasks to visualize your productivity flow.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;