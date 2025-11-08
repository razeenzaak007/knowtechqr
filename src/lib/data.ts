import type { User } from './types';

// In a real application, this would be a database like Firestore.
// This is an in-memory store that resets on server restart.
const users: User[] = [];

// Functions to interact with the mock data
export async function getUsers(): Promise<User[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addUser(user: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl'>): Promise<User> {
    const userDataForQr = {
        name: user.name,
        email: user.email,
        class: user.class,
    };
    const newUser: User = {
        id: (Date.now() + Math.random()).toString(36),
        ...user,
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify(userDataForQr))}`,
        createdAt: new Date().toISOString(),
    };
    users.unshift(newUser);
    return newUser;
}
