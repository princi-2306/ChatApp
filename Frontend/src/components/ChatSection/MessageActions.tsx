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
  const [pickerPosition, setPickerPosition] = useState<'top' | 'bottom'>('top');
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

  // Calculate position when showing reactions
  useEffect(() => {
    if (showReactions && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const pickerHeight = 80; // Approximate height of emoji picker
      
      // If not enough space above, show below instead
      if (spaceAbove < pickerHeight && spaceBelow > spaceAbove) {
        setPickerPosition('bottom');
      } else {
        setPickerPosition('top');
      }
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

      {/* Emoji Picker Dropdown - Dynamic Position */}
      {showReactions && (
        <div 
          className={`absolute left-1/2 -translate-x-1/2 bg-background border border-border rounded-lg shadow-xl p-2 z-[100] animate-in fade-in ${
            pickerPosition === 'top' 
              ? 'bottom-full mb-2 slide-in-from-bottom-2' 
              : 'top-full mt-2 slide-in-from-top-2'
          }`}
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
          {/* Small arrow pointing to action buttons */}
          <div 
            className={`absolute left-1/2 -translate-x-1/2 w-4 h-4 bg-background border-border ${
              pickerPosition === 'top'
                ? '-bottom-2 border-b border-r rotate-45'
                : '-top-2 border-t border-l rotate-45'
            }`}
          />
        </div>
      )}
    </div>
  );
};

export default MessageActions;