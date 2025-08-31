import express from 'express';
import 'dotenv/config'
import cors from 'cors' // if the whiteListing is required from backend to deliver the data to forntend
import https from 'http'
import cookieParser from "cookie-parser"
// routes imports
import userRouter from "./routes/user.routes.js"
import adminRouter from "./routes/admin.routes.js"
import messageRouter from "./routes/message.route.js"
import { Server } from 'socket.io';

const app = express();
const server = https.createServer(app);

// Socket.io setup
const io = new Server(server, {
    cors: {origin: process.env.CORS_ORIGIN, credentials: true}
})

// Store online users 
const userSocketMap = {};

// Socket.io connection handling
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected with ID: " + userId); 
    console.log("A user connected: " + socket.id);
    console.log("Socket map before update: ", socket);

    if(userId) userSocketMap[userId] = socket.id;

    // Emit online user to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
    socket.on("User Disconnected", () => {
        console.log("User Disconnected: " + userId);
        delete userSocketMap[userId];
        io.emmit("getOnlineUsers", Object.keys(userSocketMap));
    })
});

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

app.get("/", (req, res) => res.send(`Server running on port`));

export {
    server,
    app, 
    io,
    userSocketMap
};