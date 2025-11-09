'use client';

import { useState, useMemo } from 'react';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserTableActions } from '@/components/user-table-actions';
import { QrCodeDialog } from '@/components/qr-code-dialog';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface UserDashboardProps {
  initialUsers: User[];
}

function UserTable({
  users,
  onShowQr,
}: {
  users: User[];
  onShowQr: (user: User) => void;
}) {
  return (
    <div className="mt-4 rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead>Job</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead className="hidden md:table-cell text-right">Registered</TableHead>
            <TableHead><span className="sr-only">Actions</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">{user.email}</TableCell>
                <TableCell>{user.job}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {user.checkedInAt ? (
                    <Badge variant="secondary">Checked In</Badge>
                  ) : (
                    <Badge variant="outline">Registered</Badge>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-right text-muted-foreground">
                  {format(new Date(user.createdAt), 'MMM d, yyyy h:mm a')}
                </TableCell>
                <TableCell className="text-right">
                  <UserTableActions user={user} onShowQr={onShowQr} />
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                No users found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}


export default function UserDashboard({ initialUsers }: UserDashboardProps) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  
  const filteredUsers = useMemo(() => {
    if (!search) return initialUsers;
    const searchTerm = search.toLowerCase();
    return initialUsers.filter(user =>
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.job.toLowerCase().includes(searchTerm) ||
      user.area.toLowerCase().includes(searchTerm) ||
      user.bloodGroup.toLowerCase().includes(searchTerm) ||
      user.gender.toLowerCase().includes(searchTerm) ||
      user.whatsappNumber.includes(searchTerm)
    );
  }, [search, initialUsers]);

  const registeredUsers = useMemo(() => filteredUsers.filter(u => !u.checkedInAt), [filteredUsers]);
  const checkedInUsers = useMemo(() => filteredUsers.filter(u => u.checkedInAt), [filteredUsers]);

  const handleShowQr = (user: User) => {
    setSelectedUser(user);
    setIsQrDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">User Registrations</h1>
          <p className="text-muted-foreground">A list of all users who have registered and participated.</p>
        </div>
        <div className="flex gap-2">
            <Button asChild>
                <Link href="/admin/scan">
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan QR Code
                </Link>
            </Button>
            <Button asChild variant="outline">
                <Link href="/">
                    View QR Code
                </Link>
            </Button>
        </div>
      </div>
      
      <Tabs defaultValue="registered">
        <div className="flex justify-between items-center flex-wrap gap-4">
            <TabsList>
                <TabsTrigger value="registered">Registered ({registeredUsers.length})</TabsTrigger>
                <TabsTrigger value="checked-in">Checked-in ({checkedInUsers.length})</TabsTrigger>
            </TabsList>
            <div className="w-full sm:w-auto">
                <Input
                placeholder="Search by name, email, job, area..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:max-w-sm"
                />
            </div>
        </div>

        <TabsContent value="registered">
            <div className="bg-card p-4 sm:p-6 rounded-xl border shadow-sm">
                <UserTable users={registeredUsers} onShowQr={handleShowQr} />
            </div>
        </TabsContent>
        <TabsContent value="checked-in">
            <div className="bg-card p-4 sm:p-6 rounded-xl border shadow-sm">
                <UserTable users={checkedInUsers} onShowQr={handleShowQr} />
            </div>
        </TabsContent>

      </Tabs>


      {selectedUser && (
        <QrCodeDialog 
          user={selectedUser} 
          open={isQrDialogOpen} 
          onOpenChange={setIsQrDialogOpen} 
        />
      )}
    </div>
  );
}
