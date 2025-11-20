import React, { useEffect, useState } from "react";
import { PhoneOff, Mic, MicOff } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useCallStore from "@/components/store/callStore";

interface ActiveCallModalProps {
  onEndCall: () => void;
  onToggleMute: () => void;
}

const ActiveCallModal: React.FC<ActiveCallModalProps> = ({
  onEndCall,
  onToggleMute,
}) => {
  const { activeCall, callDuration } = useCallStore();
  const [displayDuration, setDisplayDuration] = useState("00:00");

  // Format call duration
  useEffect(() => {
    const minutes = Math.floor(callDuration / 60);
    const seconds = callDuration % 60;
    setDisplayDuration(
      `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    );
  }, [callDuration]);

  if (!activeCall) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/30 via-background to-primary/20 backdrop-blur-md">
      <div className="bg-card/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4 border border-border/50">
        {/* Audio wave animation */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Animated audio waves */}
          {!activeCall.isMuted && (
            <div className="absolute inset-0 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary rounded-full animate-pulse"
                  style={{
                    height: `${20 + Math.random() * 40}px`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: "0.8s",
                  }}
                />
              ))}
            </div>
          )}

          {/* Avatar */}
          <Avatar className="h-28 w-28 border-4 border-primary/20 shadow-xl relative z-10">
            <AvatarImage src={activeCall.userAvatar} />
            <AvatarFallback className="text-3xl bg-primary/10">
              {activeCall.userName.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Call info */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-1">
            {activeCall.userName}
          </h2>
          <p className="text-primary text-lg font-mono tracking-wider">
            {displayDuration}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {activeCall.isMuted ? "Muted" : "Connected"}
          </p>
        </div>

        {/* Control buttons */}
        <div className="flex justify-center gap-6">
          {/* Mute/Unmute button */}
          <button
            onClick={onToggleMute}
            className="group relative flex flex-col items-center gap-2 transition-transform hover:scale-110 active:scale-95"
          >
            <div
              className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                activeCall.isMuted
                  ? "bg-red-500 hover:bg-red-600 group-hover:shadow-red-500/50"
                  : "bg-muted hover:bg-muted/80"
              }`}
            >
              {activeCall.isMuted ? (
                <MicOff className="h-6 w-6 text-white" />
              ) : (
                <Mic className="h-6 w-6 text-foreground" />
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              {activeCall.isMuted ? "Unmute" : "Mute"}
            </span>
          </button>

          {/* End call button */}
          <button
            onClick={onEndCall}
            className="group relative flex flex-col items-center gap-2 transition-transform hover:scale-110 active:scale-95"
          >
            <div className="h-14 w-14 rounded-full bg-red-500 hover:bg-red-600 flex items-center justify-center shadow-lg group-hover:shadow-red-500/50 transition-all">
              <PhoneOff className="h-6 w-6 text-white" />
            </div>
            <span className="text-xs text-muted-foreground">End Call</span>
          </button>
        </div>

        {/* Audio visualizer */}
        {!activeCall.isMuted && (
          <div className="mt-6 flex justify-center gap-1">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary/30 rounded-full animate-pulse"
                style={{
                  height: `${4 + Math.random() * 16}px`,
                  animationDelay: `${i * 0.05}s`,
                  animationDuration: "1s",
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Hidden audio element for remote stream */}
      <audio id="remoteAudio" autoPlay />
    </div>
  );
};

export default ActiveCallModal;