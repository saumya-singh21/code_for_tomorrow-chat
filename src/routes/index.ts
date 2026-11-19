import { Router } from 'express';
import * as ctrl from '../controllers/chatController';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.post('/chat/create', asyncHandler(ctrl.createChat));
router.post('/chat/:chatId/message/send', asyncHandler(ctrl.sendMessage));
router.get('/chat/:chatId/messages', asyncHandler(ctrl.getMessages));
router.post('/chat/:chatId/message/:messageId/read', asyncHandler(ctrl.markMessageRead));
router.post('/chat/:chatId/lastseen', asyncHandler(ctrl.updateLastSeen));
router.get('/user/:userId/chats', asyncHandler(ctrl.listUserChats));

export default router;
