
'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import type { User } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserTableActions } from '@/components/user-table-actions';
import { QrCodeDialog } from '@/components/qr-code-dialog';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScanLine, Mail, Briefcase, MapPin, Droplets, User as UserIcon, Upload, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { importUsersAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

// New component to safely render dates on the client
function ClientFormattedDate({ date, formatString }: { date: string | null | undefined; formatString: string; }) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted || !date) {
        // Render a placeholder or nothing on the server and initial client render
        return null; 
    }

    try {
        return <span>{format(new Date(date), formatString)}</span>;
    } catch (e) {
        return null;
    }
}


interface UserDashboardProps {
  initialUsers: User[];
}

function UserMobileCard({ user, onShowQr }: { user: User; onShowQr: (user: User) => void; }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base font-medium">{user.name}</CardTitle>
        <UserTableActions user={user} onShowQr={onShowQr} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground space-y-2">
            <div className="flex items-center"><Mail className="mr-2 h-4 w-4" /><span>{user.email}</span></div>
            <div className="flex items-center"><Briefcase className="mr-2 h-4 w-4" /><span>{user.job}</span></div>
            <div className="flex items-center"><MapPin className="mr-2 h-4 w-4" /><span>{user.area}</span></div>
            <div className="flex items-center"><Droplets className="mr-2 h-4 w-4" /><span>{user.bloodGroup}</span></div>
            <div className="flex items-center capitalize"><UserIcon className="mr-2 h-4 w-4" /><span>{user.gender}</span></div>
        </div>
         <div className="flex items-center justify-between pt-2 border-t">
          <div>
            {user.checkedInAt ? (
              <Badge variant="secondary">Checked In</Badge>
            ) : (
              <Badge variant="outline">Registered</Badge>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
             <ClientFormattedDate date={user.checkedInAt ?? user.createdAt} formatString="MMM d, h:mm a" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function UserTable({
  users,
  onShowQr,
}: {
  users: User[];
  onShowQr: (user: User) => void;
}) {
  return (
    <>
    {/* Mobile View */}
    <div className="mt-4 space-y-4 md:hidden">
         {users.length > 0 ? (
            users.map((user) => <UserMobileCard key={user.id} user={user} onShowQr={onShowQr} />)
        ) : (
            <div className="text-center text-muted-foreground py-12">No users found.</div>
        )}
    </div>
    
    {/* Desktop View */}
    <div className="mt-4 rounded-lg border hidden md:block">
      <TooltipProvider>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Email</TableHead>
              <TableHead className="hidden lg:table-cell">Job</TableHead>
              <TableHead className="hidden lg:table-cell">Area</TableHead>
              <TableHead className="hidden xl:table-cell">Blood Group</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right hidden sm:table-cell">Registered</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length > 0 ? (
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{user.email}</TableCell>
                  <TableCell className="hidden lg:table-cell">{user.job}</TableCell>
                  <TableCell className="hidden lg:table-cell">{user.area}</TableCell>
                  <TableCell className="hidden xl:table-cell">{user.bloodGroup}</TableCell>
                  <TableCell>
                    {user.checkedInAt ? (
                       <Tooltip>
                        <TooltipTrigger>
                           <Badge variant="secondary">Checked In</Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <ClientFormattedDate date={user.checkedInAt} formatString='MMM d, yyyy h:mm a' />
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <Badge variant="outline">Registered</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground hidden sm:table-cell">
                    <Tooltip>
                      <TooltipTrigger>
                         <ClientFormattedDate date={user.createdAt} formatString='MMM d, yyyy' />
                      </TooltipTrigger>
                      <TooltipContent>
                        <ClientFormattedDate date={user.createdAt} formatString='MMM d, yyyy h:mm a' />
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-right">
                    <UserTableActions user={user} onShowQr={onShowQr} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center h-24 text-muted-foreground">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TooltipProvider>
    </div>
    </>
  );
}


export default function UserDashboard({ initialUsers }: UserDashboardProps) {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
            defval: undefined
        });

        // Map Excel columns to the expected schema properties
        const mappedData = jsonData.map((row: any) => ({
          name: row['Full Name'],
          age: row['Age'],
          bloodGroup: row['Blood Group'],
          gender: row['Gender'],
          job: row['Job'],
          area: row['Area in Kuwait'],
          whatsappNumber: String(row['Whatsapp Number'] ?? ''),
          email: row['Email address'],
        }));


        const result = await importUsersAction(mappedData);

        if (result.success) {
          toast({
            title: "Import Successful",
            description: result.message,
          });
        } else {
          toast({
            variant: 'destructive',
            title: "Import Failed",
            description: result.message,
          });
        }
      } catch (error) {
        console.error("Error processing Excel file:", error);
        toast({
          variant: 'destructive',
          title: "Import Error",
          description: "An error occurred while processing the Excel file. Make sure it is a valid .xlsx or .xls file and the column headers are correct.",
        });
      } finally {
        setIsImporting(false);
        // Reset file input so the same file can be selected again
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
              accept=".xlsx, .xls, .csv"
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
        <div className="flex flex-col sm:flex-row justify-between items-center flex-wrap gap-4">
            <TabsList className="grid w-full grid-cols-2 sm:w-auto">
                <TabsTrigger value="registered">Registered ({registeredUsers.length})</TabsTrigger>
                <TabsTrigger value="checked-in">Checked-in ({checkedInUsers.length})</TabsTrigger>
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
                <UserTable users={registeredUsers} onShowQr={handleShowQr} />
            </div>
        </TabsContent>
        <TabsContent value="checked-in">
            <div className="bg-card p-0 sm:p-2 md:p-4 rounded-xl md:border md:shadow-sm">
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
