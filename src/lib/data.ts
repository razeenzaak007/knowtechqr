
import fs from 'fs/promises';
import path from 'path';
import type { User } from './types';

// Path to the JSON file that will act as our database
const DB_PATH = path.join(process.cwd(), 'src', 'lib', 'db.json');

// Type guard for our database structure
type Database = {
  users: User[];
};

// Function to read the database file
async function readDB(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    const db = JSON.parse(data) as Database;
    // Basic validation to ensure the 'users' array exists
    if (!Array.isArray(db.users)) {
        return { users: [] };
    }
    return db;
  } catch (error) {
    // If the file doesn't exist or is empty/corrupt, return a default structure
    return { users: [] };
  }
}

// Function to write to the database file
async function writeDB(db: Database): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');
}


export async function getUsers(): Promise<User[]> {
  try {
    const db = await readDB();
    // Sort users by creation date, descending (newest first)
    return db.users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching users:", error);
    throw new Error('Failed to fetch users from the database.');
  }
}

export async function addUser(user: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'>): Promise<User> {
    try {
        const db = await readDB();
        
        // Generate a unique ID and QR code URL
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
        await writeDB(db);
        
        return newUser;
    } catch (error) {
        console.error("Error adding user:", error);
        throw new Error('Could not save user to the database. Please try again.');
    }
}

export async function checkInUser(userId: string): Promise<{ user: User | null; alreadyCheckedIn: boolean; }> {
    try {
        const db = await readDB();
        const userIndex = db.users.findIndex(u => u.id === userId);

        if (userIndex > -1) {
            const user = db.users[userIndex];
            
            if (user.checkedInAt) {
                 // User is already checked in
                return { user, alreadyCheckedIn: true };
            }

            // User is not checked in, so check them in now
            user.checkedInAt = new Date().toISOString();
            await writeDB(db);
            return { user, alreadyCheckedIn: false };
        }
        
        return { user: null, alreadyCheckedIn: false }; // User not found
    } catch (error) {
        console.error("Error checking in user:", error);
        throw new Error('Could not check in user. Please try again.');
    }
}
