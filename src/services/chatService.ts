import * as chatRepo from '../repositories/chatRepository';
import { UserChat } from '../types';
import { badRequest, notFound } from '../utils/httpError';

export async function createOrGetChat(userAId: number, userBId: number): Promise<number> {
  if (userAId === userBId) throw badRequest('userAId and userBId must be different users');

  const existing = await chatRepo.findExistingUserIds([userAId, userBId]);
  const missing = [userAId, userBId].filter((id) => !existing.includes(id));
  if (missing.length > 0) throw notFound(`User(s) not found: ${missing.join(', ')}`);

  return chatRepo.findOrCreateChat(userAId, userBId);
}

export async function listUserChats(userId: number): Promise<UserChat[]> {
  if (!(await chatRepo.userExists(userId))) throw notFound(`User ${userId} not found`);
  return chatRepo.listUserChats(userId);
}
