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

    // socket.on("typing", (room) => socket.in(room).emit("typing"));
    // socket.on("stop typing",(room) => socket.in(room).emit("stop typing"))
    
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

})

// const userSocketMap = {}; // track userId → socket.id

// io.on("connection", (socket) => {
//   console.log("connected to socket.io");

//   // user joins their personal room
//   socket.on("setup", (userData) => {
//     socket.join(userData._id);
//     userSocketMap[userData._id] = socket.id;
//     console.log("User connected:", userData._id);
//     socket.emit("connected");
//   });

//   // user joins a chat room
//   socket.on("join chat", (chatId) => {
//     socket.join(chatId);
//     console.log(`User joined chat room: ${chatId}`);

//     // get all sockets in this room
//     const socketsInRoom = io.sockets.adapter.rooms.get(chatId) || new Set();

//     // map socket IDs to user IDs using userSocketMap
//     const usersInRoom = [];
//     for (const sockId of socketsInRoom) {
//       const foundUserId = Object.keys(userSocketMap).find(
//         (uid) => userSocketMap[uid] === sockId
//       );
//       if (foundUserId) usersInRoom.push(foundUserId);
//     }

//     console.log(`Users currently in room ${chatId}:`, usersInRoom);
//   });

//   // send message to everyone in that chat room
//   socket.on("new message", (newMessage) => {
//     const chat = newMessage.chat;
//     if (!chat.users) return console.log("chat.users not defined");

//     io.to(chat._id).emit("message recieved", newMessage);
//   });

//   // clean up on disconnect
//   socket.on("disconnect", () => {
//     const userId = Object.keys(userSocketMap).find(
//       (uid) => userSocketMap[uid] === socket.id
//     );
//     if (userId) {
//       delete userSocketMap[userId];
//       console.log(`User disconnected: ${userId}`);
//     }
//   });
// });

// // Store online users 
// const userSocketMap = {};

// // Socket.io connection handling
// io.on("connection", (socket) => {
//     const userId = socket.handshake.query.userId;
//     console.log("User connected with ID: " + userId); 
//     console.log("A user connected: " + socket.id);
//     // console.log("Socket map before update: ", socket);

//     if(userId) userSocketMap[userId] = socket.id;

//     // Emit online user to all connected clients
//     io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
//     socket.on("User Disconnected", () => {
//         console.log("User Disconnected: " + userId);
//         delete userSocketMap[userId];
//         io.emit("getOnlineUsers", Object.keys(userSocketMap));
//     })
// });

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
app.use("/api/v1/chats",chatRouter)

app.get("/", (req, res) => res.send(`Server running on port`));

export {
    server,
    app, 
    io
};