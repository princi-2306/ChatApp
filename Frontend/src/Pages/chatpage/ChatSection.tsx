import React, { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import userPost from "@/components/store/userStore";
import useChatStore from "@/components/store/chatStore";
import useNotificationStore from "@/components/store/notificationStore";
import useCallStore from "@/components/store/callStore";
import { Chat } from "@/components/store/chatStore";
import { User } from "@/components/store/userStore";
import axios from "axios";
import { toast } from "sonner";
import { DefaultEventsMap } from "@socket.io/component-emitter";
import { Message } from "@/types/message";
import { useNavigate } from "react-router-dom";

// Import components
import ChatHeader from "../../components/ChatSection/ChatHeader";
import MessageList from "../../components/ChatSection/MessageList";
import TypingIndicator from "../../components/ChatSection/TypingIndicator";
import MessageInput from "../../components/ChatSection/MessageInput";
import EmptyChatState from "../../components/ChatSection/EmptyChatState";
import UserProfileModal from "../../components/ChatSection/UserProfileModal";
import VoiceCallModal from "../../components/ChatSection/VoiceCallModal";
import ActiveCallModal from "../../components/ChatSection/ActiveCallModal";
import GroupChatDetails from "@/components/ChatSection/GroupChatDetails";
import DeleteChatModal from "@/components/ChatSection/DeleteChatModal";
import EditMessageModal from "@/components/ChatSection/EditMessageModal";

import { useVoiceCall } from "../../hooks/useVoiceCall";

const ENDPOINT = `${import.meta.env.VITE_URL}`;
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;

// FIX 3: Changed type to allow 'null' to match store state
let currentChatCompare: Chat | null | undefined; 
    
interface ChatSectionProps {
  onBack?: () => void;
}

// HELPER FUNCTION: Sort messages by creation time (oldest first)
const sortMessagesByTime = (messages: Message[]): Message[] => {
  return [...messages].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime();
    const timeB = new Date(b.createdAt).getTime();
    return timeA - timeB; // Ascending order (oldest first)
  });
};

