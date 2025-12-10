import React, { useRef, useEffect, useState } from "react";
import { Loader, File, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/components/store/userStore";
import { Chat } from "@/components/store/chatStore";
import MessageActions from "./MessageActions";
import MessageReactions from "./MessageReactions";
import { Message, Reaction } from "@/types/message";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUser: User | null;
  formatTime: (date: Date | string) => string;
  searchQuery?: string;
  onEditMessage: (messageId: string, content: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  currentUser,
  formatTime,
  searchQuery,
  onEditMessage,
  onReactToMessage,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === query.toLowerCase() ? (
            <mark key={i} className="bg-yellow-300 dark:bg-yellow-600">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  // Check if message can be edited (within 5 minutes)
  const canEditMessage = (message: Message) => {
    if (message.sender._id !== currentUser?._id) return false;
    const fiveMinutes = 5 * 60 * 1000;
    const timeSinceSent = Date.now() - new Date(message.createdAt).getTime();
    return timeSinceSent <= fiveMinutes;
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
                const canEdit = canEditMessage(msg);
                const showActions =
                  hoveredMessageId === msg._id && (canEdit || true); // Always show for reactions

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    onMouseEnter={() => setHoveredMessageId(msg._id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className="relative max-w-xs lg:max-w-md">
                      {/* Message Actions (Edit/React) */}
                      {showActions && (
                        <div
                          className={`absolute -top-8 ${
                            isMe ? "right-0" : "left-0"
                          } z-10`}
                        >
                          <MessageActions
                            messageId={msg._id}
                            canEdit={canEdit}
                            onEdit={() => onEditMessage(msg._id, msg.content)}
                            onReact={(emoji) => onReactToMessage(msg._id, emoji)}
                          />
                        </div>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        }`}
                      >
                        {/* Sender Name (for group chats or received messages) */}
                        {msg.content && !isMe && (
                          <p className="text-sm font-semibold text-zinc-500 mb-1">
                            {msg.sender.username}
                          </p>
                        )}

                        {/* Text Content */}
                        {msg.content && (
                          <p className="text-sm whitespace-pre-wrap mb-2">
                            {searchQuery
                              ? highlightText(msg.content, searchQuery)
                              : msg.content}
                          </p>
                        )}

                        {/* Attachments */}
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {msg.attachments.map((attachment, idx) => (
                              <div key={idx}>
                                {attachment.fileType === "image" ? (
                                  <div className="rounded-lg overflow-hidden">
                                    <img
                                      src={attachment.url}
                                      alt={attachment.fileName}
                                      className="max-w-full h-auto rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                                      onClick={() =>
                                        window.open(attachment.url, "_blank")
                                      }
                                    />
                                  </div>
                                ) : (
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
                                      <p
                                        className={`text-sm font-medium truncate ${
                                          isMe
                                            ? "text-primary-foreground"
                                            : "text-foreground"
                                        }`}
                                      >
                                        {attachment.fileName}
                                      </p>
                                      <p
                                        className={`text-xs ${
                                          isMe
                                            ? "text-primary-foreground/70"
                                            : "text-muted-foreground"
                                        }`}
                                      >
                                        {formatFileSize(attachment.fileSize)}
                                      </p>
                                    </div>
                                    <Download
                                      className={`h-4 w-4 flex-shrink-0 ${
                                        isMe
                                          ? "text-primary-foreground/70"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Reactions */}
                        <MessageReactions
                          reactions={msg.reactions || []}
                          currentUserId={currentUser?._id}
                          onReactionClick={(emoji) =>
                            onReactToMessage(msg._id, emoji)
                          }
                        />

                        {/* Timestamp and Edited Tag */}
                        <div
                          className={`flex items-center justify-end gap-2 mt-1 ${
                            isMe
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          {msg.isEdited && (
                            <span className="text-xs italic">edited</span>
                          )}
                          <span className="text-xs">
                            {formatTime(msg.createdAt)}
                          </span>
                        </div>
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