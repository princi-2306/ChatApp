import { useEffect, useRef, useState } from "react";
import { Socket } from "socket.io-client";
import { User } from "@/components/store/userStore";
import useCallStore from "@/components/store/callStore";
import { toast } from "sonner";
import axios from "axios";

// STUN servers configuration
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useVoiceCall = (
  socket: Socket | null,
  currentUser: User | null,
  otherUser: User | null
) => {
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  const {
    setIncomingCall,
    setActiveCall,
    activeCall,
    incomingCall,
    setCallDuration,
    clearCall,
    setIsRinging,
  } = useCallStore();

  // Initialize peer connection
  const createPeerConnection = () => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socket && otherUser) {
        socket.emit("webrtc:ice-candidate", {
          from: currentUser?._id,
          to: otherUser._id,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      remoteStreamRef.current = event.streams[0];
      // Play remote audio
      const remoteAudio = document.getElementById(
        "remoteAudio"
      ) as HTMLAudioElement;
      if (remoteAudio) {
        remoteAudio.srcObject = event.streams[0];
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  // Get user media (microphone)
  const getUserMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      localStreamRef.current = stream;
      return stream;
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
      throw error;
    }
  };

  // Initiate a call
  const initiateCall = async () => {
    if (!socket || !currentUser || !otherUser) {
      toast.error("Cannot initiate call");
      return;
    }

    try {
      // Get microphone access
      const stream = await getUserMedia();
      
      // Create peer connection
      const pc = createPeerConnection();
      
      // Add local stream tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Send call initiation to other user
      socket.emit("call:initiate", {
        callerId: currentUser._id,
        receiverId: otherUser._id,
        callerName: currentUser.username,
        callerAvatar: currentUser.avatar,
        offer: offer,
      });

      setIsRinging(true);
      toast.info(`Calling ${otherUser.username}...`);
    } catch (error) {
      console.error("Error initiating call:", error);
      toast.error("Failed to initiate call");
      cleanup();
    }
  };

  // Accept incoming call
  const acceptCall = async () => {
    if (!socket || !currentUser || !incomingCall) {
      toast.error("Cannot accept call");
      return;
    }

    try {
      // Get microphone access
      const stream = await getUserMedia();
      
      // Create peer connection
      const pc = createPeerConnection();
      
      // Add local stream tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Set remote description (offer)
      await pc.setRemoteDescription(
        new RTCSessionDescription(incomingCall.offer)
      );

      // Create answer
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      // Send answer to caller
      socket.emit("call:accept", {
        callerId: incomingCall.callerId,
        receiverId: currentUser._id,
        answer: answer,
      });

      // Set active call
      setActiveCall({
        userId: incomingCall.callerId,
        userName: incomingCall.callerName,
        userAvatar: incomingCall.callerAvatar,
        startTime: new Date(),
        isMuted: false,
      });

      // Start call timer
      startCallTimer();

      toast.success("Call connected!");
    } catch (error) {
      console.error("Error accepting call:", error);
      toast.error("Failed to accept call");
      cleanup();
    }
  };

  // Reject incoming call
  const rejectCall = () => {
    if (!socket || !currentUser || !incomingCall) return;

    socket.emit("call:reject", {
      callerId: incomingCall.callerId,
      receiverId: currentUser._id,
      reason: "Call rejected",
    });

    toast.info("Call rejected");
    cleanup();
  };

  // End active call
  const endCall = async () => {
    if (!socket || !currentUser || !activeCall) return;

    const duration = Math.floor(
      (new Date().getTime() - activeCall.startTime.getTime()) / 1000
    );

    // Emit end call event
    socket.emit("call:end", {
      callerId: currentUser._id,
      receiverId: activeCall.userId,
      duration,
    });

    // Save call log to backend
    try {
      await axios.post(
        "http://localhost:8000/api/v1/calls/log",
        {
          receiverId: activeCall.userId,
          callType: "voice",
          status: "completed",
          duration,
          startTime: activeCall.startTime,
          endTime: new Date(),
        },
        {
          headers: {
            Authorization: `Bearer ${currentUser.token}`,
          },
        }
      );
    } catch (error) {
      console.error("Error saving call log:", error);
    }

    toast.info("Call ended");
    cleanup();
  };

  // Toggle mute
  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        useCallStore.getState().toggleMute();
      }
    }
  };

  // Start call timer
  const startCallTimer = () => {
    let seconds = 0;
    callTimerRef.current = setInterval(() => {
      seconds++;
      setCallDuration(seconds);
    }, 1000);
  };

  // Cleanup function
  const cleanup = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Clear timer
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    // Clear call state
    clearCall();
  };

  // Socket event listeners
  useEffect(() => {
    if (!socket || !currentUser) return;

    // Incoming call
    socket.on("call:incoming", ({ callerId, callerName, callerAvatar, offer }) => {
      setIncomingCall({
        callerId,
        callerName,
        callerAvatar,
        offer,
      });
      toast.info(`Incoming call from ${callerName}`);
    });

    // Call accepted
    socket.on("call:accepted", async ({ receiverId, answer }) => {
      if (peerConnectionRef.current) {
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        setActiveCall({
          userId: receiverId,
          userName: otherUser?.username || "User",
          userAvatar: otherUser?.avatar || "",
          startTime: new Date(),
          isMuted: false,
        });

        startCallTimer();
        toast.success("Call connected!");
      }
    });

    // Call rejected
    socket.on("call:rejected", ({ receiverId, reason }) => {
      toast.error(reason || "Call rejected");
      cleanup();
    });

    // Call ended
    socket.on("call:ended", ({ duration }) => {
      toast.info("Call ended");
      cleanup();
    });

    // Call busy
    socket.on("call:busy", ({ message }) => {
      toast.error(message || "User is busy");
      cleanup();
    });

    // ICE candidate
    socket.on("webrtc:ice-candidate", async ({ from, candidate }) => {
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (error) {
          console.error("Error adding ICE candidate:", error);
        }
      }
    });

    return () => {
      socket.off("call:incoming");
      socket.off("call:accepted");
      socket.off("call:rejected");
      socket.off("call:ended");
      socket.off("call:busy");
      socket.off("webrtc:ice-candidate");
    };
  }, [socket, currentUser, otherUser]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  return {
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    incomingCall,
    activeCall,
  };
};

export default useVoiceCall;