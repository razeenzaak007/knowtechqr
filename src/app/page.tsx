
import Header from '@/components/header';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { headers } from 'next/headers';

export default function Home() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const protocol = headersList.get('x-forwarded-proto') || 'http';
  const registerUrl = `${protocol}://${host}/register`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(registerUrl)}`;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex flex-col items-center justify-center text-center">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold tracking-tight font-headline">Registration QR Code</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Display this QR code. When scanned, it will lead to the user registration form.
          </p>

          <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg border w-full max-w-sm mx-auto min-h-[302px]">
            <Image
              src={qrCodeUrl}
              alt="Registration QR Code"
              width={250}
              height={250}
              className="rounded-lg shadow-md"
              unoptimized
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" >
               <a href={qrCodeUrl} download="registration-qrcode.png" target="_blank">
                Download QR Code
              </a>
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
