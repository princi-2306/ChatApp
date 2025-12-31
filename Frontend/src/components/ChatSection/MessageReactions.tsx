// TS DONE

import React from "react";
import { Reaction } from "@/types/message";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MessageReactionsProps {
  reactions: Reaction[];
  currentUserId?: string;
  onReactionClick?: (emoji: string) => void;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
  reactions,
  currentUserId,
  onReactionClick,
}) => {
  if (!reactions || reactions.length === 0) return null;

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(groupedReactions).map(([emoji, reactionList]) => {
        const userReacted = reactionList.some(
          (r) => r.user._id === currentUserId
        );
        const usernames = reactionList.map((r) => r.user.username).join(", ");

        return (
          <TooltipProvider key={emoji}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onReactionClick?.(emoji)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-all ${
                    userReacted
                      ? "bg-blue-500/20 border-blue-500 border"
                      : "bg-muted border border-border hover:bg-accent"
                  }`}
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="text-xs font-medium">
                    {reactionList.length}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">{usernames}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
};

export default MessageReactions;