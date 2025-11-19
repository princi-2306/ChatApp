import React from "react";
import {
  Search,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/components/store/userStore";

interface ChatHeaderProps {
  otherUser: User | null;
  onBack?: () => void;
  formatTime: (date: Date | string) => string;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ otherUser, onBack, formatTime }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b">
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
        <Avatar className="h-10 w-10">
          <AvatarImage src={otherUser?.avatar} alt={otherUser?.username} />
          <AvatarFallback>{otherUser?.username?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
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
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Profile</DropdownMenuItem>
            <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
            <DropdownMenuItem>Clear Chat</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Block User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ChatHeader;