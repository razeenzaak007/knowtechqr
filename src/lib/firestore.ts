
import { 
  collection, 
  getDocs, 
  addDoc, 
  doc, 
  getDoc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import type { User } from './types';
import { adminDb } from '@/firebase/admin';

export async function getUsers(): Promise<User[]> {
  const usersCol = collection(adminDb, 'users');
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
  const usersCol = collection(adminDb, 'users');
  
  const newUserDoc = {
    ...user,
    createdAt: Timestamp.now(),
    checkedInAt: null,
  };

  const docRef = await addDoc(usersCol, newUserDoc);
  
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: docRef.id }))}`;

  await updateDoc(docRef, { qrCodeUrl });
  
  const docSnap = await getDoc(docRef);
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
  const usersCol = collection(adminDb, 'users');
  
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
    const docRef = await addDoc(usersCol, docData);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: docRef.id }))}`;
    return updateDoc(docRef, { qrCodeUrl });
  });

  await Promise.all(promises);
}

export async function checkInUser(userId: string): Promise<{ user: User | null; alreadyCheckedIn: boolean; }> {
  const userRef = doc(adminDb, 'users', userId);
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
