import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);

// Setup socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: 'https://let-s-talk-lq7h.onrender.com', // Frontend URL (change as needed)
        methods: ['GET', 'POST']
    }
});

// This map stores userId -> socketId
const userSocketMap = {};

// Function to get receiver's socketId by userId
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// Handling socket connection
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId; // Get userId from the socket connection query

    // Check if userId is provided
    if (userId) {
        userSocketMap[userId] = socket.id; // Store the socketId for the userId
        console.log(`User ${userId} connected with socket id: ${socket.id}`);
    } else {
        console.log('No userId provided in the socket connection');
        socket.disconnect(); // Disconnect if userId is not present
        return;
    }

    // Emit online users list to all connected clients
    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    // Handle disconnect
    socket.on('disconnect', () => {
        if (userId) {
            delete userSocketMap[userId]; // Remove userId from the map
            console.log(`User ${userId} disconnected`);
        }
        // Emit updated online users list to all connected clients
        io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
});

export { app, server, io };
