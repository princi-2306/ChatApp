import React, { useRef, useEffect, useState } from "react";
import { Send, Paperclip, Smile, Image, File, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import EmojiPickerComponent from "./EmojiPickerComponent";
import DragAndDropModal from "./DragAndDropModal";
import { User } from "@/components/store/userStore";
import userPost from "@/components/store/userStore";
import { Chat } from "@/components/store/chatStore";
import { toast } from "sonner";

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  sendMessage: (files?: File[]) => void;
  typingHandler: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  handleEmoji: (e: any) => void;
  isMobile: boolean;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  currentChat?: Chat; // NEW: Pass current chat
  otherUser?: User | null; // NEW: Pass other user for one-on-one chats
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  sendMessage,
  typingHandler,
  open,
  setOpen,
  handleEmoji,
  isMobile,
  selectedFiles,
  setSelectedFiles,
  currentChat,
  otherUser,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const attachmentButtonRef = useRef<HTMLButtonElement>(null);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<"image" | "file">("image");
  const [isBlocked, setIsBlocked] = useState(false);

  const isUserBlocked = userPost((state) => state.isUserBlocked);

  // Check if user is blocked when component mounts or otherUser changes
  useEffect(() => {
    if (!currentChat?.isGroupChat && otherUser) {
      const blocked = isUserBlocked(otherUser._id.toString());
      setIsBlocked(blocked);
    } else {
      setIsBlocked(false);
    }
  }, [otherUser, currentChat, isUserBlocked]);

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
      
      // Check if blocked before sending
      if (isBlocked) {
        toast.error("You cannot send messages to a blocked user. Please unblock them first.");
        return;
      }
      
      sendMessage();
    }
  };

  const handleSendClick = () => {
    // Check if blocked before sending
    if (isBlocked) {
      toast.error("You cannot send messages to a blocked user. Please unblock them first.");
      return;
    }
    
    sendMessage();
  };

  const handleImageUpload = () => {
    // Check if blocked before allowing uploads
    if (isBlocked) {
      toast.error("You cannot send files to a blocked user. Please unblock them first.");
      return;
    }
    
    setUploadType("image");
    setShowUploadModal(true);
    setShowAttachmentMenu(false);
  };

  const handleFileUpload = () => {
    // Check if blocked before allowing uploads
    if (isBlocked) {
      toast.error("You cannot send files to a blocked user. Please unblock them first.");
      return;
    }
    
    setUploadType("file");
    setShowUploadModal(true);
    setShowAttachmentMenu(false);
  };

  const handleFilesSelected = (files: File[]) => {
    // Double check block status before sending files
    if (isBlocked) {
      toast.error("You cannot send files to a blocked user. Please unblock them first.");
      return;
    }
    
    setSelectedFiles(files);
    sendMessage(files);
  };

  // If user is blocked, show a disabled state
  if (isBlocked) {
    return (
      <div className="p-4 border-t bg-muted/30">
        <div className="flex items-center justify-center gap-2 py-3 text-muted-foreground">
          <Ban className="h-5 w-5 text-orange-600" />
          <span className="text-sm">
            You have blocked this user. Unblock them to send messages.
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border-t relative">
      <div className="translate-x-16 -translate-y-4">
        <EmojiPickerComponent
          open={open}
          setOpen={setOpen}
          handleEmoji={handleEmoji}
          isMobile={isMobile}
          emojiButtonRef={emojiButtonRef}
        />
      </div>

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
          disabled={isBlocked}
        >
          <Paperclip className="h-8 w-8 -translate-y-1" />
        </Button>
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={typingHandler}
            onKeyDown={handleKeyDown}
            placeholder={isBlocked ? "Unblock user to send messages..." : "Type a message..."}
            className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 pr-12 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[40px] max-h-[150px] overflow-y-auto"
            rows={1}
            disabled={isBlocked}
          />
          <Button
            ref={emojiButtonRef}
            variant="ghost"
            size="icon"
            className="absolute right-1 bottom-1 h-8 w-8"
            onClick={() => setOpen(!open)}
            disabled={isBlocked}
          >
            <Smile className="h-6 w-6 -translate-y-1" />
          </Button>
        </div>
        <Button
          onClick={handleSendClick}
          size="icon"
          disabled={isBlocked || (newMessage?.trim() === "" && selectedFiles.length === 0)}
          className="h-10 w-10 mb-1"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;