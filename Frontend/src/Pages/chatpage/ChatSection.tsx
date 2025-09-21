import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Search,
  ArrowLeft,
  X,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import {io, Socket} from "socket.io-client"
import userPost from "@/components/store/userStore";
import useChatStore from "@/components/store/chatStore";
import { Chat } from "@/components/store/chatStore";
import { User } from "@/components/store/userStore";
import axios from "axios";
import { toast } from "sonner";
import ChatList from "./ChatList";
import { DefaultEventsMap } from "@socket.io/component-emitter";


const ENDPOINT = "http://localhost:8000";
var socket: Socket<DefaultEventsMap, DefaultEventsMap>;
var currentChatCompare;

interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSection = ({ chat, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const currentUser = userPost((state) => state.currentUser)
  const currentChat = useChatStore((state) => state.currentChat)

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

 
    useEffect(() => {
      socket = io(ENDPOINT);
      // socket.on("connect", () => {
      //   console.log(socket.id);
      // }); 
      socket.emit("setup", currentUser);
      socket.on("connected", () => setSocketConnected(true));
      socket.on("typing", ({ userId }) => {
        if (userId !== currentUser?._id) {
          setIsTyping(true);
        }
      });

      socket.on("stop typing", ({ userId }) => {
        if (userId !== currentUser?._id) {
          setIsTyping(false);
        }
      });
    });
  const otherUser: User | null =
    currentChat && !currentChat.isGroupChat ?
      currentChat?.isGroupChat ? null : currentChat?.users?.find((u: User) => u._id !== currentUser?._id) || null
      : null;
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const typingHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

        let typingTimeout;

    if (!socketConnected) return;
    // frontend
    if (!typing) {
      setTyping(true);
      socket.emit("typing", {
        chatId: currentChat?._id,
        userId: currentUser?._id,
      });
    }

    // Clear previous timeout to reset countdown
    if (typingTimeout) clearTimeout(typingTimeout);

    // Set a new timeout to stop typing after 3s of inactivity
    typingTimeout = setTimeout(() => {
      socket.emit("stop typing", {
        chatId: currentChat?._id,
        userId: currentUser?._id,
      });
      setTyping(false);
    }, 3000);

    // socket.emit("stop typing", {
    //   chatId: currentChat?._id,
    //   userId: currentUser?._id,
    // });

    // let lastTypingTime = new Date().getTime();
    // var timerLength = 3000;
    // setTimeout(() => {
    //   var timeNow = new Date().getTime();
    //   var timeDiff = timeNow - lastTypingTime;

    //   if (timeDiff >= timerLength && typing) {
    //     socket.emit("stop typing", currentChat?._id);
    //     setTyping(false);
    //   }
    // }, timerLength);
  };
  
  const fetchMessages = async () => {
    if (!currentChat) return;
    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };
      setLoading(true);
      const {data} = await axios.get(
        `http://localhost:8000/api/v1/messages/${currentChat._id}`,
        config
      );
   
      console.log(data)
      setMessages(data.data);
      setLoading(false);

      socket.emit('join chat', currentChat?._id);
      console.log(messages);
    } catch (error) {
      toast.error("unable to fetch chats with this user")
      console.log(error);
    }
  }


  const sendMessage = async() => {
      if (!newMessage.trim() || !currentChat?._id) {
        toast.error("no chat selected!")
        return;
    }
    socket.emit('stop typing', currentChat?._id);
      try {
        const config = {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentUser?.token}`
          }
        };
        setNewMessage("");
        const {data} = await axios.post(
          "http://localhost:8000/api/v1/messages/sent",
          {
            content: newMessage,
            chatId: currentChat?._id
            
          }, config
        );
        
        socket.emit("new message", data.data)
        setMessages([...messages, data.data]);
        console.log(data);
        // console.log(newMessage);
        // console.log(messages);
        //  console.log(JSON.stringify(messages));
        // toast.success("message sent!")
      } catch (error) {
        toast.error("cannot send message!")
        console.log(error);
      }
    
  }

  useEffect(() => {
    fetchMessages();
    currentChatCompare = currentChat
  }, [currentChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved: Message) => {
      if (
        !currentChatCompare ||
        currentChatCompare._id !== newMessageRecieved.chat._id
      ) {
        //notification
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  })

  const handleEmoji = (e) => {
    setNewMessage((prev) => prev + e.emoji);
    inputRef.current?.focus();
  };

  if (!currentChat) {
    return (
      <div className="flex-1 hidden lg:flex items-center justify-center bg-muted/30">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium">
            Select a chat to start messaging
          </p>
          <p className="text-sm">Or start a new conversation</p>
        </div>
      </div>
    );
  }
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

   


  return (
    <div className="flex flex-col h-full bg-background w-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="lg:hidden"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser?.avatar} alt={otherUser?.username} />
            <AvatarFallback>{otherUser?.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">{otherUser?.username}</h3>
            <p className="text-xs text-muted-foreground">
              {otherUser?.status === "online" ? (
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500"></span>
                  Online
                </span>
              ) : (
                `Last seen ${formatTime(otherUser?.lastSeen || new Date())}`
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>View Profile</DropdownMenuItem>
              <DropdownMenuItem>Mute Notifications</DropdownMenuItem>
              <DropdownMenuItem>Clear Chat</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                Block User
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {loading ? (
              <Loader />
            ) : (
              <>
                {messages.map((msg) => {
                  const isMe = msg.sender?._id === currentUser?._id; // check if I sent it
                  return (
                    <div
                      key={msg._id}
                      className={`flex ${
                        isMe ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md rounded-lg px-4 py-2 ${
                          isMe
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <div
                          className={`flex items-center justify-end gap-2 mt-1 ${
                            isMe
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-xs">
                            {formatTime(msg.createdAt)}
                          </span>
                          {/* Optional: add ticks if you implement delivery status later */}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </ScrollArea>
      </div>

      {isTyping ? (
        <div className="absolute bottom-36">
          <DotLottieReact
            width={70}
            src="https://lottie.host/d4e2179d-3f5a-45f1-b76b-5cf513c304cb/qMCCGpV3TW.lottie"
            loop
            autoplay
          />
        </div>
      ) : (
        <></>
      )}

      {/* Message Input */}
      <div className="p-4 border-t relative">
        {!isMobile && open && (
          <div className="absolute bottom-full right-16 mb-2 z-50">
            <div className="bg-background border rounded-lg shadow-lg">
              <EmojiPicker
                theme={Theme.DARK}
                onEmojiClick={handleEmoji}
                width={350}
                height={400}
              />
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 relative">
            <Input
              ref={inputRef}
              value={newMessage}
              onChange={typingHandler}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className="pr-12"
            />
            <Button
              ref={emojiButtonRef}
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
              onClick={() => setOpen(!open)}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={sendMessage}
            size="icon"
            disabled={newMessage?.trim() === ""}
            className="h-10 w-10"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {/* Emoji Picker Modal for Mobile */}
      <Dialog open={isMobile && open} onOpenChange={setOpen}>
        <DialogContent className="fixed bottom-0 left-2 right-0 p-0 border-0 bg-transparent z-50 max-h-[70vh] -translate-x-20">
          <div className="bg-background rounded-t-2xl flex flex-col h-full shadow-lg">
            <div className="flex justify-center items-center p-3 border-b relative">
              <div className="absolute left-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-hidden">
              <EmojiPicker
                theme={Theme.DARK}
                onEmojiClick={handleEmoji}
                width="100%"
                height="100%"
                style={{ width: "100%", height: "100%", translate: "20" }}
                className=""
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatSection;
