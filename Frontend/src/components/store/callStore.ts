import { create } from "zustand";
import { User } from "./userStore";

export interface IncomingCall {
  callerId: string;
  callerName: string;
  callerAvatar: string;
  offer: RTCSessionDescriptionInit;
}

export interface ActiveCall {
  userId: string;
  userName: string;
  userAvatar: string;
  startTime: Date;
  isMuted: boolean;
}

interface CallState {
  incomingCall: IncomingCall | null;
  activeCall: ActiveCall | null;
  callDuration: number;
  isRinging: boolean;
  
  // Actions
  setIncomingCall: (call: IncomingCall | null) => void;
  setActiveCall: (call: ActiveCall | null) => void;
  setCallDuration: (duration: number) => void;
  setIsRinging: (isRinging: boolean) => void;
  toggleMute: () => void;
  clearCall: () => void;
}

const useCallStore = create<CallState>((set) => ({
  incomingCall: null,
  activeCall: null,
  callDuration: 0,
  isRinging: false,

  setIncomingCall: (call) => set({ incomingCall: call }),
  
  setActiveCall: (call) => set({ 
    activeCall: call,
    incomingCall: null, // Clear incoming call when active call starts
    isRinging: false,
  }),
  
  setCallDuration: (duration) => set({ callDuration: duration }),
  
  setIsRinging: (isRinging) => set({ isRinging }),
  
  toggleMute: () =>
    set((state) => ({
      activeCall: state.activeCall
        ? { ...state.activeCall, isMuted: !state.activeCall.isMuted }
        : null,
    })),
  
  clearCall: () =>
    set({
      incomingCall: null,
      activeCall: null,
      callDuration: 0,
      isRinging: false,
    }),
}));

export default useCallStore;