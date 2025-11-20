import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import EmojiPicker, { Theme } from "emoji-picker-react";

interface EmojiPickerComponentProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  handleEmoji: (e: any) => void;
  isMobile: boolean;
  emojiButtonRef: React.RefObject<HTMLButtonElement>;
}

const EmojiPickerComponent: React.FC<EmojiPickerComponentProps> = ({ 
  open, 
  setOpen, 
  handleEmoji, 
  isMobile, 
  emojiButtonRef 
}) => {
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Handle click outside emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        open &&
        emojiPickerRef.current &&
        emojiButtonRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open, emojiButtonRef, setOpen]);

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="fixed bottom-0 left-2 right-0 p-0 border-0 bg-transparent z-50 max-h-[70vh] -translate-x-20">
          <div className="bg-background rounded-t-2xl flex flex-col h-full shadow-lg">
            <div className="flex justify-center items-center p-3 border-b relative">
              <div className="absolute left-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <EmojiPicker
                theme={Theme.DARK}
                onEmojiClick={handleEmoji}
                width="100%"
                height="100%"
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop emoji picker
  if (!open) return null;

  return (
    <>
      {/* Invisible overlay to capture outside clicks */}
      <div 
        className="fixed inset-0 z-40"
        onClick={() => setOpen(false)}
      />
      <div 
        ref={emojiPickerRef}
        className="absolute bottom-full right-16 mb-2 z-50"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="bg-background border rounded-lg shadow-lg">
          {/* Close button for emoji picker */}
          <div className="flex justify-end p-2 border-b">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          <EmojiPicker
            theme={Theme.DARK}
            onEmojiClick={handleEmoji}
            width={350}
            height={400}
          />
        </div>
      </div>
    </>
  );
};

export default EmojiPickerComponent;