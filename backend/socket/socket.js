import { Server } from "socket.io";
import express from "express";
import http from "http";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Setup socket.io with CORS
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(server, {
    cors: {
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error('Not allowed by CORS'));
        },
        credentials: true,
        methods: ['GET', 'POST'],
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
