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

// Import voice call hook
import { useVoiceCall } from "../../hooks/useVoiceCall";

const ENDPOINT = "http://localhost:8000";
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;
let currentChatCompare;

interface Attachment {
  url: string;
  publicId: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt: Date;
}

interface ChatSectionProps {
  chat?: Chat;
  onBack?: () => void;
}

const ChatSection: React.FC<ChatSectionProps> = ({ chat, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMessages, setFilteredMessages] = useState<Message[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUser = userPost((state) => state.currentUser);
  const currentChat = useChatStore((state) => state.currentChat);

  // Notification store
  const addNotification = useNotificationStore(
    (state) => state.addNotification
  );
  const incrementUnreadForChat = useNotificationStore(
    (state) => state.incrementUnreadForChat
  );
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  // Call store
  const { incomingCall, activeCall } = useCallStore();

  const fetchUnreadCount = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.get(
        "http://localhost:8000/api/v1/notifications/unread-count",
        config
      );

      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  // Initialize socket
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

    // Listen for new notifications
    socket.on("new notification", ({ notification, chatId }) => {
      console.log("New notification received:", notification);

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
      socket.off("new notification");
    };
  }, [currentUser]);

  const otherUser: User | null =
    currentChat && !currentChat.isGroupChat
      ? currentChat?.users?.find((u: User) => u._id !== currentUser?._id) ||
        null
      : null;

  // Initialize voice call hook
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
        `http://localhost:8000/api/v1/messages/${currentChat._id}`,
        config
      );

      setMessages(data.data);
      setLoading(false);

      socket.emit("join chat", currentChat?._id);
    } catch (error) {
      toast.error("Unable to fetch chats with this user");
      console.log(error);
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
        "http://localhost:8000/api/v1/messages/sent",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

      socket.emit("new message", data.data);
      setMessages([...messages, data.data]);
    } catch (error) {
      toast.error("Cannot send message!");
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
        `http://localhost:8000/api/v1/chats/clear-chat/${currentChat._id}`,
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

    setFilteredMessages(filtered);
  };

  // Group management functions
  const handleEditGroup = async (group: Chat) => {
    try {
      // Implement edit group logic
      console.log("Editing group:", group);
      toast.success("Group settings updated successfully!");
    } catch (error) {
      toast.error("Failed to update group settings");
      console.error("Error editing group:", error);
    }
  };

  const handleAddMembers = async (group: Chat) => {
    try {
      // Implement add members logic
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

      const config = {
        headers: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      };

      const { data } = await axios.put(
        `http://localhost:8000/api/v1/chats/group-leave`,
        {
          chatId: group._id,
          userId: currentUser._id,
        },
        config
      );

      toast.success("You have left the group");
      setShowProfileModal(false);

      // Optionally refresh chats list or navigate away
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

  useEffect(() => {
    fetchMessages();
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
        setMessages((prevMessages) => [...prevMessages, newMessageRecieved]);
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

  // console.log(currentChat)
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
        />

        <MessageList
          messages={searchQuery ? filteredMessages : messages}
          loading={loading}
          currentUser={currentUser}
          formatTime={formatTime}
          searchQuery={searchQuery}
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
        />

        {/* Conditional Profile Modal Rendering */}
        {showProfileModal &&
          (currentChat.isGroupChat ? (
            <GroupChatDetails
              open={showProfileModal}
              onOpenChange={setShowProfileModal}
              group={currentChat}
              currentUser={currentUser}
              formatTime={formatTime}
              onEditGroup={handleEditGroup}
              onAddMembers={handleAddMembers}
              onLeaveGroup={handleLeaveGroup}
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
      </div>

      {/* Voice Call Modals */}
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