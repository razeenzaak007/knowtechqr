
'use client';

import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { QrCodeDisplay } from './qr-code-display';
import { Download, MessageCircle } from 'lucide-react';

interface QrCodeDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrCodeDialog({ user, open, onOpenChange }: QrCodeDialogProps) {
  if (!user) return null;

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
    const participantUrl = `${window.location.origin}/participant/${user.id}`;
    const venueUrl = "https://maps.app.goo.gl/1u39ZagstVPDZdXUA?g_st=ipc";

    const message = `Dear ${user.name},\n\nYour Registration for Basic Life Support (BLS) Training in connection with KnowTech 3.0 is Confirmed. You are requested to report at Venue by 1.30 pm and show the QR Code provided in the below link at Entrance.\n\n${participantUrl}\n\nVenue location: ${venueUrl}\n\nThank You\nKnowTech Drive, Kuwait`;

    const whatsappUrl = `https://wa.me/${user.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-0">
        <div className="p-6 pt-0">
          <QrCodeDisplay user={user} />
          <div className="text-sm space-y-1 text-muted-foreground grid grid-cols-2 gap-x-4 gap-y-1 mb-6">
              <p><span className="font-semibold text-foreground">Email:</span> {user.email}</p>
              <p><span className="font-semibold text-foreground">Job:</span> {user.job}</p>
              <p><span className="font-semibold text-foreground">Age:</span> {user.age}</p>
              <p><span className="font-semibold text-foreground">Gender:</span> {user.gender}</p>
              <p><span className="font-semibold text-foreground">Blood Group:</span> {user.bloodGroup}</p>
              <p><span className="font-semibold text-foreground">Area:</span> {user.area}</p>
              <p className="col-span-2"><span className="font-semibold text-foreground">WhatsApp:</span> {user.whatsappNumber}</p>
          </div>
          <DialogFooter className="sm:justify-end gap-2 flex-col sm:flex-row">
             <Button type="button" variant="outline" onClick={handleDownload}>
                <Download className="mr-2" />
                Download
            </Button>
            <Button type="button" onClick={handleSendWhatsApp}>
                <MessageCircle className="mr-2" />
                Send via WhatsApp
            </Button>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
