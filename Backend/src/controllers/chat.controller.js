import ApiResponse from "../utils/ApiResponse.js";
import { DeleteOnCloudinary, UploadOnCloudinary } from "../utils/Cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Message } from "../models/Message.model.js";
import { User } from "../models/User.model.js";
import { Chat } from "../models/ChatModel.model.js";
import ApiError from "../utils/ApiError.js";

const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("UserId param not sent with request");
    return res.status(400);
  }

  var isChat = await Message.find({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } },
    ],
  })
    .populate("users", "-password")
    .populate("latestMessage");

  isChat = await User.populate(isChat, {
    path: "latestMessage.sender",
    select: "username avatar email",
  });

  if (isChat.length > 0) {
    res.send(isChat[0]);
  } else {
    var chatData = {
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    };
  }

  const createChat = await Chat.create(chatData);
  const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
    "users",
    "-password"
  );

  return res
    .status(200)
    .json(new ApiResponse(200, FullChat, "Chats created successfully!"));
});


const fetchChats = asyncHandler(async (req, res) => {
  try {
    // Get current user with blocked users
    const currentUser = await User.findById(req.user._id);
    
    // Get users who have blocked the current user
    const usersWhoBlockedMe = await User.find({
        blockedUsers: req.user._id
    }).select('_id');
    
    const blockedByIds = usersWhoBlockedMe.map(u => u._id);
    const allBlockedUserIds = [
        ...currentUser.blockedUsers,
        ...blockedByIds
    ];

    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 });

    // Filter out chats with blocked users (for one-on-one chats only)
    chats = chats.filter(chat => {
        if (chat.isGroupChat) {
            // Keep all group chats
            return true;
        } else {
            // For one-on-one chats, check if the other user is blocked
            const otherUser = chat.users.find(
                user => user._id.toString() !== req.user._id.toString()
            );
            
            if (otherUser) {
                const isBlocked = allBlockedUserIds.some(
                    id => id.toString() === otherUser._id.toString()
                );
                return !isBlocked; // Keep chat only if user is not blocked
            }
            return true;
        }
    });

    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "username avatar email",
    });

    res
      .status(200)
      .json(new ApiResponse(200, chats, "All chats fetched successfully!"));
  } catch (error) {
    console.error("Fetch chats error:", error);
    res.status(500).json(new ApiResponse(500, null, "Failed to fetch chats"));
  }
});


const createGroupChats = asyncHandler(async (req, res) => {
  if (!req.body.users || !req.body.name) {
    return res
      .status(400)
      .json(new ApiError(400, "Please fill all the fields"));
  }

  var users = JSON.parse(req.body.users);
  if (users.length < 2) {
    return res
      .status(400)
      .json(new ApiError(400, "more than 2 users required for group chat"));
  }

  let avatarUrl = null;
  if (req.files) {
    const avatarLocalPath = [req.files.groupAvatar[0]?.buffer];
    try {
      const uploadResult = await UploadOnCloudinary(avatarLocalPath);
      if (uploadResult) {
        avatarUrl = uploadResult[0].url;
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
    }
  }

  const groupChatData = {
    chatName: req.body.name,
    users: [...users, req.user._id],
    isGroupChat: true,
    groupAdmin: req.user,
  };

  if (avatarUrl) {
    groupChatData.groupAvatar = avatarUrl;
  }

  const groupChat = await Chat.create(groupChatData);

  const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  console.log(fullGroupChat);
  return res
    .status(200)
    .json(
      new ApiResponse(200, fullGroupChat, "Group chat created successfully!")
    );
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  const newChatName = await Chat.findByIdAndUpdate(
    chatId,
    { chatName: chatName },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, newChatName, "group chat name updated successfully!")
    );
});

