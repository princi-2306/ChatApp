import React, { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import userPost from "@/components/store/userStore";
import useChatStore from "@/components/store/chatStore";
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

const ENDPOINT = "http://localhost:8000";
let socket: Socket<DefaultEventsMap, DefaultEventsMap>;
let currentChatCompare;

// UPDATED: Add attachments to Message interface
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
  attachments?: Attachment[]; // ADDED
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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); // ADDED
  
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentUser = userPost((state) => state.currentUser);
  const currentChat = useChatStore((state) => state.currentChat);

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
  });

  const otherUser: User | null =
    currentChat && !currentChat.isGroupChat
      ? currentChat?.users?.find((u: User) => u._id !== currentUser?._id) || null
      : null;

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

  // UPDATED: sendMessage to handle files with FormData
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
      // UPDATED: Use FormData for file upload
      const formData = new FormData();
      
      if (newMessage.trim()) {
        formData.append("content", newMessage);
      }
      
      formData.append("chatId", currentChat._id);
      
      // Append all files
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
        // Notification logic here
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });

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
    <div className="flex flex-col h-full bg-background w-full">
      <ChatHeader 
        otherUser={otherUser} 
        onBack={onBack} 
        formatTime={formatTime}
      />

      <MessageList
        messages={messages}
        loading={loading}
        currentUser={currentUser}
        formatTime={formatTime}
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
    </div>
  );
};

export default ChatSection;