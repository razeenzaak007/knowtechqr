'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { User } from '@/lib/types';
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
      <path d="M14.05 14.05a2 2 0 0 1-2.83 0L9.8 12.62a2 2 0 0 1 0-2.83l1.42-1.42a2 2 0 0 1 2.83 0z" />
    </svg>
);


interface QrCodeDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrCodeDialog({ user, open, onOpenChange }: QrCodeDialogProps) {
  if (!user) return null;

  const handleDownload = () => {
    // This creates a link to download the QR code image from the external API.
    const link = document.createElement('a');
    link.href = user.qrCodeUrl;
    // The QR server doesn't set Content-Disposition, so we set download attribute.
    // This might open in a new tab instead of downloading directly based on browser settings.
    link.download = `qrcode-${user.name.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.target = '_blank'; // To avoid navigating away
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleSendWhatsApp = () => {
    if (!user) return;
    
    const message = `Hello ${user.name},\n\nHere are your registration details for the Basic Life Support Training event:\n\n*Name:* ${user.name}\n*Job:* ${user.job}\n*Area:* ${user.area}\n\nHere is your QR Code for event entry:\n${user.qrCodeUrl}\n\nPlease save it for the event day.`;

    const whatsappUrl = `https://wa.me/${user.whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Basic Life Support Training</DialogTitle>
          <DialogDescription>
            This is the participant's unique QR code for event entry.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border">
          <Image
            src={user.qrCodeUrl}
            alt={`QR Code for ${user.name}`}
            width={250}
            height={250}
            className="rounded-lg shadow-md"
            unoptimized // QR code API might not have cache headers
          />
           <p className="mt-4 text-lg font-semibold">{user.name}</p>
        </div>
        <div className="text-sm space-y-1 text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1">
            <p><span className="font-semibold text-foreground">Email:</span> {user.email}</p>
            <p><span className="font-semibold text-foreground">Job:</span> {user.job}</p>
            <p><span className="font-semibold text-foreground">Age:</span> {user.age}</p>
            <p><span className="font-semibold text-foreground">Gender:</span> {user.gender}</p>
            <p><span className="font-semibold text-foreground">Blood Group:</span> {user.bloodGroup}</p>
            <p><span className="font-semibold text-foreground">Area:</span> {user.area}</p>
            <p className="col-span-2"><span className="font-semibold text-foreground">WhatsApp:</span> {user.whatsappNumber}</p>
        </div>
        <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row">
            <div className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                 <Button variant="outline" onClick={handleSendWhatsApp} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800">
                    <WhatsAppIcon />
                    Send via WhatsApp
                </Button>
            </div>
            <Button type="button" onClick={() => onOpenChange(false)}>
                Done
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
