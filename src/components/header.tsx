import { QrCode } from 'lucide-react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-primary transition-opacity hover:opacity-80">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
                <QrCode className="h-6 w-6" />
            </div>
            <span className="font-headline tracking-tight">QR Enrollment</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
