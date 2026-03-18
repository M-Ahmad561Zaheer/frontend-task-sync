import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, Send, MessageCircle, Search, SmilePlus, Check, CheckCheck } from "lucide-react";
import {
  getChatRoomId,
  sendMessage,
  listenMessages,
  listenUserStatus,
  listenTyping,
  setTyping,
  markAllRead,
  addReaction,
  removeReaction,
} from "../services/chatService";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

// ─────────────────────────────────────────
// Message Bubble
// ─────────────────────────────────────────
const MessageBubble = ({ msg, isMe, currentUser, chatRoomId }) => {
  const [showEmojis, setShowEmojis] = useState(false);

  const reactions = msg.reactions
    ? Object.entries(msg.reactions).reduce((acc, [uid, emoji]) => {
        acc[emoji] = (acc[emoji] || []);
        acc[emoji].push(uid);
        return acc;
      }, {})
    : {};

  const myReaction = msg.reactions?.[currentUser.id];
  const isRead = msg.readBy && Object.keys(msg.readBy).length > 1;

  const handleReaction = async (emoji) => {
    if (myReaction === emoji) {
      await removeReaction(chatRoomId, msg.id, currentUser.id);
    } else {
      await addReaction(chatRoomId, msg.id, currentUser.id, emoji);
    }
    setShowEmojis(false);
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={`flex group ${isMe ? "justify-end" : "justify-start"} items-end gap-2`}
    >
      {/* Other user avatar */}
      {!isMe && (
        <div className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-[10px] font-black text-white shrink-0 mb-1">
          {msg.senderName?.[0]?.toUpperCase()}
        </div>
      )}

      <div className={`max-w-[72%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
        {/* Bubble */}
        <div className="relative">
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm break-words leading-relaxed ${
              isMe
                ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm shadow-lg shadow-blue-500/30"
                : "bg-white/15 backdrop-blur-md text-white border border-white/20 rounded-bl-sm shadow-lg"
            }`}
          >
            {msg.text}
          </div>

          {/* Emoji picker on hover */}
          <div className={`absolute ${isMe ? "right-0" : "left-0"} -top-8 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10`}>
            <div className="flex gap-1 bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-full px-2 py-1 shadow-xl">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`text-sm hover:scale-125 transition-transform ${
                    myReaction === emoji ? "scale-125" : ""
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reactions display */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs backdrop-blur-sm border transition-all ${
                  users.includes(currentUser.id)
                    ? "bg-blue-500/30 border-blue-400/50 text-white"
                    : "bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
                }`}
              >
                {emoji} <span className="text-[10px]">{users.length}</span>
              </button>
            ))}
          </div>
        )}

        {/* Time + Read status */}
        <div className={`flex items-center gap-1 text-[10px] text-white/50 px-1`}>
          <span>{formatTime(msg.timestamp)}</span>
          {isMe && (
            isRead
              ? <CheckCheck size={12} className="text-blue-300" />
              : <Check size={12} className="text-white/40" />
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Chat Window
// ─────────────────────────────────────────
const ChatWindow = ({ currentUser, otherUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherStatus, setOtherStatus] = useState({ online: false, lastSeen: null });
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatRoomId = getChatRoomId(currentUser.id, otherUser.id);

  useEffect(() => {
    const unsub = listenMessages(chatRoomId, (msgs) => {
      setMessages(msgs);
      // Saare unread messages read mark karo
      markAllRead(chatRoomId, msgs, currentUser.id).catch(console.error);
    });
    return unsub;
  }, [chatRoomId, currentUser.id]);

  useEffect(() => {
    const unsub = listenUserStatus(otherUser.id, setOtherStatus);
    return unsub;
  }, [otherUser.id]);

  useEffect(() => {
    const unsub = listenTyping(chatRoomId, currentUser.id, setIsOtherTyping);
    return unsub;
  }, [chatRoomId, currentUser.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOtherTyping]);

  // Cleanup typing on unmount
  useEffect(() => {
    return () => {
      setTyping(chatRoomId, currentUser.id, false).catch(console.error);
    };
  }, [chatRoomId, currentUser.id]);

  const handleTextChange = (e) => {
    setText(e.target.value);
    setTyping(chatRoomId, currentUser.id, true).catch(console.error);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(chatRoomId, currentUser.id, false).catch(console.error);
    }, 2000);
  };

  const handleSend = async () => {
    if (!text.trim()) return;
    setSending(true);
    setTyping(chatRoomId, currentUser.id, false).catch(console.error);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    try {
      await sendMessage(chatRoomId, currentUser.id, currentUser.name, text.trim());
      setText("");
    } catch (err) {
      console.error("Send error:", err);
    } finally {
      setSending(false);
    }
  };

  const formatLastSeen = (ts) => {
    if (!ts) return "a while ago";
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 backdrop-blur-sm border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center font-black text-white text-sm shadow-lg">
              {otherUser.name?.[0]?.toUpperCase()}
            </div>
            <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-gray-900 ${
              otherStatus.online ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-gray-500"
            }`} />
          </div>
          <div>
            <p className="font-bold text-sm text-white">{otherUser.name}</p>
            <p className="text-[11px] text-white/50">
              {otherStatus.online ? "Active now" : `Last seen ${formatLastSeen(otherStatus.lastSeen)}`}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-xl transition-all text-white/60 hover:text-white"
        >
          <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-white/30">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <MessageCircle size={28} />
            </div>
            <p className="text-sm">Say hi to {otherUser.name}! 👋</p>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isMe={msg.senderId === currentUser.id}
              currentUser={currentUser}
              chatRoomId={chatRoomId}
            />
          ))
        )}

        {/* Typing indicator */}
        {isOtherTyping && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black text-white shrink-0">
              {otherUser.name?.[0]?.toUpperCase()}
            </div>
            <div className="bg-white/15 backdrop-blur-md border border-white/20 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 bg-white/5 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 px-3 py-2 focus-within:border-blue-400/50 transition-all">
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder={`Message ${otherUser.name}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={`p-2 rounded-xl transition-all ${
              text.trim() && !sending
                ? "bg-blue-500 text-white hover:bg-blue-400 shadow-lg shadow-blue-500/30"
                : "text-white/20 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </div>
        <p className="text-[10px] text-white/20 mt-1.5 text-center">Enter to send · Hover message for reactions</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// Main Chat Sidebar — Glassmorphism
// ─────────────────────────────────────────
const ChatSidebar = ({ currentUser, chatUsers, isOpen, onClose }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [userStatuses, setUserStatuses] = useState({});

  useEffect(() => {
    if (!chatUsers?.length) return;
    const unsubs = chatUsers.map((user) =>
      listenUserStatus(user.id, (status) => {
        setUserStatuses((prev) => ({ ...prev, [user.id]: status }));
      })
    );
    return () => unsubs.forEach((u) => u());
  }, [chatUsers]);

  const filteredUsers = chatUsers?.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" onClick={onClose} />

      {/* Sidebar */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex overflow-hidden"
        style={{
          width: "clamp(320px, 40vw, 480px)",
          background: "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,27,75,0.95) 50%, rgba(15,23,42,0.95) 100%)",
          backdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-20 right-10 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-5 w-40 h-40 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Users List Panel */}
        <div
          className={`flex flex-col border-r border-white/8 relative z-10 transition-all duration-300 ${
            selectedUser ? "w-[72px] sm:w-[88px]" : "w-full sm:w-[200px]"
          }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-4 border-b border-white/8">
            {!selectedUser && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <MessageCircle size={13} className="text-blue-400" />
                </div>
                <span className="font-black text-xs text-white/80 uppercase tracking-widest">Chats</span>
              </div>
            )}
            <button
              onClick={onClose}
              className={`p-1.5 hover:bg-white/10 rounded-lg transition-all text-white/40 hover:text-white ${selectedUser ? "mx-auto" : ""}`}
            >
              <X size={14} />
            </button>
          </div>

          {/* Search - sirf jab user select nahi */}
          {!selectedUser && (
            <div className="px-2 py-2 border-b border-white/8">
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-2 text-white/30" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/8 border border-white/10 rounded-xl pl-7 pr-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-blue-400/50 transition-all"
                />
              </div>
            </div>
          )}

          {/* Users List */}
          <div className="flex-1 overflow-y-auto py-2 space-y-1 px-1.5">
            {filteredUsers.length === 0 ? (
              !selectedUser && (
                <div className="text-center py-8 px-3">
                  <div className="w-10 h-10 bg-white/5 rounded-full mx-auto flex items-center justify-center mb-2">
                    <MessageCircle size={16} className="text-white/20" />
                  </div>
                  <p className="text-[10px] text-white/30 italic">No contacts yet</p>
                  <p className="text-[9px] text-white/20 mt-1">Share a task first</p>
                </div>
              )
            ) : (
              filteredUsers.map((user) => {
                const status = userStatuses[user.id];
                const isOnline = status?.online;
                const isActive = selectedUser?.id === user.id;

                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center gap-2.5 px-2 py-2.5 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-blue-500/20 border border-blue-400/30"
                        : "hover:bg-white/8 border border-transparent"
                    } ${selectedUser ? "justify-center" : ""}`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white shadow-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/30"
                          : "bg-gradient-to-br from-violet-500/60 to-blue-500/60"
                      }`}>
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-gray-900 ${
                        isOnline ? "bg-emerald-400" : "bg-gray-500"
                      }`} />
                    </div>

                    {/* Name + status - sirf jab collapsed nahi */}
                    {!selectedUser && (
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-xs font-bold truncate ${isActive ? "text-blue-300" : "text-white/80"}`}>
                          {user.name?.split(" ")[0]}
                        </p>
                        <p className={`text-[10px] font-medium ${isOnline ? "text-emerald-400" : "text-white/30"}`}>
                          {isOnline ? "● Online" : "○ Offline"}
                        </p>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window Panel */}
        <div className="flex-1 flex flex-col relative z-10 min-w-0">
          {selectedUser ? (
            <ChatWindow
              currentUser={currentUser}
              otherUser={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-white/20 gap-4 px-6">
              <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center">
                <MessageCircle size={32} className="opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-white/40">Select a conversation</p>
                <p className="text-xs text-white/20 mt-1">Pick someone from the left to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatSidebar;