
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config'; // I'll create this file
import type { User } from './types';

// Functions to interact with the Firestore 'users' collection
export async function getUsers(): Promise<User[]> {
  try {
    const usersCol = collection(db, 'users');
    const q = query(usersCol, orderBy('createdAt', 'desc'));
    const userSnapshot = await getDocs(q);
    const userList = userSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            ...data,
            createdAt: (data.createdAt as Timestamp).toDate().toISOString(),
             checkedInAt: data.checkedInAt ? (data.checkedInAt as Timestamp).toDate().toISOString() : null,
        } as User;
    });
    return userList;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function addUser(user: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>): Promise<User> {
    const newUserPayload = {
        ...user,
        createdAt: Timestamp.now(),
        checkedInAt: null,
    };
    
    const docRef = await addDoc(collection(db, "users"), newUserPayload);
    
    const newUser: User = {
        id: docRef.id,
        ...user,
        qrCodeUrl: '',
        createdAt: newUserPayload.createdAt.toDate().toISOString(),
        checkedInAt: null,
    };

    // The qr code now contains the user object itself, for easier scanning
    newUser.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: newUser.id }))}`;

    // We need to update the doc with the QR code URL.
    await updateDoc(doc(db, "users", newUser.id), {
      qrCodeUrl: newUser.qrCodeUrl,
    });
    
    return newUser;
}

export async function checkInUser(userId: string): Promise<User | null> {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            if (!userData.checkedInAt) { // Prevent multiple check-ins
                await updateDoc(userRef, {
                    checkedInAt: Timestamp.now()
                });
            }
            // Refetch to get the updated document
            const updatedUserDoc = await getDoc(userRef);
            const updatedData = updatedUserDoc.data();
            return {
                id: updatedUserDoc.id,
                ...updatedData,
                 createdAt: (updatedData!.createdAt as Timestamp).toDate().toISOString(),
                 checkedInAt: updatedData!.checkedInAt ? (updatedData!.checkedInAt as Timestamp).toDate().toISOString() : null,
            } as User;
        }
        return null; // User not found
    } catch (error) {
        console.error("Error checking in user:", error);
        return null;
    }
}
