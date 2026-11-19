import * as chatRepo from '../src/repositories/chatRepository';
import * as chatService from '../src/services/chatService';
import { HttpError } from '../src/utils/httpError';

jest.mock('../src/repositories/chatRepository');

describe('Chat Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrGetChat', () => {
    it('throws 400 badRequest if userAId equals userBId', async () => {
      await expect(chatService.createOrGetChat(1, 1)).rejects.toThrow(HttpError);
      await expect(chatService.createOrGetChat(1, 1)).rejects.toMatchObject({
        status: 400,
        message: 'userAId and userBId must be different users',
      });
    });

    it('throws 404 notFound if one or both users do not exist', async () => {
      (chatRepo.findExistingUserIds as jest.Mock).mockResolvedValue([1]);

      await expect(chatService.createOrGetChat(1, 2)).rejects.toThrow(HttpError);
      await expect(chatService.createOrGetChat(1, 2)).rejects.toMatchObject({
        status: 404,
        message: 'User(s) not found: 2',
      });
    });

    it('returns chatId when both users exist', async () => {
      (chatRepo.findExistingUserIds as jest.Mock).mockResolvedValue([1, 2]);
      (chatRepo.findOrCreateChat as jest.Mock).mockResolvedValue(10);

      const result = await chatService.createOrGetChat(1, 2);
      expect(result).toBe(10);
      expect(chatRepo.findOrCreateChat).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('listUserChats', () => {
    it('throws 404 notFound if user does not exist', async () => {
      (chatRepo.userExists as jest.Mock).mockResolvedValue(false);

      await expect(chatService.listUserChats(99)).rejects.toThrow(HttpError);
      await expect(chatService.listUserChats(99)).rejects.toMatchObject({
        status: 404,
        message: 'User 99 not found',
      });
    });

    it('returns user chats list when user exists', async () => {
      (chatRepo.userExists as jest.Mock).mockResolvedValue(true);
      const mockChats = [
        { chatId: 1, memberIds: [1, 2], createdAt: '2026-01-01T00:00:00.000Z' },
      ];
      (chatRepo.listUserChats as jest.Mock).mockResolvedValue(mockChats);

      const result = await chatService.listUserChats(1);
      expect(result).toEqual(mockChats);
      expect(chatRepo.listUserChats).toHaveBeenCalledWith(1);
    });
  });
});
