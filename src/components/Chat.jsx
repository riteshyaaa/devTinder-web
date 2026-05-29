import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import createSocketConnection from "../utils/socket";
import { useSelector } from "react-redux";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  const { targetId } = useParams();
  const user = useSelector((state) => state.user);
  const userId = user?._id;

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!userId) return;
    const socket = createSocketConnection();
    socketRef.current = socket;

    socket.emit("joinChat", { firstName: user?.firstName, userId, targetId });

    socket.on("messageReceived", ({ firstName, lastName, text }) => {
      setMessages((prev) => [...prev, { firstName, lastName, text, time: new Date() }]);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, targetId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit("sendMessage", {
      firstName: user?.firstName,
      lastName: user?.lastName,
      userId,
      targetId,
      text: newMessage,
    });
    setNewMessage("");
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

  return (
    <section
      className="w-full max-w-3xl mx-auto border border-base-content/20 m-5 h-[70vh] flex flex-col rounded-lg overflow-hidden"
      aria-label="Chat conversation"
    >
      {/* Chat Header */}
      <header className="p-4 border-b border-base-content/20 bg-base-200">
        <h1 className="text-lg font-semibold">Chat</h1>
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
          const isOwn = user.firstName === msg.firstName;
          return (
            <div
              key={index}
              className={`chat ${isOwn ? "chat-end" : "chat-start"}`}
            >
              <div className="chat-header text-xs opacity-70">
                {`${msg.firstName} ${msg.lastName}`}
                {msg.time && (
                  <time className="ml-2 opacity-50" dateTime={msg.time.toISOString?.() || ""}>
                    {formatTime(msg.time)}
                  </time>
                )}
              </div>
              <div className="chat-bubble">{msg.text}</div>
            </div>
          );
        })}
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
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder="Type your message here..."
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
