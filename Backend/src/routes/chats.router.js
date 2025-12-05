import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {upload} from "../middlewares/multer.middleware.js"
import { 
    accessChat,
    fetchChats,
    createGroupChats,
    renameGroup,
    addToGroup,
    LeaveGroup,
  deleteChat,
  togglePin,
  blockUser,
    clearChat  // IMPORT NEW FUNCTION
} from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.route("/").post(verifyJWT, accessChat);
chatRouter.route("/fetch-chats").get(verifyJWT, fetchChats);
chatRouter.route("/group").post(verifyJWT,
  upload.fields([
    {
      name: "groupAvatar",
      maxCount: 1
    }
  ]), createGroupChats);
chatRouter.route("/rename").put(verifyJWT, renameGroup);
chatRouter.route("/toggle-pin").put(verifyJWT, togglePin);
chatRouter.route("/block-user").put(verifyJWT, blockUser);
chatRouter.route("/group-leave").put(verifyJWT, LeaveGroup);
chatRouter.route("/groupadd").put(verifyJWT, addToGroup);
chatRouter.route("/delete-chat/:chatId").delete(verifyJWT, deleteChat);
chatRouter.route("/clear-chat/:chatId").delete(verifyJWT, clearChat);  // NEW ROUTE

export default chatRouter;