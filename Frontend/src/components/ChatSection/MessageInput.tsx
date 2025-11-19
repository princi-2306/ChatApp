import React, { useRef, useEffect, useState } from "react";
import { Send, Paperclip, Smile, Image, File } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmojiPickerComponent from "./EmojiPickerComponent";
import DragAndDropModal from "./DragAndDropModal";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: (files?: File[]) => void; // UPDATED: Added files parameter
  typingHandler: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleEmoji: (e: any) => void;
  isMobile: boolean;
  selectedFiles: File[]; // ADDED
  setSelectedFiles: (files: File[]) => void; // ADDED
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  sendMessage,
  typingHandler,
  open,
  setOpen,
  handleEmoji,
  isMobile,
  selectedFiles, // ADDED
  setSelectedFiles, // ADDED
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "file">("image");

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [newMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleImageUpload = () => {
    setUploadType("image");
    setShowUploadModal(true);
    setShowAttachmentMenu(false);
  };

  const handleFileUpload = () => {
    setUploadType("file");
    setShowUploadModal(true);
    setShowAttachmentMenu(false);
  };

  // UPDATED: Send files immediately when selected
  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
    sendMessage(files); // Send with files
  };

  return (
    <div className="p-4 border-t relative">
      <EmojiPickerComponent
        open={open}
        setOpen={setOpen}
        handleEmoji={handleEmoji}
        isMobile={isMobile}
        emojiButtonRef={emojiButtonRef}
      />

      {/* Attachment Menu */}
      {showAttachmentMenu && (
        <>
          {/* Invisible overlay to capture outside clicks */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowAttachmentMenu(false)}
          />
          <div
            className="absolute bottom-18 left-4 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50 min-w-[160px]"
          >
            <button
              onClick={handleImageUpload}
              className="w-full flex items-center gap-3 px-4 cursor-pointer py-3 hover:bg-accent transition-colors text-left"
            >
              <div className="bg-blue-500/10 p-2 rounded-lg">
                <Image className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-sm font-medium">Image</span>
            </button>
            <div className="border-t border-border" />
            <button
              onClick={handleFileUpload}
              className="w-full flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-accent transition-colors text-left"
            >
              <div className="bg-purple-500/10 p-2 rounded-lg">
                <File className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-sm font-medium">File</span>
            </button>
          </div>
        </>
      )}

      {/* Drag and Drop Modal */}
      <DragAndDropModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadType={uploadType}
        onFilesSelected={handleFilesSelected}
      />

      <div className="flex items-end gap-2 relative z-50">
        <Button 
          ref={attachmentButtonRef}
          variant="ghost" 
          size="icon" 
          className="mb-1 cursor-pointer"
          onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
        >
          <Paperclip className="h-8 w-8 -translate-y-1" />
        </Button>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={typingHandler}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] max-h-[150px] overflow-y-auto"
            rows={1}
          />
          <Button
            ref={emojiButtonRef}
            variant="ghost"
            size="icon"
            className="absolute right-1 bottom-1 h-8 w-8"
            onClick={() => setOpen(!open)}
          >
            <Smile className="h-6 w-6 -translate-y-1" />
          </Button>
        </div>
        <Button
          onClick={() => sendMessage()} // UPDATED: Call without files
          size="icon"
          disabled={newMessage?.trim() === "" && selectedFiles.length === 0}
          className="h-10 w-10 mb-1"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;