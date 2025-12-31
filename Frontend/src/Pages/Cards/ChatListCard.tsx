// TS DONE

import React, {useState} from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useChatStore from "@/components/store/chatStore";
import { blockUser } from "@/lib/blockUserApi";
import { muteChat as muteChatApi, unmuteChat as unmuteChatApi } from "@/lib/muteApi";
import userPost from "@/components/store/userStore";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pin,
  Volume2,
  CheckCheck,
  Users,
  Eraser,
  MoreHorizontal,
  BellOff,
  Ban,
  Loader2,
} from "lucide-react";

interface Chat {
  _id: string;
  isGroupChat: boolean;
  chatName?: string;
  groupAvatar?: string;
  users?: Array<{
    _id: string;
    username: string;
    avatar?: string;
    isOnline?: boolean;
  }>;
  latestMessage?: {
    content: string;
    createdAt: string;
    sender?: {
      _id: string;
      username: string;
    };
  };
  pinned?: boolean;
  isMuted?: boolean;
  mute?: boolean;
  mutedUntil?: string;
  groupAdmin?: {
    _id: string;
  };
}

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface ChatListCardProps {
  chat: Chat;
  loggedUser: User | null;
  onPin: () => void;
  onMute: () => void;
  onMarkAsRead: () => void;
  deleteChat: () => void;
  clearChat: () => void;
  unreadCount?: number;
  // NEW: Props for controlling the dropdown menu state
  isMenuOpen: boolean;
  onMenuOpenChange: (open: boolean) => void;
}

const ChatListCard: React.FC<ChatListCardProps> = ({
  chat,
  loggedUser,
  onPin,
  onMute,
  onMarkAsRead,
  clearChat,
  unreadCount = 0,
  // NEW: Destructure control props
  isMenuOpen,
  onMenuOpenChange,
}) => {

  const [isBlockLoading, setIsBlockLoading] = useState(false);
  const [isMuteLoading, setIsMuteLoading] = useState(false);
  
  const currentUser = userPost((state) => state.currentUser);
  const addBlockedUser = userPost((state) => state.addBlockedUser);
  const deleteChats = useChatStore((state) => state.deleteChat);
  const muteChat = useChatStore((state) => state.muteChat);
  const unmuteChat = useChatStore((state) => state.unmuteChat);

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

  const lastMessageSender =
    chat.isGroupChat && chat.latestMessage?.sender
      ? chat.latestMessage.sender._id === loggedUser?._id
        ? "You"
        : chat.latestMessage.sender.username
      : "";

  const isMuted = chat.isMuted || chat.mute;

  const getMuteExpiryText = () => {
    if (!isMuted || !chat.mutedUntil) return "Muted";

    const now = new Date();
    const expiryDate = new Date(chat.mutedUntil);
    const diffMs = expiryDate.getTime() - now.getTime();

    if (diffMs <= 0) return "Muted";

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (days > 0) return `Muted for ${days}d`;
    if (hours > 0) return `Muted for ${hours}h`;
    return "Muted";
  };

  const handleBlockUser = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!otherUser || !currentUser?.token || chat.isGroupChat) return;

    setIsBlockLoading(true);
    try {
      const response = await blockUser(otherUser._id.toString(), currentUser.token);
      
      addBlockedUser({
        _id: otherUser._id,
        username: otherUser.username,
        avatar: otherUser.avatar || "",
        email: "",
        password: "",
        token: "",
      });
      
      deleteChats(chat._id);
      
      toast.success(response.message || "User blocked successfully");
    } catch (error: any) {
      console.error("Error blocking user:", error);
      toast.error(
        error.response?.data?.message || "Failed to block user"
      );
    } finally {
      setIsBlockLoading(false);
    }
  };

  const handleToggleMute = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!currentUser?.token) return;

    setIsMuteLoading(true);
    try {
      if (isMuted) {
        await unmuteChatApi(chat._id, currentUser.token);
        unmuteChat(chat._id);
        toast.success("Chat unmuted. You will now receive notifications.");
      } else {
        await muteChatApi(chat._id, currentUser.token);
        muteChat(chat._id);
        toast.success("Chat muted. You won't receive notifications.");
      }
      
      if (onMute) {
        onMute();
      }
    } catch (error: any) {
      console.error("Error toggling mute:", error);
      toast.error(
        error.response?.data?.message || "Failed to toggle mute"
      );
    } finally {
      setIsMuteLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent/50 cursor-pointer transition-colors group">
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

        {!chat.isGroupChat && otherUser?.isOnline && (
          <div className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm truncate">{displayName}</h3>

            <div className="flex items-center gap-1">
              {chat.pinned && (
                <Pin className="h-3 w-3 text-muted-foreground fill-current" />
              )}
              {isMuted && (
                <div title={getMuteExpiryText()}>
                  <BellOff className="h-3 w-3 text-orange-600" />
                </div>
              )}
              {chat.isGroupChat && chat.groupAdmin?._id === loggedUser?._id && (
                <Badge variant="outline" className="h-4 px-1 text-[10px]">
                  Admin
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && !isMuted && (
              <Badge
                variant="default"
                className="h-5 min-w-[20px] flex items-center justify-center px-1.5 bg-blue-500 hover:bg-blue-600 text-xs"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
            {unreadCount > 0 && isMuted && (
              <Badge
                variant="outline"
                className="h-5 min-w-[20px] flex items-center justify-center px-1.5 text-xs border-orange-600 text-orange-600"
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
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        {/* MODIFIED: Controlled DropdownMenu */}
        <DropdownMenu open={isMenuOpen} onOpenChange={onMenuOpenChange}>
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

            <DropdownMenuItem 
              onClick={handleToggleMute}
              disabled={isMuteLoading}
            >
              {isMuteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isMuted ? "Unmuting..." : "Muting..."}
                </>
              ) : isMuted ? (
                <>
                  <Volume2 className="h-4 w-4 mr-2" />
                  Unmute notifications
                </>
              ) : (
                <>
                  <BellOff className="h-4 w-4 mr-2" />
                  Mute notifications
                </>
              )}
            </DropdownMenuItem>

            {unreadCount > 0 && (
              <DropdownMenuItem onClick={onMarkAsRead}>
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark as read
              </DropdownMenuItem>
            )}

            {chat.latestMessage && (
              <DropdownMenuItem onClick={clearChat}>
                <Eraser className="h-4 w-4 mr-2" />
                Clear Chat
              </DropdownMenuItem>
            )}

            {!chat.isGroupChat && otherUser && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleBlockUser}
                  disabled={isBlockLoading}
                  className="text-orange-600 focus:text-orange-700 focus:bg-orange-50 dark:focus:bg-orange-950"
                >
                  {isBlockLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Ban className="h-4 w-4 mr-2" />
                  )}
                  {isBlockLoading ? "Blocking..." : "Block User"}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatListCard;