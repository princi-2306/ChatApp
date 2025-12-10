import express from 'express';
import 'dotenv/config'
import cors from 'cors'
import https from 'http'
import cookieParser from "cookie-parser"
// routes imports
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"
import messageRouter from "./routes/message.route.js"
import chatRouter from './routes/chats.router.js';
import notificationRouter from './routes/notification.routes.js';
import callRouter from './routes/call.routes.js';
import { Server } from 'socket.io';

const app = express();
const server = https.createServer(app);

// Socket.io setup
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
})

// Store active calls in memory (you can also use Redis for production)
const activeCalls = new Map();

io.on("connection", (socket) => {
    console.log("connected to socket.io");

    socket.on('setup', (userData) => {
        socket.join(userData._id);
        console.log("userdata_id : ", userData._id);
        socket.emit("connected");
    });

    socket.on("join chat", (room) => {
        socket.join(room);
        console.log("user joined room : " + room);
    });

    socket.on("typing", ({ chatId, userId }) => {
      socket.in(chatId).emit("typing", { userId });
    });

    socket.on("stop typing", ({ chatId, userId }) => {
      socket.in(chatId).emit("stop typing", { userId });
    });
    
    socket.on("new message", (newMessageRecieved) => {
        var chat = newMessageRecieved.chat;
        if (!chat.users) return console.log("chat.users not defined");

        chat.users.forEach(user => {
            if (user._id == newMessageRecieved.sender._id) return;

            socket.in(user._id).emit("message recieved", newMessageRecieved)
            console.log(newMessageRecieved);
        });
    });

    // ==================== MESSAGE EDIT/REACTION EVENTS ====================
    
    // Listen for edit message event from client
    socket.on("edit message", ({ messageId, content, chatId, isEdited, editedAt }) => {
        console.log(`Message ${messageId} edited in chat ${chatId}`);
        // Broadcast to all users in the chat
        socket.to(chatId).emit("message edited", {
            messageId,
            content,
            isEdited: isEdited || true,
            editedAt: editedAt || new Date(),
            chatId
        });
    });

    // Listen for reaction event from client
    socket.on("react to message", ({ messageId, reactions, chatId, userId, emoji }) => {
        console.log(`Reaction ${emoji} added to message ${messageId} in chat ${chatId} by user ${userId}`);
        // Broadcast to all users in the chat
        socket.to(chatId).emit("message reaction", {
            messageId,
            reactions,
            chatId,
            userId,
            emoji
        });
    });

    // Optional: Request edit history (for real-time notifications)
    socket.on("request edit history", ({ messageId, chatId }) => {
        console.log(`Edit history requested for message ${messageId} in chat ${chatId}`);
        // Client should make API call to fetch history
        // This event can be used for logging or analytics
    });

    // ==================== END MESSAGE EDIT/REACTION EVENTS ====================

    socket.on("notification read", ({ notificationId, userId }) => {
        console.log(`Notification ${notificationId} read by user ${userId}`);
    });

    // ==================== VOICE CALL EVENTS ====================
    
    // Initiate a call
    socket.on("call:initiate", ({ callerId, receiverId, callerName, callerAvatar, offer }) => {
        console.log(`Call initiated from ${callerId} to ${receiverId}`);
        
        // Store active call
        activeCalls.set(callerId, { 
            receiverId, 
            status: 'ringing',
            startTime: Date.now() 
        });
        
        // Notify receiver about incoming call
        socket.to(receiverId).emit("call:incoming", {
            callerId,
            callerName,
            callerAvatar,
            offer
        });
    });

    // Accept a call
    socket.on("call:accept", ({ callerId, receiverId, answer }) => {
        console.log(`Call accepted by ${receiverId}`);
        
        // Update call status
        if (activeCalls.has(callerId)) {
            activeCalls.get(callerId).status = 'active';
        }
        
        // Send answer back to caller
        socket.to(callerId).emit("call:accepted", {
            receiverId,
            answer
        });
    });

    // Reject a call
    socket.on("call:reject", ({ callerId, receiverId, reason }) => {
        console.log(`Call rejected by ${receiverId}`);
        
        // Remove from active calls
        activeCalls.delete(callerId);
        
        // Notify caller about rejection
        socket.to(callerId).emit("call:rejected", {
            receiverId,
            reason: reason || "Call rejected"
        });
    });

    // End a call
    socket.on("call:end", ({ callerId, receiverId, duration }) => {
        console.log(`Call ended between ${callerId} and ${receiverId}`);
        
        // Remove from active calls
        activeCalls.delete(callerId);
        activeCalls.delete(receiverId);
        
        // Notify both parties
        socket.to(receiverId).emit("call:ended", { 
            callerId,
            duration 
        });
        socket.to(callerId).emit("call:ended", { 
            receiverId,
            duration 
        });
    });

    // WebRTC Offer (for renegotiation or initial setup)
    socket.on("webrtc:offer", ({ from, to, offer }) => {
        console.log(`WebRTC offer from ${from} to ${to}`);
        socket.to(to).emit("webrtc:offer", { from, offer });
    });

    // WebRTC Answer
    socket.on("webrtc:answer", ({ from, to, answer }) => {
        console.log(`WebRTC answer from ${from} to ${to}`);
        socket.to(to).emit("webrtc:answer", { from, answer });
    });

    // ICE Candidate Exchange
    socket.on("webrtc:ice-candidate", ({ from, to, candidate }) => {
        console.log(`ICE candidate from ${from} to ${to}`);
        socket.to(to).emit("webrtc:ice-candidate", { from, candidate });
    });

    // Call busy (receiver is already in another call)
    socket.on("call:busy", ({ callerId, receiverId }) => {
        console.log(`${receiverId} is busy`);
        
        activeCalls.delete(callerId);
        
        socket.to(callerId).emit("call:busy", {
            receiverId,
            message: "User is currently busy"
        });
    });

    // ==================== END VOICE CALL EVENTS ====================

    socket.on("disconnect", () => {
        console.log("User disconnected from socket.io");
        
        // Clean up any active calls for this user
        for (const [callerId, callData] of activeCalls.entries()) {
            if (socket.id === callerId || socket.id === callData.receiverId) {
                // Notify the other party
                const otherUserId = socket.id === callerId ? callData.receiverId : callerId;
                io.to(otherUserId).emit("call:ended", {
                    reason: "User disconnected"
                });
                activeCalls.delete(callerId);
            }
        }
    });
})

// middlewares
app.use(express.json());
app.use(express.urlencoded({
    extended:true,
    limit: "16kb"
}));
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/messages", messageRouter)
app.use("/api/v1/chats", chatRouter)
app.use("/api/v1/notifications", notificationRouter)
app.use("/api/v1/calls", callRouter)

app.get("/", (req, res) => res.send(`Server running on port`));

export {
    server,
    app, 
    io
};