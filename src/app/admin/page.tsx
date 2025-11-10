
import Header from '@/components/header';
import UserDashboard from '@/components/user-dashboard';
// We will now fetch initial data on the client in UserDashboard

export default function AdminPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        {/* Pass an empty array initially, data will be loaded client-side */}
        <UserDashboard initialUsers={[]} />
      </main>
    </div>
  );
}
