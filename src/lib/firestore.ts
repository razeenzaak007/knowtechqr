
'use client';

import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  updateDoc, 
  Timestamp, 
  serverTimestamp, 
  writeBatch,
  getDoc,
  runTransaction
} from 'firebase/firestore';
import type { User } from './types';
import { initializeFirebase } from '@/firebase';

// This function now runs on the client
function getClientDb() {
    return initializeFirebase().firestore;
}

export async function getUsers(): Promise<User[]> {
  const db = getClientDb();
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      ...data,
      id: doc.id,
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      checkedInAt: (data.checkedInAt as Timestamp)?.toDate().toISOString() || null,
    } as User;
  });
  userList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return userList;
}

export async function addUser(user: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>): Promise<User> {
  const db = getClientDb();
  const usersCol = collection(db, 'users');
  
  const newUserDoc = {
    ...user,
    createdAt: serverTimestamp(),
    checkedInAt: null,
  };

  const docRef = await addDoc(usersCol, newUserDoc);
  
  // The QR code now contains a URL to the participant's dedicated page within this app
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${window.location.origin}/participant/${docRef.id}`)}`;

  await updateDoc(docRef, { qrCodeUrl });

  // We can't get the server timestamp on the client immediately, so we'll construct the user object without it.
  // The on-success UI will have everything it needs.
  return {
    ...user,
    id: docRef.id,
    createdAt: new Date().toISOString(), // Use client time for immediate feedback
    checkedInAt: null,
    qrCodeUrl,
  } as User;
}

export async function addUsers(users: Array<Partial<Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>>>): Promise<void> {
    const db = getClientDb();
    const usersCol = collection(db, 'users');
    const batch = writeBatch(db);

    const origin = window.location.origin;

    users.forEach((user) => {
        const docRef = doc(usersCol); // Create a reference first to get the ID
        
        // The QR code now contains a URL to the participant's dedicated page within this app
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(`${origin}/participant/${docRef.id}`)}`;
        
        const docData = {
          name: user.name ?? 'N/A',
          age: user.age ?? 0,
          bloodGroup: user.bloodGroup ?? 'N/A',
          gender: user.gender ?? 'N/A',
          job: user.job ?? 'N/A',
          area: user.area ?? 'N/A',
          whatsappNumber: user.whatsappNumber ?? 'N/A',
          email: user.email ?? 'N/A',
          createdAt: serverTimestamp(),
          checkedInAt: null,
          qrCodeUrl: qrCodeUrl,
        };
        batch.set(docRef, docData);
    });

    await batch.commit();
}


export async function checkInUser(userId: string): Promise<{ user: User | null; alreadyCheckedIn: boolean; }> {
  const db = getClientDb();
  const userRef = doc(db, 'users', userId);
  
  // Use a transaction to safely check and update the user
  try {
    const result = await runTransaction(db, async (transaction) => {
      const userSnap = await transaction.get(userRef);

      if (!userSnap.exists()) {
        // By returning a specific value, we can handle this case outside the transaction
        return { user: null, alreadyCheckedIn: false, error: 'not-found' };
      }

      const userData = userSnap.data();
      if (userData.checkedInAt) {
        // User is already checked in. Return their data.
        return { 
          user: { 
            ...userData, 
            id: userSnap.id,
            createdAt: (userData.createdAt as Timestamp).toDate().toISOString(),
            checkedInAt: (userData.checkedInAt as Timestamp).toDate().toISOString(),
          } as User, 
          alreadyCheckedIn: true 
        };
      }
      
      // User exists and is not checked in, so update them.
      transaction.update(userRef, { checkedInAt: serverTimestamp() });
      
      // Return the user data with a client-side timestamp for immediate UI feedback.
      return {
        user: {
          ...userData,
          id: userSnap.id,
          createdAt: (userData.createdAt as Timestamp).toDate().toISOString(),
          checkedInAt: new Date().toISOString(), // Use client time for UI
        } as User,
        alreadyCheckedIn: false
      };
    });
    
    // If the user was not found inside the transaction, result will have the error.
    if(result.error === 'not-found') {
        return { user: null, alreadyCheckedIn: false };
    }

    return result;

  } catch (error) {
    console.error("Check-in transaction failed: ", error);
    // If the transaction fails for other reasons (e.g. permissions), return an error state.
    return { user: null, alreadyCheckedIn: false };
  }
}


export async function clearCheckIn(userId: string): Promise<void> {
  const db = getClientDb();
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { checkedInAt: null });
}
