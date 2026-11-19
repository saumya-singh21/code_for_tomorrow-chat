import { createApp } from './app';
import { pool } from './config/db';
import { env } from './config/env';
import { getDb } from './config/firebase';

async function main(): Promise<void> {
  await pool.query('SELECT 1');
  getDb();

  const server = createApp().listen(env.PORT, () => {
    console.log(`Chat backend listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (): void => {
    server.close(() => {
      void pool.end().finally(() => process.exit(0));
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
