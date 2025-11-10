
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: These service account credentials are automatically provided
// by Firebase App Hosting. Do not edit them manually.
// For local development, you would typically use a service account JSON file.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp({
    credential: serviceAccount ? cert(serviceAccount) : undefined,
  });
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
