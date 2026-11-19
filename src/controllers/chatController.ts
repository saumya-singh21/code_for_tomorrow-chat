import { Request, Response } from 'express';
import * as chatService from '../services/chatService';
import * as messageService from '../services/messageService';
import {
  chatIdParams,
  createChatBody,
  getMessagesQuery,
  lastSeenBody,
  markReadParams,
  sendMessageBody,
  userBody,
  userIdParams,
} from '../utils/schemas';

export async function createChat(req: Request, res: Response): Promise<void> {
  const { userAId, userBId } = createChatBody.parse(req.body);
  const chatId = await chatService.createOrGetChat(userAId, userBId);
  res.status(200).json({ chatId });
}

export async function sendMessage(req: Request, res: Response): Promise<void> {
  const { chatId } = chatIdParams.parse(req.params);
  const { senderId, text } = sendMessageBody.parse(req.body);
  const message = await messageService.sendMessage(chatId, senderId, text);
  res.status(201).json(message);
}

export async function getMessages(req: Request, res: Response): Promise<void> {
  const { chatId } = chatIdParams.parse(req.params);
  const { limit } = getMessagesQuery.parse(req.query);
  const messages = await messageService.getMessages(chatId, limit);
  res.status(200).json({ chatId, count: messages.length, messages });
}

export async function markMessageRead(req: Request, res: Response): Promise<void> {
  const { chatId, messageId } = markReadParams.parse(req.params);
  const { userId } = userBody.parse(req.body);
  const receipt = await messageService.markMessageRead(chatId, messageId, userId);
  res.status(200).json(receipt);
}

export async function updateLastSeen(req: Request, res: Response): Promise<void> {
  const { chatId } = chatIdParams.parse(req.params);
  const { userId, messageId } = lastSeenBody.parse(req.body);
  const lastSeen = await messageService.updateLastSeen(chatId, userId, messageId);
  res.status(200).json(lastSeen);
}

export async function listUserChats(req: Request, res: Response): Promise<void> {
  const { userId } = userIdParams.parse(req.params);
  const chats = await chatService.listUserChats(userId);
  res.status(200).json({ userId, chats });
}
