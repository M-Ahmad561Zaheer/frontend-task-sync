import React, { useState } from "react";
import { X, Mail, Shield, Copy, Check, Edit2, Save, User } from "lucide-react";
import { toast } from "react-hot-toast";

const ProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user?.id);
    setCopied(true);
    toast.success("ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (newName.trim() === "") return toast.error("Name cannot be empty");
    onUpdate(newName);
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-[2rem] bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="relative px-6 pt-6 pb-20 bg-gradient-to-br from-blue-600 to-indigo-700">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 text-white/80 text-xs font-bold uppercase tracking-widest">
            <User size={14} />
            Profile
          </div>

          <h2 className="mt-3 text-2xl font-black text-white">
            Account Details
          </h2>

          <p className="mt-1 text-sm text-blue-100">
            Manage your profile information.
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col items-center">
            <div className="w-28 h-28 rounded-[2rem] bg-white dark:bg-slate-950 p-2 shadow-xl border border-white/50 dark:border-slate-800">
              <div className="w-full h-full rounded-[1.5rem] bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-4xl font-black text-blue-600 dark:text-blue-400">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            </div>
          </div>

          <div className="mt-5 text-center">
            {isEditing ? (
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  className="w-full max-w-[220px] bg-slate-50 dark:bg-slate-900 border border-blue-500 rounded-2xl px-4 py-2.5 text-center font-bold text-lg outline-none text-slate-900 dark:text-white"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />

                <button
                  onClick={handleSave}
                  className="p-3 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all"
                >
                  <Save size={18} />
                </button>
              </div>
            ) : (
              <div className="group flex items-center justify-center gap-2">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                  {user?.name}
                </h3>

                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                >
                  <Edit2 size={16} />
                </button>
              </div>
            )}

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5">
              <Mail size={14} />
              {user?.email}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                  <Shield size={11} />
                  Unique ID
                </span>

                <button
                  onClick={handleCopyId}
                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-all"
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>

              <p className="font-mono text-[11px] break-all text-slate-600 dark:text-slate-300">
                {user?.id}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl text-center border border-blue-100 dark:border-blue-900/40">
                <p className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Role
                </p>
                <p className="font-bold text-sm text-slate-900 dark:text-white mt-1">
                  Task Manager
                </p>
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl text-center border border-emerald-100 dark:border-emerald-900/40">
                <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                  Status
                </p>
                <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-1">
                  Active
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-black hover:opacity-90 transition-all shadow-lg"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;