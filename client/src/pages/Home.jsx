import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import socket from "../socket.js";

import { jwtDecode } from "jwt-decode";

import { useRef } from "react";


function Home() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [username, setUsername] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]); //Old message history
  const [newMessage, setNewMessage] = useState(""); //Any new message

  const messagesEndRef = useRef(null);

  const token = localStorage.getItem("token");
  const decoded = token ? jwtDecode(token) : null;
  const currentUserId = decoded?.id;

  //const port = import.meta.env.VITE_PORT;

  const API = import.meta.env.VITE_API_URL;


  useEffect(() => {
    const handleReceiveMessage = (incomingMessage) => {
      if (!selectedUser) return;
      const sender = String(incomingMessage.sender);
      const receiver = String(incomingMessage.receiver);
      const chatPartner = String(selectedUser._id);
      if (sender === chatPartner || receiver === chatPartner) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedUser]);



  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/gossip/auth");
      return;
    }

    // Fetch users
    const fetchUsers = async () => {
      try {
        const res = await fetch(`${API}/api/users`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          navigate("/gossip/auth");
          return;
        }

        const data = await res.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [navigate]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedUser(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  const handleKeyDown = (e) => {
    if(e.key === "Enter"){
      handleSendMessage();
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedUser) {
        setMessages([]);
        return;
      }

      const token = localStorage.getItem("token");

      try {
        const res = await fetch(
          `${API}/api/messages/${selectedUser._id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          console.error("Failed to fetch messages");
          return;
        }

        const data = await res.json();
        setMessages(data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/gossip/auth");
  };


  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          content: newMessage,
        }),
      });

      if (!res.ok) {
        console.error("Failed to send message");
        return;
      }

      const savedMessage = await res.json();

      // 🔥 Instantly update UI
      setMessages((prev) => [...prev, savedMessage]);

      setNewMessage(""); // clear input
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div style={styles.container}>

      {/* LEFT PANEL */}
      <div style={styles.leftPanel}>
        <div style={styles.leftHeader}>
          <h3>Contacts</h3>
          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>
        </div>

        <div>
          {users.map((user) => (
            <div key={user._id}
              style={{
                ...styles.userItem,
                backgroundColor: selectedUser?._id === user._id ? "lightblue" : "#ffffff"
              }}
              onClick={() => setSelectedUser(user)}
            >
              {user.username}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div style={styles.rightPanel}>
        {selectedUser ? (
          <div>
            <h2>Chat with {selectedUser.username}</h2>
            <div style={{ marginTop: "20px", width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  marginBottom: "20px",
                  maxHeight: "60vh",
                  overflowY: "auto",
                }}
              >
                {messages.length === 0 ? (
                  <p>No messages yet</p>
                ) : (
                  messages.map((msg) => {
                    const isMyMessage = String(msg.sender) === currentUserId;

                    return (
                      <div
                        key={msg._id}
                        style={{
                          marginBottom: "10px",
                          padding: "8px",
                          borderRadius: "6px",
                          backgroundColor: isMyMessage ? "#764ba2" : "#e9ecef",
                          color: isMyMessage ? "#fff" : "#000",
                          alignSelf: isMyMessage ? "flex-end" : "flex-start",
                          maxWidth: "60%",
                        }}
                      >
                        {msg.content}
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef}/>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  style={{
                    flex: 1,
                    padding: "8px",
                    borderRadius: "6px",
                    border: "1px solid #ccc",
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: "none",
                    backgroundColor: "#764ba2",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <h2>Select a user to start chatting</h2>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  leftPanel: {
    width: "30%",
    borderRight: "1px solid #ddd",
    padding: "20px",
    overflowY: "auto",
    backgroundColor: "#f8f9fa",
  },
  rightPanel: {
    width: "70%",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  leftHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
  },
  userItem: {
    padding: "10px",
    borderRadius: "8px",
    marginBottom: "10px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    border: "1px solid #ddd",
  },
  logoutButton: {
    padding: "6px 10px",
    backgroundColor: "#764ba2",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default Home;