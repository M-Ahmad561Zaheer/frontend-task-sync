import React, { useState } from "react";
import { X, User, Mail, Shield, Copy, Check, Edit2, Save } from "lucide-react";
import { toast } from "react-hot-toast";

const ProfileModal = ({ isOpen, onClose, user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(user?.name || "");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyId = () => {
    navigator.clipboard.writeText(user?.id);
    setCopied(true);
    toast.success("ID Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (newName.trim() === "") return toast.error("Name cannot be empty");
    onUpdate(newName);
    setIsEditing(false);
    
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border dark:border-gray-800 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-8 pb-8">
          <div className="relative -mt-16 mb-6 flex flex-col items-center">
            <div className="w-32 h-32 bg-white dark:bg-gray-900 p-2 rounded-full shadow-xl">
              <div className="w-full h-full bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-4xl font-black text-blue-600">
                {user?.name?.[0].toUpperCase()}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Name Field */}
            <div className="text-center">
              {isEditing ? (
                <div className="flex gap-2 items-center justify-center">
                  {/* <input 
                    type="text"
                    className="bg-gray-50 dark:bg-gray-800 border-2 border-blue-500 rounded-xl px-4 py-1 text-center font-bold text-xl outline-none"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    autoFocus
                  /> */}
                  <input 
  type="text"
  className="bg-gray-50 dark:bg-gray-800 border-2 border-blue-500 rounded-xl px-2 py-1 text-center font-bold text-lg md:text-xl outline-none w-full max-w-[200px]"
  value={newName}
  onChange={(e) => setNewName(e.target.value)}
  autoFocus
/>
                  <button onClick={handleSave} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                    <Save size={18} />
                  </button>
                </div>
              ) : (
                <div className="group flex items-center justify-center gap-2">
                  <h2 className="text-2xl font-black tracking-tight">{user?.name}</h2>
                  <button 
                        onClick={() => setIsEditing(true)}
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 text-gray-400 hover:text-blue-500 transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
              <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 mt-1">
                <Mail size={14} /> {user?.email}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* User ID Section */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-1">
                    <Shield size={10} /> Your unique ID
                  </span>
                  <button onClick={handleCopyId} className="text-blue-600 hover:text-blue-700 transition-all">
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="font-mono text-[11px] break-all text-gray-600 dark:text-gray-300">
                  {user?.id}
                </p>
              </div>

              {/* Stats / Info */}
              <div className="flex gap-4">
                 <div className="flex-1 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-blue-600 uppercase">Role</p>
                    <p className="font-bold text-sm">Task Manager</p>
                 </div>
                 <div className="flex-1 p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-indigo-600 uppercase">Status</p>
                    <p className="font-bold text-sm text-green-500">Active</p>
                 </div>
              </div>
            </div>

            <button 
              onClick={onClose}
              className="w-full py-4 bg-gray-900 dark:bg-white dark:text-gray-900 text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-lg"
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