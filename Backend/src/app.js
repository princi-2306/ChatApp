import express from 'express';
import 'dotenv/config'
import cors from 'cors' // if the whiteListing is required from backend to deliver the data to forntend
import https from 'http'
import cookieParser from "cookie-parser"
// routes imports
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"
import messageRouter from "./routes/message.route.js"
import chatRouter from './routes/chats.router.js';
import notificationRouter from './routes/notification.routes.js'; // NEW: Import notification routes
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
      socket.in(chatId).emit("typing", { userId }); // broadcast to other users in room
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

    // NEW: Handle notification read events
    socket.on("notification read", ({ notificationId, userId }) => {
        console.log(`Notification ${notificationId} read by user ${userId}`);
        // You can broadcast this to update UI in real-time if needed
    });

    socket.on("disconnect", () => {
        console.log("User disconnected from socket.io");
    });
})

// middlewares
app.use(express.json());       // accepting this size of amount of json data here
app.use(express.urlencoded({
    extended:true,
    limit: "16kb"
}));
app.use(express.static("public"))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
})) // if cors is requested for backend to deliver the data


// routes declaration
app.use("/api/v1/users", userRouter)
app.use("/api/v1/admin", adminRouter)
app.use("/api/v1/messages", messageRouter)
app.use("/api/v1/chats", chatRouter)
app.use("/api/v1/notifications", notificationRouter) // NEW: Add notification routes

app.get("/", (req, res) => res.send(`Server running on port`));

export {
    server,
    app, 
    io
};