import { DocumentReference, FieldValue, Timestamp } from 'firebase-admin/firestore';
import { getDb } from '../config/firebase';
import * as chatRepo from '../repositories/chatRepository';
import { LastSeen, Message, ReadReceipt } from '../types';
import { forbidden, notFound } from '../utils/httpError';

const chatDoc = (chatId: number) => getDb().collection('chats').doc(String(chatId));
const messagesCol = (chatId: number) => chatDoc(chatId).collection('messages');

const toIso = (value: unknown): string =>
  value instanceof Timestamp ? value.toDate().toISOString() : new Date().toISOString();

async function assertMember(chatId: number, userId: number): Promise<void> {
  if (!(await chatRepo.chatExists(chatId))) throw notFound(`Chat ${chatId} not found`);
  if (!(await chatRepo.isChatMember(chatId, userId))) {
    throw forbidden(`User ${userId} is not a member of chat ${chatId}`);
  }
}

async function assertMessageExists(chatId: number, messageId: string): Promise<DocumentReference> {
  const ref = messagesCol(chatId).doc(messageId);
  const snap = await ref.get();
  if (!snap.exists) throw notFound(`Message ${messageId} not found in chat ${chatId}`);
  return ref;
}

export async function sendMessage(chatId: number, senderId: number, text: string): Promise<Message> {
  await assertMember(chatId, senderId);

  const ref = messagesCol(chatId).doc();
  await ref.set({ senderId, text, createdAt: FieldValue.serverTimestamp() });

  const saved = await ref.get();
  return { id: ref.id, chatId, senderId, text, timestamp: toIso(saved.get('createdAt')) };
}

export async function getMessages(chatId: number, limit: number): Promise<Message[]> {
  if (!(await chatRepo.chatExists(chatId))) throw notFound(`Chat ${chatId} not found`);

  const snap = await messagesCol(chatId).orderBy('createdAt', 'desc').limit(limit).get();

  return snap.docs
    .map((doc) => ({
      id: doc.id,
      chatId,
      senderId: Number(doc.get('senderId')),
      text: String(doc.get('text')),
      timestamp: toIso(doc.get('createdAt')),
    }))
    .reverse();
}

export async function markMessageRead(
  chatId: number,
  messageId: string,
  userId: number,
): Promise<ReadReceipt> {
  await assertMember(chatId, userId);
  const messageRef = await assertMessageExists(chatId, messageId);

  const receiptRef = messageRef.collection('readReceipts').doc(String(userId));
  try {
    await receiptRef.create({ userId, readAt: FieldValue.serverTimestamp() });
  } catch (err) {
    const code = (err as { code?: number }).code;
    if (code !== 6) throw err;
  }

  const saved = await receiptRef.get();
  return { chatId, messageId, userId, readAt: toIso(saved.get('readAt')) };
}

export async function updateLastSeen(
  chatId: number,
  userId: number,
  messageId: string,
): Promise<LastSeen> {
  await assertMember(chatId, userId);
  await assertMessageExists(chatId, messageId);

  const ref = chatDoc(chatId).collection('lastSeen').doc(String(userId));
  await ref.set({ userId, messageId, updatedAt: FieldValue.serverTimestamp() });

  const saved = await ref.get();
  return { chatId, userId, messageId, updatedAt: toIso(saved.get('updatedAt')) };
}
