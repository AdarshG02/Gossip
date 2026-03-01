import { io } from "socket.io-client";

const port = import.meta.env.VITE_PORT;

const socket = io(`http://localhost:${port}`, {
  auth: {
    token: localStorage.getItem("token"),
  },
});

socket.on("connect", () => {
  console.log("🔥 Connected to socket:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ Socket connection error:", err.message);
});

export default socket;