// NEW: Update Group Details (Name and/or Avatar)
const updateGroupDetails = asyncHandler(async (req, res) => {
  const { chatId, chatName } = req.body;

  try {
    // Find the chat first
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(new ApiError(404, {}, "Chat not found"));
    }

    // Verify it's a group chat
    if (!chat.isGroupChat) {
      return res
        .status(400)
        .json(new ApiError(400, {}, "This is not a group chat"));
    }

    // Verify user is the group admin
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(
          new ApiError(
            403,
            {},
            "Only group admin can update group details"
          )
        );
    }

    // Prepare update object
    const updateData = {};

    // Update chat name if provided
    if (chatName && chatName.trim()) {
      updateData.chatName = chatName.trim();
    }

    // Handle avatar update if file is provided
    if (req.files && req.files.groupAvatar) {
      try {
        // Delete old avatar from Cloudinary if exists
        if (chat.groupAvatar) {
          // Extract public_id from the URL
          const urlParts = chat.groupAvatar.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          
          try {
            await DeleteOnCloudinary(publicId);
            console.log("Old avatar deleted:", publicId);
          } catch (error) {
            console.error("Error deleting old avatar:", error);
          }
        }

        // Upload new avatar
        const avatarLocalPath = [req.files.groupAvatar[0]?.buffer];
        const uploadResult = await UploadOnCloudinary(avatarLocalPath);
        
        if (uploadResult && uploadResult[0]) {
          updateData.groupAvatar = uploadResult[0].url;
          console.log("New avatar uploaded:", uploadResult[0].url);
        }
      } catch (error) {
        console.error("Error uploading new avatar:", error);
        return res
          .status(500)
          .json(new ApiError(500, {}, "Failed to upload avatar"));
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json(
          new ApiError(400, {}, "Please provide details to update")
        );
    }

    // Update the chat
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      updateData,
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    // Populate latestMessage sender if exists
    if (updatedChat.latestMessage) {
      await updatedChat.populate({
        path: "latestMessage.sender",
        select: "username avatar email",
      });
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedChat,
          "Group details updated successfully!"
        )
      );
  } catch (error) {
    console.error("Error updating group details:", error);
    return res
      .status(500)
      .json(new ApiError(500, {}, "Failed to update group details"));
  }
});

// NEW: Remove Group Avatar
const removeGroupAvatar = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  try {
    // Find the chat
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(new ApiError(404, {}, "Chat not found"));
    }

    // Verify it's a group chat
    if (!chat.isGroupChat) {
      return res
        .status(400)
        .json(new ApiError(400, {}, "This is not a group chat"));
    }

    // Verify user is the group admin
    if (chat.groupAdmin.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json(
          new ApiError(403, {}, "Only group admin can remove group avatar")
        );
    }

    // Check if avatar exists
    if (!chat.groupAvatar) {
      return res
        .status(400)
        .json(new ApiError(400, {}, "Group has no avatar to remove"));
    }

    // Delete avatar from Cloudinary
    try {
      const urlParts = chat.groupAvatar.split('/');
      const publicIdWithExtension = urlParts[urlParts.length - 1];
      const publicId = publicIdWithExtension.split('.')[0];
      
      await DeleteOnCloudinary(publicId);
      console.log("Avatar deleted from Cloudinary:", publicId);
    } catch (error) {
      console.error("Error deleting avatar from Cloudinary:", error);
    }

    // Update chat to remove avatar
    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { groupAvatar: null },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          updatedChat,
          "Group avatar removed successfully!"
        )
      );
  } catch (error) {
    console.error("Error removing group avatar:", error);
    return res
      .status(500)
      .json(new ApiError(500, {}, "Failed to remove group avatar"));
  }
});

const addToGroup = asyncHandler(async (req, res) => {
  const { chatId, userIds } = req.body;
  const currentChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $push: { users: { $each: userIds } },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, { currentChat, userIds }, "new user added to group sucessfully!")
    );
});

