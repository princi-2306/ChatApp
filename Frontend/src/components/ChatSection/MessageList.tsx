import React, { useRef, useEffect } from "react";
import { Loader, File, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/components/store/userStore";
import { Chat } from "@/components/store/chatStore";

// UPDATED: Add Attachment interface
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

  // ADDED: Helper function to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
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
                      {/* Text Content */}
                      {msg.content && (
                        <p className="text-sm whitespace-pre-wrap mb-2">{msg.content}</p>
                      )}

                      {/* ADDED: Attachments Display */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {msg.attachments.map((attachment, idx) => (
                            <div key={idx}>
                              {attachment.fileType === "image" ? (
                                // Image Display
                                <div className="rounded-lg overflow-hidden">
                                  <img
                                    src={attachment.url}
                                    alt={attachment.fileName}
                                    className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => window.open(attachment.url, '_blank')}
                                  />
                                </div>
                              ) : (
                                // Document/File Display
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                    isMe
                                      ? "bg-primary-foreground/10 hover:bg-primary-foreground/20"
                                      : "bg-background hover:bg-accent"
                                  }`}
                                >
                                  <div className="h-10 w-10 rounded bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <File className="h-5 w-5 text-purple-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${
                                      isMe ? "text-primary-foreground" : "text-foreground"
                                    }`}>
                                      {attachment.fileName}
                                    </p>
                                    <p className={`text-xs ${
                                      isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                    }`}>
                                      {formatFileSize(attachment.fileSize)}
                                    </p>
                                  </div>
                                  <Download className={`h-4 w-4 flex-shrink-0 ${
                                    isMe ? "text-primary-foreground/70" : "text-muted-foreground"
                                  }`} />
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Timestamp */}
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