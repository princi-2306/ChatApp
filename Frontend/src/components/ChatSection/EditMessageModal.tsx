import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader } from "lucide-react";

interface EditMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  messageId: string;
  currentContent: string;
  onSave: (messageId: string, newContent: string) => Promise<void>;
}

const EditMessageModal: React.FC<EditMessageModalProps> = ({
  open,
  onOpenChange,
  messageId,
  currentContent,
  onSave,
}) => {
  const [content, setContent] = useState(currentContent);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setContent(currentContent);
    }
  }, [open, currentContent]);

  const handleSave = async () => {
    if (!content.trim() || content === currentContent) {
      return;
    }

    setLoading(true);
    try {
      await onSave(messageId, content.trim());
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving edited message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Message</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[100px] resize-none"
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to save, Shift+Enter for new line
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !content.trim() || content === currentContent}
          >
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditMessageModal;