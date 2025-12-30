import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Notification } from "../models/Notification.model.js";
import { Chat } from "../models/ChatModel.model.js";
import { User } from "../models/User.model.js";
import mongoose from "mongoose";

// Get all notifications for logged-in user
const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: No user found in request");
  }

  const notifications = await Notification.find({ recipient: userId })
    .populate("sender", "username avatar email")
    .populate("chat", "chatName isGroupChat")
    .populate("message", "content createdAt")
    .sort({ createdAt: -1 })
    .limit(50); // Limit to last 50 notifications

  return res.status(200).json(
    new ApiResponse(200, notifications, "Notifications fetched successfully")
  );
});

// Get unread notification count
const getUnreadCount = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: No user found in request");
  }

  const unreadCount = await Notification.countDocuments({
    recipient: userId,
    isRead: false
  });

  return res.status(200).json(
    new ApiResponse(200, { unreadCount }, "Unread count fetched successfully")
  );
});



const getUnreadMessageCountPerChat = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new ApiError(401, "Unauthorized: No user found in request");
  }

  // Get user's muted chats
  const user = await User.findById(userId);
  const mutedChatIds = user.mutedChats || [];

  // Aggregate unread notifications grouped by chat, excluding muted chats
  const unreadCounts = await Notification.aggregate([
    {
      $match: {
        recipient: userId,
        sender: { $ne: userId },
        isRead: false,
        type: { $in: ["new_message", "group_message"] },
        chat: {
          $nin: mutedChatIds.map((id) => new mongoose.Types.ObjectId(id)),
        }, // Exclude muted chats
      },
    },
    {
      $group: {
        _id: "$chat",
        count: { $sum: 1 },
        lastNotification: { $max: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "chats",
        localField: "_id",
        foreignField: "_id",
        as: "chatInfo",
      },
    },
    {
      $unwind: "$chatInfo",
    },
    {
      $project: {
        chatId: "$_id",
        count: 1,
        lastNotification: 1,
        chatName: "$chatInfo.chatName",
        isGroupChat: "$chatInfo.isGroupChat",
      },
    },
    {
      $sort: { lastNotification: -1 },
    },
  ]);

  // Format the response as an object with chatId as keys
  const formattedCounts = {};
  unreadCounts.forEach(item => {
    formattedCounts[item.chatId.toString()] = {
      count: item.count,
      lastNotification: item.lastNotification,
      chatName: item.chatName,
      isGroupChat: item.isGroupChat
    };
  });

  return res.status(200).json(
    new ApiResponse(200, formattedCounts, "Unread message counts per chat fetched successfully")
  );
});




// Mark notification as read
const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification ID format");
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to mark this notification as read");
  }

  if (notification.isRead) {
    return res.status(200).json(
      new ApiResponse(200, notification, "Notification already marked as read")
    );
  }

  notification.isRead = true;
  await notification.save();

  return res.status(200).json(
    new ApiResponse(200, notification, "Notification marked as read")
  );
});

// Mark all notifications in a chat as read
const markChatNotificationsAsRead = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat ID format");
  }

  const result = await Notification.updateMany(
    {
      recipient: userId,
      chat: chatId,
      isRead: false
    },
    {
      $set: { isRead: true }
    }
  );

  return res.status(200).json(
    new ApiResponse(200, { modifiedCount: result.modifiedCount }, "Chat notifications marked as read")
  );
});

// Mark all notifications as read
const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const result = await Notification.updateMany(
    {
      recipient: userId,
      isRead: false
    },
    {
      $set: { isRead: true }
    }
  );

  return res.status(200).json(
    new ApiResponse(200, { modifiedCount: result.modifiedCount }, "All notifications marked as read")
  );
});

// Delete a notification
const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user?._id;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification ID format");
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.recipient.toString() !== userId.toString()) {
    throw new ApiError(403, "You are not authorized to delete this notification");
  }

  await Notification.findByIdAndDelete(notificationId);

  return res.status(200).json(
    new ApiResponse(200, {}, "Notification deleted successfully")
  );
});

// Delete all notifications for user
const deleteAllNotifications = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const result = await Notification.deleteMany({ recipient: userId });

  return res.status(200).json(
    new ApiResponse(200, { deletedCount: result.deletedCount }, "All notifications deleted successfully")
  );
});

export {
  getNotifications,
  getUnreadCount,
  getUnreadMessageCountPerChat,
  markNotificationAsRead,
  markChatNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
};