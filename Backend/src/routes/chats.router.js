import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
    accessChat,
    fetchChats,
    createGroupChats,
    renameGroup,
    addToGroup,
    removeFromGroup,
    deleteChat
} from "../controllers/chat.controller.js";

const chatRouter = Router();

chatRouter.route("/").post(verifyJWT, accessChat);
chatRouter.route("/fetch-chats").get(verifyJWT, fetchChats);
chatRouter.route("/group").post(verifyJWT, createGroupChats);
chatRouter.route("/rename").put(verifyJWT, renameGroup);
chatRouter.route("/groupremove").put(verifyJWT, removeFromGroup);
chatRouter.route("/groupadd").put(verifyJWT, addToGroup);
chatRouter.route("/delete-chat/:chatId").delete(verifyJWT, deleteChat)

export default chatRouter;