// TS DONE

import { create } from 'zustand';
import useChatStore from './chatStore';

export interface Notification {
  _id: string;
  recipient: string;
  sender: {
    _id: string;
    username: string;
    avatar: string;
    email: string;
  };
  chat: {
    _id: string;
    chatName: string;
    isGroupChat: boolean;
  };
  message: {
    _id: string;
    content: string;
    createdAt: Date;
  };
  type: 'new_message' | 'group_message' | 'added_to_group' | 'removed_from_group';
  isRead: boolean;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnreadCountPerChat {
  [chatId: string]: {
    count: number;
    lastNotification: Date;
    chatName: string;
    isGroupChat: boolean;
  } | undefined; 
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  unreadPerChat: UnreadCountPerChat;
  
  setNotifications: (notifications: Notification[]) => void;
  addNotification: (notification: Notification) => void;
  setUnreadCount: (count: number) => void;
  setUnreadPerChat: (unreadPerChat: UnreadCountPerChat) => void;
  markNotificationAsRead: (notificationId: string) => void;
  markChatNotificationsAsRead: (chatId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  incrementUnreadForChat: (chatId: string, chatName: string, isGroupChat: boolean) => void;
  clearUnreadForChat: (chatId: string) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  unreadCount: 0,
  unreadPerChat: {},

  setNotifications: (notifications) => set({ notifications }),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  setUnreadPerChat: (unreadPerChat) => set({ unreadPerChat }),

  markNotificationAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === notificationId ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  markChatNotificationsAsRead: (chatId) =>
    set((state) => {
      const chatNotifications = state.notifications.filter(
        (n) => n.chat._id === chatId && !n.isRead
      );
      return {
        notifications: state.notifications.map((n) =>
          n.chat._id === chatId ? { ...n, isRead: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - chatNotifications.length),
        unreadPerChat: {
          ...state.unreadPerChat,
          [chatId]: undefined,
        },
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  deleteNotification: (notificationId) =>
    set((state) => {
      const notification = state.notifications.find((n) => n._id === notificationId);
      return {
        notifications: state.notifications.filter((n) => n._id !== notificationId),
        unreadCount: notification && !notification.isRead 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount,
      };
    }),

  clearNotifications: () =>
    set({ notifications: [], unreadCount: 0, unreadPerChat: {} }),

  // The backend already handles this, but for extra safety on frontend:
incrementUnreadForChat: (chatId, chatName, isGroupChat) =>
  set((state) => {
    // Check if chat is muted (this is optional since backend handles it)
    const isMuted = useChatStore.getState().isChatMuted(chatId);
    
    if (isMuted) {
      console.log(`Chat ${chatId} is muted, skipping notification increment`);
      return state; // Don't increment if muted
    }
    
    return {
      unreadPerChat: {
        ...state.unreadPerChat,
        [chatId]: {
          count: (state.unreadPerChat[chatId]?.count || 0) + 1,
          lastNotification: new Date(),
          chatName,
          isGroupChat,
        },
      },
    };
  }),

  clearUnreadForChat: (chatId) =>
    set((state) => {
      const newUnreadPerChat = { ...state.unreadPerChat };
      delete newUnreadPerChat[chatId];
      return { unreadPerChat: newUnreadPerChat };
    }),
}));

export default useNotificationStore;