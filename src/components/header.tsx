import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold text-accent transition-opacity hover:opacity-80">
            <Image 
                src="https://i.imgur.com/kQYw8yV.png"
                alt="Knowtech Logo"
                width={36}
                height={36}
            />
            <span className="font-headline tracking-tight">Basic Life Support Training</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
