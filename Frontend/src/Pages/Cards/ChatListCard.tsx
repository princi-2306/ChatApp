import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pin,
  Volume2,
  VolumeX,
  CheckCheck,
  Trash2,
  Users,
  Eraser,
  MoreHorizontal,
} from "lucide-react";
import { Chat } from "@/components/store/chatStore";
import { User } from "@/components/store/userStore";

interface ChatListCardProps {
  chat: Chat;
  loggedUser: User | null;
  onPin: () => void;
  onMute: () => void;
  onMarkAsRead: () => void;
  deleteChat: () => void;
  clearChat: () => void; // NEW: Clear chat function
  unreadCount?: number;
}

const ChatListCard: React.FC<ChatListCardProps> = ({
  chat,
  loggedUser,
  onPin,
  onMute,
  onMarkAsRead,
  deleteChat,
  clearChat, // NEW: Clear chat prop
  unreadCount = 0,
}) => {
  // Get the other user in non-group chats
  const otherUser = chat.isGroupChat
    ? null
    : chat.users?.find((u) => u._id !== loggedUser?._id);

  const displayName = chat.isGroupChat
    ? chat.chatName
    : otherUser?.username || "Unknown";

  const displayAvatar = chat.isGroupChat ? chat.groupAvatar : otherUser?.avatar;

  const lastMessage = chat.latestMessage?.content || "No messages yet";
  const lastMessageTime = chat.latestMessage?.createdAt
    ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // Format member count for group chats
  const memberCount = chat.isGroupChat ? chat.users?.length || 0 : 0;

  // Get last message sender name for group chats
  const lastMessageSender =
    chat.isGroupChat && chat.latestMessage?.sender
      ? chat.latestMessage.sender._id === loggedUser?._id
        ? "You"
        : chat.latestMessage.sender.username
      : "";


  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group ">
      {/* Avatar with group indicator */}
      <div className="relative">
        <Avatar className="h-12 w-12">
          {displayAvatar ? (
            <AvatarImage src={displayAvatar} alt={displayName} />
          ) : null}
          <AvatarFallback
            className={chat.isGroupChat ? "bg-primary/10 text-primary" : ""}
          >
            {chat.isGroupChat ? (
              <Users className="h-5 w-5" />
            ) : (
              displayName?.charAt(0).toUpperCase()
            )}
          </AvatarFallback>
        </Avatar>

        {/* Online status indicator for individual chats */}
        {!chat.isGroupChat && otherUser?.isOnline && (
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
        )}
      </div>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{displayName}</h3>

            {/* Chat indicators */}
            <div className="flex items-center gap-1">
              {chat.pinned && (
                <Pin className="h-3 w-3 text-muted-foreground fill-current" />
              )}
              {chat.mute && (
                <VolumeX className="h-3 w-3 text-muted-foreground" />
              )}
              {chat.isGroupChat && chat.groupAdmin?._id === loggedUser?._id && (
                <Badge variant="outline" className="h-4 px-1 text-[10px]">
                  Admin
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge
                variant="default"
                className="h-5 min-w-[20px] flex items-center justify-center px-1.5 bg-blue-500 hover:bg-blue-600 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {lastMessageTime}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Last message preview */}
            <p className="text-sm text-muted-foreground truncate flex-1">
              {chat.isGroupChat && lastMessageSender ? (
                <>
                  <span className="font-medium text-foreground/80">
                    {lastMessageSender}:
                  </span>{" "}
                  {lastMessage}
                </>
              ) : (
                lastMessage
              )}
            </p>
          </div>
        </div>

        {/* Group chat member count */}
        {/* {chat.isGroupChat && memberCount > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </p>
        )} */}
      </div>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 transition-opacity"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onPin}>
            <Pin className="h-4 w-4 mr-2" />
            {chat.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onMute}>
            {chat.mute ? (
              <>
                <Volume2 className="h-4 w-4 mr-2" />
                Unmute
              </>
            ) : (
              <>
                <VolumeX className="h-4 w-4 mr-2" />
                Mute
              </>
            )}
          </DropdownMenuItem>

          {unreadCount > 0 && (
            <DropdownMenuItem onClick={onMarkAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark as read
            </DropdownMenuItem>
          )}

          {/* NEW: Clear Chat Option */}
          {chat.latestMessage && (
            <DropdownMenuItem onClick={clearChat}>
              <Eraser className="h-4 w-4 mr-2" />
              Clear Chat
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={deleteChat}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatListCard;