import React from "react";
import { Chat } from "@/components/store/chatStore";
import { User } from "@/components/store/userStore";
import { MoreHorizontal, Pin, Bell, BellOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ChatListCardProps {
  chat: Chat;
  loggedUser: User | null;
  onPin: () => void;
  onMute: () => void;
  onMarkAsRead: () => void;
  deleteChat: (chaId : string) => void;
}

const ChatListCard = ({
  deleteChat,
  chat,
  loggedUser,
  onPin,
  onMute,
  onMarkAsRead,
}: ChatListCardProps) => {
  // Determine the "other user" for 1-to-1 chats
  const otherUser = chat.isGroupChat
    ? null
    : chat.users?.find((u) => u._id !== loggedUser?._id);

  return (
    <div
      className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
        chat.unreadCount > 0 ? "bg-accent/50" : ""
      }`}
    >
      <div className="relative mr-3">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={chat.isGroupChat ? "/group-avatar.png" : otherUser?.avatar}
            alt={chat.chatName || otherUser?.username}
          />
          <AvatarFallback>
            {chat.isGroupChat
              ? chat.chatName?.charAt(0)
              : otherUser?.username.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold truncate">
            {chat.isGroupChat ? chat.chatName : otherUser?.username}
          </h4>
          {/* <span className="text-xs text-muted-foreground">
            {chat.timestamp}
          </span> */}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate">
            {chat.latestMessage?.content}
          </p>
          <div className="flex items-center gap-1 ml-2">
            {chat.mute && <BellOff className="h-3 w-3 text-muted-foreground" />}
            {chat.unreadCount > 0 && (
              <Badge
                variant="default"
                className="h-5 w-5 rounded-full p-0 flex items-center justify-center"
              >
                {chat.unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onPin}>
            <Pin className="h-4 w-4 mr-2" />
            {chat.pinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onMute}>
            {chat.mute ? <>Bell Unmute</> : <>BellOff Mute</>}
          </DropdownMenuItem>
          {chat.unreadCount > 0 && (
            <DropdownMenuItem onClick={onMarkAsRead}>
              Mark as read
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => deleteChat(chat._id)}>
            Delete chat
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatListCard;
