import React, { useState, useRef, useEffect } from "react";
import { Edit2, Smile } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageActionsProps {
  messageId: string;
  canEdit: boolean;
  onEdit: () => void;
  onReact: (emoji: string) => void;
}

// Common emoji reactions
const QUICK_REACTIONS = ["👍", "❤️", "😂", "😮", "😢", "🙏", "🔥", "👏"];

const MessageActions: React.FC<MessageActionsProps> = ({
  messageId,
  canEdit,
  onEdit,
  onReact,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close reactions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowReactions(false);
      }
    };

    if (showReactions) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [showReactions]);

  const handleReaction = (emoji: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Reaction clicked:", emoji, "for message:", messageId);
    onReact(emoji);
    setShowReactions(false);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Edit clicked for message:", messageId);
    onEdit();
  };

  const toggleReactions = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle reactions, current state:", showReactions);
    setShowReactions(!showReactions);
  };

  return (
    <div 
      ref={containerRef}
      className="relative flex items-center gap-1 bg-background border border-border rounded-lg shadow-lg px-1 py-1"
      onClick={(e) => e.stopPropagation()}
      onMouseLeave={(e) => {
        // Don't close if mouse is moving to the emoji picker
        e.stopPropagation();
      }}
    >
      {/* Edit Button */}
      {canEdit && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-accent"
          onClick={handleEdit}
          title="Edit message (within 5 minutes)"
        >
          <Edit2 className="h-4 w-4" />
        </Button>
      )}

      {/* React Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-accent"
        title="Add reaction"
        onClick={toggleReactions}
      >
        <Smile className="h-4 w-4" />
      </Button>

      {/* Emoji Picker Dropdown - STAYS OPEN */}
      {showReactions && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-background border border-border rounded-lg shadow-xl p-2 z-[100] animate-in fade-in slide-in-from-bottom-2"
          onClick={(e) => e.stopPropagation()}
          onMouseEnter={(e) => {
            // Keep open when mouse enters
            e.stopPropagation();
          }}
          onMouseLeave={(e) => {
            // Keep open when mouse leaves to allow clicking
            e.stopPropagation();
          }}
        >
          <div className="flex gap-1">
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                className="text-2xl hover:scale-125 transition-transform p-2 rounded-md hover:bg-accent active:scale-110 cursor-pointer"
                onClick={(e) => handleReaction(emoji, e)}
                onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
                title={`React with ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>
          {/* Small arrow pointing down */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-background border-b border-r border-border rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default MessageActions;