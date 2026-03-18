import React, { useState, useEffect } from "react";
import { PlusCircle, Save, Calendar, FileText, Link, Tag, ChevronDown } from "lucide-react";

const TaskForm = ({ onCreate, editingTask, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Pending",
    dueDate: "",
    attachment: ""
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        status: editingTask.status || "Pending",
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split("T")[0] : "",
        attachment: editingTask.attachments?.[0] || ""
      });
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      attachments: formData.attachment ? [formData.attachment] : [] 
    };
    
    if (editingTask) {
      onUpdate(editingTask._id, payload);
    } else {
      onCreate(payload);
    }
    
    setFormData({ title: "", description: "", status: "Pending", dueDate: "", attachment: "" });
  };

  return (
    <div className="max-w-2xl mx-auto w-full transition-all duration-300">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-6 md:p-10 rounded-[2rem] shadow-2xl border border-gray-100 dark:border-gray-800 space-y-8"
      >
        {/* Form Header */}
        <div className="flex items-center gap-4 border-b border-gray-50 dark:border-gray-800/50 pb-6">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
            <PlusCircle className="text-blue-600 dark:text-blue-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              {editingTask ? "Edit Task" : "Create New Task"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Organize your workflow efficiently.</p>
          </div>
        </div>

        <div className="space-y-5">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1 flex items-center gap-2">
              <Tag size={16} className="text-blue-500" /> Task Title
            </label>
            <input
              type="text"
              placeholder="e.g., Design System Update"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400 shadow-sm"
              required
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1 flex items-center gap-2">
              <FileText size={16} className="text-indigo-500" /> Description
            </label>
            <textarea
              placeholder="Describe the task details here..."
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400 shadow-sm resize-none"
            />
          </div>

          {/* Grid for Status and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1">Current Status</label>
              <div className="relative group">
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none appearance-none cursor-pointer font-medium"
                >
                  <option value="Pending">🕒 Pending</option>
                  <option value="In Progress">🚀 In Progress</option>
                  <option value="Completed">✅ Completed</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none group-hover:text-blue-500 transition-colors" size={18} />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1 flex items-center gap-2">
                <Calendar size={16} className="text-rose-500" /> Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl dark:text-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          {/* Attachment URL */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-600 dark:text-gray-400 ml-1 flex items-center gap-2">
              <Link size={16} className="text-emerald-500" /> Resource / Attachment Link
            </label>
            <input
              type="text"
              placeholder="https://example.com/resource"
              value={formData.attachment}
              onChange={(e) => setFormData({...formData, attachment: e.target.value})}
              className="w-full bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400 shadow-sm"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-5 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-black tracking-wide shadow-xl shadow-blue-500/30 flex items-center justify-center gap-3 active:scale-[0.98] transform"
        >
          <Save size={22} className="animate-pulse" />
          {editingTask ? "Update This Task" : "Create Task Now"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;