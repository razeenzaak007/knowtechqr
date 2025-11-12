'use client';

import Header from '@/components/header';
import Image from 'next/image';
import type { User } from '@/lib/types';
import { Button } from './ui/button';
import { Download } from 'lucide-react';

const WhatsAppIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="mr-2 h-4 w-4"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );

interface QrCodeDisplayProps {
  user: User;
}

export function QrCodeDisplay({ user }: QrCodeDisplayProps) {
  const handleDownload = () => {
    if (!user?.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = user.qrCodeUrl;
    link.download = `qrcode-${user.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendWhatsApp = () => {
    if (!user) return;

    const participantPageUrl = `${window.location.origin}/participant/${user.id}`;
    const venueUrl = "https://maps.app.goo.gl/1u39ZagstVPDZdXUA?g_st=ipc";

    const message = `Dear ${user.name},\n\nYour Registration for Basic Life Support (BLS) Training in connection with KnowTech 3.0 is Confirmed. You are requested to report at Venue by 1.30 pm and show the QR Code provided in the below link at Entrance.\n\n${participantPageUrl}\n\nVenue location: ${venueUrl}\n\nThank You\nKnowTech Drive, Kuwait`;

    const whatsappUrl = `https://wa.me/${user.whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
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
        <div className="flex flex-col gap-4 w-full max-w-xs">
            <Button onClick={handleDownload} size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download QR Code
            </Button>
            <Button onClick={handleSendWhatsApp} size="lg" variant="outline">
                <WhatsAppIcon />
                Send via WhatsApp
            </Button>
        </div>
      </div>
    </>
  );
}
