import request from 'supertest';
import { createApp } from '../src/app';
import * as chatService from '../src/services/chatService';
import * as messageService from '../src/services/messageService';

jest.mock('../src/services/chatService');
jest.mock('../src/services/messageService');

describe('API Routes Integration', () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns 200 with status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ status: 'ok' });
    });
  });

  describe('404 Not Found', () => {
    it('returns 404 for unknown route', async () => {
      const res = await request(app).get('/unknown-endpoint');
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('Route not found');
    });
  });

  describe('POST /chat/create', () => {
    it('returns 200 with chatId on valid input', async () => {
      (chatService.createOrGetChat as jest.Mock).mockResolvedValue(42);

      const res = await request(app)
        .post('/chat/create')
        .send({ userAId: 1, userBId: 2 });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ chatId: 42 });
      expect(chatService.createOrGetChat).toHaveBeenCalledWith(1, 2);
    });

    it('returns 400 when validation fails (missing fields)', async () => {
      const res = await request(app)
        .post('/chat/create')
        .send({ userAId: 1 });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toBeDefined();
    });
  });

  describe('POST /chat/:chatId/message/send', () => {
    it('returns 201 with created message', async () => {
      const mockMessage = {
        id: 'msg_abc',
        chatId: 1,
        senderId: 1,
        text: 'Hello test',
        timestamp: '2026-01-01T00:00:00.000Z',
      };
      (messageService.sendMessage as jest.Mock).mockResolvedValue(mockMessage);

      const res = await request(app)
        .post('/chat/1/message/send')
        .send({ senderId: 1, text: 'Hello test' });

      expect(res.status).toBe(201);
      expect(res.body).toEqual(mockMessage);
      expect(messageService.sendMessage).toHaveBeenCalledWith(1, 1, 'Hello test');
    });

    it('returns 400 when text is empty', async () => {
      const res = await request(app)
        .post('/chat/1/message/send')
        .send({ senderId: 1, text: '' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('GET /chat/:chatId/messages', () => {
    it('returns 200 with messages list', async () => {
      const mockMessages = [
        { id: '1', chatId: 5, senderId: 1, text: 'Hi', timestamp: '2026-01-01T00:00:00.000Z' },
      ];
      (messageService.getMessages as jest.Mock).mockResolvedValue(mockMessages);

      const res = await request(app).get('/chat/5/messages?limit=10');

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        chatId: 5,
        count: 1,
        messages: mockMessages,
      });
      expect(messageService.getMessages).toHaveBeenCalledWith(5, 10);
    });
  });
});
