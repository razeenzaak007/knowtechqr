
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// IMPORTANT: These service account credentials are automatically provided
// by Firebase App Hosting or can be set as environment variables.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : undefined;

let adminApp: App;

if (!getApps().length) {
  if (serviceAccount) {
    // If a service account is explicitly provided via environment variable, use it.
    // This is the standard for local development or certain CI/CD environments.
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });
  } else {
    // Otherwise, allow the SDK to auto-discover credentials from the environment.
    // This is the standard practice for services like App Hosting and Cloud Run.
    adminApp = initializeApp();
  }
} else {
  adminApp = getApps()[0];
}

export const adminDb = getFirestore(adminApp);
