
'use client';

import { useState, useMemo, useRef } from 'react';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserTableActions } from '@/components/user-table-actions';
import { QrCodeDialog } from '@/components/qr-code-dialog';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine, Mail, Briefcase, Upload, Loader2, Phone, FileDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { addUsers, clearCheckIn } from '@/lib/firestore';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Skeleton } from './ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';


interface UserDashboardProps {
  initialUsers: User[]; // This will be empty, kept for prop consistency
}

function UserMobileCard({ user, onShowQr, onClearCheckIn }: { user: User; onShowQr: (user: User) => void; onClearCheckIn: (user: User) => void; }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{user.name}</CardTitle>
        <UserTableActions user={user} onShowQr={onShowQr} onClearCheckIn={onClearCheckIn} />
      </CardHeader>
      <CardContent className="space-y-3 pt-2">
        <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center"><Phone className="mr-2 h-4 w-4" /><span>{user.whatsappNumber}</span></div>
            <div className="flex items-center"><Mail className="mr-2 h-4 w-4" /><span>{user.email}</span></div>
            <div className="flex items-center"><Briefcase className="mr-2 h-4 w-4" /><span>{user.job}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}


function UserTable({
  users,
  isLoading,
  onShowQr,
  onClearCheckIn,
}: {
  users: User[];
  isLoading: boolean;
  onShowQr: (user: User) => void;
  onClearCheckIn: (user: User) => void;
}) {
  if (isLoading) {
    return <UserTableSkeleton />;
  }
  
  return (
    <>
    {/* Mobile View */}
    <div className="mt-4 space-y-4 md:hidden">
         {users.length > 0 ? (
            users.map((user) => <UserMobileCard key={user.id} user={user} onShowQr={onShowQr} onClearCheckIn={onClearCheckIn} />)
        ) : (
            <div className="text-center text-muted-foreground py-12">No users found.</div>
        )}
    </div>
    
    {/* Desktop View */}
    <div className="mt-4 rounded-lg border hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>WhatsApp Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.whatsappNumber}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>{user.job}</TableCell>
                  <TableCell className="text-right">
                    <UserTableActions user={user} onShowQr={onShowQr} onClearCheckIn={onClearCheckIn} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
    </div>
    </>
  );
}

