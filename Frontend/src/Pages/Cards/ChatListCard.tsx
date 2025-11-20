import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Pin, Volume2, Check, Trash2 } from "lucide-react";
import { Chat } from "@/components/store/chatStore";
import { User } from "@/components/store/userStore";

interface ChatListCardProps {
  chat: Chat;
  loggedUser: User | null;
  onPin: () => void;
  onMute: () => void;
  onMarkAsRead: () => void;
  deleteChat: () => void;
  unreadCount?: number;
}

const ChatListCard: React.FC<ChatListCardProps> = ({
  chat,
  loggedUser,
  onPin,
  onMute,
  onMarkAsRead,
  deleteChat,
  unreadCount = 0,
}) => {
  // Get the other user in non-group chats
  const otherUser = chat.isGroupChat
    ? null
    : chat.users?.find((u) => u._id !== loggedUser?._id);

  const displayName = chat.isGroupChat
    ? chat.chatName
    : otherUser?.username || "Unknown";

  const displayAvatar = chat.isGroupChat
    ? chat.chatName?.charAt(0).toUpperCase()
    : otherUser?.avatar;

  const lastMessage = chat.latestMessage?.content || "No messages yet";
  const lastMessageTime = chat.latestMessage?.createdAt
    ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors relative">
      {/* Avatar */}
      <Avatar className="h-12 w-12">
        {!chat.isGroupChat && otherUser?.avatar ? (
          <AvatarImage src={otherUser.avatar} alt={displayName} />
        ) : null}
        <AvatarFallback>{displayName?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>

      {/* Chat Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-sm truncate flex items-center gap-2">
            {displayName}
            {chat.pinned && <Pin className="h-3 w-3 text-muted-foreground" />}
            {chat.mute && (
              <Volume2 className="h-3 w-3 text-muted-foreground" />
            )}
          </h3>
          <span className="text-xs text-muted-foreground">{lastMessageTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate flex-1">
            {lastMessage}
          </p>
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="ml-2 h-5 min-w-[20px] flex items-center justify-center px-1.5 bg-blue-500 hover:bg-blue-600"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </div>
      </div>

      {/* Actions Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={handleMenuClick}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPin}>
            <Pin className="h-4 w-4 mr-2" />
            {chat.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMute}>
            <Volume2 className="h-4 w-4 mr-2" />
            Mute
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMarkAsRead}>
            <Check className="h-4 w-4 mr-2" />
            Mark as read
          </DropdownMenuItem>
          <DropdownMenuItem onClick={deleteChat} className="text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatListCard;