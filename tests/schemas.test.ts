import {
  createChatBody,
  sendMessageBody,
  getMessagesQuery,
  markReadParams,
  lastSeenBody,
} from '../src/utils/schemas';

describe('Validation Schemas', () => {
  describe('createChatBody', () => {
    it('accepts valid user IDs', () => {
      const result = createChatBody.safeParse({ userAId: 1, userBId: 2 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ userAId: 1, userBId: 2 });
      }
    });

    it('coerces string numbers to integers', () => {
      const result = createChatBody.safeParse({ userAId: '1', userBId: '2' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ userAId: 1, userBId: 2 });
      }
    });

    it('rejects invalid or missing IDs', () => {
      expect(createChatBody.safeParse({ userAId: 'abc', userBId: 2 }).success).toBe(false);
      expect(createChatBody.safeParse({ userAId: 1 }).success).toBe(false);
      expect(createChatBody.safeParse({ userAId: -1, userBId: 2 }).success).toBe(false);
    });
  });

  describe('sendMessageBody', () => {
    it('accepts valid senderId and non-empty text', () => {
      const result = sendMessageBody.safeParse({ senderId: 1, text: 'Hello!' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.text).toBe('Hello!');
      }
    });

    it('trims leading and trailing whitespace', () => {
      const result = sendMessageBody.safeParse({ senderId: 1, text: '  Hello World  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.text).toBe('Hello World');
      }
    });

    it('rejects empty or whitespace-only text', () => {
      expect(sendMessageBody.safeParse({ senderId: 1, text: '' }).success).toBe(false);
      expect(sendMessageBody.safeParse({ senderId: 1, text: '   ' }).success).toBe(false);
    });
  });

  describe('getMessagesQuery', () => {
    it('defaults limit to 50 when omitted', () => {
      const result = getMessagesQuery.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(50);
      }
    });

    it('accepts limit within range 1 to 100', () => {
      const result = getMessagesQuery.safeParse({ limit: '20' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20);
      }
    });

    it('rejects limit outside 1 to 100', () => {
      expect(getMessagesQuery.safeParse({ limit: 0 }).success).toBe(false);
      expect(getMessagesQuery.safeParse({ limit: 101 }).success).toBe(false);
    });
  });

  describe('markReadParams', () => {
    it('accepts valid chatId and messageId', () => {
      const result = markReadParams.safeParse({ chatId: 1, messageId: 'msg-123' });
      expect(result.success).toBe(true);
    });

    it('rejects empty messageId', () => {
      const result = markReadParams.safeParse({ chatId: 1, messageId: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('lastSeenBody', () => {
    it('accepts valid userId and messageId', () => {
      const result = lastSeenBody.safeParse({ userId: 1, messageId: 'msg-456' });
      expect(result.success).toBe(true);
    });
  });
});
