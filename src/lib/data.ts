
import 'dotenv/config';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
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
    // Propagate the error for the UI to handle if needed
    throw new Error('Failed to fetch users from the database.');
  }
}

export async function addUser(user: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>): Promise<User> {
    try {
        const newUserPayload = {
            ...user,
            createdAt: Timestamp.now(),
            checkedInAt: null,
            qrCodeUrl: '', // Start with an empty qrCodeUrl
        };
        
        const docRef = await addDoc(collection(db, "users"), newUserPayload);
        
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: docRef.id }))}`;

        // Now, update the document with the generated QR code URL.
        await updateDoc(doc(db, "users", docRef.id), {
          qrCodeUrl: qrCodeUrl,
        });
        
        // Fetch the complete document from Firestore to ensure all data is consistent
        const newUserDoc = await getDoc(doc(db, 'users', docRef.id));
        const newUserData = newUserDoc.data();

        if (!newUserData) {
            throw new Error("Failed to retrieve newly created user.");
        }
        
        const newUser: User = {
            id: newUserDoc.id,
            ...newUserData,
            createdAt: (newUserData.createdAt as Timestamp).toDate().toISOString(),
            checkedInAt: newUserData.checkedInAt ? (newUserData.checkedInAt as Timestamp).toDate().toISOString() : null,
        } as User;
        
        return newUser;
    } catch (error) {
        console.error("Error adding user:", error);
        // This will be caught by the server action and displayed to the user.
        throw new Error('Could not save user to the database. Please try again.');
    }
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
            if (!updatedData) {
                return null;
            }
            return {
                id: updatedUserDoc.id,
                ...updatedData,
                 createdAt: (updatedData.createdAt as Timestamp).toDate().toISOString(),
                 checkedInAt: updatedData.checkedInAt ? (updatedData.checkedInAt as Timestamp).toDate().toISOString() : null,
            } as User;
        }
        return null; // User not found
    } catch (error) {
        console.error("Error checking in user:", error);
        throw new Error('Could not check in user. Please try again.');
    }
}
