import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: [
            process.env.CLIENT_URL,
            process.env.CLIENT_LIVE_URL,
            "https://www.traveltalesapp.in",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
        ],
        methods: ["GET", "POST"],
        credentials: true,
    },
});

export const getReceiverSocketId = (receiverId) => {
    return userSocketMap[receiverId];
};

const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
    console.log("a user connected", socket.id);

    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
        userSocketMap[userId] = socket.id;
        socket.join(userId);
    }

    // io.emit() is used to send events to all the connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("User Joined Room: " + room);
    });

    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop typing", (room) => socket.in(room).emit("stop typing"));

    socket.on("new message", (newMessageReceived) => {
        var chat = newMessageReceived.chat;

        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach((user) => {
            if (user._id == newMessageReceived.sender._id) return;

            // Send to the user's personal room (so they get it even if not in chat UI)
            socket.in(user._id).emit("message received", newMessageReceived);
        });
    });

    socket.on("disconnect", () => {
        console.log("user disconnected", socket.id);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
});

export { app, io, server };
