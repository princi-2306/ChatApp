import React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";


const SignOut = ({ onClose, currentUser }) => {
  return (
      <div>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Profile</AlertDialogTitle>
          <div className='flex flex-col items-center'>
            <div><img className="w-30 h-30 rounded-full" src={currentUser?.avatar} alt="" /></div>
            <div>{currentUser?.email}</div>
            <div>{currentUser?.username}</div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction>Sign Out</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>

      
    </div>
  )
}

export default SignOut

