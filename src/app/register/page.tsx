'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addUserAction, type FormState } from '@/app/actions';
import { Loader2 } from 'lucide-react';
import Header from '@/components/header';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Download } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const UserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().min(1, { message: 'Please enter a valid age.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }).min(1, 'Blood group is required.'),
  gender: z.string({ required_error: 'Please select a gender.' }),
  job: z.string().min(2, { message: 'Job must be at least 2 characters.' }),
  area: z.string().min(2, { message: 'Area must be at least 2 characters.' }),
  whatsappNumber: z.string().min(8, { message: 'Please enter a valid WhatsApp number.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

type FormData = z.infer<typeof UserSchema>;

const initialState: FormState = {
  message: '',
  user: null,
  errors: {},
};

export default function RegisterPage() {
  const { toast } = useToast();
  const [state, formAction, isPending] = useActionState(addUserAction, initialState);
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(UserSchema),
    defaultValues: { name: '', email: '', whatsappNumber: '', area: '', job: '', age: 0 },
  });
  
  const onSubmit = (data: FormData) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
        const value = (data as any)[key];
        formData.append(key, value);
    });
    formAction(formData);
  };

  useEffect(() => {
    if (state.message) {
        if (state.user) {
            setSubmitted(true);
            form.reset();
        } else {
            toast({
                variant: "destructive",
                title: "Registration Failed",
                description: state.message,
            });
            if (state.errors) {
                Object.keys(state.errors).forEach((key) => {
                    const field = key as keyof FormData;
                    const message = state.errors?.[field]?.[0]
                    if (message) {
                        form.setError(field, { type: 'server', message });
                    }
                });
            }
        }
    }
  }, [state, form, toast]);

  const handleDownload = () => {
    if (!state.user?.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = state.user.qrCodeUrl;
    link.download = `qrcode-${state.user.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

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
            {submitted && state.user ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                 <h2 className="text-2xl font-bold">Registration Successful!</h2>
                <p className="text-muted-foreground">
                  Here is your unique QR code for entry. Please save it.
                </p>
                {state.user.qrCodeUrl && (
                  <div className="flex items-center justify-center p-6 bg-muted/50 rounded-lg border">
                    <Image
                      src={state.user.qrCodeUrl}
                      alt={`QR Code for ${state.user.name}`}
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
                  <Button onClick={() => setSubmitted(false)} variant="secondary" size="lg">
                    Register Another
                  </Button>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl><Input placeholder="e.g., Jane Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="age" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl><Input type="number" placeholder="e.g., 25" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="bloodGroup" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Blood Group</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a blood group" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                   <FormField control={form.control} name="gender" render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex flex-col space-y-1">
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="male" /></FormControl>
                            <FormLabel className="font-normal">Male</FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="female" /></FormControl>
                            <FormLabel className="font-normal">Female</FormLabel>
                          </FormItem>
                           <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl><RadioGroupItem value="other" /></FormControl>
                            <FormLabel className="font-normal">Other</FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                   <FormField control={form.control} name="job" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job</FormLabel>
                        <FormControl><Input placeholder="e.g., Software Engineer" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="area" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Area in Kuwait</FormLabel>
                        <FormControl><Input placeholder="e.g., Salmiya" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField control={form.control} name="whatsappNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number</FormLabel>
                        <FormControl><Input type="tel" placeholder="e.g., 99xxxxxx" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl><Input placeholder="e.g., jane.doe@example.com" type="email" {...field} /></FormControl>
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
