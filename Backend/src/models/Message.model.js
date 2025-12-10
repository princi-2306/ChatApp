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
    attachments: [{
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
      },
      fileType: {
        type: String,
        required: true
      },
      fileName: {
        type: String,
        required: true
      },
      fileSize: {
        type: Number,
      },
      mimeType: {
        type: String,
      }
    }],
    image: {
      type: String,
    },
    // NEW: Edit message fields
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
    },
    editHistory: [{
      content: String,
      editedAt: {
        type: Date,
        default: Date.now
      }
    }],
    // NEW: Reactions field
    reactions: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      emoji: {
        type: String,
        required: true
      },
      reactedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  { timestamps: true }
);

// Method to check if message can be edited (within 5 minutes)
messageSchema.methods.canBeEdited = function() {
  const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
  const timeSinceSent = Date.now() - this.createdAt.getTime();
  return timeSinceSent <= fiveMinutes;
};

// Method to add or update reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  const existingReactionIndex = this.reactions.findIndex(
    r => r.user.toString() === userId.toString()
  );

  if (existingReactionIndex !== -1) {
    // If user already reacted, update the emoji
    if (this.reactions[existingReactionIndex].emoji === emoji) {
      // If same emoji, remove the reaction (toggle off)
      this.reactions.splice(existingReactionIndex, 1);
    } else {
      // Different emoji, update it
      this.reactions[existingReactionIndex].emoji = emoji;
      this.reactions[existingReactionIndex].reactedAt = Date.now();
    }
  } else {
    // New reaction
    this.reactions.push({ user: userId, emoji, reactedAt: Date.now() });
  }
  
  return this.save();
};

export const Message = mongoose.model("Message", messageSchema); 