import { Server } from "socket.io";
import jwt from "jsonwebtoken";

let io;
const onlineUsers = new Map();

export const initSocket = (server) => {
    io = new Server(server, {
        cors:{
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });


    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if(!token){
            return next(new Error("Authentication error"));
        }

        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            // console.log("Decoded:", decoded);
            
            socket.userId = decoded.id; //Attaching useId to socket
            next();
        } catch(error){
            next(new Error("Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.userId);

        //SECURE SOCKET AUTHENTICATION REASONS

        // socket.on("register", (userId) => {
        //     onlineUsers.set(userId, socket.id);
        //     console.log("Online users:", onlineUsers);
        // });

        onlineUsers.set(String(socket.userId), socket.id);

        socket.on("disconnect", () => {
            for(let [userId, socketId] of onlineUsers.entries()) {
                if(socketId === socket.id){
                    onlineUsers.delete(userId);
                    break;
                }
            }
            console.log("User disconnected:", socket.id);
        });
    });
};

export const getIO = () => {
    if(!io){
        throw new Error("Socket.io not initialized!");
    }

    return io;
};


export const getReceiverSocketId = (receiverId) => {
    return onlineUsers.get(String(receiverId));
  };