
import {
  collection,
  getDocs,
  addDoc,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  getDoc,
  Firestore,
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import type { User } from './types';
import { initializeFirebase } from '@/firebase';
import { addDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { getAuth } from 'firebase/auth';

// This file will now contain functions that interact with Firestore.
// The components will use hooks to get the firestore instance.

export async function getUsers(db: Firestore): Promise<User[]> {
  const usersCol = collection(db, 'registrations');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
  return userList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addUser(db: Firestore, user: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>): Promise<User> {
    const usersCol = collection(db, 'registrations');
    
    // The QR code URL will be generated before calling this function now.
    // We will generate ID client side to create QR code, then save to DB.
    const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: newId }))}`;

    const newUser: User = {
        ...user,
        id: newId,
        createdAt: new Date().toISOString(),
        checkedInAt: null,
        qrCodeUrl: qrCodeUrl,
    };
    
    // Use the non-blocking function to add the document
    addDocumentNonBlocking(usersCol, {
      ...user,
      createdAt: serverTimestamp(),
      checkedInAt: null,
      qrCodeUrl: qrCodeUrl,
      id: newId
    });

    return newUser;
}

export async function addUsers(db: Firestore, users: Array<Partial<Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>>>): Promise<void> {
    const batch = writeBatch(db);
    const usersCol = collection(db, 'registrations');

    users.forEach(user => {
        const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: newId }))}`;
        const docRef = doc(usersCol, newId);
        
        batch.set(docRef, {
            ...user,
            id: newId,
            createdAt: serverTimestamp(),
            checkedInAt: null,
            qrCodeUrl: qrCodeUrl,
        });
    });

    await batch.commit();
}


export async function checkInUser(db: Firestore, userId: string): Promise<{ user: User | null; alreadyCheckedIn: boolean; }> {
    const userRef = doc(db, 'registrations', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
        const user = { ...userSnap.data(), id: userSnap.id } as User;

        if (user.checkedInAt) {
            return { user, alreadyCheckedIn: true };
        }
        
        updateDocumentNonBlocking(userRef, {
            checkedInAt: new Date().toISOString(),
        });

        // Return optimistic data
        const updatedUser = { ...user, checkedInAt: new Date().toISOString() };
        return { user: updatedUser, alreadyCheckedIn: false };
    }
    
    return { user: null, alreadyCheckedIn: false };
}
