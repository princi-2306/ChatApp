import mongoose, {Schema} from "mongoose";

const messageSchema = new Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      trim: true,
    },
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat"
    },
    // UPDATED: Support multiple attachments
    attachments: [{
      url: {
        type: String, // Cloudinary URL
        required: true
      },
      publicId: {
        type: String, // For deletion
      },
      fileType: {
        type: String, // 'image', 'document', 'video', etc.
        required: true
      },
      fileName: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number, // in bytes
      },
      mimeType: {
        type: String, // e.g., 'image/png', 'application/pdf'
      }
    }],
    // Keep for backward compatibility
    image: {
      type: String,
    }
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", messageSchema);
