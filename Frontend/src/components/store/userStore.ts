
import {create} from 'zustand'
import {devtools , persist} from 'zustand/middleware'

export type User = {
    _id: number;
    token : string,
    username : string;
    email: string;
    password: string;
    avatar: string;
};

type UserState = {
    currentUser: User | null,
    users : User[];
    addUser: (user: User) => void;
    login: (user: User) => void;
    logout: () => void;
    updatePassword: (newPassword: string) => void;
    updateDetails: (newUsername: string, newEmail : string) => void;
    updateAvatar: (newAvatar : string) => void;
    // removeUser : (userId : string) => void;
}

const userPost = create<UserState>()(
    devtools(
        persist(
            (set) => ({
                currentUser : null,
                users: [],
                login: (user) => set({ currentUser: user }),
                logout: () => {
                    set({ currentUser: null });
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
                            currentUser: user, // set as logged-in user
                        }
                    }),
                // removeUser : (userId) => 
                //     set((state) => ({
                //        users : state.users.filter((p) => p._id !== userId)
                //     })),
                // updateUser : (updates : Partial<User>) => 
                //     set((state) => {
                //         if (!state.currentUser) return state;
                //         return {
                //             currentUser: {
                //                 ...state.currentUser,
                //                 ...updates
                //             }
                //         }
                //     }),
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
                }
            }),
           
            {name : 'user-storage'}
         )
        )
    );

export default userPost;