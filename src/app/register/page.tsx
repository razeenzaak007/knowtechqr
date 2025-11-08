'use client';

import { useState, useTransition } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addUserAction } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import Header from '@/components/header';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Download } from 'lucide-react';

const UserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  class: z.string().min(3, { message: 'Class/Course must be at least 3 characters.' }),
});

type FormData = z.infer<typeof UserSchema>;

export default function RegisterPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] = useState<{
    submitted: boolean;
    qrCodeUrl?: string;
    userName?: string;
  }>({ submitted: false });

  const form = useForm<FormData>({
    resolver: zodResolver(UserSchema),
    defaultValues: { name: '', email: '', class: '' },
  });

  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('class', data.class);

    startTransition(async () => {
      const result = await addUserAction(null, formData);
      if (result && result.user) {
        setSubmissionState({ 
          submitted: true, 
          qrCodeUrl: result.user.qrCodeUrl, 
          userName: result.user.name 
        });
        form.reset();
      } else if (result && result.errors) {
        if (result.errors.name) form.setError('name', { type: 'server', message: result.errors.name[0] });
        if (result.errors.email) form.setError('email', { type: 'server', message: result.errors.email[0] });
        if (result.errors.class) form.setError('class', { type: 'server', message: result.errors.class[0] });
        
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: result.message,
        });
      }
    });
  };

  const handleDownload = () => {
    if (!submissionState.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = submissionState.qrCodeUrl;
    link.download = `qrcode-${submissionState.userName?.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>User Registration</CardTitle>
            <CardDescription>Fill out the form below to register. Your QR code will be generated upon submission.</CardDescription>
          </CardHeader>
          <CardContent>
            {submissionState.submitted ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                 <h2 className="text-2xl font-bold">Registration Successful!</h2>
                <p className="text-muted-foreground">
                  Here is your unique QR code for entry. Please save it.
                </p>
                {submissionState.qrCodeUrl && (
                  <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg border">
                    <Image
                      src={submissionState.qrCodeUrl}
                      alt={`QR Code for ${submissionState.userName}`}
                      width={250}
                      height={250}
                      className="rounded-lg shadow-md"
                      unoptimized
                    />
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleDownload} size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                  <Button onClick={() => setSubmissionState({ submitted: false })} variant="secondary" size="lg">
                    Register Another
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="e.g., jane.doe@example.com" type="email" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="e.g., Introduction to Art" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isPending} className="w-full">
                    {isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Register & Generate QR Code'
                    )}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
