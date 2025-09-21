import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Message } from "../models/Message.model.js";
import { User } from "../models/User.model.js";
import {
    DeleteOnCloudinary,
    UploadOnCloudinary
} from "../utils/Cloudinary.js";
import mongoose from "mongoose";
// import { io } from "../app.js"; // Import the io instance
import { Chat } from "../models/ChatModel.model.js";

//---------------- Get users for sidebar ----------------
const getUserForSidebar = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized: No user found in request");

    // exclude current user
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    if (!filteredUsers.length) {
        return res.status(200).json(new ApiResponse(200, { filteredUsers: [], unseenMessages: {} }, "No other users found"));
    }

    // unseen messages count per user
    const unseenMessages = {};
    await Promise.all(
        filteredUsers.map(async (user) => {
            const count = await Message.countDocuments({
                senderId: user._id,
                reciverId: userId,
                seen: false
            });
            if (count > 0) unseenMessages[user._id] = count;
        })
    );

    return res.status(200).json(
        new ApiResponse(200, { filteredUsers, unseenMessages }, "Users fetched for sidebar")
    );
});

// ---------------- Get all messages with a user ----------------
const getMessages = asyncHandler(async (req, res) => {
    // const { id: selectedUserId } = req.params;
    // const myId = req.user?._id;

    // if (!mongoose.Types.ObjectId.isValid(selectedUserId)) {
    //     throw new ApiError(400, "Invalid user ID format");
    // }

    // const messages = await Message.find({
    //     $or: [
    //         { senderId: myId, reciverId: selectedUserId },
    //         { senderId: selectedUserId, reciverId: myId }
    //     ]
    // }).sort({ createdAt: 1 });

    // // mark unseen as seen
    // await Message.updateMany(
    //     { senderId: selectedUserId, reciverId: myId, seen: false },
    //     { $set: { seen: true } }
    // );
    const message = await Message.find({ chat: req.params.chatId })
        .populate("sender", "username avatar email")
        .populate("chat")

    return res.status(200).json(new ApiResponse(200, message, "Messages fetched successfully"));
});

// ---------------- Mark message as seen ----------------
const markMessagesAsSeen = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid message ID format");
    }

    const message = await Message.findById(id);
    if (!message) throw new ApiError(404, "Message not found");

    if (message.reciverId.toString() !== userId.toString()) {
        throw new ApiError(403, "You are not authorized to mark this message as seen");
    }

    if (message.seen) {
        return res.status(200).json({ success: true, message: "Message already marked as seen" });
    }

    message.seen = true;
    await message.save();

    return res.status(200).json({ success: true, message: "Message marked as seen" });
});

// ---------------- Send message ----------------
const sendMessage = asyncHandler(async (req, res) => {
    // const { text, image } = req.body;
    // const receiverId = req.params.id;
    // const senderId = req.user?._id;

    // if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    //     throw new ApiError(400, "Invalid receiver ID format");
    // }

    // if (!text && !image) {
    //     throw new ApiError(400, "Message cannot be empty");
    // }

    // let imageUrl = null;
    // if (image) {
    //     try {
    //         const uploadResult = await UploadOnCloudinary(image);
    //         imageUrl = uploadResult?.secure_url || null;
    //     } catch (err) {
    //         throw new ApiError(500, "Failed to upload image");
    //     }
    // }

    // const newMessage = await Message.create({
    //     senderId,
    //     reciverId: receiverId,
    //     text,
    //     image: imageUrl,
    //     seen: false
    // });

    

    // return res.status(201).json(
    //     new ApiResponse(201, newMessage, "Message sent successfully")
    // );

    const { content, chatId } = req.body;
    if (!content || !chatId) {
        throw new ApiError(400, "message cannot be empty!")
    }
    const newMessage = {
        sender: req.user._id,
        content: content,
        chat : chatId,
    }
    try {
      var message = await Message.create(newMessage);
      message = await message.populate("sender", "username avatar");
      message = await message.populate("chat");
      message = await User.populate(message, {
        path: "chat.users",
        select: "username avatar email",
      });

      await Chat.findByIdAndUpdate(req.body.chatId, {
        latestMessage: message,
      });

      // Emit the new message to the receiver if they are online
    //   const receiverSocketId = userSocketMap[receiverId];
    //   if (receiverSocketId) {
    //     io.to(receiverSocketId).emit("newMessage", newMessage);
    //   } else {
    //     console.log("Receiver is offline, cannot emit message");
    //   }

      return res
        .status(200)
        .json(new ApiResponse(200, message, "message sent!"));
    } catch (error) {
        res.status(400).json(new ApiError(400, "unable to send messages"))
    }
});

export {
    getUserForSidebar,
    getMessages,
    markMessagesAsSeen,
    sendMessage
};
