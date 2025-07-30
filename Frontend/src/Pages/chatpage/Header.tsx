import React, {useState } from "react";
import { Card, CardTitle } from "@/components/ui/card";
import { FaRegBell } from "react-icons/fa6";
import userPost from "@/components/store/userStore";
import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface PasswordForm {

  newPassword: string;
  confirmPassword: string;
  currentPassword: string;
}

interface DetailsForm {
  username: string;
  email: string;
}

const Header = () => {
  const currentUser = userPost((state) => state.currentUser);
  const updatePassword = userPost((state => state.updatePassword))
  const updateAvatar = userPost((state) => state.updateAvatar);
  const updateDetails = userPost((state) => state.updateDetails);
  const logout = userPost((state) => state.logout);
  const navigate = useNavigate();
  const [password, setPassword] = useState<PasswordForm>({
    newPassword: '',
    confirmPassword: '',
    currentPassword: ''
  });
   const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [detailsForm, setDetailsForm] = useState<DetailsForm>({
    username: currentUser?.username || '',
    email: currentUser?.email || ''
  });
  const [isLoading, setIsLoading] = useState(false);
   const [error, setError] = useState("");
  
 
   
  const changePassowrd = async (e : React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      if (password.newPassword !== password.confirmPassword) {
        toast.error("Passwords do not match")
        return;
      }
    
      await axios.post(
        "http://localhost:8000/api/v1/users/change-password",
          {
          oldPassword: password.currentPassword,
          newPassword: password.newPassword
        },
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );

  
        updatePassword(password.newPassword);
        setPassword({
          newPassword: "",
          confirmPassword: "",
          currentPassword:""
        });
       console.log("password updated successfully")
     
    } catch (err) {
      console.log("Password update failed:", err);
    } finally {
      setIsLoading(false);
    }
  }
  
  const changeUserDetails = async(e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("")
    try {

      // if(!/\S+@\S+\.\S+/.test(detailsForm.email)){
      //   toast.error("Enter valid email !")
      //   return;
      // };
        
      const response = await axios.patch(
        "http://localhost:8000/api/v1/users/update-details",
        { username: detailsForm.username, email: detailsForm.email },
        {
          headers: { Authorization: `Bearer ${currentUser?.token}` },
        }
      );
      toast.success("Profile updated successfully");
      updateDetails(detailsForm.username, detailsForm.email);
      
    } catch (error) {
      toast.error("failed to update")
    }
    setIsLoading(false);
  };

  const changeAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarFile) return;
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    setIsLoading(true);
    try {
      const response = await axios.put(
        "http://localhost:8000/api/v1/users/update-avatar",
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${currentUser?.token}`
          }
        }
      );
      setAvatarFile(avatarFile);
      updateAvatar(URL.createObjectURL(avatarFile));
      toast.success("Avatar updated successfully!")
    } catch (error) {
      toast.error("Failed to update avatar");
    }
    setIsLoading(false);
  }

  const userLogOut = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post(
        "http://localhost:8000/api/v1/users/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${currentUser?.token}`,
          },
        }
      );
      logout();
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error("Logout error : ", error);
      toast.error('Logout failed');
    }
  } 

  return (
    <div>
      <Card className="">
        <div className="flex justify-around items-center">
          <div>
            <Popover>
              <PopoverTrigger>
                <img
                  className="h-10 w-10 rounded-full"
                  src={currentUser?.avatar}
                  alt=""
                />
              </PopoverTrigger>
              <PopoverContent className="flex justify-center items-center flex-col ">
                <img
                  className="h-20 w-20 rounded-full"
                  src={currentUser?.avatar}
                  alt=""
                />
                <div>{currentUser?.username}</div>
                <div className="mb-4">{currentUser?.email}</div>
                <Dialog>
                  <DialogTrigger>
                    <div className="underline cursor-pointer">
                      Update Password
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>Update Password</DialogHeader>
                    <form onSubmit={changePassowrd}>
                      <div className="grid gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="currentPassword">
                            Current Password
                          </Label>
                          <Input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={password.currentPassword}
                            onChange={(e) =>
                              setPassword({
                                ...password,
                                currentPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="newPassword">Password</Label>
                          <Input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={password.newPassword}
                            onChange={(e) =>
                              setPassword({
                                ...password,
                                newPassword: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="confirmPassword">
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={password.confirmPassword}
                            onChange={(e) =>
                              setPassword({
                                ...password,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="pt-3">
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                          </Button>
                        </DialogFooter>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger>
                    <div className="underline cursor-pointer">
                      Update Avatar
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>Update Avatar</DialogHeader>
                    <form onSubmit={changeAvatar}>
                      <div className="grid gap-3">
                        <Label htmlFor="name-1">Avatar</Label>
                        <Input
                          id="avatar"
                          name="avatar"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setAvatarFile(e.target.files[0]);
                            }
                          }}
                          type="file"
                        />
                      </div>
                      <div className="pt-3">
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                          </Button>
                        </DialogFooter>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <Dialog>
                  <DialogTrigger>
                    <div className="underline cursor-pointer">
                      Update Details
                    </div>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>Update Details</DialogHeader>
                    <form onSubmit={changeUserDetails} action="">
                      <div className="grid gap-4">
                        <div className="grid gap-3">
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            name="username"
                            type="text"
                            value={detailsForm.username}
                            onChange={(e) =>
                              setDetailsForm((prev) => ({
                                ...prev,
                                username: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div className="grid gap-3">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={detailsForm.email}
                            onChange={(e) =>
                              setDetailsForm((prev) => ({
                                ...prev,
                                email: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                      <div className="pt-3">
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : "Save changes"}
                          </Button>
                        </DialogFooter>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
                <div className="pt-5">
                  <Button onClick={userLogOut}>Sign Out</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="text-3xl">
            <CardTitle>Chat App</CardTitle>
          </div>
          <div className="text-xl">
            <FaRegBell />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Header;
