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
    pinned: boolean | false;
    latestMessage: string;
    groupAvatar: string;
}

interface ChatStore {
    currentChat: Chat | null;
    chats: Chat[];
    setCurrentChat: (chat: Chat | null) => void;
    setChats: (chats: Chat[]) => void;
    updateChat: (updatedChat: Chat) => void;
    deleteChat: (chatId : string) => void;
}

const useChatStore = create<ChatStore>((set) => ({
    currentChat: null,
    chats: [],
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
    }))
}));

export default useChatStore;