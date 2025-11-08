import { getUsers } from '@/lib/data';
import Header from '@/components/header';
import UserDashboard from '@/components/user-dashboard';

export default async function Home() {
  const users = await getUsers();

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <UserDashboard initialUsers={users} />
      </main>
    </div>
  );
}
