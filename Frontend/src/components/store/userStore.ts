// TS DONE

import {create} from 'zustand'
import {devtools , persist} from 'zustand/middleware'

export type User = {
    _id: number | string;
    token : string,
    username : string;
    email: string;
    password: string;
    avatar: string;
    blockedUsers?: string[]; // NEW: Array of blocked user IDs
    bio?: string
    createdAt?: string | Date;
    lastSeen?: string | Date;
    status?: string 
    profilePicture? : string;
};

type UserState = {
    currentUser: User | null,
    users : User[];
    blockedUsers: User[]; // NEW: List of blocked users
    addUser: (user: User) => void;
    login: (user: User) => void;
    logout: () => void;
    updatePassword: (newPassword: string) => void;
    updateDetails: (newUsername: string, newEmail : string) => void;
    updateAvatar: (newAvatar : string) => void;
    // NEW: Block user methods
    addBlockedUser: (user: User) => void;
    removeBlockedUser: (userId: string) => void;
    setBlockedUsers: (users: User[]) => void;
    isUserBlocked: (userId: string) => boolean;
}

const userPost = create<UserState>()(
    devtools(
        persist(
            (set, get) => ({
                currentUser : null,
                users: [],
                blockedUsers: [], // NEW
                login: (user) => set({ currentUser: user }),
                logout: () => {
                    set({ currentUser: null, blockedUsers: [] });
                    localStorage.removeItem('tokens');
                },
                addUser: (user) =>
                    set((state) => {
                        if (state.users.some(u => u._id === user._id || u.email === user.email)) {
                            console.warn('user already exists');
                            return state;
                        }
                        return {
                        users: [user, ...state.users],
                            currentUser: user,
                        }
                    }),
                updatePassword: (newPassword: string) => {
                    set((state) => {
                        if (!state.currentUser) {
                            throw new Error('no user is currently logged in');
                        }
            
                        return {
                            currentUser: {
                                ...state.currentUser,
                                password: newPassword,
                            }
                        }
                    })
                },
                updateDetails: (newEmail: string, newUsername: string) => {
                    set((state) => {
                        if (!state.currentUser) {
                            throw new Error('no user is currently logged in');
                        }
                        return {
                            currentUser: {
                                ...state.currentUser,
                                email: newEmail,
                                username : newUsername
                            }
                        }
                    })
                },
                updateAvatar: (newAvatar: string) => {
                    set((state) => {
                        if (!state.currentUser) {
                            throw new Error('no user is currently logged in');
                        }
                        return {
                            currentUser: {
                                ...state.currentUser,
                                avatar : newAvatar
                            }
                        }
                    })
                },
                // NEW: Add blocked user
                addBlockedUser: (user: User) => 
                    set((state) => ({
                        blockedUsers: [...state.blockedUsers, user],
                        currentUser: state.currentUser ? {
                            ...state.currentUser,
                            blockedUsers: [...(state.currentUser.blockedUsers || []), user._id.toString()]
                        } : null
                    })),
                // NEW: Remove blocked user
                removeBlockedUser: (userId: string) =>
                    set((state) => ({
                        blockedUsers: state.blockedUsers.filter(u => u._id.toString() !== userId),
                        currentUser: state.currentUser ? {
                            ...state.currentUser,
                            blockedUsers: (state.currentUser.blockedUsers || []).filter(id => id !== userId)
                        } : null
                    })),
                // NEW: Set all blocked users
                setBlockedUsers: (users: User[]) =>
                    set({ blockedUsers: users }),
                // NEW: Check if user is blocked
                isUserBlocked: (userId: string) => {
                    const state = get();
                    return state.blockedUsers.some(u => u._id.toString() === userId);
                }
            }),
           
            {name : 'user-storage'}
         )
        )
    );

export default userPost;