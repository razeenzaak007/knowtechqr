'use client';

import { useState, useTransition, useEffect } from 'react';
import { useFormState } from 'react-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { addUserAction, type FormState } from '@/app/actions';
import { UserPlus, Loader2 } from 'lucide-react';
import { QrCodeDialog } from './qr-code-dialog';
import type { User } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const UserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  class: z.string().min(3, { message: 'Class/Course must be at least 3 characters.' }),
});

export function AddUserSheet() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<User | null>(null);

  const [state, formAction] = useFormState(addUserAction, null);

  const form = useForm<z.infer<typeof UserSchema>>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: '',
      email: '',
      class: '',
    },
  });

  const onSubmit = (data: z.infer<typeof UserSchema>) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('class', data.class);
    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (!state) return;

    if (state.user) {
        setIsSheetOpen(false);
        setNewUser(state.user);
        setIsQrDialogOpen(true);
        form.reset();
    } else if (state.errors) {
      if (state.errors.name) form.setError('name', { type: 'server', message: state.errors.name[0] });
      if (state.errors.email) form.setError('email', { type: 'server', message: state.errors.email[0] });
      if (state.errors.class) form.setError('class', { type: 'server', message: state.errors.class[0] });
      
      toast({
          variant: "destructive",
          title: "Registration Failed",
          description: state.message,
      });
    }
  }, [state, form, toast]);

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={(open) => {
        setIsSheetOpen(open);
        if (!open) {
          form.clearErrors();
        }
      }}>
        <SheetTrigger asChild>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Register New User</SheetTitle>
            <SheetDescription>
              Fill in the details below to generate a new QR code enrollment.
            </SheetDescription>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
              <div className="space-y-6 py-6 flex-1">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Jane Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., jane.doe@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="class"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class / Course</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Introduction to Art" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <SheetFooter>
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={isPending} className="w-40">
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate QR Code'
                  )}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        </SheetContent>
      </Sheet>
      
      {newUser && (
        <QrCodeDialog 
          user={newUser} 
          open={isQrDialogOpen} 
          onOpenChange={setIsQrDialogOpen} 
        />
      )}
    </>
  );
}
