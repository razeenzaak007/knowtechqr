'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/types';
import { MoreHorizontal, QrCode, Eraser } from 'lucide-react';

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


interface UserTableActionsProps {
  user: User;
  onShowQr: (user: User) => void;
  onClearCheckIn: (user: User) => void;
}

export function UserTableActions({ user, onShowQr, onClearCheckIn }: UserTableActionsProps) {

  const handleSendWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent dropdown from closing if needed
    if (!user) return;

    // The link to the user's personal QR code page
    const participantPageUrl = `${window.location.origin}/participant/${user.id}`;
    const venueUrl = "https://maps.app.goo.gl/1u39ZagstVPDZdXUA?g_st=ipc";

    const message = `Dear ${user.name},\n\nYour Registration for Basic Life Support (BLS) Training in connection with KnowTech 3.0 is Confirmed. You are requested to report at Venue by 1.30 pm and show the QR Code provided in the below link at Entrance.\n\n${participantPageUrl}\n\nVenue location: ${venueUrl}\n\nThank You\nKnowTech Drive, Kuwait`;

    const whatsappUrl = `https://wa.me/${user.whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu for {user.name}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{user.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onShowQr(user)}>
          <QrCode className="mr-2 h-4 w-4" />
          View QR Code
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSendWhatsApp}>
          <WhatsAppIcon />
          Send via WhatsApp
        </DropdownMenuItem>
        {user.checkedInAt && (
          <DropdownMenuItem onClick={() => onClearCheckIn(user)} className="text-destructive focus:text-destructive">
            <Eraser className="mr-2 h-4 w-4" />
            Clear Check-in
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
