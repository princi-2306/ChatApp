import { createContext, ReactNode } from "react";

interface ChatContextType{

}


const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps{
    children : ReactNode;
}

const ChatProvider = ({children}: ChatProviderProps) => {
    const value = {} as ChatContextType;
    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider> 
};

export default ChatProvider;
export { ChatContext };