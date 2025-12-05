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
    // Find chats where logged-in user is in the users array
    let chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } },
    })
      .populate("users", "-password") // populate all users except password
      .populate("groupAdmin", "-password") // populate group admin
      .populate("latestMessage") // populate latest message
      .sort({ updatedAt: -1 }); // latest updated first

    // Populate latestMessage.sender with username, avatar, email
    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "username avatar email",
    });

    res
      .status(200)
      .json(new ApiResponse(200, chats, "All chats fetched successfully!"));
  } catch (error) {
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

  // Handle avatar upload if file is provided
  let avatarUrl = null;
  if (req.files) {
    // console.log("File path:", req.files.groupAvatar[0]);
    const avatarLocalPath = [req.files.groupAvatar[0]?.buffer];
    try {
      const uploadResult = await UploadOnCloudinary(avatarLocalPath);
      // console.log("Cloudinary upload result:", uploadResult);
      if (uploadResult) {
        avatarUrl = uploadResult[0].url;
        // console.log("Avatar uploaded:", avatarUrl);
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      // Continue without avatar if upload fails
    }
  }

  const groupChatData = {
    chatName: req.body.name,
    users: [...users, req.user._id],
    isGroupChat: true,
    groupAdmin: req.user,
  };

  // Add avatar URL if available
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
  //get chatId , chatName
  //change name of that chatId

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

// const seachUser = asyncHandler(async (req, res) => {
//   const { userId } = req.params;
//   if (!userId) {
//     return res.status(404).json(new ApiError(404, "no user found!"));
//   }
//   const user = await User
// })

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const deleteChat = await Chat.findByIdAndDelete(chatId);
  if (!deleteChat) {
    return res.status(404).json(new ApiError(404, {}, "chat not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "chat deleted successfully!"));
});

// NEW: Clear Chat Function
const clearChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  try {
    // Check if chat exists
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json(new ApiError(404, {}, "Chat not found"));
    }

    // Verify user is part of the chat
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

    // Get all messages for this chat that have attachments
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
    const result = await Message.deleteMany({ chat: chatId });

    // Update chat's latestMessage to null
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

  // Validate input
  if (!chatId) {
    return res
      .status(400)
      .json(new ApiResponse(400, null, "Chat ID is required"));
  }

  try {
    // Find the chat and toggle the pinned status
    const chat = await Chat.findById(chatId);

    if (!chat) {
      return res.status(404).json(new ApiResponse(404, null, "Chat not found"));
    }

    // Toggle the pinned status
    chat.pinned = !chat.pinned;

    // Save the updated chat
    const updatedChat = await chat.save();

    // Populate necessary fields if needed
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
  const currentUserId = req.user._id; // From auth middleware

  // Validate input
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
    // Check if user exists
    const userToBlock = await User.findById(userIdToBlock);
    if (!userToBlock) {
      return res.status(404).json(new ApiResponse(404, null, "User not found"));
    }

    // Check if already blocked
    const currentUser = await User.findById(currentUserId);
    if (currentUser.blockedUsers.includes(userIdToBlock)) {
      return res
        .status(400)
        .json(new ApiResponse(400, null, "User is already blocked"));
    }

    // Add to blocked users
    currentUser.blockedUsers.push(userIdToBlock);
    await currentUser.save();

    // Remove any existing chats between users
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
          { blockedUser: userToBlock },
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

export {
  accessChat,
  fetchChats,
  createGroupChats,
  renameGroup,
  addToGroup,
  LeaveGroup,
  deleteChat,
  togglePin,
  blockUser,
  clearChat, // EXPORT NEW FUNCTION
};
