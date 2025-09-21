import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import userPost from '@/components/store/userStore'
import axios from 'axios'
import { toast } from 'sonner'
import { Loader, Save } from 'lucide-react'

const ChangePassword = ({onClose}) => {
  const [loading, setLoading] = useState(false);
  const [oldPassword, setOldPassword] = useState<string>();
  const [newPassword, setNewPassword] = useState<string>();
 

  const passwordChange = async () => {
    try {
      const config = {
        headers: {
          "Content-Type" : "application/json",
          Authorization : `Bearer ${localStorage.getItem("token")}`
        }
      }

      setLoading(true);

      const response = await axios.post(
        "http://localhost:8000/api/v1/users/change-password",
        {
          oldPassword,
          newPassword
        }
        ,config
      );

      toast.success("password changes successfully!")
      setLoading(false);
    } catch (error) {
      toast.error("cannot change password");
      console.log(error);
    }
  }

  if(loading) return <Loader/>
  return (
    <DialogContent
      className="sm:max-w-[425px]"
      onInteractOutside={(e) => e.preventDefault()} 
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      <form onSubmit={passwordChange}>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
          <DialogDescription>
            Make changes to your password here. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-3">
            <Label htmlFor="password">Old Password</Label>
            <Input id="oldPassword" name="oldPassword" value={oldPassword} />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="username-1">New Password</Label>
            <Input id="newPassword" name="newPassword" value={newPassword} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit">{loading ? <Loader /> : "Save Changes"}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}

export default ChangePassword
