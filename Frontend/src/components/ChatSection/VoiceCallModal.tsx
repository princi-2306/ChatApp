// TS DONE

import React from "react";
import { Phone, PhoneOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useCallStore from "@/components/store/callStore";

interface VoiceCallModalProps {
  onAccept: () => void;
  onReject: () => void;
}

const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  onAccept,
  onReject,
}) => {
  const { incomingCall } = useCallStore();

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 border border-primary/20">
        {/* Pulsing ring animation */}
        <div className="relative flex items-center justify-center mb-6">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-primary/20 animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-28 h-28 rounded-full bg-primary/30 animate-pulse" />
          </div>
          <Avatar className="h-24 w-24 border-4 border-background shadow-xl relative z-10">
            <AvatarImage src={incomingCall.callerAvatar} />
            <AvatarFallback className="text-2xl">
              {incomingCall.callerName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Caller info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {incomingCall.callerName}
          </h2>
          <p className="text-muted-foreground text-sm">Incoming voice call...</p>
        </div>

        {/* Action buttons */}
        <div className="flex justify-center gap-8">
          {/* Reject button */}
          <button
            onClick={onReject}
            className="group relative flex flex-col items-center gap-2 transition-transform hover:scale-110 active:scale-95"
          >
            <div className="h-16 w-16 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-all">
              <PhoneOff className="h-7 w-7 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Decline</span>
          </button>

          {/* Accept button */}
          <button
            onClick={onAccept}
            className="group relative flex flex-col items-center gap-2 transition-transform hover:scale-110 active:scale-95"
          >
            <div className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 transition-all animate-pulse">
              <Phone className="h-7 w-7 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">Accept</span>
          </button>
        </div>
      </div>

      {/* Hidden audio element for remote stream */}
      <audio id="remoteAudio" autoPlay />
    </div>
  );
};

export default VoiceCallModal;