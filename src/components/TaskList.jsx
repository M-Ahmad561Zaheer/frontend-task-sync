import React from "react";
import { shareTask } from "../services/taskService";
// ✅ Link icon yahan add kar diya hai
import { Edit3, Trash2, Share2, Calendar, Clock, CheckCircle2, User, Link as LinkIcon } from "lucide-react";

const TaskList = ({ tasks, setEditingTask, onDelete, fetchTasks }) => {
  const currentUserId = localStorage.getItem("userId");

  const handleShare = async (taskId) => {
    const email = prompt("Enter the Email address of the person you want to share with:");
    if (!email) return;

    if (!email.includes("@")) {
      alert("Please enter a valid email address!");
      return;
    }

    try {
      await shareTask(taskId, email);
      alert(`✅ Task Shared with ${email}!`);
      if (fetchTasks) fetchTasks();
    } catch (err) {
      alert(err.response?.data?.message || "Sharing failed!");
    }
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200';
      default: return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200';
    }
  };

  return (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 font-medium italic">No tasks found. Time to relax! ☕</p>
        </div>
      ) : (
        tasks.map((task) => {
          const isOwner = task.owner === currentUserId || !task.owner;

          return (
            <div 
              key={task._id} 
              className="group bg-white dark:bg-gray-900 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-800"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-extrabold text-gray-800 dark:text-white group-hover:text-blue-600 transition-colors">
                      {task.title}
                    </h3>
                    
                    {!isOwner && (
                      <span className="flex items-center gap-1 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-purple-200 dark:border-purple-800">
                        <User size={10} /> Shared with me
                      </span>
                    )}
                    
                    {task.status === 'Completed' && <CheckCircle2 size={18} className="text-green-500" />}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {task.description}
                  </p>

                  {/* ✅ Updated Clickable Link Section */}
{task.link && (
  <div className="mt-2">
    <a 
      href={task.link.startsWith('http') ? task.link : `https://${task.link}`} 
      target="_blank" 
      rel="noopener noreferrer"
      // Added cursor-pointer and relative z-20 to ensure clickability
      className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 px-4 py-2 rounded-xl border border-blue-200 dark:border-blue-800 transition-all cursor-pointer relative z-20"
      onClick={(e) => e.stopPropagation()} // Card ke click event ko rokne ke liye
    >
      <LinkIcon size={14} strokeWidth={3} />
      <span>Open Resource</span>
      {/* External Link ka icon */}
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
      </svg>
    </a>
  </div>
)}
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(task.status)}`}>
                      <Clock size={12} />
                      {task.status}
                    </span>

                    {task.dueDate && (
                      <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-3 py-1 rounded-full text-xs font-bold">
                        <Calendar size={12} />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex sm:flex-col lg:flex-row gap-2 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0">
                  {isOwner && (
                    <button 
                      onClick={() => handleShare(task._id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white p-2 sm:px-3 rounded-lg text-xs font-bold transition-all border border-green-200"
                    >
                      <Share2 size={16} />
                      <span className="hidden lg:inline">Share</span>
                    </button>
                  )}
                  
                  <button 
                    onClick={() => setEditingTask(task)}
                    className="flex-1 flex items-center justify-center gap-1 bg-amber-50 text-amber-600 hover:bg-amber-500 hover:text-white p-2 sm:px-3 rounded-lg text-xs font-bold transition-all border border-amber-200"
                  >
                    <Edit3 size={16} />
                    <span className="hidden lg:inline">Edit</span>
                  </button>
                  
                  {isOwner && (
                    <button 
                      onClick={() => onDelete(task._id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-2 sm:px-3 rounded-lg text-xs font-bold transition-all border border-red-200"
                    >
                      <Trash2 size={16} />
                      <span className="hidden lg:inline">Delete</span>
                    </button>
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