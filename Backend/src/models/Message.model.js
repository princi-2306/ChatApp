import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";

const messageSchema = new Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    reciverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    text: {
        type: String,
        maxlength: 1200
    },
    image: {
        type: String   // cloudnary URL
    },
    seen: {
        type: Boolean,
        default: false
    }


})

export const Message = mongoose.model("Message", messageSchema);
