export interface Message {
  id: string;
  chatId: number;
  senderId: number;
  text: string;
  timestamp: string;
}

export interface ReadReceipt {
  chatId: number;
  messageId: string;
  userId: number;
  readAt: string;
}

export interface LastSeen {
  chatId: number;
  userId: number;
  messageId: string;
  updatedAt: string;
}

export interface UserChat {
  chatId: number;
  memberIds: number[];
  createdAt: string;
}
