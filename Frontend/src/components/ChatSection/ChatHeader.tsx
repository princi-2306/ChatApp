// TS DONE

import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  ArrowLeft,
  X,
  Phone,
  Trash2,
  Ban,
  ShieldCheck,
  BellOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "@/components/store/userStore";
import { Chat } from "@/components/store/chatStore";
import userPost from "@/components/store/userStore";
import useChatStore from "@/components/store/chatStore";
import { blockUser, unblockUser, checkIfUserBlocked } from "@/lib/blockUserApi";
// import { muteChat as muteChatApi, unmuteChat as unmuteChatApi } from "@/lib/muteApi";
import { toast } from "sonner";

interface ChatHeaderProps {
  currentChat: Chat;
  otherUser: User | null;
  onBack?: () => void;
  formatTime: (date: Date | string) => string;
  onSearch: (query: string) => void;
  isSearching: boolean;
  searchQuery: string;
  onViewProfile: () => void;
  onClearChat: () => Promise<void>;
  onInitiateCall: () => void;
  onDeleteChat?: () => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  currentChat,
  otherUser, 
  onBack, 
  formatTime,
  onSearch,
  searchQuery,
  onViewProfile,
  onClearChat,
  onInitiateCall,
  onDeleteChat,
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [isBlockLoading, setIsBlockLoading] = useState(false);

  const currentUser = userPost((state) => state.currentUser);
  const addBlockedUser = userPost((state) => state.addBlockedUser);
  const removeBlockedUser = userPost((state) => state.removeBlockedUser);
  const deleteChat = useChatStore((state) => state.deleteChat);
  // const muteChat = useChatStore((state) => state.muteChat);
  // const unmuteChat = useChatStore((state) => state.unmuteChat);

  const isMuted = currentChat?.isMuted || currentChat?.mute;

  // Check block status when chat changes
  useEffect(() => {
    const checkBlockStatus = async () => {
      if (otherUser && currentUser?.token && !currentChat.isGroupChat) {
        try {
          const response = await checkIfUserBlocked(
            otherUser._id.toString(),
            currentUser.token
          );
          setIsBlocked(response.data.isBlocked || false);
        } catch (error) {
          console.error("Error checking block status:", error);
        }
      }
    };

    checkBlockStatus();
  }, [otherUser, currentUser?.token, currentChat]);

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      onSearch("");
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const handleClearChat = async () => {
    setIsClearing(true);
    try {
      await onClearChat();
      setShowClearDialog(false);
    } catch (error) {
      console.error("Error clearing chat:", error);
    } finally {
      setIsClearing(false);
    }
  };

  const handleBlockUnblock = async () => {
    if (!currentUser?.token || !otherUser) return;

    setIsBlockLoading(true);
    try {
      if (isBlocked) {
        // Unblock user
        const response = await unblockUser(otherUser._id.toString(), currentUser.token);
        removeBlockedUser(otherUser._id.toString());
        setIsBlocked(false);
        toast.success(response.message || "User unblocked successfully");
      } else {
        // Block user
        const response = await blockUser(otherUser._id.toString(), currentUser.token);
        addBlockedUser(otherUser);
        setIsBlocked(true);
        
        // Delete the current chat
        deleteChat(currentChat._id);
        
        toast.success(response.message || "User blocked successfully");
        
        // Navigate back
        if (onBack) {
          onBack();
        }
      }
    } catch (error: any) {
      console.error("Error blocking/unblocking user:", error);
      toast.error(
        error.response?.data?.message || 
        `Failed to ${isBlocked ? "unblock" : "block"} user`
      );
    } finally {
      setIsBlockLoading(false);
    }
  };

  // const handleToggleMute = async () => {
  //   if (!currentUser?.token) return;

  //   try {
  //     if (isMuted) {
  //       // Unmute
  //       await unmuteChatApi(currentChat._id, currentUser.token);
  //       unmuteChat(currentChat._id);
  //       toast.success("Chat unmuted. You will now receive notifications.");
  //     } else {
  //       // Mute
  //       await muteChatApi(currentChat._id, currentUser.token);
  //       muteChat(currentChat._id);
  //       toast.success("Chat muted. You won't receive notifications.");
  //     }
  //   } catch (error: any) {
  //     console.error("Error toggling mute:", error);
  //     toast.error(
  //       error.response?.data?.message || "Failed to toggle mute"
  //     );
  //   }
  // };

