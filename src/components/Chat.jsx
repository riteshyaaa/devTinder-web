import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getSocket } from "../utils/socket";
import { fetchChatHistory, getErrorMessage } from "../services/api";
import { Spinner } from "./Shimmer";
import CodeBlock from "./CodeBlock";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [targetUser, setTargetUser] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

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
              firstName: msg.senderId?.firstName || msg.firstName || "",
              lastName: msg.senderId?.lastName || msg.lastName || "",
              text: msg.text || msg.message || "",
              time: msg.createdAt ? new Date(msg.createdAt) : new Date(msg.time || Date.now()),
              read: msg.read || false,
              senderId: msg.senderId?._id || msg.senderId || msg.userId || "",
            }))
          : [];
        setMessages(formatted);

        // Extract target user info if available
        if (res.data?.targetUser) {
          setTargetUser(res.data.targetUser);
        }
      } catch (err) {
        // Silently fail - chat will start fresh (API may not exist yet)
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

    // Join chat room
    socket.emit("joinChat", { firstName: user?.firstName, userId, targetId });

    // Listen for new messages
    socket.on("messageReceived", ({ firstName, lastName, text, senderId, time }) => {
      setMessages((prev) => [
        ...prev,
        {
          firstName,
          lastName,
          text,
          time: time ? new Date(time) : new Date(),
          read: true,
          senderId: senderId || "",
        },
      ]);
      // Emit read receipt when message is received and chat is open
      socket.emit("messageRead", { userId, targetId });
    });

    // Typing indicator
    socket.on("userTyping", ({ firstName: typingName }) => {
      setIsTyping(true);
      setTypingUser(typingName);
    });

    socket.on("userStoppedTyping", () => {
      setIsTyping(false);
      setTypingUser("");
    });

    // Online status
    socket.on("userOnline", ({ userId: onlineUserId }) => {
      if (onlineUserId === targetId) setIsOnline(true);
    });

    socket.on("userOffline", ({ userId: offlineUserId }) => {
      if (offlineUserId === targetId) setIsOnline(false);
    });

    // Check if target is online
    socket.emit("checkOnline", { targetId });
    socket.on("onlineStatus", ({ userId: checkedId, online }) => {
      if (checkedId === targetId) setIsOnline(online);
    });

    // Read receipts - mark messages as read
    socket.on("messagesRead", ({ readBy }) => {
      if (readBy === targetId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId === userId ? { ...msg, read: true } : msg
          )
        );
      }
    });

    return () => {
      socket.off("messageReceived");
      socket.off("userTyping");
      socket.off("userStoppedTyping");
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("onlineStatus");
      socket.off("messagesRead");
      socket.emit("leaveChat", { userId, targetId });
    };
  }, [userId, targetId]);

  // Handle typing indicator emission
  const handleTyping = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("typing", { userId, targetId, firstName: user?.firstName });

    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { userId, targetId });
    }, 2000);
  }, [userId, targetId, user?.firstName]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const socket = socketRef.current;
    if (!socket) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    socket.emit("stopTyping", { userId, targetId });

    socket.emit("sendMessage", {
      firstName: user?.firstName,
      lastName: user?.lastName,
      userId,
      targetId,
      text: newMessage,
    });
    setNewMessage("");
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
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Detect if text contains code (starts with ``` or has multiple lines with indentation)
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
              <span
                className={`w-2 h-2 rounded-full ${isOnline ? "bg-success" : "bg-base-content/30"}`}
                aria-hidden="true"
              />
              <span className="text-xs opacity-60">
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div
        className="flex-1 overflow-y-auto p-5 space-y-2"
        role="log"
        aria-label="Message history"
        aria-live="polite"
      >
        {messages.length === 0 && (
          <p className="text-center text-base-content/50 mt-10">
            No messages yet. Start the conversation!
          </p>
        )}

        {messages.map((msg, index) => {
          const isOwn = msg.senderId === userId || user.firstName === msg.firstName;
          return (
            <div
              key={index}
              className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-header text-xs opacity-70">
                {`${msg.firstName} ${msg.lastName}`}
                {msg.time && (
                  <time className="ml-2 opacity-50">
                    {formatTime(msg.time)}
                  </time>
                )}
              </div>
              <div className="chat-bubble">
                {isCodeSnippet(msg.text) ? (
                  <CodeBlock {...parseCodeBlock(msg.text)} />
                ) : (
                  msg.text
                )}
              </div>
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

      {/* Input Area */}
      <form
        className="p-4 border-t border-base-content/20 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <label htmlFor="chat-input" className="sr-only">
          Type your message
        </label>
        <input
          id="chat-input"
          value={newMessage}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Type a message... (use ``` for code)"
          className="flex-1 input input-bordered"
          aria-label="Message input"
          autoComplete="off"
        />
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={!newMessage.trim()}
          aria-label="Send message"
        >
          Send
        </button>
      </form>
    </section>
  );
};

export default Chat;
