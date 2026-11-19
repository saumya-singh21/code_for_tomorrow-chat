import { readFileSync } from 'fs';
import { resolve } from 'path';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import { env } from './env';

let firestore: Firestore | undefined;

export function getDb(): Firestore {
  if (firestore) return firestore;

  if (getApps().length === 0) {
    if (env.FIREBASE_SERVICE_ACCOUNT_PATH) {
      const serviceAccount = JSON.parse(
        readFileSync(resolve(env.FIREBASE_SERVICE_ACCOUNT_PATH), 'utf8'),
      );
      initializeApp({ credential: cert(serviceAccount) });
    } else if (process.env.FIRESTORE_EMULATOR_HOST) {
      initializeApp({ projectId: env.FIREBASE_PROJECT_ID ?? 'demo-chat' });
    } else {
      initializeApp({ credential: applicationDefault() });
    }
  }

  firestore = getFirestore();
  return firestore;
}