  return (
    <>
      <div className="border-b">
        {showSearch ? (
          // Search Mode
          <div className="flex items-center gap-3 p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSearchToggle}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-9 pr-9"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => onSearch("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          // Normal Mode
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              {onBack && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onBack}
                  className="lg:hidden"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              )}
              <Avatar className="h-10 w-10 cursor-pointer" onClick={onViewProfile}>
                <AvatarImage 
                  src={currentChat.isGroupChat ? currentChat.groupAvatar : otherUser?.avatar} 
                  alt={currentChat.isGroupChat ? currentChat.chatName : otherUser?.username} 
                />
                <AvatarFallback>
                  {currentChat.isGroupChat 
                    ? currentChat.chatName?.charAt(0).toUpperCase() 
                    : otherUser?.username?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="cursor-pointer" onClick={onViewProfile}>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {currentChat.isGroupChat ? currentChat.chatName : otherUser?.username}
                  </h3>
                  {isMuted && (
                    <div className="flex items-center gap-1 text-orange-600" title="Notifications muted">
                      <BellOff className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {currentChat.isGroupChat ? (
                    `${currentChat.users?.length || 0} members`
                  ) : isBlocked ? (
                    <span className="text-orange-600 flex items-center gap-1">
                      <Ban className="h-3 w-3" />
                      Blocked
                    </span>
                  ) : otherUser?.status === "online" ? (
                    <span className="flex items-center gap-1">
                      <span className="h-2 w-2 rounded-full bg-green-500"></span>
                      Online
                    </span>
                  ) : (
                    `Last seen ${formatTime(otherUser?.lastSeen || new Date())}`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Voice Call Button (only for one-on-one chats and not blocked) */}
              {!currentChat.isGroupChat && !isBlocked && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={onInitiateCall}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Phone className="h-5 w-5" />
                </Button>
              )}
              
              <Button variant="ghost" size="icon" onClick={handleSearchToggle}>
                <Search className="h-5 w-5" />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger >
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={onViewProfile}>
                    View {currentChat.isGroupChat ? "Group" : "Profile"}
                  </DropdownMenuItem>
                  
                  {/* <DropdownMenuItem 
                    onClick={handleToggleMute}
                    disabled={isMuteLoading}
                  >
                    {isMuteLoading ? (
                      "Loading..."
                    ) : isMuted ? (
                      <>
                        
                        Unmute Notifications
                      </>
                    ) : (
                      <>
                      
                        Mute Notifications
                      </>
                    )}
                  </DropdownMenuItem> */}
                  
                  <DropdownMenuItem onClick={() => setShowClearDialog(true)}>
                    Clear Chat
                  </DropdownMenuItem>
                  
                  {!currentChat.isGroupChat && otherUser && (
                    <DropdownMenuItem 
                      onClick={handleBlockUnblock}
                      disabled={isBlockLoading}
                      className={isBlocked 
                        ? "text-green-600 focus:text-green-600 focus:bg-green-50 dark:focus:bg-green-950" 
                        : "text-orange-600 focus:text-orange-600 focus:bg-orange-50 dark:focus:bg-orange-950"
                      }
                    >
                      {isBlocked ? (
                        <>
                          <ShieldCheck className="mr-2 h-4 w-4" />
                          Unblock User
                        </>
                      ) : (
                        <>
                          <Ban className="mr-2 h-4 w-4" />
                          Block User
                        </>
                      )}
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  
                  {onDeleteChat && (
                    <DropdownMenuItem
                      onClick={onDeleteChat}
                      className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete {currentChat.isGroupChat ? "Group" : "Chat"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>

      {/* Clear Chat Confirmation Dialog */}
      <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Chat History?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all messages and attachments in this chat. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClearing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearChat}
              disabled={isClearing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isClearing ? "Clearing..." : "Clear Chat"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ChatHeader;