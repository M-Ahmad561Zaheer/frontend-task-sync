import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  MessageCircle,
  Search,
  Check,
  CheckCheck,
  Users,
} from "lucide-react";
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

const MessageBubble = ({ msg, isMe, currentUser, chatRoomId }) => {
  const reactions = msg.reactions
    ? Object.entries(msg.reactions).reduce((acc, [uid, emoji]) => {
        acc[emoji] = acc[emoji] || [];
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
  };

  const formatTime = (ts) => {
    if (!ts) return "";
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex group ${isMe ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[78%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div className="relative">
          <div
            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed break-words shadow-sm ${
              isMe
                ? "bg-blue-600 text-white rounded-br-md"
                : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-md border border-slate-200 dark:border-slate-700"
            }`}
          >
            {msg.text}
          </div>

          <div
            className={`absolute ${
              isMe ? "right-0" : "left-0"
            } -top-9 opacity-0 group-hover:opacity-100 transition-all z-20`}
          >
            <div className="flex gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-2 py-1 shadow-xl">
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

        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1">
            {Object.entries(reactions).map(([emoji, users]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
                  users.includes(currentUser.id)
                    ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800"
                    : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                }`}
              >
                {emoji}
                <span className="text-[10px]">{users.length}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] text-slate-400 px-1">
          <span>{formatTime(msg.timestamp)}</span>
          {isMe &&
            (isRead ? (
              <CheckCheck size={12} className="text-blue-500" />
            ) : (
              <Check size={12} />
            ))}
        </div>
      </div>
    </div>
  );
};

const ChatWindow = ({ currentUser, otherUser, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [otherStatus, setOtherStatus] = useState({
    online: false,
    lastSeen: null,
  });
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const chatRoomId = getChatRoomId(currentUser.id, otherUser.id);

  useEffect(() => {
    const unsub = listenMessages(chatRoomId, (msgs) => {
      setMessages(msgs);
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
      await sendMessage(
        chatRoomId,
        currentUser.id,
        currentUser.name,
        text.trim()
      );
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
    <div className="flex flex-col h-full bg-white dark:bg-slate-950">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white shadow-sm">
              {otherUser.name?.[0]?.toUpperCase()}
            </div>

            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-950 ${
                otherStatus.online ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
          </div>

          <div className="min-w-0">
            <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
              {otherUser.name}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {otherStatus.online
                ? "Active now"
                : `Last seen ${formatLastSeen(otherStatus.lastSeen)}`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-all"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50 dark:bg-slate-900/40">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-slate-400">
            <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
              <MessageCircle size={28} />
            </div>
            <p className="font-bold text-slate-600 dark:text-slate-300">
              Start conversation
            </p>
            <p className="text-xs mt-1">Say hi to {otherUser.name} 👋</p>
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

        {isOtherTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-md px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-3 py-2 focus-within:border-blue-500 transition-all">
          <input
            type="text"
            value={text}
            onChange={handleTextChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${otherUser.name}...`}
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className={`p-2.5 rounded-xl transition-all ${
              text.trim() && !sending
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send size={16} />
          </button>
        </div>

        <p className="text-[10px] text-slate-400 mt-2 text-center">
          Press Enter to send · Hover message for reactions
        </p>
      </div>
    </div>
  );
};

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

  const filteredUsers =
    chatUsers?.filter((u) =>
      u.name?.toLowerCase().includes(search.toLowerCase())
    ) || [];

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      <aside className="fixed right-0 top-0 h-full w-full sm:w-[420px] lg:w-[460px] z-50 bg-white dark:bg-slate-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex overflow-hidden">
        <div className="w-[145px] sm:w-[165px] shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-col">
          <div className="px-3 py-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Users size={15} />
                </div>
                <p className="font-black text-sm text-slate-900 dark:text-white">
                  Chats
                </p>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
              >
                <X size={15} />
              </button>
            </div>

            <div className="relative">
              <Search
                size={13}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs outline-none focus:border-blue-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-10 px-2">
                <MessageCircle
                  size={22}
                  className="mx-auto text-slate-300 dark:text-slate-600 mb-2"
                />
                <p className="text-xs text-slate-400 font-medium">
                  No contacts
                </p>
                <p className="text-[10px] text-slate-400 mt-1">
                  Share task first
                </p>
              </div>
            ) : (
              filteredUsers.map((user) => {
                const status = userStatuses[user.id];
                const isOnline = status?.online;
                const isActive = selectedUser?.id === user.id;

                return (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full flex items-center gap-2 px-2 py-2.5 rounded-xl transition-all text-left ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
                        }`}
                      >
                        {user.name?.[0]?.toUpperCase()}
                      </div>

                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 ${
                          isActive
                            ? "border-blue-600"
                            : "border-slate-50 dark:border-slate-900"
                        } ${isOnline ? "bg-emerald-500" : "bg-slate-400"}`}
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate">
                        {user.name?.split(" ")[0]}
                      </p>
                      <p
                        className={`text-[10px] ${
                          isActive
                            ? "text-white/70"
                            : isOnline
                            ? "text-emerald-500"
                            : "text-slate-400"
                        }`}
                      >
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {selectedUser ? (
            <ChatWindow
              currentUser={currentUser}
              otherUser={selectedUser}
              onClose={() => setSelectedUser(null)}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center bg-white dark:bg-slate-950 px-6">
              <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center mb-4">
                <MessageCircle
                  size={34}
                  className="text-slate-400 dark:text-slate-500"
                />
              </div>

              <p className="font-black text-slate-800 dark:text-white">
                Select a chat
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Choose a user to start messaging.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default ChatSidebar;