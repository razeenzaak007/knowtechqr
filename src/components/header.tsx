
import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold transition-opacity hover:opacity-80">
            <div className="relative h-10 w-24">
                <Image 
                    src="https://i.postimg.cc/RVpDWGv4/IMG-20251111-WA0000.jpg"
                    alt="Knowtech Logo"
                    fill
                    className="object-contain"
                />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">Basic Life Support Training</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
