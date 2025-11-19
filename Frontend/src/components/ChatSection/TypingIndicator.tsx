import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface TypingIndicatorProps {
  isTyping: boolean;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ isTyping }) => {
  if (!isTyping) return null;

  return (
    <div className="absolute bottom-36">
      <DotLottieReact
        width={70}
        src="https://lottie.host/d4e2179d-3f5a-45f1-b76b-5cf513c304cb/qMCCGpV3TW.lottie"
        loop
        autoplay
      />
    </div>
  );
};

export default TypingIndicator;