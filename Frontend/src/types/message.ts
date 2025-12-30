export interface Attachment {
  url: string;
  publicId: string;
  fileType: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface Reaction {
  user: {
    _id: string;
    username: string;
    avatar?: string;
  };
  emoji: string;
  reactedAt: Date | string;
}


export interface EditHistory {
  content: string;
  editedAt: Date;
}

export interface Message {
  _id: string;
  sender: {
    _id: string;
    username: string;
    avatar?: string;
    email?: string;
  };
  content: string;
  chat: {
    _id: string;
    chatName?: string;
    isGroupChat?: boolean;
    users?: Array<{
      _id: string;
      username: string;
      avatar?: string;
    }>;
  };
  attachments?: Attachment[];
  reactions?: Reaction[];
  isEdited?: boolean;
  editedAt?: Date | string;
  editHistory?: EditHistory[];
  createdAt: Date | string;
  updatedAt?: Date | string;
}


export interface MessageWithCanEdit extends Message {
  canBeEdited: boolean;
}