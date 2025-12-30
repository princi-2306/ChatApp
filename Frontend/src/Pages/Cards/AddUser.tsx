// TS done

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, Search } from 'lucide-react';
import { useState, useEffect } from 'react'; // 1. Import useEffect
import userPost from '@/components/store/userStore';
import { toast } from 'sonner';
import axios from 'axios';
import Loader from '@/components/ui/Loader';
import useChatStore from '@/components/store/chatStore';


interface User {
  _id: string;
  username: string;
  email: string;
  avatar: string;
  token?: string;
}


const AddUser = ({ onClose }) => {
  const currentUser = userPost((state) => state.currentUser);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const setCurrentChat = useChatStore((state) => state.setCurrentChat)
  const [isShowUsers, setIsShowUser] = useState<User[]>([]);


  // 2. Add this useEffect for "Live Search" (Debouncing)
  useEffect(() => {
    // Set a timer to run the search after 500ms of inactivity
    const delayDebounceFn = setTimeout(() => {
      if (search.trim()) {
        handleSearch(search);
      } else {
        setIsShowUser([]); // Clear results if input is empty
        setLoading(false);
      }
    }, 500);

    // Cleanup: This cancels the previous timer if the user types again 
    // before the 500ms is up.
    return () => clearTimeout(delayDebounceFn);
  }, [search]); // Runs whenever 'search' state changes

  // 3. Update handleSearch to accept the query string directly
  const handleSearch = async (query) => {
    // Guard clause: if query is empty or not a string (e.g. event object), stop
    if (!query || typeof query !== 'string') return;

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${currentUser?.token}`
        }
      };
      // Use the 'query' argument, not the state, to ensure accuracy inside the effect
      const response = await axios.get(
        `http://localhost:8000/api/v1/users/register?search=${query}`,
        config
      );
      
      setLoading(false);
      setIsShowUser(response.data.data);
      console.log(response.data.data);
    } catch (error) {
      // toast.error("failed to load results") // commented out to avoid spamming errors while typing
      console.log(error);
      setLoading(false);
    }
  }

  const accessChat = async (userId) => {
    try {
      setLoading(true);
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${currentUser?.token}`,
        },
      };
      const response = await axios.post(
        "http://localhost:8000/api/v1/chats/",
        { userId },
        config
      );

      setCurrentChat(response.data.data);
      console.log(response.data);
      setLoading(false);
      toast.success("user added successfully!");
      onClose();
    } catch (error: any) {
      if (error.response?.status === 409) {
        toast.info("Chat with this user already exists");

        if (error.response.data?.data) {
          setCurrentChat(error.response.data.data);
        }
      } else {
        toast.error("Failed to open chat");
      }

      console.error(error);
      setLoading(false); // Ensure loading stops on error
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
          {/* The button is now purely visual/optional since search is automatic.
             I kept it but clicking it just manually triggers the same function.
          */}
          <Button onClick={() => handleSearch(search)} size="sm" disabled={loading}>
            {loading ? <Loader /> : "Go"}
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <ScrollArea className="h-full p-4">
            <div className="space-y-2">
              {loading ? (
                <div className="flex justify-center p-4">
                  <Loader /> 
                </div>
              ) : (
                isShowUsers.length > 0 ? (
                  isShowUsers?.map(user => (
                    <div
                      key={user._id}
                      className="flex items-center justify-between p-2 border rounded-md hover:bg-muted cursor-pointer"
                    >
                      <img className='w-8 h-8 rounded-full' src={user.avatar} alt="" />
                      <span>{user.username}</span>
                      <Button size="sm" variant="secondary" onClick={() => accessChat(user._id)}>
                        Add
                      </Button>
                    </div>
                  ))
                ) : (
                  // Only show "No users found" if the user has actually typed something
                  search && <p className="text-center text-muted-foreground">No users found</p>
                )
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export default AddUser;