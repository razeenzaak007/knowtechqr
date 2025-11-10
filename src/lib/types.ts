
import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  name: string;
  age: number;
  bloodGroup: string;
  gender: string;
  job: string;
  area: string;
  whatsappNumber: string;
  email: string;
  qrCodeUrl: string;
  createdAt: string | Timestamp; // Allow both for client/server
  checkedInAt: string | Timestamp | null; // Allow both for client/server
}
