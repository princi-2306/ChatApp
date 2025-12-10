import React, { useState } from "react";
import { Edit2, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageActionsProps {
  messageId: string;
  canEdit: boolean;
  onEdit: () => void;
  onReact: (emoji: string) => void;
}

// Common emoji reactions (like WhatsApp)
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  canEdit,
  onEdit,
  onReact,
}) => {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className="flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg px-2 py-1">
      {/* Edit Button - Only show if within 5 minutes */}
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={onEdit}
          title="Edit message"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}

      {/* React Button with Emoji Picker */}
      <Popover open={showReactions} onOpenChange={setShowReactions}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            title="React to message"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                className="text-2xl hover:scale-125 transition-transform p-1 rounded hover:bg-accent"
                onClick={() => {
                  onReact(emoji);
                  setShowReactions(false);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default MessageActions;