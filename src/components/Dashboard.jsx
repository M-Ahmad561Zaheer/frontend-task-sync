import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BarChart3,
  CheckCircle,
  Share2,
  ClipboardList,
  AlertCircle,
  Clock3,
} from "lucide-react";

const COLORS = ["#f59e0b", "#3b82f6", "#10b981"];

const Dashboard = ({ tasks = [], sharedTasks = [] }) => {
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

  const stats = [
    {
      label: "My Tasks",
      value: totalTasks,
      icon: <ClipboardList size={20} />,
      box: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Completed",
      value: completedTasks,
      icon: <CheckCircle size={20} />,
      box: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "In Progress",
      value: inProgressTasks,
      icon: <Clock3 size={20} />,
      box: "bg-indigo-500/10 text-indigo-500",
    },
    {
      label: "Shared",
      value: sharedWithMeCount,
      icon: <Share2 size={20} />,
      box: "bg-purple-500/10 text-purple-500",
    },
  ];

  return (
    <section className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-7">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="font-black text-lg text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 size={22} className="text-blue-500" />
            Performance Analytics
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
            Track your task progress and workload summary.
          </p>
        </div>

        <div className="bg-slate-100 dark:bg-slate-800 px-5 py-3 rounded-2xl">
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
            Completion
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            {progressPercent}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="rounded-3xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-5 hover:-translate-y-1 hover:shadow-lg transition-all"
          >
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-4 ${stat.box}`}
            >
              {stat.icon}
            </div>

            <p className="text-xs font-black uppercase tracking-wider text-slate-400">
              {stat.label}
            </p>

            <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">
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
            Action required: {overdueTasks} overdue task
            {overdueTasks > 1 ? "s" : ""}.
          </p>
        </div>
      )}

      <div className="h-[280px] w-full rounded-[1.75rem] bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 p-4">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={6}
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>

              <Tooltip
                contentStyle={{
                  borderRadius: "16px",
                  border: "none",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
                }}
              />

              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <ClipboardList size={36} />
            <p className="font-black mt-3">No task data yet</p>
            <p className="text-xs mt-1">Create tasks to view analytics.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Dashboard;