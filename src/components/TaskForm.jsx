import React, { useState, useEffect } from "react";
import {
  PlusCircle,
  Save,
  Calendar,
  FileText,
  Link,
  Tag,
  X,
  Layers,
} from "lucide-react";

const PRESET_TAGS = [
  "Work",
  "Personal",
  "Urgent",
  "Design",
  "Bug",
  "Feature",
  "Meeting",
  "Review",
];

const TAG_COLORS = {
  Work: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800",
  Personal:
    "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800",
  Urgent:
    "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800",
  Design:
    "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-800",
  Bug: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
  Feature:
    "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:text-teal-400 dark:border-teal-800",
  Meeting:
    "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800",
  Review:
    "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-950/40 dark:text-pink-400 dark:border-pink-800",
};

export const getTagColor = (tag) =>
  TAG_COLORS[tag] ||
  "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";

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
        dueDate: editingTask.dueDate
          ? new Date(editingTask.dueDate).toISOString().split("T")[0]
          : "",
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

    setFormData({
      title: "",
      description: "",
      status: "Pending",
      dueDate: "",
      attachment: "",
      tags: [],
    });

    setTagInput("");
  };

  const addTag = (tag) => {
    const clean = tag.trim();
    if (!clean || formData.tags.includes(clean) || formData.tags.length >= 5)
      return;

    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, clean],
    }));

    setTagInput("");
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput);
    }

    if (e.key === "Backspace" && !tagInput && formData.tags.length > 0) {
      removeTag(formData.tags[formData.tags.length - 1]);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm p-5 md:p-7 space-y-6"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <PlusCircle size={25} />
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {editingTask ? "Edit Task" : "Create New Task"}
              </h2>

              <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                {editingTask
                  ? "Update task details without changing workflow."
                  : "Add a new task with status, tags and deadline."}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-500 dark:text-slate-300 w-fit">
            <Layers size={13} />
            Task Details
          </div>
        </div>

        <div className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
              <Tag size={14} />
              Title
            </label>

            <input
              type="text"
              placeholder="What needs to be done?"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-400 font-semibold"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
              <FileText size={14} />
              Description
            </label>

            <textarea
              placeholder="Add more details about this task..."
              rows="4"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium resize-none"
            />
          </div>

          {/* Status + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1">
                Status
              </label>

              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-black"
              >
                <option value="Pending">🕒 Pending</option>
                <option value="In Progress">🚀 In Progress</option>
                <option value="Completed">✅ Completed</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <Calendar size={14} />
                Due Date
              </label>

              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) =>
                  setFormData({ ...formData, dueDate: e.target.value })
                }
                className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all font-bold"
              />
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
              <Tag size={14} />
              Tags
              <span className="text-[10px] font-bold text-slate-400 normal-case tracking-normal">
                max 5
              </span>
            </label>

            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-blue-500 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all min-h-[54px]">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border ${getTagColor(
                    tag
                  )}`}
                >
                  {tag}

                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:opacity-70"
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}

              {formData.tags.length < 5 && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder={
                    formData.tags.length === 0
                      ? "Type tag and press Enter..."
                      : "Add more..."
                  }
                  className="flex-1 min-w-[130px] bg-transparent outline-none text-sm dark:text-white placeholder:text-slate-400 font-medium"
                />
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {PRESET_TAGS.filter((t) => !formData.tags.includes(t)).map(
                (tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black border border-dashed hover:border-solid transition-all hover:scale-105 ${getTagColor(
                      tag
                    )}`}
                  >
                    + {tag}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Attachment */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 flex items-center gap-2">
              <Link size={14} />
              Attachment Link
            </label>

            <input
              type="text"
              placeholder="https://example.com/file"
              value={formData.attachment}
              onChange={(e) =>
                setFormData({ ...formData, attachment: e.target.value })
              }
              className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 px-4 py-3.5 rounded-2xl dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all font-black shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Save size={20} />
          {editingTask ? "Update Task" : "Save Task"}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;