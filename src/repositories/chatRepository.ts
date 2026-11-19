import { RowDataPacket } from 'mysql2/promise';
import { pool } from '../config/db';
import { UserChat } from '../types';

export async function findExistingUserIds(ids: number[]): Promise<number[]> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT id FROM users WHERE id IN (?)', [ids]);
  return rows.map((r) => Number(r.id));
}

export async function userExists(userId: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 FROM users WHERE id = ? LIMIT 1', [userId]);
  return rows.length > 0;
}

export async function chatExists(chatId: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>('SELECT 1 FROM chats WHERE id = ? LIMIT 1', [chatId]);
  return rows.length > 0;
}

export async function isChatMember(chatId: number, userId: number): Promise<boolean> {
  const [rows] = await pool.query<RowDataPacket[]>(
    'SELECT 1 FROM chat_members WHERE chat_id = ? AND user_id = ? LIMIT 1',
    [chatId, userId],
  );
  return rows.length > 0;
}

export async function findOrCreateChat(userAId: number, userBId: number): Promise<number> {
  const lo = Math.min(userAId, userBId);
  const hi = Math.max(userAId, userBId);
  const pairKey = `${lo}_${hi}`;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('INSERT IGNORE INTO chats (pair_key) VALUES (?)', [pairKey]);
    const [rows] = await conn.query<RowDataPacket[]>('SELECT id FROM chats WHERE pair_key = ?', [pairKey]);
    const row = rows[0];
    if (!row) throw new Error('Chat row missing after insert');
    const chatId = Number(row.id);
    await conn.query('INSERT IGNORE INTO chat_members (chat_id, user_id) VALUES (?, ?), (?, ?)', [
      chatId,
      lo,
      chatId,
      hi,
    ]);
    await conn.commit();
    return chatId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function listUserChats(userId: number): Promise<UserChat[]> {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT c.id AS chatId, c.created_at AS createdAt, m2.user_id AS memberId
       FROM chat_members m1
       JOIN chats c         ON c.id = m1.chat_id
       JOIN chat_members m2 ON m2.chat_id = c.id
      WHERE m1.user_id = ?
      ORDER BY c.id, m2.user_id`,
    [userId],
  );

  const byChat = new Map<number, UserChat>();
  for (const r of rows) {
    const chatId = Number(r.chatId);
    let chat = byChat.get(chatId);
    if (!chat) {
      chat = { chatId, memberIds: [], createdAt: new Date(r.createdAt as Date).toISOString() };
      byChat.set(chatId, chat);
    }
    chat.memberIds.push(Number(r.memberId));
  }
  return [...byChat.values()];
}
