'use client';

import Header from '@/components/header';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  const registerUrl = typeof window !== 'undefined' ? `${window.location.origin}/register` : '';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registerUrl)}`;

  const handleDownload = () => {
    if (!registerUrl) return;
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `registration-qrcode.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex flex-col items-center justify-center text-center">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Registration QR Code</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Display or download this QR code. When scanned, it will lead to the user registration form.
          </p>

          {registerUrl && (
            <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg border w-full max-w-sm mx-auto">
                <Image
                  src={qrCodeUrl}
                  alt="Registration QR Code"
                  width={250}
                  height={250}
                  className="rounded-lg shadow-md"
                  unoptimized
                />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={handleDownload} size="lg">
              Download QR Code
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/admin">
                View Registered Users
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
