import React, { useEffect, useState } from "react";
import { Phone, PhoneIncoming, PhoneOutgoing, PhoneMissed, Clock, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import userPost from "@/components/store/userStore";
import axios from "axios";
import { toast } from "sonner";

interface CallLog {
  _id: string;
  caller: {
    _id: string;
    username: string;
    avatar: string;
  };
  receiver: {
    _id: string;
    username: string;
    avatar: string;
  };
  callType: "voice" | "video";
  status: "missed" | "completed" | "rejected" | "cancelled";
  duration: number;
  createdAt: string;
}

const CallHistoryPage: React.FC = () => {
  const [callHistory, setCallHistory] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const currentUser = userPost((state) => state.currentUser);

  const fetchCallHistory = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const { data } = await axios.get(
        "http://localhost:8000/api/v1/calls/history",
        config
      );

      setCallHistory(data.data.calls);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching call history:", error);
      toast.error("Failed to load call history");
      setLoading(false);
    }
  };

  const deleteCallLog = async (callId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      await axios.delete(
        `http://localhost:8000/api/v1/calls/${callId}`,
        config
      );

      setCallHistory((prev) => prev.filter((call) => call._id !== callId));
      toast.success("Call log deleted");
    } catch (error) {
      console.error("Error deleting call log:", error);
      toast.error("Failed to delete call log");
    }
  };

  useEffect(() => {
    fetchCallHistory();
  }, []);

  const formatDuration = (seconds: number) => {
    if (seconds === 0) return "0s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    } else {
      return date.toLocaleDateString([], { 
        month: "short", 
        day: "numeric", 
        hour: "2-digit", 
        minute: "2-digit" 
      });
    }
  };

  const getCallIcon = (call: CallLog) => {
    const isCaller = call.caller._id === currentUser?._id;
    
    if (call.status === "missed") {
      return <PhoneMissed className="h-5 w-5 text-red-500" />;
    } else if (isCaller) {
      return <PhoneOutgoing className="h-5 w-5 text-green-500" />;
    } else {
      return <PhoneIncoming className="h-5 w-5 text-blue-500" />;
    }
  };

  const getOtherUser = (call: CallLog) => {
    return call.caller._id === currentUser?._id ? call.receiver : call.caller;
  };

  const getCallStatus = (call: CallLog) => {
    const isCaller = call.caller._id === currentUser?._id;
    
    if (call.status === "completed") {
      return formatDuration(call.duration);
    } else if (call.status === "missed") {
      return "Missed";
    } else if (call.status === "rejected") {
      return "Rejected";
    } else if (call.status === "cancelled") {
      return isCaller ? "Cancelled" : "No answer";
    }
    return "";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="border-b p-4">
        <h1 className="text-2xl font-bold">Call History</h1>
        <p className="text-sm text-muted-foreground">
          {callHistory.length} call{callHistory.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Call List */}
      <ScrollArea className="flex-1">
        <div className="divide-y">
          {callHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-96 text-muted-foreground">
              <Phone className="h-16 w-16 mb-4 opacity-20" />
              <p className="text-lg font-medium">No call history</p>
              <p className="text-sm">Your calls will appear here</p>
            </div>
          ) : (
            callHistory.map((call) => {
              const otherUser = getOtherUser(call);
              return (
                <div
                  key={call._id}
                  className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors"
                >
                  {/* Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={otherUser.avatar} />
                    <AvatarFallback>
                      {otherUser.username.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  {/* Call Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {getCallIcon(call)}
                      <h3 className="font-semibold truncate">
                        {otherUser.username}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDate(call.createdAt)}</span>
                      <span>•</span>
                      <span className={call.status === "missed" ? "text-red-500" : ""}>
                        {getCallStatus(call)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCallLog(call._id)}
                    className="text-muted-foreground hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default CallHistoryPage;