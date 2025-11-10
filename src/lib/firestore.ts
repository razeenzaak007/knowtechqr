
import type { User } from './types';
import { adminDb } from '@/firebase/admin';
import { Timestamp } from 'firebase-admin/firestore';

export async function getUsers(): Promise<User[]> {
  const usersCol = adminDb.collection('users');
  const userSnapshot = await usersCol.get();
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
  const usersCol = adminDb.collection('users');
  
  const newUserDoc = {
    ...user,
    createdAt: Timestamp.now(),
    checkedInAt: null,
  };

  const docRef = await usersCol.add(newUserDoc);
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: docRef.id }))}`;

  await docRef.update({ qrCodeUrl });
  
  const docSnap = await docRef.get();
  const data = docSnap.data();

  return {
    ...data,
    id: docRef.id,
    createdAt: (data?.createdAt as Timestamp).toDate().toISOString(),
    checkedInAt: null,
    qrCodeUrl,
  } as User;
}

export async function addUsers(users: Array<Partial<Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>>>): Promise<void> {
  const usersCol = adminDb.collection('users');
  const batch = adminDb.batch();

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
      qrCodeUrl: '',
    };
    const docRef = usersCol.doc(); // Create a reference first
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: docRef.id }))}`;
    
    batch.set(docRef, { ...docData, qrCodeUrl });
  });

  await Promise.all(promises); // Wait for all QR URLs to be determined
  await batch.commit(); // Commit the batch write
}

export async function checkInUser(userId: string): Promise<{ user: User | null; alreadyCheckedIn: boolean; }> {
  const userRef = adminDb.collection('users').doc(userId);
  const userSnap = await userRef.get();

  if (userSnap.exists) {
    const userData = userSnap.data()!;
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
    await userRef.update({ checkedInAt: checkedInTime });

    const updatedUserSnap = await userRef.get();
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
