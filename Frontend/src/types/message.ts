import { User } from "@/components/store/userStore";
import { Chat } from "@/components/store/chatStore";

export interface Attachment {
  url: string;
  publicId: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface Reaction {
  _id?: string;
  user: User;
  emoji: string;
  reactedAt: Date;
}

export interface EditHistory {
  content: string;
  editedAt: Date;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  chat: Chat;
  attachments?: Attachment[];
  isEdited?: boolean;
  editedAt?: Date;
  editHistory?: EditHistory[];
  reactions?: Reaction[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MessageWithCanEdit extends Message {
  canBeEdited: boolean;
}