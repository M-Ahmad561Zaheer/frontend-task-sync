import React, { useState } from "react";
import { shareTask, updateStatus } from "../services/taskService";
import { Edit3, Trash2, Share2, Calendar, Clock, CheckCircle2, User, Link, ExternalLink } from "lucide-react";

const TaskList = ({ tasks, setEditingTask, onDelete, fetchTasks, isSharedView = false }) => {
  const currentUserId = localStorage.getItem("userId");
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  const handleShare = async (taskId) => {
    const email = prompt("Enter the email address to share this task with:");
    if (!email) return;
    if (!email.includes("@")) { alert("Please enter a valid email address!"); return; }
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
      case "Completed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200";
      case "In Progress": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200";
      default: return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200";
    }
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 font-medium italic">
            {isSharedView ? "No tasks shared with you yet." : "No tasks found. Time to create one! ✨"}
          </p>
        </div>
      ) : (
        tasks.map((task) => {
          const isOwner = task.isOwner !== undefined
            ? task.isOwner
            : task.owner?._id
              ? task.owner._id.toString() === currentUserId
              : task.owner?.toString() === currentUserId;

          const attachmentUrl = task.attachments?.[0] || null;

          return (
            <div key={task._id} className="group bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h3>
                    {(task.isShared || isSharedView) && (
                      <span className="flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-purple-200 dark:border-purple-800">
                        <User size={10} /> Shared with me
                      </span>
                    )}
                    {isSharedView && task.owner?.name && (
                      <span className="text-[10px] text-gray-400 font-medium">by {task.owner.name}</span>
                    )}
                    {task.status === "Completed" && <CheckCircle2 size={18} className="text-green-500" />}
                  </div>

                  {task.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{task.description}</p>
                  )}

                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(task.status)}`}>
                      <Clock size={12} />{task.status}
                    </span>
                    {task.dueDate && (
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
                        <Calendar size={12} />{new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {attachmentUrl && (
                    <a href={attachmentUrl} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800"
                    >
                      <Link size={12} className="shrink-0" />
                      <span className="truncate max-w-[250px]">{attachmentUrl}</span>
                      <ExternalLink size={10} className="shrink-0 opacity-60" />
                    </a>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex sm:flex-col lg:flex-row gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  {isOwner && !isSharedView && (
                    <>
                      <button onClick={() => handleShare(task._id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white p-2 sm:px-3 rounded-lg text-xs font-bold transition-all border border-green-200">
                        <Share2 size={16} /><span className="hidden lg:inline">Share</span>
                      </button>
                      <button onClick={() => setEditingTask(task)}
                        className="flex-1 flex items-center justify-center gap-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white p-2 sm:px-3 rounded-lg text-xs font-bold transition-all border border-amber-200">
                        <Edit3 size={16} /><span className="hidden lg:inline">Edit</span>
                      </button>
                      <button onClick={() => onDelete(task._id)}
                        className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 sm:px-3 rounded-lg text-xs font-bold transition-all border border-red-200">
                        <Trash2 size={16} /><span className="hidden lg:inline">Delete</span>
                      </button>
                    </>
                  )}

                  {isSharedView && (
                    <select value={task.status} disabled={updatingStatusId === task._id}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      className={`text-xs font-bold px-3 py-2 rounded-lg border transition-all outline-none cursor-pointer w-full sm:w-auto
                        ${task.status === "Completed" ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                          : task.status === "In Progress" ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800"
                          : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800"}
                        ${updatingStatusId === task._id ? "opacity-50 cursor-wait" : ""}`}
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