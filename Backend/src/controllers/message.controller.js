import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Message } from "../models/Message.model.js";
import { User } from "../models/User.model.js";
import { UploadOnCloudinary } from "../utils/Cloudinary.js";
import mongoose from "mongoose";
import { Chat } from "../models/ChatModel.model.js";
import { Notification } from "../models/Notification.model.js";
import { io } from "../app.js";

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
        .populate("chat")
        .populate("reactions.user", "username avatar");

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

const createNotificationForUsers = async (message, chat, senderId) => {
  try {
    const notifications = [];
    
    let contentPreview = message.content ? message.content.substring(0, 50) : "";
    
    if (!contentPreview && message.attachments && message.attachments.length > 0) {
      const attachmentType = message.attachments[0].fileType;
      contentPreview = `Sent ${attachmentType === 'image' ? 'an image' : 'a file'}`;
    }

    for (const userId of chat.users) {
      if (userId.toString() !== senderId.toString()) {
        const notification = await Notification.create({
          recipient: userId,
          sender: senderId,
          chat: chat._id,
          message: message._id,
          type: chat.isGroupChat ? 'group_message' : 'new_message',
          content: contentPreview,
          isRead: false
        });

        notifications.push(notification);

        io.to(userId.toString()).emit("new notification", {
          notification: await notification.populate([
            { path: "sender", select: "username avatar email" },
            { path: "chat", select: "chatName isGroupChat" }
          ]),
          chatId: chat._id.toString()
        });
      }
    }

    return notifications;
  } catch (error) {
    console.error("Error creating notifications:", error);
    return [];
  }
};

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body;
    const files = req.files;

    if (!content && (!files || files.length === 0)) {
        throw new ApiError(400, "Message cannot be empty!");
    }

    if (!chatId) {
        throw new ApiError(400, "Chat ID is required!");
    }

    const chat = await Chat.findById(chatId).populate("users");
    if (!chat) {
        throw new ApiError(404, "Chat not found!");
    }

    const isUserInChat = chat.users.some(
        user => user._id.toString() === req.user._id.toString()
    );

    if (!isUserInChat) {
        throw new ApiError(403, "You are not a member of this chat!");
    }

    const newMessage = {
        sender: req.user._id,
        content: content || "",
        chat: chatId,
        attachments: []
    };

    try {
        if (files && files.length > 0) {
            const images = files.filter(f => f.mimetype.startsWith('image/'));
            const documents = files.filter(f => !f.mimetype.startsWith('image/'));
            
            let uploadedAttachments = [];

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

        await createNotificationForUsers(message, chat, req.user._id);

        return res.status(200).json(new ApiResponse(200, message, "Message sent!"));
    } catch (error) {
        console.error("Send message error:", error);
        throw new ApiError(400, "Unable to send message");
    }
});

// NEW: Edit message controller
const editMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?._id;

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Message content cannot be empty");
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new ApiError(400, "Invalid message ID format");
    }

    const message = await Message.findById(messageId)
        .populate("sender", "username avatar email")
        .populate("chat");

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    // Check if user is the sender
    if (message.sender._id.toString() !== userId.toString()) {
        throw new ApiError(403, "You can only edit your own messages");
    }

    // Check if message can still be edited (within 5 minutes)
    if (!message.canBeEdited()) {
        throw new ApiError(403, "Message can only be edited within 5 minutes of sending");
    }

    // Save original content to edit history
    if (!message.editHistory) {
        message.editHistory = [];
    }
    message.editHistory.push({
        content: message.content,
        editedAt: new Date()
    });

    // Update message content
    message.content = content.trim();
    message.isEdited = true;
    message.editedAt = new Date();

    await message.save();

    // Populate the message again after save
    await message.populate("reactions.user", "username avatar");

    // Emit socket event to notify all users in the chat
    const chat = await Chat.findById(message.chat._id);
    chat.users.forEach(user => {
        io.to(user._id.toString()).emit("message edited", {
            messageId: message._id,
            content: message.content,
            isEdited: message.isEdited,
            editedAt: message.editedAt,
            chatId: message.chat._id
        });
    });

    return res.status(200).json(
        new ApiResponse(200, message, "Message edited successfully")
    );
});

// NEW: Add/Remove reaction to message
const reactToMessage = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const { emoji } = req.body;
    const userId = req.user?._id;

    if (!emoji || emoji.trim() === "") {
        throw new ApiError(400, "Emoji is required");
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new ApiError(400, "Invalid message ID format");
    }

    const message = await Message.findById(messageId).populate("chat");

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    // Check if user is part of the chat
    const chat = await Chat.findById(message.chat._id);
    const isUserInChat = chat.users.some(
        user => user._id.toString() === userId.toString()
    );

    if (!isUserInChat) {
        throw new ApiError(403, "You must be a member of this chat to react to messages");
    }

    // Add or toggle reaction
    await message.addReaction(userId, emoji);

    // Populate reactions after update
    await message.populate("reactions.user", "username avatar");
    await message.populate("sender", "username avatar email");

    // Emit socket event to notify all users in the chat
    chat.users.forEach(user => {
        io.to(user._id.toString()).emit("message reaction", {
            messageId: message._id,
            reactions: message.reactions,
            chatId: message.chat._id
        });
    });

    return res.status(200).json(
        new ApiResponse(200, message.reactions, "Reaction updated successfully")
    );
});

// NEW: Get edit history of a message
const getEditHistory = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const userId = req.user?._id;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
        throw new ApiError(400, "Invalid message ID format");
    }

    const message = await Message.findById(messageId).populate("chat");

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    // Check if user is part of the chat
    const chat = await Chat.findById(message.chat._id);
    const isUserInChat = chat.users.some(
        user => user._id.toString() === userId.toString()
    );

    if (!isUserInChat) {
        throw new ApiError(403, "You must be a member of this chat to view edit history");
    }

    return res.status(200).json(
        new ApiResponse(200, {
            messageId: message._id,
            currentContent: message.content,
            isEdited: message.isEdited,
            editedAt: message.editedAt,
            editHistory: message.editHistory || []
        }, "Edit history fetched successfully")
    );
});

export {
    getUserForSidebar,
    getMessages,
    markMessagesAsSeen,
    sendMessage,
    editMessage,
    reactToMessage,
    getEditHistory
};