const ChatSection: React.FC<ChatSectionProps> = ({ onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [open, setOpen] = useState(false);
  
  // FIX 1: Removed unused 'setIsMobile'
  const [isMobile] = useState(false); 

  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDeleteChatModal, setShowDeleteChatModal] = useState(false);
  const navigate = useNavigate();

  // NEW: Edit message states
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingMessageContent, setEditingMessageContent] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const deleteChat = useChatStore((state) => state.deleteChat);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUser = userPost((state) => state.currentUser);
  const currentChat = useChatStore((state) => state.currentChat);

  const handleDeleteChatClick = () => {
    setShowDeleteChatModal(true);
  };

  const handleChatDeleted = () => {
    if (currentChat) {
      deleteChat(currentChat._id);
    }
    setShowDeleteChatModal(false);
    if (onBack) {
      onBack();
    }
    if (socket && socketConnected && currentChat) {
      socket.emit("chat deleted", {
        chatId: currentChat._id,
        deletedBy: currentUser?._id,
        isGroupChat: currentChat.isGroupChat,
      });
    }
  };

  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const incrementUnreadForChat = useNotificationStore(
    (state) => state.incrementUnreadForChat
  );
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  const { incomingCall, activeCall } = useCallStore();

  const fetchUnreadCount = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.get(
        `${import.meta.env.VITE_URL}/notifications/unread-count`,
        config
      );

      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleGroupUpdate = (updatedGroup: Chat) => {
    const updateChat = useChatStore.getState().updateChat;
    updateChat(updatedGroup);

    if (currentChat?._id === updatedGroup._id) {
      const setCurrentChat = useChatStore.getState().setCurrentChat;
      setCurrentChat(updatedGroup);
    }

    if (socket && socketConnected) {
      socket.emit("group updated", {
        groupId: updatedGroup._id,
        updatedGroup: updatedGroup,
      });
    }
  };

  // NEW: Handle edit message
  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditingMessageContent(content);
    setShowEditModal(true);
  };

  // NEW: Save edited message
  const saveEditedMessage = async (messageId: string, newContent: string) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      // FIX 2: Removed unused 'data' destructuring
      await axios.put(
        `${import.meta.env.VITE_URL}/messages/edit/${messageId}`,
        { content: newContent },
        config
      );

      // Update local messages and maintain sort order
      setMessages((prevMessages) => {
        const updatedMessages = prevMessages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                content: newContent,
                isEdited: true,
                editedAt: new Date(),
              }
            : msg
        );
        return sortMessagesByTime(updatedMessages);
      });

      // Emit socket event
      if (socket && socketConnected && currentChat) {
        socket.emit("edit message", {
          messageId,
          content: newContent,
          chatId: currentChat._id,
          isEdited: true,
          editedAt: new Date(),
        });
      }

      toast.success("Message edited successfully");
    } catch (error: any) {
      console.error("Error editing message:", error);
      toast.error(
        error.response?.data?.message || "Failed to edit message"
      );
      throw error;
    }
  };

  // NEW: Handle react to message
  const handleReactToMessage = async (messageId: string, emoji: string) => {
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/messages/react/${messageId}`,
        { emoji },
        config
      );

      // Update local messages with new reactions
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: data.data.reactions } : msg
        )
      );

      // Emit socket event
      if (socket && socketConnected && currentChat) {
        socket.emit("react to message", {
          messageId,
          reactions: data.data.reactions,
          chatId: currentChat._id,
          userId: currentUser?._id,
          emoji,
        });
      }
    } catch (error: any) {
      console.error("Error reacting to message:", error);
      toast.error(
        error.response?.data?.message || "Failed to add reaction"
      );
    }
  };


// In your ChatSection.tsx, update the socket listener for reactions
// Find this section in your useEffect and UPDATE IT:

useEffect(() => {
  socket = io(ENDPOINT);
  socket.emit("setup", currentUser);
  socket.on("connected", () => setSocketConnected(true));

  socket.on("typing", ({ userId }) => {
    if (userId !== currentUser?._id) {
      setIsTyping(true);
    }
  });

  socket.on("stop typing", ({ userId }) => {
    if (userId !== currentUser?._id) {
      setIsTyping(false);
    }
  });

  socket.on("message edited", ({ messageId, content, isEdited, editedAt }) => {
    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.map((msg) =>
        msg._id === messageId
          ? { ...msg, content, isEdited, editedAt: new Date(editedAt) }
          : msg
      );
      return sortMessagesByTime(updatedMessages);
    });
  });

  // 🔥 FIX: Changed from "message reacted" to "message reaction"
  socket.on("message reaction", ({ messageId, reactions }) => {
    console.log("🎭 Socket: Received message reaction", { messageId, reactions });
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId ? { ...msg, reactions } : msg
      )
    );
  });

  socket.on("chat deleted", ({ chatId, deletedBy, isGroupChat }) => {
    if (deletedBy !== currentUser?._id) {
      deleteChat(chatId);
      toast.info(
        isGroupChat
          ? "Group was deleted by admin"
          : "Chat was deleted by the other user"
      );
      if (currentChat?._id === chatId && onBack) {
        onBack();
      }
    }
  });

  socket.on("group deleted", ({ groupId, deletedBy, groupName }) => {
    if (deletedBy !== currentUser?._id) {
      deleteChat(groupId);
      toast.info(`Group "${groupName}" was deleted by admin`);
      if (currentChat?._id === groupId && onBack) {
        onBack();
      }
      navigate(-1);
    }
  });

  socket.on("new notification", ({ notification, chatId }) => {
    addNotification(notification);
    incrementUnreadForChat(
      chatId,
      notification.chat.chatName,
      notification.chat.isGroupChat
    );
    fetchUnreadCount();

    if (!currentChatCompare || currentChatCompare._id !== chatId) {
      toast.info(`New message from ${notification.sender.username}`, {
        description: notification.content,
        duration: 3000,
      });
    }
  });


  return () => {
    socket.off("typing");
    socket.off("stop typing");
    socket.off("message edited");
    socket.off("message reaction");  // 🔥 FIX: Updated event name
    socket.off("new notification");
    socket.off("chat deleted");
    socket.off("group deleted");
  };
}, [currentUser]);


  const otherUser: User | null =
    currentChat && !currentChat.isGroupChat
      ? currentChat?.users?.find((u: User) => u._id !== currentUser?._id) ||
      null
      : null;

  const { initiateCall, acceptCall, rejectCall, endCall, toggleMute } =
    useVoiceCall(socket, currentUser, otherUser);

  const typingHandler = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", {
        chatId: currentChat?._id,
        userId: currentUser?._id,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop typing", {
        chatId: currentChat?._id,
        userId: currentUser?._id,
      });
      setTyping(false);
    }, 3000);
  };

  const fetchMessages = async () => {
  
    if (!currentChat) return;
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };
      setLoading(true);
      const { data } = await axios.get(
        `${import.meta.env.VITE_URL}/messages/${currentChat._id}`,
        config
      );

      // FIXED: Sort messages after fetching
      const sortedMessages = sortMessagesByTime(data.data);
      setMessages(sortedMessages);
      setLoading(false);

      socket.emit("join chat", currentChat?._id);
    } catch (error) {
      toast.error("Unable to fetch chats with this user");
      console.log(error);
      setLoading(false);
    }
  };
  

  const sendMessage = async (files?: File[]) => {
    const filesToSend = files || selectedFiles;

    if (!newMessage.trim() && filesToSend.length === 0) {
      toast.error("Message cannot be empty!");
      return;
    }

    if (!currentChat?._id) {
      toast.error("No chat selected!");
      return;
    }

    // NEW: Check if trying to message a blocked user (for one-on-one chats)
    if (!currentChat.isGroupChat && otherUser) {
      const isBlocked = userPost.getState().isUserBlocked(otherUser._id.toString());
      if (isBlocked) {
        toast.error("You cannot send messages to a blocked user. Please unblock them first.");
        return;
      }
    }

    socket.emit("stop typing", {
      chatId: currentChat?._id,
      userId: currentUser?._id,
    });

    try {
      const formData = new FormData();

      if (newMessage.trim()) {
        formData.append("content", newMessage);
      }

      formData.append("chatId", currentChat._id);

      filesToSend.forEach((file) => {
        formData.append("files", file);
      });

      setNewMessage("");
      setSelectedFiles([]);

      const { data } = await axios.post(
        `${import.meta.env.VITE_URL}/messages/sent`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

      socket.emit("new message", data.data);

      setMessages((prevMessages) => sortMessagesByTime([...prevMessages, data.data]));
    } catch (error: any) {
      // Handle specific block error from backend (403 status)
      if (error.response?.status === 403) {
        const errorMessage = error.response?.data?.message || "You cannot send messages to this user";
        toast.error(errorMessage);

        // If user is blocked by the other person, navigate back
        if (errorMessage.includes("blocked") && onBack) {
          setTimeout(() => {
            onBack();
          }, 1500);
        }
      } else {
        toast.error("Cannot send message!");
      }
      console.log(error);
    }
  };


  const handleClearChat = async () => {
    if (!currentChat?._id) {
      toast.error("No chat selected!");
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const { data } = await axios.delete(
        `${import.meta.env.VITE_URL}/chats/clear-chat/${currentChat._id}`,
        config
      );

      setMessages([]);
      setSearchQuery("");
      setFilteredMessages([]);

      toast.success(data.message || "Chat cleared successfully!");
    } catch (error: any) {
      console.error("Error clearing chat:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to clear chat. Please try again."
      );
      throw error;
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (!query.trim()) {
      setFilteredMessages([]);
      return;
    }

    const filtered = messages.filter((msg) => {
      const contentMatch = msg.content
        .toLowerCase()
        .includes(query.toLowerCase());
      const attachmentMatch = msg.attachments?.some((att) =>
        att.fileName.toLowerCase().includes(query.toLowerCase())
      );
      return contentMatch || attachmentMatch;
    });

    // FIXED: Sort filtered messages too
    setFilteredMessages(sortMessagesByTime(filtered));
  };

  const handleEditGroup = async (group: Chat) => {
    try {
      console.log("Opening edit modal for group:", group);
    } catch (error) {
      toast.error("Failed to update group settings");
      console.error("Error editing group:", error);
    }
  };

  const handleAddMembers = async (group: Chat) => {
    try {
      console.log("Adding members to group:", group);
      toast.success("Members added successfully!");
    } catch (error) {
      toast.error("Failed to add members");
      console.error("Error adding members:", error);
    }
  };

  const handleLeaveGroup = async (group: Chat) => {
    try {
      if (!currentUser) return;

      const isAdmin = group.groupAdmin._id === currentUser._id;

      if (isAdmin) {
        toast.error(
          "As admin, please use 'Delete Group' option from group settings"
        );
        return;
      }

      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      };

      await axios.put(
        `${import.meta.env.VITE_URL}/chats/group-leave`,
        {
          chatId: group._id,
          userId: currentUser._id,
        },
        config
      );

      deleteChat(group._id);
      toast.success("You have left the group");
      setShowProfileModal(false);

      if (onBack) {
        onBack();
      }
    } catch (error: any) {
      console.error("Error leaving group:", error);
      toast.error(
        error.response?.data?.message ||
        "Failed to leave group. Please try again."
      );
    }
  };

  const handleGroupDeleted = () => {
    if (currentChat) {
      deleteChat(currentChat._id);
    }

    setShowProfileModal(false);

    if (onBack) {
      onBack();
    }

    if (socket && socketConnected && currentChat) {
      socket.emit("group deleted", {
        groupId: currentChat._id,
        deletedBy: currentUser?._id,
        groupName: currentChat.chatName,
      });
    }
  };

  useEffect(() => {
    if (useChatStore.getState().isDialogOpen) return;
    fetchMessages();
    // FIX 3: variable is now nullable, so this assignment is valid
    currentChatCompare = currentChat; 
  }, [currentChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved: Message) => {
      if (
        !currentChatCompare ||
        currentChatCompare._id !== newMessageRecieved.chat._id
      ) {
        console.log("Message received for different chat");
      } else {
        // FIXED: Add received message and maintain sort order
        setMessages((prevMessages) =>
          sortMessagesByTime([...prevMessages, newMessageRecieved])
        );
      }
    });

    return () => {
      socket.off("message recieved");
    };
  }, []);

  const handleEmoji = (e: any) => {
    setNewMessage((prev) => prev + e.emoji);
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!currentChat) {
    return <EmptyChatState />;
  }

  return (
    <>
      <div className="flex flex-col h-full bg-background w-full">
        <ChatHeader
          currentChat={currentChat}
          otherUser={otherUser}
          onBack={onBack}
          formatTime={formatTime}
          onSearch={handleSearch}
          isSearching={searchQuery.length > 0}
          searchQuery={searchQuery}
          onViewProfile={() => setShowProfileModal(true)}
          onClearChat={handleClearChat}
          onInitiateCall={initiateCall}
          onDeleteChat={handleDeleteChatClick}
        />

        <MessageList
          messages={searchQuery ? filteredMessages : messages}
          loading={loading}
          currentUser={currentUser}
          formatTime={formatTime}
          searchQuery={searchQuery}
          onEditMessage={handleEditMessage}
          onReactToMessage={handleReactToMessage}
        />

        <TypingIndicator isTyping={isTyping} />

        <MessageInput
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          typingHandler={typingHandler}
          open={open}
          setOpen={setOpen}
          handleEmoji={handleEmoji}
          isMobile={isMobile}
          selectedFiles={selectedFiles}
          setSelectedFiles={setSelectedFiles}
          currentChat={currentChat}  // NEW: Pass current chat
          otherUser={otherUser}       // NEW: Pass other user
        />

        {showProfileModal &&
          (currentChat.isGroupChat ? (
            <GroupChatDetails
              open={showProfileModal}
              onOpenChange={setShowProfileModal}
              // FIX 4: Added type assertion 'as any' to bypass compatibility issues
              group={currentChat as any}
              currentUser={currentUser}
              formatTime={formatTime}
              onEditGroup={handleEditGroup as any}
              onAddMembers={handleAddMembers as any}
              onLeaveGroup={handleLeaveGroup as any}
              onGroupUpdate={handleGroupUpdate as any}
              onGroupChatDelete={handleGroupDeleted}
            />
          ) : (
            <UserProfileModal
              key={otherUser?._id}
              open={showProfileModal}
              onOpenChange={setShowProfileModal}
              user={otherUser}
              formatTime={formatTime}
            />
          ))}

        {!currentChat?.isGroupChat && (
          <DeleteChatModal
            open={showDeleteChatModal}
            onOpenChange={setShowDeleteChatModal}
            chat={currentChat}
            otherUser={otherUser}
            currentUser={currentUser}
            onChatDeleted={handleChatDeleted}
          />
        )}

        {/* NEW: Edit Message Modal */}
        {showEditModal && editingMessageId && (
          <EditMessageModal
            open={showEditModal}
            onOpenChange={setShowEditModal}
            messageId={editingMessageId}
            currentContent={editingMessageContent}
            onSave={saveEditedMessage}
          />
        )}
      </div>

      {incomingCall && (
        <VoiceCallModal onAccept={acceptCall} onReject={rejectCall} />
      )}

      {activeCall && (
        <ActiveCallModal onEndCall={endCall} onToggleMute={toggleMute} />
      )}
    </>
  );
};

export default ChatSection;