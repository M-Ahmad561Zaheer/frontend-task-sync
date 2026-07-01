import React, { useState, useEffect } from "react";
import { PlusCircle, Save, Calendar, FileText, Link, Tag, X } from "lucide-react";

// Preset tags suggestions
const PRESET_TAGS = ["Work", "Personal", "Urgent", "Design", "Bug", "Feature", "Meeting", "Review"];

const TAG_COLORS = {
  Work: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Personal: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Urgent: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  Design: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Bug: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  Feature: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  Meeting: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Review: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

export const getTagColor = (tag) =>
  TAG_COLORS[tag] || "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";

const TaskForm = ({ onCreate, editingTask, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "Pending",
    dueDate: "",
    attachment: "",
    tags: [],
  });
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title || "",
        description: editingTask.description || "",
        status: editingTask.status || "Pending",
        dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split("T")[0] : "",
        attachment: editingTask.attachments?.[0] || "",
        tags: editingTask.tags || [],
      });
    }
  }, [editingTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      attachments: formData.attachment ? [formData.attachment] : [],
    };
    if (editingTask) {
      onUpdate(editingTask._id, payload);
    } else {
      onCreate(payload);
    }
    setFormData({ title: "", description: "", status: "Pending", dueDate: "", attachment: "", tags: [] });
    setTagInput("");
  };

  const addTag = (tag) => {
    const clean = tag.trim();
    if (!clean || formData.tags.includes(clean) || formData.tags.length >= 5) return;
    setFormData((prev) => ({ ...prev, tags: [...prev.tags, clean] }));
    setTagInput("");
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); }
    if (e.key === "Backspace" && !tagInput && formData.tags.length > 0) {
      removeTag(formData.tags[formData.tags.length - 1]);
    }
  };

  return (
    <div className="max-w-2xl mx-auto w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-gray-900 p-4 md:p-8 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-4 dark:border-gray-800">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
            <PlusCircle className="text-blue-600 dark:text-blue-400" size={24} />
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800 dark:text-white">
            {editingTask ? "Edit Task" : "Create New Task"}
          </h2>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
              <Tag size={14} /> Title
            </label>
            <input
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border-2 border-gray-100 dark:border-gray-800 p-3 rounded-xl dark:bg-gray-800 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
              <FileText size={14} /> Description
            </label>
            <textarea
              placeholder="Add more details..."
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full border-2 border-gray-100 dark:border-gray-800 p-3 rounded-xl dark:bg-gray-800 focus:border-blue-500 outline-none transition-all dark:text-white placeholder:text-gray-400"
            />
          </div>

          {/* Status + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full border-2 border-gray-100 dark:border-gray-800 p-3 rounded-xl dark:bg-gray-800 dark:text-white focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          {/* ✅ Tags Input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
              <Tag size={14} /> Tags
              <span className="text-[10px] font-normal text-gray-400">(max 5)</span>
            </label>

            {/* Tag input field */}
            <div className="flex flex-wrap gap-2 p-3 border-2 border-gray-100 dark:border-gray-800 rounded-xl dark:bg-gray-800 focus-within:border-blue-500 transition-all min-h-[48px]">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getTagColor(tag)}`}
                >
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)} className="hover:opacity-70">
                    <X size={10} />
                  </button>
                </span>
              ))}
              {formData.tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={formData.tags.length === 0 ? "Type tag + Enter..." : "Add more..."}
                  className="flex-1 min-w-[100px] bg-transparent outline-none text-xs dark:text-white placeholder:text-gray-400"
                />
              )}
            </div>

            {/* Preset tags */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_TAGS.filter((t) => !formData.tags.includes(t)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-bold border border-dashed border-gray-200 dark:border-gray-700 hover:border-solid transition-all ${getTagColor(tag)}`}
                >
                  + {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Attachment */}
          <div className="space-y-1">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1 flex items-center gap-2">
              <Link size={14} /> Attachment Link
            </label>
            <input
              type="text"
              placeholder="https://..."
              value={formData.attachment}
              onChange={(e) => setFormData({ ...formData, attachment: e.target.value })}
              className="w-full border-2 border-gray-100 dark:border-gray-800 p-3 rounded-xl dark:bg-gray-800 focus:border-blue-500 outline-none transition-all dark:text-white"
            />
          </div>
        </div>

        {/* Submit */}
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