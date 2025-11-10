
'use client';

import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc,
  Timestamp,
  getFirestore
} from 'firebase/firestore';
import type { User } from './types';
import { initializeFirebase } from '@/firebase';

// This function is now a client-side utility to get the Firestore instance.
function getDb() {
  // Ensure Firebase is initialized and get the Firestore instance.
  // This is safe to call multiple times.
  const { firestore } = initializeFirebase();
  return firestore;
}

export async function getUsers(): Promise<User[]> {
  const db = getDb();
  const usersCol = collection(db, 'users');
  const userSnapshot = await getDocs(usersCol);
  const userList = userSnapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      ...data,
      id: doc.id,
      // Convert Firestore Timestamps to ISO strings
      createdAt: (data.createdAt as Timestamp)?.toDate().toISOString() || new Date().toISOString(),
      checkedInAt: (data.checkedInAt as Timestamp)?.toDate().toISOString() || null,
    } as User;
  });
  // Sort users by creation date, most recent first
  userList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return userList;
}

export async function addUser(user: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>): Promise<User> {
  const db = getDb();
  const usersCol = collection(db, 'users');
  
  const newUserDoc = {
    ...user,
    createdAt: Timestamp.now(), // Use Firestore server timestamp
    checkedInAt: null,
  };

  const docRef = await addDoc(usersCol, newUserDoc);
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: docRef.id }))}`;

  // Update the document with its own QR code URL
  await updateDoc(docRef, { qrCodeUrl });
  
  const docSnap = await getDoc(docRef);
  const data = docSnap.data();

  return {
    ...data,
    id: docRef.id,
    createdAt: (data?.createdAt as Timestamp).toDate().toISOString(),
    checkedInAt: null, // It's null on creation
    qrCodeUrl,
  } as User;
}

export async function addUsers(users: Array<Partial<Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>>>): Promise<void> {
  const db = getDb();
  const usersCol = collection(db, 'users');
  
  const promises = users.map(async (user) => {
    const docData = {
      name: user.name ?? 'N/A',
      age: user.age ?? 0,
      bloodGroup: user.bloodGroup ?? 'N/A',
      gender: user.gender ?? 'N/A',
      job: user.job ?? 'N/A',
      area: user.area ?? 'N/A',
      whatsappNumber: user.whatsappNumber ?? 'N/A',
      email: user.email ?? 'N/A',
      createdAt: Timestamp.now(),
      checkedInAt: null,
      qrCodeUrl: '', // Will be updated after creation
    };
    const docRef = await addDoc(usersCol, docData);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: docRef.id }))}`;
    return updateDoc(docRef, { qrCodeUrl });
  });

  await Promise.all(promises);
}

export async function checkInUser(userId: string): Promise<{ user: User | null; alreadyCheckedIn: boolean; }> {
  const db = getDb();
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);

  if (userSnap.exists()) {
    const userData = userSnap.data();
    if (userData.checkedInAt) {
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

    const checkedInTime = Timestamp.now();
    await updateDoc(userRef, { checkedInAt: checkedInTime });

    const updatedUserSnap = await getDoc(userRef);
    const updatedUserData = updatedUserSnap.data()!;

    return { 
      user: {
        ...updatedUserData,
        id: updatedUserSnap.id,
        createdAt: (updatedUserData.createdAt as Timestamp).toDate().toISOString(),
        checkedInAt: (updatedUserData.checkedInAt as Timestamp).toDate().toISOString(),
      } as User, 
      alreadyCheckedIn: false 
    };
  }

  return { user: null, alreadyCheckedIn: false };
}
