
'use client';

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import type { User } from '@/lib/types';
import { MoreHorizontal, QrCode, Eraser } from 'lucide-react';

interface UserTableActionsProps {
  user: User;
  onShowQr: (user: User) => void;
  onClearCheckIn: (user: User) => void;
}

export function UserTableActions({ user, onShowQr, onClearCheckIn }: UserTableActionsProps) {
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
