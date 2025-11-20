import React, { useState } from "react";
import {
  Search,
  MoreVertical,
  ArrowLeft,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

interface ChatHeaderProps {
  otherUser: User | null;
  onBack?: () => void;
  formatTime: (date: Date | string) => string;
  onSearch: (query: string) => void;
  isSearching: boolean;
  searchQuery: string;
  onViewProfile: () => void;
  onClearChat: () => Promise<void>;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  otherUser, 
  onBack, 
  formatTime,
  onSearch,
  isSearching,
  searchQuery,
  onViewProfile,
  onClearChat
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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
                <AvatarImage src={otherUser?.avatar} alt={otherUser?.username} />
                <AvatarFallback>{otherUser?.username?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="cursor-pointer" onClick={onViewProfile}>
                <h3 className="font-semibold">{otherUser?.username}</h3>
                <p className="text-xs text-muted-foreground">
                  {otherUser?.status === "online" ? (
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
              <Button variant="ghost" size="icon" onClick={handleSearchToggle}>
                <Search className="h-5 w-5" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onViewProfile}>
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowClearDialog(true)}>
                    Clear Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    Block User
                  </DropdownMenuItem>
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