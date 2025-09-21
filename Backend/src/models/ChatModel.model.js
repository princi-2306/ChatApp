import mongoose, {Schema } from "mongoose";
import jwt from "jsonwebtoken";

const chatModelSchema = new Schema(
    {
        chatName: {
            type: String,
            trim: true
        },
        isGroupChat: {
            type: Boolean,
            default: false
        },
        users: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            }
        ],
        latestMessage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        },
        groupAdmin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        mute: {
            type: Boolean,
            default : false
        },
        unreadCount: {
            type: Boolean,
            default : false
        },
        pinned: {
            type: Boolean,
            default : false
        }
    },
    { timestamps: true });

    export const Chat = mongoose.model("Chat", chatModelSchema) 