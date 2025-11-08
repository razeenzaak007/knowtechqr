'use client';

import { useState, useMemo } from 'react';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AddUserSheet } from '@/components/add-user-sheet';
import { UserTableActions } from '@/components/user-table-actions';
import { QrCodeDialog } from '@/components/qr-code-dialog';
import { format } from 'date-fns';

interface UserDashboardProps {
  initialUsers: User[];
}

export default function UserDashboard({ initialUsers: users }: UserDashboardProps) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(user =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.class.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, users]);

  const handleShowQr = (user: User) => {
    setSelectedUser(user);
    setIsQrDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">User Registrations</h1>
          <p className="text-muted-foreground">Manage and create new user enrollments.</p>
        </div>
        <AddUserSheet />
      </div>
      
      <div className="bg-card p-4 sm:p-6 rounded-xl border shadow-sm">
        <div className="flex items-center justify-between">
            <Input
              placeholder="Search by name, email, or class..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
        </div>
        <div className="mt-4 rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="hidden md:table-cell text-right">Registered On</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">{user.email}</TableCell>
                    <TableCell>{user.class}</TableCell>
                    <TableCell className="hidden md:table-cell text-right text-muted-foreground">
                      {format(new Date(user.createdAt), 'MMM d, yyyy h:mm a')}
                    </TableCell>
                    <TableCell className="text-right">
                      <UserTableActions user={user} onShowQr={handleShowQr} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                    No users found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

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
