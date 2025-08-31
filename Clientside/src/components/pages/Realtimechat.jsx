import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "../css/realtimechat.css";

const socket = io("http://localhost:3000", {
  withCredentials: true,
});

function Realtimechat() {
  const [joined, setJoined] = useState(false);
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(""); 

  useEffect(() => {
    socket.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", (data) => {
      setTypingUser(data.username);
     
      setTimeout(() => setTypingUser(""), 2500);
    });

    return () => {
      socket.off("message");
      socket.off("typing");
    };
  }, []);

  const handleJoin = () => {
    if (username.trim()) {
      socket.emit("join", username);
      setJoined(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit("message", { username, message });
      setMessage("");
    }
  };

  return (
    <div className="chat-container">
      {!joined ? (
        <div className="join-box">
          <input
            type="text"
            placeholder="Enter your name"
            value={username}
            onChange={e => {
              setUsername(e.target.value);
              socket.emit("typing", { username: e.target.value });
            }}
          />
          <button onClick={handleJoin}>Join Chat</button>
        </div>
      ) : (
        <div className="chat-box">
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i}>
                <b>{msg.username}:</b> {msg.message}
              </div>
            ))}
            {typingUser && typingUser !== username && (
              <div className="typing-status">
                <i>{typingUser} is typing...</i>
              </div>
            )}
          </div>
          <form onSubmit={sendMessage} className="input-box">
            <input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={e => {
                setMessage(e.target.value);
                socket.emit("typing", { username });
              }}
            />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Realtimechat;