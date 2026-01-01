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
import Loader from '@/components/ui/Loader';
import { toast } from 'sonner';
import userPost from '@/components/store/userStore';


const ChangeAvatar = ({ onClose }: any) => {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const updateAvatar = userPost((state) => state.updateAvatar)
  
  const handleFileSelect = (e : any) => {
    const file = e.target.files[0];
    setSelectedFile(file);
  };

  const handleImageUpload = async (e : any) => {
    e.preventDefault();
    // const file = e.target.files[0];
    // if (!file) return;

      if (!selectedFile) {
      toast.error("Please select a file first!");
      return;
    }

    const formData = new FormData();
    formData.append("avatar",selectedFile);

    setLoading(true);
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_URL}/users/update-avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${localStorage.getItem("tokens")}`,
          },
        }
      );

      toast.success("Avatar updated successfully!")
      // console.log(response);
      updateAvatar(response.data.data.avatar);

       if (onClose) {
         onClose();
       }
        
    } catch (error) {
      toast.error("Unable to update avatar");
      console.log("avatar error : ", error);
      // setLoading(false);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DialogContent className="sm:max-w-[425px]">
      <form action="" onSubmit={handleImageUpload}>
        <DialogHeader>
          <DialogTitle>Update Avatar</DialogTitle>
          <DialogDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="name-1">Avatar</Label>
            <Input onChange={handleFileSelect} id="avatar" type="file" name="avatar" accept="image/*" />
          </div>
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
              "Save Changes"
            )}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

  export default ChangeAvatar;
