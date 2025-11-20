import mongoose, { Schema } from "mongoose";

const notificationSchema = new Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true
    },
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true
    },
    type: {
      type: String,
      enum: ['new_message', 'group_message', 'added_to_group', 'removed_from_group'],
      default: 'new_message'
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    content: {
      type: String, // Preview of the message
      trim: true
    }
  },
  { timestamps: true }
);

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);