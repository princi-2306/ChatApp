import React, { useState } from 'react'
import img from "@/assets/download (5).jpeg"
import axios from 'axios'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from '@/components/ui/input';
import { FaSearch } from "react-icons/fa";
import { useSearchParams } from 'react-router-dom';
import userPost from '@/components/store/userStore';

const ChatList = () => {
  const [chats, setChats] = useState<string[]>([]);

  const user = userPost((state) => state.addUser);
 

  return (
    <div className='flex mt-2 w-150 px-3'>
     
      <Table>
        <TableHeader>
            <TableHead className='text-3xl py-5'>Chats</TableHead>
            
        </TableHeader>
         <div className='flex items-center gap-2 my-4'>
        <FaSearch className='text-xl'/>
        <Input type="text" placeholder='type name' />
      </div>
       
           <TableBody>
          <ScrollArea className="h-110 m-0 p=0"> 
            <div>
              {chats.map((idx,item) => (
                <TableRow key={idx}>
                  <TableCell>
                    <div className='flex gap-6 items-center'>
                      <img className='w-10 h-10 rounded-full' src={item.avatar} alt="" />
                      <div className='flex flex-col'>
                        <div className='text-lg'>{item.name}</div>
                        <div className='text-sm'>{item.msg}</div>
                      </div>
                      <div className='translate-x-32'>{item.msg.time}</div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </div>
            <ScrollBar/>
          </ScrollArea>
        </TableBody>
        
        
      </Table>
    </div>
  )
}

export default ChatList
