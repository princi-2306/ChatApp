import React, { useState } from 'react'
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Label } from '@radix-ui/react-label';
import { Loader } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import userPost from '@/components/store/userStore';


const SignOut = ({ onClose, currentUser }) => {
  const [loading, setLoading] = useState(false);
  const logout = userPost((state) => state.logout);

  const handleSignOut = async (e) => {
    e.preventDefault();
    const config = {
      headers: {
        Authorization : `Bearer ${localStorage.getItem("tokens")}`
      }
    }
    setLoading(true);
    try {
       await axios.post(
        "http://localhost:3000/api/v1/users/logout",
        {},
        config
      );
      toast.success("Logged out successfully!");
      logout();
      window.location.href = "/";
    } catch (error) {
      toast.error("unable to logout!");
      console.error("logout error : ", error);
    } finally {
      setLoading(false);
    }
  }
  return (
    <DialogContent className="sm:max-w-[425px]">
      <form action="" onSubmit={handleSignOut}>
        <DialogHeader>
          <DialogTitle>Profile</DialogTitle>
            {/* <DialogDescription>
          Are you sure you want to sign out, {currentUser?.username}?
        </DialogDescription> */}
        </DialogHeader>
    
        <div className="flex flex-col items-center">
        
          <div>
            <img
              className="w-30 h-30 rounded-full"
              src={currentUser?.avatar}
              alt=""
            />
          </div>
          <div>{currentUser?.email}</div>
          <div>{currentUser?.username}</div>
       
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader className="h-4 w-4 animate-spin" />
            ) : (
              "Log Out"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default SignOut

