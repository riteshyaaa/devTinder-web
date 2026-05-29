import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSocket } from "../utils/socket";
import { fetchChatHistory, getErrorMessage } from "../services/api";
import { Spinner } from "./Shimmer";
import CodeBlock from "./CodeBlock";

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "🎉", "🔥", "👀", "💯", "🚀"];

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [targetUser, setTargetUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(null); // message index or null
  const [imagePreview, setImagePreview] = useState(null);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const { targetId } = useParams();
  const user = useSelector((state) => state.user);
  const userId = user?._id;

  // Auto-scroll to latest message
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Load chat history from backend
  useEffect(() => {
    const loadHistory = async () => {
      setLoadingHistory(true);
      try {
        const res = await fetchChatHistory(targetId);
        const history = res.data?.messages || res.data?.data?.messages || res.data || [];
        const formatted = Array.isArray(history)
          ? history.map((msg) => ({
              id: msg._id || msg.id || `${Date.now()}-${Math.random()}`,
              firstName: msg.senderId?.firstName || msg.firstName || "",
              lastName: msg.senderId?.lastName || msg.lastName || "",
              text: msg.text || msg.message || "",
              time: msg.createdAt ? new Date(msg.createdAt) : new Date(msg.time || Date.now()),
              read: msg.read || false,
              senderId: msg.senderId?._id || msg.senderId || msg.userId || "",
              reactions: msg.reactions || {},
              imageUrl: msg.imageUrl || null,
              fileUrl: msg.fileUrl || null,
              fileName: msg.fileName || null,
            }))
          : [];
        setMessages(formatted);

        if (res.data?.targetUser) {
          setTargetUser(res.data.targetUser);
        }
      } catch (err) {
        console.warn("Chat history not available:", getErrorMessage(err));
      } finally {
        setLoadingHistory(false);
      }
    };

    if (targetId) loadHistory();
  }, [targetId]);

  // Socket connection & event handlers
  useEffect(() => {
    if (!userId) return;
    const socket = getSocket();
    socketRef.current = socket;

    socket.emit("joinChat", { firstName: user?.firstName, userId, targetId });

    // New messages
    socket.on("messageReceived", ({ firstName, lastName, text, senderId, time, imageUrl, fileUrl, fileName }) => {
      const msgId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setMessages((prev) => [
        ...prev,
        {
          id: msgId,
          firstName,
          lastName,
          text: text || "",
          time: time ? new Date(time) : new Date(),
          read: true,
          senderId: senderId || "",
          reactions: {},
          imageUrl: imageUrl || null,
          fileUrl: fileUrl || null,
          fileName: fileName || null,
        },
      ]);
      socket.emit("messageRead", { userId, targetId });
    });

    // Typing
    socket.on("userTyping", ({ firstName: typingName }) => {
      setIsTyping(true);
      setTypingUser(typingName);
    });
    socket.on("userStoppedTyping", () => {
      setIsTyping(false);
      setTypingUser("");
    });

    // Online status
    socket.on("userOnline", ({ userId: uid }) => {
      if (uid === targetId) setIsOnline(true);
    });
    socket.on("userOffline", ({ userId: uid }) => {
      if (uid === targetId) setIsOnline(false);
    });
    socket.emit("checkOnline", { targetId });
    socket.on("onlineStatus", ({ userId: uid, online }) => {
      if (uid === targetId) setIsOnline(online);
    });

    // Read receipts
    socket.on("messagesRead", ({ readBy }) => {
      if (readBy === targetId) {
        setMessages((prev) =>
          prev.map((msg) => (msg.senderId === userId ? { ...msg, read: true } : msg))
        );
      }
    });

    // Emoji reactions from other user
    socket.on("reactionReceived", ({ messageId, emoji, fromUserId }) => {
      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id === messageId) {
            const reactions = { ...msg.reactions };
            reactions[emoji] = [...(reactions[emoji] || []), fromUserId];
            return { ...msg, reactions };
          }
          return msg;
        })
      );
    });

    return () => {
      socket.off("messageReceived");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("onlineStatus");
      socket.off("messagesRead");
      socket.off("reactionReceived");
      socket.emit("leaveChat", { userId, targetId });
    };
  }, [userId, targetId]);

  // Typing emission
  const handleTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("typing", { userId, targetId, firstName: user?.firstName });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { userId, targetId });
    }, 2000);
  }, [userId, targetId, user?.firstName]);

  // Send message
  const sendMessage = () => {
    if (!newMessage.trim() && !imagePreview) return;
    const socket = socketRef.current;
    if (!socket) return;

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stopTyping", { userId, targetId });

    socket.emit("sendMessage", {
      firstName: user?.firstName,
      lastName: user?.lastName,
      userId,
      targetId,
      text: newMessage,
      imageUrl: imagePreview || null,
    });
    setNewMessage("");
    setImagePreview(null);
  };

  // Emoji reaction
  const handleReaction = (messageIndex, emoji) => {
    const msg = messages[messageIndex];
    if (!msg) return;
    const socket = socketRef.current;
    if (socket) {
      socket.emit("addReaction", {
        messageId: msg.id,
        emoji,
        userId,
        targetId,
      });
    }
    // Optimistic update
    setMessages((prev) =>
      prev.map((m, i) => {
        if (i === messageIndex) {
          const reactions = { ...m.reactions };
          const existing = reactions[emoji] || [];
          if (existing.includes(userId)) {
            reactions[emoji] = existing.filter((id) => id !== userId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = [...existing, userId];
          }
          return { ...m, reactions };
        }
        return m;
      })
    );
    setShowEmojiPicker(null);
  };

  // Image/file handling
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For images, create a preview (in production, upload to cloud storage)
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      // For non-image files, just send the filename as a message
      const socket = socketRef.current;
      if (socket) {
        socket.emit("sendMessage", {
          firstName: user?.firstName,
          lastName: user?.lastName,
          userId,
          targetId,
          text: `📎 Shared file: ${file.name}`,
          fileName: file.name,
        });
      }
    }
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    handleTyping();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const isCodeSnippet = (text) => {
    return text.startsWith("```") || (text.includes("\n") && text.match(/^\s{2,}/m));
  };

  const parseCodeBlock = (text) => {
    if (text.startsWith("```")) {
      const lines = text.split("\n");
      const lang = lines[0].replace("```", "").trim() || "javascript";
      const code = lines.slice(1, lines.length - 1).join("\n").replace(/```$/, "");
      return { lang, code };
    }
    return { lang: "text", code: text };
  };

  if (loadingHistory) {
    return <Spinner text="Loading messages..." />;
  }

  return (
    <section
      className="w-full max-w-3xl mx-auto border border-base-content/20 m-5 h-[70vh] flex flex-col rounded-lg overflow-hidden"
      aria-label="Chat conversation"
    >
      {/* Chat Header */}
      <header className="p-4 border-b border-base-content/20 bg-base-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/connections" className="btn btn-ghost btn-sm btn-circle" aria-label="Back to connections">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-lg font-semibold">
              {targetUser ? `${targetUser.firstName} ${targetUser.lastName}` : "Chat"}
            </h1>
            <div className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-success animate-pulse" : "bg-base-content/30"}`} aria-hidden="true" />
              <span className="text-xs opacity-60">{isOnline ? "Online" : "Offline"}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-3" role="log" aria-label="Message history" aria-live="polite">
        {messages.length === 0 && (
          <p className="text-center text-base-content/50 mt-10">No messages yet. Start the conversation!</p>
        )}

        {messages.map((msg, index) => {
          const isOwn = msg.senderId === userId || user.firstName === msg.firstName;
          const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

          return (
            <div key={msg.id || index} className={`chat ${isOwn ? "chat-end" : "chat-start"} group relative`}>
              <div className="chat-header text-xs opacity-70">
                {`${msg.firstName} ${msg.lastName}`}
                {msg.time && <time className="ml-2 opacity-50">{formatTime(msg.time)}</time>}
              </div>

              <div className="chat-bubble relative">
                {/* Image */}
                {msg.imageUrl && (
                  <div className="mb-1">
                    <img
                      src={msg.imageUrl}
                      alt="Shared image"
                      className="max-w-[240px] max-h-[200px] rounded-lg object-cover cursor-pointer"
                      onClick={() => window.open(msg.imageUrl, "_blank")}
                    />
                  </div>
                )}

                {/* Text content */}
                {msg.text && (
                  isCodeSnippet(msg.text) ? (
                    <CodeBlock {...parseCodeBlock(msg.text)} />
                  ) : (
                    <span>{msg.text}</span>
                  )
                )}

                {/* Reaction button (appears on hover) */}
                <button
                  className="absolute -bottom-2 right-0 opacity-0 group-hover:opacity-100 transition-opacity btn btn-ghost btn-xs btn-circle text-base"
                  onClick={() => setShowEmojiPicker(showEmojiPicker === index ? null : index)}
                  aria-label="Add reaction"
                  type="button"
                >
                  😊
                </button>
              </div>

              {/* Reaction display */}
              {hasReactions && (
                <div className="flex gap-1 mt-0.5 flex-wrap">
                  {Object.entries(msg.reactions).map(([emoji, users]) => (
                    <button
                      key={emoji}
                      className={`badge badge-sm cursor-pointer ${
                        users.includes(userId) ? "badge-primary" : "badge-ghost"
                      }`}
                      onClick={() => handleReaction(index, emoji)}
                      aria-label={`${emoji} reaction (${users.length})`}
                      type="button"
                    >
                      {emoji} {users.length > 1 ? users.length : ""}
                    </button>
                  ))}
                </div>
              )}

              {/* Emoji picker dropdown */}
              {showEmojiPicker === index && (
                <div className="flex gap-1 mt-1 bg-base-300 rounded-full px-2 py-1 shadow-lg z-10">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="btn btn-ghost btn-xs btn-circle text-lg hover:scale-125 transition-transform"
                      onClick={() => handleReaction(index, emoji)}
                      aria-label={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              {/* Read receipt */}
              {isOwn && (
                <div className="chat-footer opacity-50 text-xs">
                  {msg.read ? "✓✓ Read" : "✓ Sent"}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="chat chat-start">
            <div className="chat-bubble chat-bubble-ghost">
              <span className="flex items-center gap-1 text-sm opacity-70">
                {typingUser || "Someone"} is typing
                <span className="loading loading-dots loading-xs" />
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Image Preview (when selected) */}
      {imagePreview && (
        <div className="px-4 pt-2 border-t border-base-content/10 bg-base-200 flex items-center gap-2">
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="h-16 w-16 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => setImagePreview(null)}
              className="absolute -top-1 -right-1 btn btn-circle btn-xs btn-error"
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
          <span className="text-xs opacity-60">Image attached</span>
        </div>
      )}

      {/* Input Area */}
      <form
        className="p-4 border-t border-base-content/20 flex items-center gap-2"
        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
      >
        {/* File/Image upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="btn btn-ghost btn-sm btn-circle"
          aria-label="Attach file or image"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.txt,.js,.ts,.py,.md"
          className="hidden"
          onChange={handleFileSelect}
        />

        <label htmlFor="chat-input" className="sr-only">Type your message</label>
        <input
          id="chat-input"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Type a message... (``` for code)"
          className="flex-1 input input-bordered"
          aria-label="Message input"
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={!newMessage.trim() && !imagePreview}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </section>
  );
};

export default Chat;
