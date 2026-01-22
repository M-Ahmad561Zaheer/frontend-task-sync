import React, { useState, useEffect } from "react";
import { PlusCircle, Save, Calendar, FileText, Link, Tag } from "lucide-react";

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
        className="bg-white dark:bg-gray-900 p-4 md:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6"
      >
        {/* Form Header */}
        <div className="flex items-center gap-3 border-b pb-4 dark:border-gray-800">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <PlusCircle className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">
            {editingTask ? "Edit Task Details" : "Create New Task"}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
              <Tag size={14} /> Title
            </label>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full border-2 border-gray-100 dark:border-gray-800 p-3 rounded-xl dark:bg-gray-800 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
              required
            />
          </div>

          {/* Description Textarea */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
              <FileText size={14} /> Description
            </label>
            <textarea
              placeholder="Add more details about this task..."
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full border-2 border-gray-100 dark:border-gray-800 p-3 rounded-xl dark:bg-gray-800 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Grid for Status and Date - Responsive (1 col on mobile, 2 on tablet) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Status</label>
              <select 
                value={formData.status} 
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full border-2 border-gray-100 dark:border-gray-800 p-3 rounded-xl dark:bg-gray-800 dark:text-white focus:border-blue-500 outline-none appearance-none"
              >
                <option value="Pending">🕒 Pending</option>
                <option value="In Progress">🚀 In Progress</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
                <Calendar size={14} /> Due Date
              </label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                className="w-full border-2 border-gray-100 dark:border-gray-800 p-3 rounded-xl dark:bg-gray-800 dark:text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* Attachment URL */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
              <Link size={14} /> Attachment Link
            </label>
            <input
              type="text"
              placeholder="https://image-url.com or documentation link"
              value={formData.attachment}
              onChange={(e) => setFormData({...formData, attachment: e.target.value})}
              className="w-full border-2 border-gray-100 dark:border-gray-800 p-3 rounded-xl dark:bg-gray-800 focus:border-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Save size={20} />
          {editingTask ? "Update Task" : "Save Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;