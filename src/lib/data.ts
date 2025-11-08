import type { User } from './types';

// In a real application, this would be a database like Firestore.
// This is an in-memory store that resets on server restart.
const users: User[] = [
  {
    id: '1',
    name: 'Alice Johnson',
    email: 'alice.j@example.com',
    class: 'Mathematics 101',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=%7B%22name%22%3A%22Alice%20Johnson%22%2C%22email%22%3A%22alice.j%40example.com%22%2C%22class%22%3A%22Mathematics%20101%22%7D',
    createdAt: new Date('2023-10-01T10:00:00Z').toISOString(),
  },
  {
    id: '2',
    name: 'Bob Williams',
    email: 'bob.w@example.com',
    class: 'History of Art',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=%7B%22name%22%3A%22Bob%20Williams%22%2C%22email%22%3A%22bob.w%40example.com%22%2C%22class%22%3A%22History%20of%20Art%22%7D',
    createdAt: new Date('2023-10-02T11:30:00Z').toISOString(),
  },
  {
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie.b@example.com',
    class: 'Physics 202',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=%7B%22name%22%3A%22Charlie%20Brown%22%2C%22email%22%3A%22charlie.b%40example.com%22%2C%22class%22%3A%22Physics%20202%22%7D',
    createdAt: new Date('2023-10-03T14:15:00Z').toISOString(),
  },
   {
    id: '4',
    name: 'Diana Prince',
    email: 'diana.p@example.com',
    class: 'Ancient Civilizations',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=%7B%22name%22%3A%22Diana%20Prince%22%2C%22email%22%3A%22diana.p%40example.com%22%2C%22class%22%3A%22Ancient%20Civilizations%22%7D',
    createdAt: new Date('2023-10-04T09:00:00Z').toISOString(),
  },
];

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
