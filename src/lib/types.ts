
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
  createdAt: string; // Using string for easy serialization between server/client
  checkedInAt: string | null; // Can be a date string or null
}
