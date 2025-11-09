import type { User } from './types';

// In a real application, this would be a database like Firestore.
// This is an-memory store that resets on server restart.
const users: User[] = [];

// Functions to interact with the mock data
export async function getUsers(): Promise<User[]> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function addUser(user: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>): Promise<User> {
    const newUser: User = {
        id: (Date.now() + Math.random()).toString(36),
        ...user,
        // This is a temporary placeholder URL.
        qrCodeUrl: '', 
        createdAt: new Date().toISOString(),
        checkedInAt: null,
    };
    
    // The qr code now contains the user object itself, for easier scanning
    newUser.qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify(newUser))}`;

    users.unshift(newUser);

    return newUser;
}

export async function checkInUser(userId: string): Promise<User | null> {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        const user = users[userIndex];
        if (!user.checkedInAt) { // Prevent multiple check-ins
            user.checkedInAt = new Date().toISOString();
        }
        return user; // Return user whether newly checked in or already was
    }
    return null; // User not found
}
