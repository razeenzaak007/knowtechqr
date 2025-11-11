'use client';

import Header from '@/components/header';
import Image from 'next/image';
import type { User } from '@/lib/types';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

interface QrCodeDisplayProps {
  user: User;
}

export function QrCodeDisplay({ user }: QrCodeDisplayProps) {
  const handleDownload = () => {
    if (!user?.qrCodeUrl) return;
    const link = document.createElement('a');
    // The user.qrCodeUrl from firestore is already a full URL to the image generator
    link.href = user.qrCodeUrl;
    link.download = `qrcode-${user.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <Header />
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
        <h2 className="text-2xl font-bold">Basic Life Support Training</h2>
        <p className="text-muted-foreground">
          Here is your unique QR code for entry. Please save it.
        </p>
        {user.qrCodeUrl && (
          <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border">
            <Image
              src={user.qrCodeUrl}
              alt={`QR Code for ${user.name}`}
              width={250}
              height={250}
              className="rounded-lg shadow-md"
              unoptimized
            />
            <p className="mt-4 text-lg font-semibold">{user.name}</p>
          </div>
        )}
        <Button onClick={handleDownload} size="lg">
          <Download className="mr-2 h-4 w-4" />
          Download QR Code
        </Button>
      </div>
    </>
  );
}
