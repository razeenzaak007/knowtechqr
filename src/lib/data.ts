
import { promises as fs } from 'fs';
import path from 'path';
import type { User } from './types';

// The path to the JSON file
const dbPath = path.join(process.cwd(), 'src', 'lib', 'db.json');

// In-memory cache for the database to avoid reading the file on every request in a serverless environment.
// This is a simple cache, for a real app a more robust solution would be needed.
let dbCache: { users: User[] } | null = null;

async function readDb(): Promise<{ users: User[] }> {
  if (dbCache) {
    return dbCache;
  }
  try {
    const fileContent = await fs.readFile(dbPath, 'utf-8');
    dbCache = JSON.parse(fileContent);
    return dbCache!;
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, return empty state and don't cache
      return { users: [] };
    }
    console.error("Error reading database file:", error);
    throw error;
  }
}

async function writeDb(data: { users: User[] }): Promise<void> {
  // Sort users by creation date before writing
  data.users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  await fs.writeFile(dbPath, JSON.stringify(data, null, 2), 'utf-8');
  dbCache = data; // Update cache
}

export async function getUsers(): Promise<User[]> {
  const db = await readDb();
  return db.users;
}

export async function addUser(user: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>): Promise<User> {
  const db = await readDb();
  const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: newId }))}`;

  const newUser: User = {
    ...user,
    id: newId,
    createdAt: new Date().toISOString(),
    checkedInAt: null,
    qrCodeUrl: qrCodeUrl,
  };

  db.users.push(newUser);
  await writeDb(db);
  return newUser;
}


export async function addUsers(users: Array<Partial<Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>>>): Promise<void> {
    const db = await readDb();

    users.forEach(user => {
        const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(JSON.stringify({ id: newId }))}`;
        
        const newUser: User = {
            id: newId,
            createdAt: new Date().toISOString(),
            checkedInAt: null,
            qrCodeUrl: qrCodeUrl,
            name: user.name ?? 'N/A',
            age: user.age ?? 0,
            bloodGroup: user.bloodGroup ?? 'N/A',
            gender: user.gender ?? 'N/A',
            job: user.job ?? 'N/A',
            area: user.area ?? 'N/A',
            whatsappNumber: user.whatsappNumber ?? 'N/A',
            email: user.email ?? 'N/A',
        };
        db.users.push(newUser);
    });

    await writeDb(db);
}


export async function checkInUser(userId: string): Promise<{ user: User | null; alreadyCheckedIn: boolean; }> {
  const db = await readDb();
  const userIndex = db.users.findIndex(u => u.id === userId);

  if (userIndex !== -1) {
    const user = db.users[userIndex];
    if (user.checkedInAt) {
      return { user, alreadyCheckedIn: true };
    }

    const checkedInTime = new Date().toISOString();
    db.users[userIndex] = { ...user, checkedInAt: checkedInTime };
    await writeDb(db);
    return { user: db.users[userIndex], alreadyCheckedIn: false };
  }

  return { user: null, alreadyCheckedIn: false };
}
