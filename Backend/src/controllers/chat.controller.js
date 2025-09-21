import ApiResponse from "../utils/ApiResponse.js";
import { DeleteOnCloudinary, UploadOnCloudinary } from "../utils/Cloudinary.js";
import asyncHandler from "../utils/asyncHandler.js";
import { Message } from "../models/Message.model.js";
import { User } from "../models/User.model.js";
import {Chat} from "../models/ChatModel.model.js"
import ApiError from "../utils/ApiError.js";

const accessChat = asyncHandler(async (req, res) => {
    const {userId} = req.body;

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
            users: [req.user._id, userId]
        
        
        }
    }

    const createChat = await Chat.create(chatData);
    const FullChat = await Chat.findOne({ _id: createChat._id }).populate(
        "users",
        "-password"
    );

    return res.status(200).json(new ApiResponse(200, FullChat, "Chats created successfully!"))
});

const fetchChats = asyncHandler(async (req, res) => {
    // Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
    //     .populate("users", "-password")
    //     .populate("groupAdmin", "-password")
    //     .populate("latestMessage")
    //     .sort({ updatedAt: -1 })
    //     .then(async (result) => {
    //         result = await User.populate(result, {
    //             path: "latestMessage.sender",
    //             select: "username avatar email"
    //         });
    //         res.status(200).json(new ApiResponse(200, result, "all chats fetched successfully!"))
  //     })
    try {
    // Find chats where logged-in user is in the users array
    let chats = await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")        // populate all users except password
      .populate("groupAdmin", "-password")  // populate group admin
      .populate("latestMessage")            // populate latest message
      .sort({ updatedAt: -1 });             // latest updated first

    // Populate latestMessage.sender with username, avatar, email
    chats = await User.populate(chats, {
      path: "latestMessage.sender",
      select: "username avatar email",
    });

    res.status(200).json(new ApiResponse(200, chats, "All chats fetched successfully!"));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, "Failed to fetch chats"));
  }
});

const createGroupChats = asyncHandler(async (req, res) => {
    if (!req.body.users || !req.body.name) {
        return res.status(400).json(new ApiError(400, "Please fill all the fields"));
    }

    var users = JSON.parse(req.body.users) //from req we get an array which we parse here in stringyfy format
    if (users.length < 2) {
        return res.status(400)
            .json(new ApiError(400, "more than 2 users required for group chat"))
    }
    users.push(req.user); // in chat's users array , all selected users get added alongwith the current user

    const groupChat = await Chat.create({
        chatName: req.body.name,
        users: users,
        isGroupChat: true,
        groupAdmin: req.user
    });

    const fullGroupChat = await Chat.findOne({ _id: groupChat._id })
        .populate("users", "-password")
        .populate("groupAdmin", "-password");
    
    return res.status(200).json(new ApiResponse(200, fullGroupChat, "group chat created successfully!"))
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
        .populate("groupAdmin", "-password")
 
    
    return res.status(200).json(new ApiResponse(200, newChatName, "group chat name updated successfully!"))
});

const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body
    const currentChat = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      { new: "true" }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");
    
    return res.status(200).json(new ApiResponse(200, currentChat, "new user added to group sucessfully!"))
})

const removeFromGroup = asyncHandler(async (req, res) => {
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
    
  return res.status(200).json(new ApiResponse(200, updatedChat, "user removed from the gourp!"))
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const deleteChat = await Chat.findByIdAndDelete(chatId);
  if (!deleteChat) {
    return res.status(404).json(new ApiError(404, {}, "chat not found"));
  }

  return res.status(200).json(new ApiResponse(200, {}, "chat deleted successfully!"))

});

export {
    accessChat,
    fetchChats,
    createGroupChats,
    renameGroup,
    addToGroup,
  removeFromGroup,
  deleteChat
};