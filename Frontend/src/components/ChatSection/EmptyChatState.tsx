import React from "react";

const EmptyChatState: React.FC = () => {
  return (
    <div className="flex-1 hidden lg:flex items-center justify-center bg-muted/30">
      <div className="text-center text-muted-foreground">
        <p className="text-lg font-medium">
          Select a chat to start messaging
        </p>
        <p className="text-sm">Or start a new conversation</p>
      </div>
    </div>
  );
};

export default EmptyChatState;