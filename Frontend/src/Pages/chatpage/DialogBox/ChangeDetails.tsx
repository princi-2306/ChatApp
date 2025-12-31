// TS DONE

import { useState } from 'react'
import { Button } from "@/components/ui/button";
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from 'axios';
import { toast } from 'sonner';
import userPost from '@/components/store/userStore';

const ChangeDetails = ({ onClose, currentUser }: any) => {
  // const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser.username,
    email: currentUser.email
  })
  const updateDetails = userPost((state) => state.updateDetails)

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  const handleUserDetailsChange = async (e: any) => {
    e.preventDefault();

    try {
      const config = {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("tokens")}`,
        }
      };

      // setLoading(true);

      const response = await axios.patch(
        `${import.meta.env.VITE_URL}/users/update-details`,
        {
          username: formData.username,
          email: formData.email
        },
        config
      );

      toast.success("user details changed successfully!");
      updateDetails(response.data.data.email, response.data.data.username);
      onClose();
    } catch (error) {
      toast.error("Unable to update user details");
      console.error("user update error: ", error);
    } finally {
      // setLoading(false);
    }
  } 

  return (
    <DialogContent className="sm:max-w-[425px]">
      <form action="" onSubmit={handleUserDetailsChange}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Email</Label>
            <Input id="email" name="email" onChange={handleChange} value={formData.email} defaultValue={currentUser.email} />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="username-1">Username</Label>
            <Input id="username-1" name="username" onChange={handleChange} value={formData.username} defaultValue={currentUser.username} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default ChangeDetails