const LeaveGroup = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.body;
  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: { users: userId },
    },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedChat, "user removed from the gourp!"));
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    // Find the chat first
    const chat = await Chat.findById(chatId);
    
    if (!chat) {
      return res.status(404).json(new ApiError(404, {}, "Chat not found"));
    }

    // Check if it's a group chat
    if (chat.isGroupChat) {
      // For group chats, verify user is the admin
      if (chat.groupAdmin.toString() !== req.user._id.toString()) {
        return res
          .status(403)
          .json(
            new ApiError(403, {}, "Only group admin can delete the group")
          );
      }

      // Delete group avatar from Cloudinary if exists
      if (chat.groupAvatar) {
        try {
          const urlParts = chat.groupAvatar.split('/');
          const publicIdWithExtension = urlParts[urlParts.length - 1];
          const publicId = publicIdWithExtension.split('.')[0];
          
          await DeleteOnCloudinary(publicId);
          console.log("Group avatar deleted from Cloudinary:", publicId);
        } catch (error) {
          console.error("Error deleting group avatar:", error);
        }
      }
    } else {
      // For one-on-one chats, verify user is part of the chat
      const isUserInChat = chat.users.some(
        (user) => user.toString() === req.user._id.toString()
      );

      if (!isUserInChat) {
        return res
          .status(403)
          .json(
            new ApiError(403, {}, "You are not authorized to delete this chat")
          );
      }
    }

    // Get all messages with attachments for this chat
    const messagesWithAttachments = await Message.find({
      chat: chatId,
      attachments: { $exists: true, $ne: [] },
    });

    // Delete all attachments from Cloudinary
    for (const message of messagesWithAttachments) {
      if (message.attachments && message.attachments.length > 0) {
        for (const attachment of message.attachments) {
          if (attachment.publicId) {
            try {
              await DeleteOnCloudinary(attachment.publicId);
              console.log(`Deleted attachment: ${attachment.publicId}`);
            } catch (error) {
              console.error(
                `Failed to delete attachment: ${attachment.publicId}`,
                error
              );
            }
          }
        }
      }
    }

    // Delete all messages in the chat
    const deletedMessages = await Message.deleteMany({ chat: chatId });
    console.log(`Deleted ${deletedMessages.deletedCount} messages`);

    // Finally, delete the chat
    const deletedChat = await Chat.findByIdAndDelete(chatId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            deletedChat,
            deletedMessagesCount: deletedMessages.deletedCount,
          },
          chat.isGroupChat
            ? "Group deleted successfully!"
            : "Chat deleted successfully!"
        )
      );
  } catch (error) {
    console.error("Error deleting chat:", error);
    return res
      .status(500)
      .json(new ApiError(500, {}, "Failed to delete chat"));
  }
});

const clearChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json(new ApiError(404, {}, "Chat not found"));
    }

    const isUserInChat = chat.users.some(
      (user) => user.toString() === req.user._id.toString()
    );

    if (!isUserInChat) {
      return res
        .status(403)
        .json(
          new ApiError(403, {}, "You are not authorized to clear this chat")
        );
    }

    const messagesWithAttachments = await Message.find({
      chat: chatId,
      attachments: { $exists: true, $ne: [] },
    });

    for (const message of messagesWithAttachments) {
      if (message.attachments && message.attachments.length > 0) {
        for (const attachment of message.attachments) {
          if (attachment.publicId) {
            try {
              await DeleteOnCloudinary(attachment.publicId);
              console.log(`Deleted attachment: ${attachment.publicId}`);
            } catch (error) {
              console.error(
                `Failed to delete attachment: ${attachment.publicId}`,
                error
              );
            }
          }
        }
      }
    }

    const result = await Message.deleteMany({ chat: chatId });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: null,
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { deletedCount: result.deletedCount },
          `Chat cleared successfully! ${result.deletedCount} message(s) deleted.`
        )
      );
  } catch (error) {
    console.error("Error clearing chat:", error);
    return res.status(500).json(new ApiError(500, {}, "Failed to clear chat"));
  }
});

