import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Search } from 'lucide-react';
import React, { useState } from 'react'
import userPost from '@/components/store/userStore';
import { toast } from 'sonner';
import axios from 'axios';
import Loader from '@/components/ui/Loader';
import useChatStore from '@/components/store/chatStore';

const AddUser = ({ onClose }) => {
  const currentUser = userPost((state) => state.currentUser);
  const [isShowUsers, setIsShowUser] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const setChats = useChatStore((state) => state.setChats)
  const chats = useChatStore((state) => state.chats)
  const setCurrentChat = useChatStore((state) => state.setCurrentChat)

  const handleSearch = async () => {
    if (!search) {
      toast.error("please enter something in search")
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      };
      const response = await axios.get(
        `http://localhost:3000/api/v1/users/register?search=${search}`,
        config
      );
      setLoading(false);
      setIsShowUser(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      toast.error("failed to load the search results")
      console.log(error);
    }
  }

  const accessChat = async(userId : string) => {
     try {
       setLoading(true);
       const config = {
         headers: {
           "Content-type" : "application/json",
           Authorization: `Bearer ${currentUser?.token}`
         }
       };
       const response = await axios.post(
         " http://localhost:3000/api/v1/chats/", {userId}, config
       );
      if (
        Array.isArray(chats) &&
        !chats.find((c) => c._id === response.data.data._id)
      ) {
        setChats([response.data, ...chats]);
      }
      
       setCurrentChat(response.data)
       console.log(response.data)
       setLoading(false);
       toast.success("user added successfully!")
       onClose();
     } catch (error) {
        toast.error("failed to load the search results");
        console.log(error);
     }
  }
  return (
    <div className="absolute top-16 z-40 lg:w-[23rem] w-full bg-background border-l shadow-lg animate-in slide-in-from-left-5 h-[calc(100%-4rem)] flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-lg font-semibold">Start New Chat</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X />
        </Button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden p-2">
        <div className="relative mb-4 flex gap-2">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search users..."
            className="w-full pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={handleSearch} size="sm" disabled={loading}>
            {loading ? <Loader/> : "Go"}</Button>
        </div>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-2">
              {loading ? <Loader/> : (
                    isShowUsers.length > 0 ? (
                    isShowUsers?.map(user => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-2 border rounded-md hover:bg-muted cursor-pointer"
                >
                  <span>{user.username}</span>
                  <Button size="sm" variant="secondary" onClick={()=>accessChat(user._id)}>
                    Add
                  </Button>
                </div>
              ))
              ) : (
              <p>No users found</p>
              )
              )}
             

            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export default AddUser
