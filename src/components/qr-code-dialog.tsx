
'use client';

import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { User } from '@/lib/types';
import { QrCodeDisplay } from './qr-code-display';

interface QrCodeDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QrCodeDialog({ user, open, onOpenChange }: QrCodeDialogProps) {
  if (!user) return null;

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
            <Button type="button" onClick={() => onOpenChange(false)}>
              Done
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
