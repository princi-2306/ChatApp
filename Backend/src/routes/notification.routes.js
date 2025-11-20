import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getNotifications,
  getUnreadCount,
  getUnreadMessageCountPerChat,
  markNotificationAsRead,
  markChatNotificationsAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications
} from "../controllers/notification.controller.js";

const notificationRouter = Router();

// Get all notifications for logged-in user
notificationRouter.route("/").get(verifyJWT, getNotifications);

// Get unread notification count
notificationRouter.route("/unread-count").get(verifyJWT, getUnreadCount);

// Get unread message count per chat (for sidebar)
notificationRouter.route("/unread-per-chat").get(verifyJWT, getUnreadMessageCountPerChat);

// Mark single notification as read
notificationRouter.route("/read/:notificationId").put(verifyJWT, markNotificationAsRead);

// Mark all notifications in a chat as read
notificationRouter.route("/read-chat/:chatId").put(verifyJWT, markChatNotificationsAsRead);

// Mark all notifications as read
notificationRouter.route("/read-all").put(verifyJWT, markAllNotificationsAsRead);

// Delete single notification
notificationRouter.route("/:notificationId").delete(verifyJWT, deleteNotification);

// Delete all notifications
notificationRouter.route("/").delete(verifyJWT, deleteAllNotifications);

export default notificationRouter;