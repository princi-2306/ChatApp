import {create} from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { User } from './userStore';


export interface Chat {
    _id: string,
    chatName: string,
    users?: User[],
    isGroupChat?: boolean,
    groupAdmin?: any;
    unreadCount: number | 2 ;
    mute: boolean | false;
    isMuted?: boolean; // NEW: Support both naming conventions
    pinned: boolean | false;
    latestMessage: string;
    groupAvatar: string;
}


interface ChatStore {
    currentChat: Chat | null;
    chats: Chat[];
    mutedChats: string[]; // NEW: Track muted chat IDs
    setCurrentChat: (chat: Chat | null) => void;
    setChats: (chats: Chat[]) => void;
    updateChat: (updatedChat: Chat) => void;
    deleteChat: (chatId : string) => void;
    // NEW: Mute-related methods
    muteChat: (chatId: string) => void;
    unmuteChat: (chatId: string) => void;
    setMutedChats: (chatIds: string[]) => void;
    isChatMuted: (chatId: string) => boolean;
}


const useChatStore = create<ChatStore>((set, get) => ({
    currentChat: null,
    chats: [],
    mutedChats: [], // NEW
    setCurrentChat: (chat) => set({ currentChat: chat }),
    setChats: (chats) => set({ chats }),
    updateChat: (updateChat) => set((state) => {
        const exists = state.chats.find((c) => c._id === updateChat._id);
        if (exists) {
            return {
                chats: state.chats.map((c) =>
                    c._id === updateChat._id ? updateChat : c)
            }
        } else {
            return { chats: [...state.chats, updateChat] };
        }
    }),
    deleteChat: (chatId) => set((state) => ({
        chats: state.chats.filter((chat) => chat._id !== chatId),
        currentChat: 
         state.currentChat?._id === chatId ? null : state.currentChat,
        mutedChats: state.mutedChats.filter(id => id !== chatId) // NEW: Remove from muted list
    })),
    // NEW: Mute chat
    muteChat: (chatId) => set((state) => ({
        mutedChats: [...state.mutedChats, chatId],
        chats: state.chats.map(chat => 
            chat._id === chatId ? { ...chat, isMuted: true, mute: true } : chat
        ),
        currentChat: state.currentChat?._id === chatId 
            ? { ...state.currentChat, isMuted: true, mute: true }
            : state.currentChat
    })),
    // NEW: Unmute chat
    unmuteChat: (chatId) => set((state) => ({
        mutedChats: state.mutedChats.filter(id => id !== chatId),
        chats: state.chats.map(chat => 
            chat._id === chatId ? { ...chat, isMuted: false, mute: false } : chat
        ),
        currentChat: state.currentChat?._id === chatId 
            ? { ...state.currentChat, isMuted: false, mute: false }
            : state.currentChat
    })),
    // NEW: Set muted chats
    setMutedChats: (chatIds) => set({ mutedChats: chatIds }),
    // NEW: Check if chat is muted
    isChatMuted: (chatId) => {
        const state = get();
        return state.mutedChats.includes(chatId);
    }
}));


export default useChatStore;