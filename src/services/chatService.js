import { db } from "../firebase";
import {
  ref,
  push,
  onValue,
  set,
  update,
  serverTimestamp,
  onDisconnect,
  off,
} from "firebase/database";

// Chat Room ID - dono users ke IDs sort karke banao (consistent)
export const getChatRoomId = (userId1, userId2) => {
  return [userId1, userId2].sort().join("_");
};

// Message bhejo
export const sendMessage = async (chatRoomId, senderId, senderName, text) => {
  const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
  await push(messagesRef, {
    senderId,
    senderName,
    text,
    timestamp: serverTimestamp(),
    readBy: { [senderId]: true }, // Sender ne khud padh liya
  });
};

// Messages listen karo (real-time)
export const listenMessages = (chatRoomId, callback) => {
  const messagesRef = ref(db, `chats/${chatRoomId}/messages`);
  onValue(messagesRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const messages = Object.entries(data).map(([id, msg]) => ({ id, ...msg }));
      callback(messages);
    } else {
      callback([]);
    }
  });
  return () => off(messagesRef);
};

// Message read mark karo
export const markMessageRead = async (chatRoomId, messageId, userId) => {
  const readRef = ref(db, `chats/${chatRoomId}/messages/${messageId}/readBy/${userId}`);
  await set(readRef, true);
};

// Saare unread messages read mark karo
export const markAllRead = async (chatRoomId, messages, userId) => {
  const updates = {};
  messages.forEach((msg) => {
    if (msg.senderId !== userId && !msg.readBy?.[userId]) {
      updates[`chats/${chatRoomId}/messages/${msg.id}/readBy/${userId}`] = true;
    }
  });
  if (Object.keys(updates).length > 0) {
    await update(ref(db), updates);
  }
};

// Typing indicator set karo
export const setTyping = async (chatRoomId, userId, isTyping) => {
  const typingRef = ref(db, `chats/${chatRoomId}/typing/${userId}`);
  await set(typingRef, isTyping ? true : null);
};

// Typing status listen karo
export const listenTyping = (chatRoomId, currentUserId, callback) => {
  const typingRef = ref(db, `chats/${chatRoomId}/typing`);
  onValue(typingRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      // Sirf doosre users ki typing dikhaao
      const othersTyping = Object.keys(data).filter(
        (uid) => uid !== currentUserId && data[uid] === true
      );
      callback(othersTyping.length > 0);
    } else {
      callback(false);
    }
  });
  return () => off(typingRef);
};

// Online status set karo
export const setOnlineStatus = (userId) => {
  const statusRef = ref(db, `status/${userId}`);
  set(statusRef, { online: true, lastSeen: serverTimestamp() });
  onDisconnect(statusRef).set({ online: false, lastSeen: serverTimestamp() });
};

// User status listen karo
export const listenUserStatus = (userId, callback) => {
  const statusRef = ref(db, `status/${userId}`);
  onValue(statusRef, (snapshot) => {
    callback(snapshot.val() || { online: false, lastSeen: null });
  });
  return () => off(statusRef);
};

// Emoji reactions
export const addReaction = async (chatRoomId, messageId, userId, emoji) => {
  const reactionRef = ref(db, `chats/${chatRoomId}/messages/${messageId}/reactions/${userId}`);
  await set(reactionRef, emoji);
};

export const removeReaction = async (chatRoomId, messageId, userId) => {
  const reactionRef = ref(db, `chats/${chatRoomId}/messages/${messageId}/reactions/${userId}`);
  await set(reactionRef, null);
};