const togglePin = asyncHandler(async (req, res) => {
  const { chatId } = req.body;

  if (!chatId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Chat ID is required"));
  }

  try {
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(new ApiResponse(404, null, "Chat not found"));
    }

    chat.pinned = !chat.pinned;

    const updatedChat = await chat.save();

    await updatedChat.populate("users", "-password");
    if (updatedChat.isGroupChat) {
      await updatedChat.populate("groupAdmin", "-password");
    }
    await updatedChat.populate("latestMessage");

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          chat: updatedChat,
          action: updatedChat.pinned ? "pinned" : "unpinned",
        },
        `Chat ${updatedChat.pinned ? "pinned" : "unpinned"} successfully!`
      )
    );
  } catch (error) {
    console.error("Error toggling pin:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});


const blockUser = asyncHandler(async (req, res) => {
  const { userIdToBlock } = req.body;
  const currentUserId = req.user._id;

  if (!userIdToBlock) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User ID to block is required"));
  }

  if (userIdToBlock === currentUserId.toString()) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "You cannot block yourself"));
  }

  try {
    const userToBlock = await User.findById(userIdToBlock);
    if (!userToBlock) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    const currentUser = await User.findById(currentUserId);
    
    // Check if already blocked
    if (currentUser.blockedUsers.includes(userIdToBlock)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User is already blocked"));
    }

    // Add to blocked list
    currentUser.blockedUsers.push(userIdToBlock);
    await currentUser.save();

    // Delete one-on-one chat between these users
    await Chat.deleteMany({
      isGroupChat: false,
      users: {
        $all: [currentUserId, userIdToBlock],
      },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { 
            blockedUser: {
              _id: userToBlock._id,
              username: userToBlock.username,
              email: userToBlock.email,
              avatar: userToBlock.avatar
            },
            blockedUsersCount: currentUser.blockedUsers.length
          },
          "User blocked successfully"
        )
      );
  } catch (error) {
    console.error("Error blocking user:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// NEW: Unblock user function
const unblockUser = asyncHandler(async (req, res) => {
  const { userIdToUnblock } = req.body;
  const currentUserId = req.user._id;

  if (!userIdToUnblock) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "User ID to unblock is required"));
  }

  try {
    const currentUser = await User.findById(currentUserId);
    
    // Check if user is actually blocked
    if (!currentUser.blockedUsers.includes(userIdToUnblock)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User is not blocked"));
    }

    // Remove from blocked list
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== userIdToUnblock
    );
    await currentUser.save();

    const unblockedUser = await User.findById(userIdToUnblock).select(
      "username email avatar"
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            unblockedUser,
            blockedUsersCount: currentUser.blockedUsers.length
          },
          "User unblocked successfully"
        )
      );
  } catch (error) {
    console.error("Error unblocking user:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// NEW: Get list of blocked users
const getBlockedUsers = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  try {
    const currentUser = await User.findById(currentUserId)
      .populate("blockedUsers", "username email avatar");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {
            blockedUsers: currentUser.blockedUsers,
            count: currentUser.blockedUsers.length
          },
          "Blocked users fetched successfully"
        )
      );
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});

// NEW: Check if a user is blocked
const isUserBlocked = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user._id;

  try {
    const currentUser = await User.findById(currentUserId);
    const isBlocked = currentUser.blockedUsers.includes(userId);

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { isBlocked },
          isBlocked ? "User is blocked" : "User is not blocked"
        )
      );
  } catch (error) {
    console.error("Error checking block status:", error);
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Internal server error"));
  }
});




export {
  accessChat,
  fetchChats,
  createGroupChats,
  renameGroup,
  updateGroupDetails,    // NEW EXPORT
  removeGroupAvatar,     // NEW EXPORT
  addToGroup,
  LeaveGroup,
  deleteChat,
  togglePin,
  blockUser,
  clearChat,
  unblockUser,
  getBlockedUsers,
  isUserBlocked
};