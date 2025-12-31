// TS DONE

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  LockKeyhole,
  UserRoundPen,
  ImageUp,
  User,
  MessageCircleMore,
  Settings,
} from "lucide-react";
import userPost from "@/components/store/userStore";
import { Separator } from "@/components/ui/separator";
import ChangePassword from "./DialogBox/ChangePassword";
import { useState } from "react";
import ChangeAvatar from "./DialogBox/ChangeAvatar";
import ChangeDetails from "./DialogBox/ChangeDetails";
import SignOut from "./DialogBox/SignOut";

const Header = () => {
  const currentUser = userPost((state) => state.currentUser);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeAvatarOpen, setChangeAvatarOpen] = useState(false);
  const [changeDetailsOpen, setChangeDetailsOpen] = useState(false);
  const [signOutOpen, setSignOutOpen] = useState(false);

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

              <Dialog open={signOutOpen} onOpenChange={setSignOutOpen}>
                <DialogTrigger asChild>
                  <div className="flex items-center gap-3">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={currentUser?.avatar}
                      alt=""
                    />
                    <div>{currentUser?.username}</div>
                  </div>
                </DialogTrigger>
                <SignOut
                  onClose={() => setSignOutOpen(false)}
                  currentUser={currentUser}
                />
              </Dialog>

              <Separator />

              {/* Change Password Dialog */}
              <Dialog
                open={changePasswordOpen}
                onOpenChange={setChangePasswordOpen}
              >
                <DialogTrigger asChild>
                  <div className="flex gap-2 items-center cursor-pointer">
                    <LockKeyhole />
                    <button type="button">Change Password</button>
                  </div>
                </DialogTrigger>
                <ChangePassword onClose={() => setChangePasswordOpen(false)} />
              </Dialog>

              <Separator />

              {/* Change Avatar Dialog */}
              <Dialog
                open={changeAvatarOpen}
                onOpenChange={setChangeAvatarOpen}
              >
                <DialogTrigger asChild>
                  <div className="flex gap-2 items-center cursor-pointer">
                    <ImageUp />
                    <button type="button">Change Avatar</button>
                  </div>
                </DialogTrigger>
                <ChangeAvatar onClose={() => setChangeAvatarOpen(false)} />
              </Dialog>

              <Separator />

              {/* Change Details Dialog */}
              <Dialog
                open={changeDetailsOpen}
                onOpenChange={setChangeDetailsOpen}
              >
                <DialogTrigger asChild>
                  <div className="flex gap-2 items-center cursor-pointer">
                    <UserRoundPen />
                    <button type="button">Change Details</button>
                  </div>
                </DialogTrigger>
                <ChangeDetails
                  currentUser={currentUser}
                  onClose={() => setChangeDetailsOpen(false)}
                />
              </Dialog>

              <Separator />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;
