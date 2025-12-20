import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import { 
    accessChat,
    fetchChats,
    createGroupChats,
    renameGroup,
    updateGroupDetails,
    removeGroupAvatar,
    addToGroup,
    LeaveGroup,
    deleteChat,
    togglePin,
    blockUser,
    unblockUser,           // NEW
    getBlockedUsers,       // NEW
    isUserBlocked,         // NEW
    clearChat
} from "../controllers/chat.controller.js";

const chatRouter = Router();

// Access or create a chat
chatRouter.route("/").post(verifyJWT, accessChat);

// Fetch all chats
chatRouter.route("/fetch-chats").get(verifyJWT, fetchChats);

// Create group chat with avatar
chatRouter.route("/group").post(
  verifyJWT,
  upload.fields([
    {
      name: "groupAvatar",
      maxCount: 1
    }
  ]), 
  createGroupChats
);

// Update group name only (legacy - kept for backward compatibility)
chatRouter.route("/rename").put(verifyJWT, renameGroup);

// Update group details (name and/or avatar)
chatRouter.route("/update-group-details").put(
  verifyJWT,
  upload.fields([
    {
      name: "groupAvatar",
      maxCount: 1
    }
  ]),
  updateGroupDetails
);

// Remove group avatar
chatRouter.route("/remove-group-avatar").put(verifyJWT, removeGroupAvatar);

// Toggle pin status
chatRouter.route("/toggle-pin").put(verifyJWT, togglePin);

// Block/Unblock user routes
chatRouter.route("/block-user").put(verifyJWT, blockUser);
chatRouter.route("/unblock-user").put(verifyJWT, unblockUser);           // NEW
chatRouter.route("/blocked-users").get(verifyJWT, getBlockedUsers);      // NEW
chatRouter.route("/is-blocked/:userId").get(verifyJWT, isUserBlocked);   // NEW

// Leave group
chatRouter.route("/group-leave").put(verifyJWT, LeaveGroup);

// Add users to group
chatRouter.route("/groupadd").put(verifyJWT, addToGroup);

// Delete chat
chatRouter.route("/delete-chat/:chatId").delete(verifyJWT, deleteChat);

// Clear chat messages
chatRouter.route("/clear-chat/:chatId").delete(verifyJWT, clearChat);

export default chatRouter;