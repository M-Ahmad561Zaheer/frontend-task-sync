import React, { useState } from "react";
import { shareTask, updateStatus } from "../services/taskService";
import { 
  Edit3, Trash2, Share2, Calendar, Clock, CheckCircle2, 
  User, Link as LinkIcon, ExternalLink, MoreVertical, AlertCircle 
} from "lucide-react";

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
      case "Completed": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50";
      case "In Progress": return "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-800/50";
      default: return "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border-amber-100 dark:border-amber-800/50";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 dark:bg-gray-900/20 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-sm mb-4">
             <AlertCircle size={32} className="text-gray-300" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-bold tracking-tight">
            {isSharedView ? "No shared tasks yet." : "Your task list is a clean slate."}
          </p>
          <p className="text-xs text-gray-400 mt-1 italic">Ready to get productive? ✨</p>
        </div>
      ) : (
        tasks.map((task) => {
          const isOwner = task.isOwner !== undefined
            ? task.isOwner
            : task.owner?._id
              ? task.owner._id.toString() === currentUserId
              : task.owner?.toString() === currentUserId;

          const attachmentUrl = task.attachments?.[0] || null;
          const isUpdating = updatingStatusId === task._id;

          return (
            <div key={task._id} 
              className={`group relative bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 border border-gray-100 dark:border-gray-800 flex flex-col gap-4 ${isUpdating ? 'opacity-60 grayscale-[0.5]' : ''}`}>
              
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-3 flex-1">
                  {/* Title & Badges */}
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-xl font-black tracking-tight text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h3>
                    
                    {(task.isShared || isSharedView) && (
                      <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest border border-purple-100 dark:border-purple-800/50">
                        <User size={12} strokeWidth={3} /> {isSharedView ? `From ${task.owner?.name || 'Partner'}` : 'Collaborative'}
                      </div>
                    )}
                    
                    {task.status === "Completed" && (
                      <div className="bg-emerald-500 p-1 rounded-full">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-2xl font-medium">
                      {task.description}
                    </p>
                  )}

                  {/* Metadata & Attachment */}
                  <div className="flex flex-wrap items-center gap-4 pt-2">
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-tighter border shadow-sm ${getStatusStyles(task.status)}`}>
                      <Clock size={14} strokeWidth={2.5} /> {task.status}
                    </div>

                    {task.dueDate && (
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-tighter border border-gray-100 dark:border-gray-700">
                        <Calendar size={14} /> {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    )}

                    {attachmentUrl && (
                      <a href={attachmentUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 text-[11px] font-black uppercase tracking-tighter text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10 px-4 py-1.5 rounded-xl border border-blue-100 dark:border-blue-800 hover:bg-blue-600 hover:text-white transition-all group/link"
                      >
                        <LinkIcon size={14} /> Link 
                        <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 -ml-1 transition-all" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Desktop Actions Section */}
                <div className="hidden sm:flex items-center gap-1 bg-gray-50 dark:bg-gray-800/50 p-1.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                  {isOwner && !isSharedView ? (
                    <>
                      <button onClick={() => handleShare(task._id)} className="p-2.5 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition-all" title="Share Task">
                        <Share2 size={18} />
                      </button>
                      <button onClick={() => setEditingTask(task)} className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all" title="Edit Task">
                        <Edit3 size={18} />
                      </button>
                      <button onClick={() => onDelete(task._id)} className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all" title="Delete Task">
                        <Trash2 size={18} />
                      </button>
                    </>
                  ) : isSharedView && (
                    <div className="px-2">
                       <select 
                        value={task.status} 
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="bg-transparent text-xs font-black uppercase tracking-widest outline-none cursor-pointer py-1"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">Working</option>
                        <option value="Completed">Done</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Mobile Actions (Visible on small screens) */}
              <div className="sm:hidden flex gap-2 pt-4 border-t border-gray-50 dark:border-gray-800">
                 {isOwner && !isSharedView ? (
                   <>
                    <button onClick={() => handleShare(task._id)} className="flex-1 flex items-center justify-center gap-2 bg-emerald-50 text-emerald-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-emerald-100">
                        <Share2 size={16} /> Share
                    </button>
                    <button onClick={() => onDelete(task._id)} className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest border border-red-100">
                        <Trash2 size={16} /> Delete
                    </button>
                   </>
                 ) : isSharedView && (
                   <div className="w-full bg-blue-50 dark:bg-blue-900/20 rounded-xl p-1">
                      <select 
                        value={task.status} 
                        disabled={isUpdating}
                        onChange={(e) => handleStatusChange(task._id, e.target.value)}
                        className="w-full bg-transparent text-center text-xs font-black uppercase tracking-widest p-2 outline-none"
                      >
                        <option value="Pending">🕒 Set Pending</option>
                        <option value="In Progress">🚀 Set Working</option>
                        <option value="Completed">✅ Set Done</option>
                      </select>
                   </div>
                 )}
              </div>

              {/* Status Update Pulse */}
              {isUpdating && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] flex items-center justify-center rounded-[2rem] z-10">
                   <div className="flex items-center gap-2 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Syncing...</span>
                   </div>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default TaskList;