import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import createSocketConnection from "../utils/socket";
import { useSelector } from "react-redux";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const socketRef = useRef(null);

  const { targetId } = useParams();
  const user = useSelector((state) => state.user);
  const userId = user?._id;

  useEffect(() => {
    if (!userId) return;
    const socket = createSocketConnection();
    socketRef.current = socket;

    // As soon as the page loaded, the socket connection is made and joinChat event is emitted
    socket.emit("joinChat", { firstName: user?.firstName, userId, targetId });

    socket.on("messageReceived", ({ firstName, lastName, text }) => {
      setMessages((messages) => [...messages, { firstName, lastName, text }]);
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

  return (
    <div className="w-3/4 mx-auto border border-gray-600 m-5 h-[70vh] flex flex-col">
      <h1 className="p-5 border-b border-gray-600">Chat</h1>
      <div className="flex-1 overflow-scroll p-5">
        {messages.map((msg, index) => {
          return (
            <div
              key={index}
              className={
                "chat " +
                (user.firstName === msg.firstName ? "chat-end" : "chat-start")
              }
            >
              <div className="chat-header">
                {`${msg.firstName}  ${msg.lastName}`}
                <time className="text-xs opacity-50"> 2 hours ago</time>
              </div>
              <div className="chat-bubble">{msg.text}</div>
              <div className="chat-footer opacity-50">Seen</div>
            </div>
          );
        })}
      </div>
      <div className="p-5 border-t border-gray-600 flex items-center gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          type="text"
          placeholder="Type your message here..."
          className="flex-1 border border-gray-500 text-white rounded p-2"
        />
        <button onClick={sendMessage} className="btn btn-secondary">
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
