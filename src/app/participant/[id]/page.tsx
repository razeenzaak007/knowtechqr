'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import type { User } from '@/lib/types';
import { QrCodeDisplay } from '@/components/qr-code-display';
import { Skeleton } from '@/components/ui/skeleton';
import Header from '@/components/header';

function QrPageSkeleton() {
    return (
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-80" />
            <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border">
                <Skeleton className="h-[250px] w-[250px] rounded-lg" />
                <Skeleton className="mt-4 h-7 w-48" />
            </div>
            <Skeleton className="h-11 w-48" />
        </div>
    );
}


export default function ParticipantPage({ params }: { params: { id: string } }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firestore = useFirestore();

  useEffect(() => {
    if (!params.id || !firestore) return;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const userRef = doc(firestore, 'users', params.id);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
           setUser({
                ...userData,
                id: userSnap.id,
                // Ensure timestamps are converted to strings if they exist
                createdAt: userData.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : new Date().toISOString(),
                checkedInAt: userData.checkedInAt?.toDate ? userData.checkedInAt.toDate().toISOString() : null,
            } as User);
        } else {
          setError('Participant not found.');
        }
      } catch (err) {
        console.error("Error fetching participant:", err);
        setError('Could not retrieve participant details.');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params.id, firestore]);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-lg">
          {loading && <QrPageSkeleton />}
          {error && <div className="text-center text-destructive font-medium">{error}</div>}
          {user && !loading && !error && <QrCodeDisplay user={user} />}
        </div>
      </main>
    </div>
  );
}
