import React, { useState } from "react";
import { shareTask, updateStatus } from "../services/taskService";
import { getTagColor } from "./TaskForm";
import {
  Edit3,
  Trash2,
  Share2,
  Calendar,
  Clock,
  CheckCircle2,
  User,
  Link,
  ExternalLink,
  Tag,
  ClipboardList,
} from "lucide-react";

const TaskList = ({
  tasks,
  setEditingTask,
  onDelete,
  fetchTasks,
  isSharedView = false,
  activeTag,
}) => {
  const currentUserId = localStorage.getItem("userId");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const handleShare = async (taskId) => {
    const email = prompt("Enter the email address to share this task with:");
    if (!email) return;
    if (!email.includes("@")) {
      alert("Please enter a valid email address!");
      return;
    }

    try {
      await shareTask(taskId, email);
      alert(`✅ Task shared with ${email}!`);
      if (fetchTasks) fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Sharing failed!");
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdatingStatusId(taskId);
    try {
      await updateStatus(taskId, newStatus);
      if (fetchTasks) fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Status update failed!");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "Completed":
        return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
      case "In Progress":
        return "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800";
      default:
        return "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    }
  };

  const filteredTasks = activeTag
    ? tasks.filter((t) => t.tags?.includes(activeTag))
    : tasks;

  return (
    <div className="space-y-4">
      {filteredTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-5 bg-slate-50 dark:bg-slate-900 rounded-[1.75rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4 shadow-sm">
            <ClipboardList size={28} className="text-slate-400" />
          </div>

          <h3 className="text-lg font-black text-slate-800 dark:text-white">
            No tasks found
          </h3>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium max-w-md">
            {activeTag
              ? `No tasks with tag "${activeTag}".`
              : isSharedView
              ? "No tasks have been shared with you yet."
              : "Your workspace is empty. Create your first task to get started."}
          </p>
        </div>
      ) : (
        filteredTasks.map((task) => {
          const isOwner =
            task.isOwner !== undefined
              ? task.isOwner
              : task.owner?._id
              ? task.owner._id.toString() === currentUserId
              : task.owner?.toString() === currentUserId;

          const attachmentUrl = task.attachments?.[0] || null;

          return (
            <div
              key={task._id}
              className="group relative overflow-hidden bg-white dark:bg-slate-900 p-5 md:p-6 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20 transition-all duration-300"
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex flex-col xl:flex-row justify-between gap-5">
                <div className="flex-1 min-w-0 space-y-4">
                  <div className="flex flex-wrap items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-blue-600 transition-all">
                      {task.status === "Completed" ? (
                        <CheckCircle2
                          size={22}
                          className="text-emerald-500 group-hover:text-white"
                        />
                      ) : (
                        <Clock
                          size={22}
                          className="text-slate-500 group-hover:text-white"
                        />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {task.title}
                        </h3>

                        {(task.isShared || isSharedView) && (
                          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400 text-[10px] px-2.5 py-1 rounded-full font-black uppercase border border-purple-200 dark:border-purple-800">
                            <User size={10} />
                            Shared
                          </span>
                        )}

                        {isSharedView && task.owner?.name && (
                          <span className="text-[11px] text-slate-400 font-bold">
                            by {task.owner.name}
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                          {task.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {task.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-black border ${getTagColor(
                            tag
                          )}`}
                        >
                          <Tag size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${getStatusStyles(
                        task.status
                      )}`}
                    >
                      <Clock size={13} />
                      {task.status}
                    </span>

                    {task.dueDate && (
                      <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-full text-xs font-black border border-slate-200 dark:border-slate-700">
                        <Calendar size={13} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {attachmentUrl && (
                    <a
                      href={attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex max-w-full items-center gap-2 text-xs text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950/40 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-800 transition-all"
                    >
                      <Link size={13} className="shrink-0" />
                      <span className="truncate max-w-[260px] sm:max-w-[420px]">
                        {attachmentUrl}
                      </span>
                      <ExternalLink size={11} className="shrink-0 opacity-60" />
                    </a>
                  )}
                </div>

                <div className="flex xl:flex-col gap-2 w-full xl:w-auto border-t xl:border-t-0 xl:border-l border-slate-100 dark:border-slate-800 pt-4 xl:pt-0 xl:pl-5">
                  {isOwner && !isSharedView && (
                    <>
                      <button
                        onClick={() => handleShare(task._id)}
                        className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white px-3 py-2.5 rounded-xl text-xs font-black transition-all border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-600 dark:hover:text-white"
                      >
                        <Share2 size={16} />
                        <span className="hidden sm:inline">Share</span>
                      </button>

                      <button
                        onClick={() => setEditingTask(task)}
                        className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white px-3 py-2.5 rounded-xl text-xs font-black transition-all border border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 dark:hover:bg-amber-500 dark:hover:text-white"
                      >
                        <Edit3 size={16} />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => onDelete(task._id)}
                        className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white px-3 py-2.5 rounded-xl text-xs font-black transition-all border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-600 dark:hover:text-white"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    </>
                  )}

                  {isSharedView && (
                    <select
                      value={task.status}
                      disabled={updatingStatusId === task._id}
                      onChange={(e) =>
                        handleStatusChange(task._id, e.target.value)
                      }
                      className={`text-xs font-black px-4 py-3 rounded-xl border transition-all outline-none cursor-pointer w-full xl:w-[160px]
                        ${
                          task.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                            : task.status === "In Progress"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800"
                            : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                        }
                        ${
                          updatingStatusId === task._id
                            ? "opacity-50 cursor-wait"
                            : ""
                        }`}
                    >
                      <option value="Pending">🕒 Pending</option>
                      <option value="In Progress">🚀 In Progress</option>
                      <option value="Completed">✅ Completed</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TaskList;