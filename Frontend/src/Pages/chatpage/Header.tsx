import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  LockKeyhole,
  UserRoundPen,
  ImageUp,
  Search,
  User,
  MessageCircleMore,
  Settings,
} from "lucide-react";
import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import userPost from "@/components/store/userStore";
import { Separator } from "@/components/ui/separator";
import ChangePassword from "./DialogBox/ChangePassword";
import { useState } from "react";
import ChangeAvatar from "./DialogBox/ChangeAvatar";
import ChangeDetails from "./DialogBox/ChangeDetails";
import SignOut from "./DialogBox/SignOut";

const Header = () => {
  const currentUser = userPost((state) => state.currentUser);
  const [changePassword, setChangePassowrd] = useState(false);
  const [changeAvatar, setChangeAvatar] = useState(false);
  const [changeDetails, setChangeDetails] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="sticky z-50 top-0 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <MessageCircleMore />
        <span className="text-lg font-semibold sm:inline-block">
          GossipGirls
        </span>
      </div>

      {/* User menu */}
      <div className="ml-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="">
              <Settings className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <div className="flex flex-col p-4 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-6 w-6" />
                <div className="text-lg">Settings</div>
              </div>
              <div>
                <AlertDialog>
                  <AlertDialogTrigger>
                    <div className="flex py-3 items-center gap-3">
                      <div onClick={() => setShowProfile(true)}>
                        <img
                          className="w-10 h-10 rounded-full"
                          src={currentUser?.avatar}
                          alt=""
                        />
                      </div>
                      <div>{currentUser?.username}</div>
                    </div>
                    {showProfile && (
                      <SignOut
                        currentUser={currentUser}
                        onClose={() => setShowProfile(false)}
                      />
                    )}
                  </AlertDialogTrigger>
                </AlertDialog>
              </div>
              <div>
                <Dialog >
                  <DialogTrigger>
                    <div className="flex gap-2 items-center">
                      <div>
                        <LockKeyhole />
                      </div>
                      <div>
                        <button onClick={() => setChangePassowrd(true)}>
                          Change Password
                        </button>
                      </div>
                      {changePassword && (
                        <ChangePassword onClose={()=>setChangePassowrd(false)} />
                      )}
                    </div>
                  </DialogTrigger>
                </Dialog>
              </div>
              <Separator />
              <div>
                <Dialog>
                  <DialogTrigger>
                    <div className="flex gap-2 items-center">
                      <div>
                        <ImageUp />
                      </div>
                      <div>
                        <button onClick={() => setChangeAvatar(true)}>
                          Change Avatar
                        </button>
                      </div>
                      {changeAvatar && (
                        <ChangeAvatar onClose={() => setChangeAvatar(false)} />
                      )}
                    </div>
                  </DialogTrigger>
                </Dialog>
              </div>
              <Separator />
              <div>
                <Dialog>
                  <DialogTrigger>
                    <div className="flex gap-2 items-center">
                      <div>
                        <UserRoundPen />
                      </div>
                      <div>
                        <button onClick={() => setChangeDetails(true)}>
                          Change Details
                        </button>
                      </div>
                      {changeDetails && (
                        <ChangeDetails
                          onClose={() => setChangeDetails(false)}
                        />
                      )}
                    </div>
                  </DialogTrigger>
                </Dialog>
              </div>

              <Separator />
            </div>
            {/* Navigation items here */}
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
