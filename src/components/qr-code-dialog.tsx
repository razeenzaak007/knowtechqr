'use client';

import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { QrCodeDisplay } from './qr-code-display';

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

interface QrCodeDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrCodeDialog({ user, open, onOpenChange }: QrCodeDialogProps) {
  if (!user) return null;

  const handleSendWhatsApp = () => {
    if (!user) return;

    // The link to the user's personal QR code page
    const participantPageUrl = `${window.location.origin}/participant/${user.id}`;
    const venueUrl = "https://maps.app.goo.gl/1u39ZagstVPDZdXUA?g_st=ipc";

    const message = `Dear ${user.name},\n\nYour Registration for Basic Life Support (BLS) Training in connection with KnowTech 3.0 is Confirmed. You are requested to report at Venue by 1.30 pm and show the QR Code provided in the below link at Entrance.\n\n${participantPageUrl}\n\nVenue location: ${venueUrl}\n\nThank You\nKnowTech Drive, Kuwait`;

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
          <DialogFooter className="sm:justify-between gap-2 flex-col sm:flex-row">
            <Button variant="outline" onClick={handleSendWhatsApp} className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800">
              <WhatsAppIcon />
              Send via WhatsApp
            </Button>
            <Button type="button" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
