import { z } from 'zod';

const id = z.coerce.number().int().positive();

export const createChatBody = z.object({
  userAId: id,
  userBId: id,
});

export const chatIdParams = z.object({ chatId: id });

export const sendMessageBody = z.object({
  senderId: id,
  text: z.string().trim().min(1, 'text must not be empty').max(4000),
});

export const getMessagesQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const markReadParams = z.object({
  chatId: id,
  messageId: z.string().min(1),
});

export const userBody = z.object({ userId: id });

export const lastSeenBody = z.object({
  userId: id,
  messageId: z.string().min(1),
});

export const userIdParams = z.object({ userId: id });