function UserTableSkeleton() {
  return (
    <div className="mt-4 rounded-lg border">
      {/* Mobile Skeleton */}
      <div className="space-y-4 md:hidden p-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Desktop Skeleton */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>WhatsApp Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Job</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function UserDashboard({ initialUsers }: UserDashboardProps) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [userToClear, setUserToClear] = useState<User | null>(null);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const firestore = useFirestore();

  const usersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'users'), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: allUsers, isLoading } = useCollection<User>(usersQuery);

  const filteredUsers = useMemo(() => {
    if (!allUsers) return [];
    if (!search) return allUsers;
    const searchTerm = search.toLowerCase();
    return allUsers.filter(user =>
      (user.name || '').toLowerCase().includes(searchTerm) ||
      (user.email || '').toLowerCase().includes(searchTerm) ||
      (user.job || '').toLowerCase().includes(searchTerm) ||
      (user.area || '').toLowerCase().includes(searchTerm) ||
      (user.bloodGroup || '').toLowerCase().includes(searchTerm) ||
      (user.gender || '').toLowerCase().includes(searchTerm) ||
      (user.whatsappNumber || '').includes(searchTerm)
    );
  }, [search, allUsers]);

  const registeredUsers = useMemo(() => filteredUsers.filter(u => !u.checkedInAt), [filteredUsers]);
  const checkedInUsers = useMemo(() => filteredUsers.filter(u => u.checkedInAt), [filteredUsers]);

  const handleShowQr = (user: User) => {
    setSelectedUser(user);
    setIsQrDialogOpen(true);
  };

  const handleClearCheckInRequest = (user: User) => {
    setUserToClear(user);
  };
  
  const confirmClearCheckIn = async () => {
    if (!userToClear) return;
    try {
      await clearCheckIn(userToClear.id);
      toast({
        title: 'Check-in Cleared',
        description: `${userToClear.name}'s check-in status has been reset.`,
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to clear check-in status.',
      });
    } finally {
      setUserToClear(null);
    }
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1, 
            defval: null 
        });

        if (jsonData.length < 2) {
          throw new Error("Excel file has no data rows.");
        }

        const headers: string[] = (jsonData[0] as string[]).map(h => h ? String(h).trim() : '');
        
        const mappedData = (jsonData.slice(1) as any[][]).map((row: any[]) => {
          const rowData: {[key: string]: any} = {};
          headers.forEach((header, index) => {
             rowData[header] = row[index];
          });
          
          return {
            name: rowData['Full Name'] || null,
            age: rowData['Age'] ? Number(rowData['Age']) : null,
            bloodGroup: rowData['Blood Group'] || null,
            gender: rowData['Gender'] || null,
            job: rowData['Job'] || null,
            area: rowData['Area in Kuwait'] || null,
            whatsappNumber: String(rowData['Whatsapp Number'] || ''),
            email: rowData['Email address'] || null,
          };
        });

        await addUsers(mappedData);

        toast({
            title: "Import Successful",
            description: `${mappedData.length} users imported successfully.`,
        });
        
      } catch (error: any) {
        console.error("Error processing Excel file:", error);
        toast({
          variant: 'destructive',
          title: "Import Error",
          description: error.message || "An error occurred while processing the Excel file. Make sure it is a valid .xlsx or .xls file and the column headers are correct.",
        });
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };
    
    reader.onerror = () => {
        setIsImporting(false);
        toast({
            variant: 'destructive',
            title: "File Read Error",
            description: "Could not read the selected file.",
        });
    }

    reader.readAsArrayBuffer(file);
  };
  
  const handleExport = (users: User[], fileName: string) => {
    const worksheetData = users.map(user => ({
      'Full Name': user.name,
      'Age': user.age,
      'Blood Group': user.bloodGroup,
      'Gender': user.gender,
      'Job': user.job,
      'Area in Kuwait': user.area,
      'Whatsapp Number': user.whatsappNumber,
      'Email address': user.email,
      'Registered At': user.createdAt ? new Date(user.createdAt).toLocaleString() : '',
      'Checked In At': user.checkedInAt ? new Date(user.checkedInAt).toLocaleString() : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight font-headline">User Registrations</h1>
          <p className="text-muted-foreground">A list of all users who have registered and participated.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
             <Button onClick={handleImportClick} disabled={isImporting} className="flex-1 md:flex-initial">
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Import
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".xlsx, .xls"
            />
            <Button asChild className="flex-1 md:flex-initial">
                <Link href="/admin/scan">
                    <ScanLine className="mr-2 h-4 w-4" />
                    Scan QR
                </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 md:flex-initial">
                <Link href="/">
                    View QR
                </Link>
            </Button>
        </div>
      </div>
      
      <Tabs defaultValue="registered">
        <div className="flex flex-col sm:flex-row justify-between items-start flex-wrap gap-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="registered">Registered ({isLoading ? '...' : registeredUsers.length})</TabsTrigger>
                <TabsTrigger value="checked-in">Checked-in ({isLoading ? '...' : checkedInUsers.length})</TabsTrigger>
            </TabsList>
            <div className="w-full sm:w-auto sm:max-w-sm">
                <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
                />
            </div>
        </div>

        <TabsContent value="registered">
            <div className="bg-card p-0 sm:p-2 md:p-4 rounded-xl md:border md:shadow-sm">
                 <div className="flex justify-end mb-4">
                    <Button variant="outline" onClick={() => handleExport(registeredUsers, 'registered-users.xlsx')} disabled={registeredUsers.length === 0}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export to Excel
                    </Button>
                 </div>
                <UserTable users={registeredUsers} onShowQr={handleShowQr} onClearCheckIn={handleClearCheckInRequest} isLoading={isLoading} />
            </div>
        </TabsContent>
        <TabsContent value="checked-in">
            <div className="bg-card p-0 sm:p-2 md:p-4 rounded-xl md:border md:shadow-sm">
                <div className="flex justify-end mb-4">
                    <Button variant="outline" onClick={() => handleExport(checkedInUsers, 'checked-in-users.xlsx')} disabled={checkedInUsers.length === 0}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export to Excel
                    </Button>
                 </div>
                <UserTable users={checkedInUsers} onShowQr={handleShowQr} onClearCheckIn={handleClearCheckInRequest} isLoading={isLoading} />
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

      <AlertDialog open={!!userToClear} onOpenChange={(open) => !open && setUserToClear(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will clear the check-in for <span className="font-semibold">{userToClear?.name}</span>. They will be moved back to the 'Registered' list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToClear(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearCheckIn}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
