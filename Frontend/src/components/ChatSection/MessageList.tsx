import React, { useRef, useEffect } from "react";
import { Loader } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/components/store/userStore";
import { Chat } from "@/components/store/chatStore";

interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  createdAt: Date;
  updatedAt: Date;
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUser: User | null;
  formatTime: (date: Date | string) => string;
}

const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  loading, 
  currentUser, 
  formatTime 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex-1 overflow-hidden">
      <ScrollArea className="h-full p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <>
              {messages.map((msg) => {
                const isMe = msg.sender?._id === currentUser?._id;
                return (
                  <div
                    key={msg._id}
                    className={`flex ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                        isMe
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div
                        className={`flex items-center justify-end gap-2 mt-1 ${
                          isMe
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        <span className="text-xs">
                          {formatTime(msg.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default MessageList;