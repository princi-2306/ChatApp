import React, { useEffect, useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import useNotificationStore from "@/components/store/notificationStore";
import userPost from "@/components/store/userStore";
import useChatStore from "@/components/store/chatStore";
import axios from "axios";
import { toast } from "sonner";

interface NotificationPanelProps {
  onNotificationClick?: (chatId: string) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onNotificationClick }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentUser = userPost((state) => state.currentUser);
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setNotifications = useNotificationStore((state) => state.setNotifications);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  const markNotificationAsRead = useNotificationStore((state) => state.markNotificationAsRead);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.get(
        "http://localhost:8000/api/v1/notifications",
        config
      );

      setNotifications(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      const response = await axios.get(
        "http://localhost:8000/api/v1/notifications/unread-count",
        config
      );

      setUnreadCount(response.data.data.unreadCount);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      await axios.put(
        `http://localhost:8000/api/v1/notifications/read/${notificationId}`,
        {},
        config
      );

      markNotificationAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      await axios.put(
        "http://localhost:8000/api/v1/notifications/read-all",
        {},
        config
      );

      markAllAsRead();
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Failed to mark all as read");
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };

      await axios.delete(
        `http://localhost:8000/api/v1/notifications/${notificationId}`,
        config
      );

      deleteNotification(notificationId);
      toast.success("Notification deleted");
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Failed to delete notification");
    }
  };

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      await handleMarkAsRead(notification._id);
    }
    
    if (onNotificationClick) {
      onNotificationClick(notification.chat._id);
    }
    
    setOpen(false);
  };

  const formatTime = (date: Date | string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffInMs = now.getTime() - notifDate.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 1) return "Just now";
    if (diffInMins < 60) return `${diffInMins}m ago`;
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notifDate.toLocaleDateString();
  };

  useEffect(() => {
    if (open && currentUser) {
      fetchNotifications();
    }
  }, [open, currentUser]);

  useEffect(() => {
    if (currentUser) {
      fetchUnreadCount();
    }
  }, [currentUser]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-[400px] p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between mr-10">
            <SheetTitle>Notifications</SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <Check className="h-4 w-4" />
                Mark all as read
              </Button>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                    !notification.isRead ? "bg-muted/30" : ""
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={notification.sender.avatar} />
                      <AvatarFallback>
                        {notification.sender.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {notification.sender.username}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {notification.content || "Sent a message"}
                          </p>
                          {notification.chat.isGroupChat && (
                            <p className="text-xs text-muted-foreground mt-1">
                              in {notification.chat.chatName}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification._id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default NotificationPanel;