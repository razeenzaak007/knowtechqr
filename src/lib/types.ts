export interface User {
  id: string;
  name: string;
  email: string;
  class: string;
  qrCodeUrl: string;
  createdAt: string; // Using string for easy serialization between server/client
}
