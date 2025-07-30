import React from 'react'
import TypeMgs from './TypeMgs'
import img from '@/assets/download (5).jpeg'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@radix-ui/react-scroll-area'
import { ScrollBar } from '@/components/ui/scroll-area'

const Chats = () => {
  return (
    <div className='w-full flex flex-col'>
      <Card className='bg-zinc-800 w-full h-20 flex '>
        <div className='px-9 flex gap-3 items-center'>
        <div><img className='w-10 h-10 rounded-full' src={img} alt="" /></div>
        <div>Priyanshi</div>
        </div>
      </Card>
       <div className='flex-1'>
       <ScrollArea>
        <ScrollBar/>
       </ScrollArea>
    </div>
    <TypeMgs/>
    </div>
   

  )
}

export default Chats
