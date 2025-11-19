import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Message } from "../models/Message.model.js";
import { User } from "../models/User.model.js";
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import mongoose from "mongoose";
import { Chat } from "../models/ChatModel.model.js";

const getUserForSidebar = asyncHandler(async (req, res) => {
    const userId = req.user?._id;
    if (!userId) throw new ApiError(401, "Unauthorized: No user found in request");

    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    if (!filteredUsers.length) {
        return res.status(200).json(new ApiResponse(200, { filteredUsers: [], unseenMessages: {} }, "No other users found"));
    }

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

const getMessages = asyncHandler(async (req, res) => {
    const message = await Message.find({ chat: req.params.chatId })
        .populate("sender", "username avatar email")
        .populate("chat");

    return res.status(200).json(new ApiResponse(200, message, "Messages fetched successfully"));
});

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

// UPDATED: Send message with file attachments
const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    const files = req.files; // Files from multer

    if (!content && (!files || files.length === 0)) {
        throw new ApiError(400, "Message cannot be empty!");
    }

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required!");
    }

    const newMessage = {
        sender: req.user._id,
        content: content || "",
        chat: chatId,
        attachments: []
    };

    try {
        // Upload files to Cloudinary if present
        if (files && files.length > 0) {
            const fileBuffers = files.map(file => file.buffer);
            
            // Separate images and other files
            const images = files.filter(f => f.mimetype.startsWith('image/'));
            const documents = files.filter(f => !f.mimetype.startsWith('image/'));
            
            let uploadedAttachments = [];

            // Upload images
            if (images.length > 0) {
                const imageBuffers = images.map(img => img.buffer);
                const uploadedImages = await UploadOnCloudinary(imageBuffers, "image");
                
                if (uploadedImages) {
                    uploadedAttachments = uploadedImages.map((result, index) => ({
                        url: result.secure_url,
                        publicId: result.public_id,
                        fileType: 'image',
                        fileName: images[index].originalname,
                        fileSize: images[index].size,
                        mimeType: images[index].mimetype
                    }));
                }
            }

            // Upload documents/files
            if (documents.length > 0) {
                const docBuffers = documents.map(doc => doc.buffer);
                const uploadedDocs = await UploadOnCloudinary(docBuffers, "raw");
                
                if (uploadedDocs) {
                    const docAttachments = uploadedDocs.map((result, index) => ({
                        url: result.secure_url,
                        publicId: result.public_id,
                        fileType: 'document',
                        fileName: documents[index].originalname,
                        fileSize: documents[index].size,
                        mimeType: documents[index].mimetype
                    }));
                    uploadedAttachments = [...uploadedAttachments, ...docAttachments];
                }
            }

            newMessage.attachments = uploadedAttachments;
        }

        var message = await Message.create(newMessage);
        message = await message.populate("sender", "username avatar");
        message = await message.populate("chat");
        message = await User.populate(message, {
            path: "chat.users",
            select: "username avatar email",
        });

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message,
        });

        return res.status(200).json(new ApiResponse(200, message, "Message sent!"));
    } catch (error) {
        console.error("Send message error:", error);
        throw new ApiError(400, "Unable to send message");
    }
});

export {
    getUserForSidebar,
    getMessages,
    markMessagesAsSeen,
    sendMessage
};
