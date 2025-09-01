import { useEffect,  useState } from "react";
import { useParams } from "react-router-dom";
import createSocketConnection from "../utils/socket";
import { useSelector } from "react-redux";

const Chat = () => {
    const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
    
  const { targetId } = useParams();
  const user = useSelector((state) => state.user);
  const userId = user?._id;
 
 
  
  useEffect(() => {
    if (!userId ) return;
    const socket =  createSocketConnection();
    //As soon as the page loaded, the socket connection is made and joinChat event is emitted
    socket.emit("joinChat", {firstName:user?.firstName,userId, targetId } );

     socket.on("messageReceived", ({ firstName, lastName, text }) => {
      setMessages((messages) => [...messages, { firstName, lastName, text }]);
    });
 
    
    return () => {
      socket.disconnect();
    };
  },[userId, targetId])
  
const sendMessage = () => {
    const socket = createSocketConnection();
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
          type="text"
          placeholder="Type your message here..."
          className="flex-1 border border-gray-500 text-white rounded p-2"
        ></input>
        <button onClick={sendMessage} className="btn btn-secondary">
          Send
        </button>
      </div>
    </div>
    // <div className="m-2 mx-auto h-[74vh] w-1/2  border border-gray-600 flex flex-col ">
    //   <h1 className="  p-5 border-b w-full border-gray-600 text-lg font-bold  item-center">
    //     Chat{" "}
    //   </h1>

    //   <div className="flex-1 p-4 space-y-4 overflow-y-auto">
    //     <div className="chat chat-start">
    //       <div className="chat-image avatar">
    //         <div className="w-10 rounded-full">
    //           <img
    //             alt="Tailwind CSS chat bubble component"
    //             src="https://img.daisyui.com/images/profile/demo/kenobee@192.webp"
    //           />
    //         </div>
    //       </div>
    //       <div className="chat-header">
    //          Virat Kholi
    //         <time className="text-xs opacity-50">12:45</time>
    //       </div>
    //       <div className="chat-bubble">{messages.map((msg, index) => (
    //         <div key={index}>
    //             {msg.text}</div>
    //       ))}

    //       </div>
    //       <div className="chat-footer opacity-50">Delivered</div>
    //     </div>
    //     <div className="chat chat-end">
    //       <div className="chat-image avatar">
    //         <div className="w-10 rounded-full">
    //           <img
    //             alt="Tailwind CSS chat bubble component"
    //             src="https://img.daisyui.com/images/profile/demo/anakeen@192.webp"
    //           />
    //         </div>
    //       </div>
    //       <div className="chat-header">
    //         Anakin
    //         <time className="text-xs opacity-50">12:46</time>
    //       </div>
    //       <div className="chat-bubble">I hate you!</div>
    //       <div className="chat-footer opacity-50">Seen at 12:46</div>
    //     </div>
    //   </div>

    //   <div className="flex items-center">
    //     <input
    //       ref={InputMsg}

    //       className=" m-2 flex-1 p-2 border border-t border-gray-600 bg-gray-900 rounded  focus:outline-none "
    //       type="text"
    //       placeholder="Type your message here..."
    //     />
    //     <button className="btn bg-secondary "
    //     onClick={
    //         () => {
    //           const newMessage = { text: InputMsg?.current?.value };
    //           setMessages([...messages, newMessage]);
    //           InputMsg.current.value = "";
    //         }
    //     }>Chat</button>
    //   </div>
    // </div>


  );
};

export default Chat;
