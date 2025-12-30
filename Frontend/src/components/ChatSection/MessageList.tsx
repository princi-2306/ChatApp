import React, { useRef, useEffect, useState } from "react";
import { Loader, File, Download, Edit2, Smile } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User } from "@/components/store/userStore";
import { Message } from "@/types/message";
import MessageReactions from "./MessageReactions";
import { Button } from "@/components/ui/button";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  currentUser: User | null;
  formatTime: (date: Date | string) => string;
  searchQuery?: string;
  onEditMessage: (messageId: string, content: string) => void;
  onReactToMessage: (messageId: string, emoji: string) => void;
}

// Common emoji reactions
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"];

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
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [pickerPosition, setPickerPosition] = useState<'top' | 'bottom'>('top');
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close reactions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showReactions && emojiButtonRef.current && !emojiButtonRef.current.contains(event.target as Node)) {
        const picker = document.getElementById(`emoji-picker-${showReactions}`);
        if (picker && !picker.contains(event.target as Node)) {
          setShowReactions(null);
        }
      }
    };

    if (showReactions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showReactions]);

  // Calculate position when showing reactions
  useEffect(() => {
    if (showReactions && emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const pickerHeight = 80;
      
      if (spaceAbove < pickerHeight && spaceBelow > spaceAbove) {
        setPickerPosition('bottom');
      } else {
        setPickerPosition('top');
      }
    }
  }, [showReactions]);

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

  const canEditMessage = (message: Message) => {
    if (message.sender._id !== currentUser?._id) return false;
    const fiveMinutes = 5 * 60 * 1000;
    const timeSinceSent = Date.now() - new Date(message.createdAt).getTime();
    return timeSinceSent <= fiveMinutes;
  };

  const handleReact = (messageId: string, emoji: string) => {
    console.log("MessageList: Reacting to message", messageId, "with", emoji);
    onReactToMessage(messageId, emoji);
    setShowReactions(null);
  };

  const handleEdit = (messageId: string, content: string) => {
    console.log("MessageList: Editing message", messageId);
    onEditMessage(messageId, content);
  };

  const toggleReactions = (messageId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowReactions(showReactions === messageId ? null : messageId);
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
                const isHovered = hoveredMessageId === msg._id;
                const showEmojiPicker = showReactions === msg._id;

                return (
                  <div
                    key={msg._id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"} group`}
                    onMouseEnter={() => setHoveredMessageId(msg._id)}
                    onMouseLeave={() => setHoveredMessageId(null)}
                  >
                    <div className="relative max-w-xs lg:max-w-md">
                      {/* Edit Button - Show on hover (top position) */}
                      {isHovered && canEdit && (
                        <div
                          className={`absolute -top-10 ${
                            isMe ? "right-0" : "left-0"
                          } z-50`}
                        >
                          <div className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg px-1 py-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-accent"
                              onClick={() => handleEdit(msg._id, msg.content)}
                              title="Edit message (within 5 minutes)"
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
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
                        {!isMe && msg.content && (
                          <p className="text-xs font-semibold text-muted-foreground mb-1">
                            {msg.sender.username}
                          </p>
                        )}

                        {/* Text Content */}
                        {msg.content && (
                          <p className="text-sm whitespace-pre-wrap break-words">
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

                        {/* Message Reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <MessageReactions
                            reactions={msg.reactions}
                            currentUserId={currentUser?._id}
                            onReactionClick={(emoji) => handleReact(msg._id, emoji)}
                          />
                        )}

                        {/* Timestamp and Emoji Button */}
                        <div
                          className={`flex items-center gap-2 mt-1 text-xs ${
                            isMe
                              ? "text-primary-foreground/70 justify-end"
                              : "text-muted-foreground justify-end"
                          }`}
                        >
                          {msg.isEdited && (
                            <span className="italic">edited</span>
                          )}
                          <span>{formatTime(msg.createdAt)}</span>
                          
                          {/* Emoji Reaction Button - Bigger and Outside */}
                          <div className="relative">
                            <button
                              ref={showEmojiPicker ? emojiButtonRef : null}
                              onClick={(e) => toggleReactions(msg._id, e)}
                              className={`p-1.5 rounded-full bg-background border border-border text-white shadow-md hover:shadow-lg hover:scale-110 transition-all ${
                                isHovered || showEmojiPicker ? 'opacity-100' : 'opacity-0'
                              }`}
                              title="Add reaction"
                            >
                              <Smile className="h-4 w-4" />
                            </button>

                            {/* Emoji Picker Dropdown - Bigger */}
                            {showEmojiPicker && (
                              <div 
                                id={`emoji-picker-${msg._id}`}
                                className={`absolute ${isMe ? 'right-0 translate-x-5 -translate-y-1' : 'left-0 -translate-x-5 -translate-y-1'} bg-background border-2 border-border rounded-xl shadow-2xl p-3 z-[100] animate-in fade-in ${
                                  pickerPosition === 'top' 
                                    ? 'bottom-full mb-3 slide-in-from-bottom-2' 
                                    : 'top-full mt-3 slide-in-from-top-2'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex gap-2">
                                  {QUICK_REACTIONS.map((emoji) => (
                                    <button
                                      key={emoji}
                                      className="text-3xl hover:scale-125 transition-transform p-2.5 rounded-lg hover:bg-accent active:scale-110 cursor-pointer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleReact(msg._id, emoji);
                                      }}
                                      onMouseDown={(e) => e.preventDefault()}
                                      title={`React with ${emoji}`}
                                    >
                                      {emoji}
                                    </button>
                                  ))}
                                </div>
                                {/* Bigger Arrow pointer */}
                                <div 
                                  className={`absolute ${isMe ? 'right-6' : 'left-6'} w-5 h-5 bg-background border-border ${
                                    pickerPosition === 'top'
                                      ? '-bottom-2.5 border-b-2 border-r-2 rotate-45'
                                      : '-top-2.5 border-t-2 border-l-2 rotate-45'
                                  }`}
                                />
                              </div>
                            )}
                          </div>
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