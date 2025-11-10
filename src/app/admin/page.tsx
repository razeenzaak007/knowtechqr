'use client';
import Header from '@/components/header';
import UserDashboard from '@/components/user-dashboard';

export default function AdminPage() {
  // The user data will now be fetched in UserDashboard using hooks
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <UserDashboard />
      </main>
    </div>
  );
}
