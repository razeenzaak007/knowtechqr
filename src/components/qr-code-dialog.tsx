'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import type { User } from '@/lib/types';
import { Download } from 'lucide-react';

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>QR Code for {user.name}</DialogTitle>
          <DialogDescription>
            This is the user's unique QR code and registration details.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg border">
          <Image
            src={user.qrCodeUrl}
            alt={`QR Code for ${user.name}`}
            width={250}
            height={250}
            className="rounded-lg shadow-md"
            unoptimized // QR code API might not have cache headers
          />
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
        <DialogFooter className="sm:justify-between gap-2 flex-col-reverse sm:flex-row">
            <Button variant="outline" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button type="button" onClick={() => onOpenChange(false)}>
                Done
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
