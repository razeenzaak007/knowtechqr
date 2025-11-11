
'use client';

import React, { useState, useEffect, useRef, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { addUser } from '@/lib/firestore';
import type { User } from '@/lib/types';
import { Loader2, Download } from 'lucide-react';
import Header from '@/components/header';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const { toast } = useToast();
  const [submittedUser, setSubmittedUser] = useState<User | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formRef = useRef<HTMLFormElement>(null);
  const [formKey, setFormKey] = useState(Date.now().toString());

  const handleDownload = () => {
    if (!submittedUser?.qrCodeUrl) return;
    const link = document.createElement('a');
    link.href = submittedUser.qrCodeUrl;
    link.download = `qrcode-${submittedUser.name?.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleRegisterAnother = () => {
    setSubmittedUser(null);
    setErrors({});
    setFormKey(Date.now().toString()); // Reset the form
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsPending(true);
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;

    // Basic validation
    const newErrors: Record<string, string> = {};
    if (!data.name) newErrors.name = 'Full Name is required.';
    if (!data.age) newErrors.age = 'Age is required.';
    if (!data.bloodGroup) newErrors.bloodGroup = 'Blood Group is required.';
    if (!data.gender) newErrors.gender = 'Gender is required.';
    if (!data.job) newErrors.job = 'Job is required.';
    if (!data.area) newErrors.area = 'Area is required.';
    if (!data.whatsappNumber) newErrors.whatsappNumber = 'WhatsApp Number is required.';
    if (!data.email) newErrors.email = 'Email is required.';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsPending(false);
      return;
    }

    try {
        const newUser: Omit<User, 'id' | 'createdAt' | 'qrCodeUrl' | 'checkedInAt'> = {
            name: data.name,
            age: Number(data.age),
            bloodGroup: data.bloodGroup,
            gender: data.gender,
            job: data.job,
            area: data.area,
            whatsappNumber: data.whatsappNumber,
            email: data.email,
        };

      const registeredUser = await addUser(newUser);
      setSubmittedUser(registeredUser);
      toast({
        title: "Registration Successful!",
        description: "Your QR code has been generated.",
      });
      formRef.current?.reset();
    } catch (e: any) {
      console.error("Registration failed:", e);
      setErrors({ _form: e.message || "An unknown error occurred during registration." });
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: e.message || "Could not save user data. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
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
            {submittedUser ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-8">
                 <h2 className="text-2xl font-bold">Basic Life Support Training</h2>
                <p className="text-muted-foreground">
                  Here is your unique QR code for entry. Please save it.
                </p>
                {submittedUser.qrCodeUrl && (
                  <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-lg border">
                    <Image
                      src={submittedUser.qrCodeUrl}
                      alt={`QR Code for ${submittedUser.name}`}
                      width={250}
                      height={250}
                      className="rounded-lg shadow-md"
                      unoptimized
                    />
                    <p className="mt-4 text-lg font-semibold">{submittedUser.name}</p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={handleDownload} size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>
                  <Button onClick={handleRegisterAnother} variant="secondary" size="lg">
                    Register Another
                  </Button>
                </div>
              </div>
            ) : (
                <form 
                  key={formKey}
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" placeholder="e.g., Jane Doe" required />
                        {errors?.name && <p className="text-sm font-medium text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" name="age" type="number" placeholder="e.g., 25" required />
                        {errors?.age && <p className="text-sm font-medium text-destructive">{errors.age}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label>Blood Group</Label>
                        <Select name="bloodGroup" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a blood group" />
                            </SelectTrigger>
                            <SelectContent>
                            {bloodGroups.map(group => <SelectItem key={group} value={group}>{group}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        {errors?.bloodGroup && <p className="text-sm font-medium text-destructive">{errors.bloodGroup}</p>}
                    </div>

                    <div className="space-y-3">
                      <Label>Gender</Label>
                      <RadioGroup name="gender" className="flex space-x-4">
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="male" id="male" />
                            <Label htmlFor="male" className="font-normal">Male</Label>
                          </div>
                          <div className="flex items-center space-x-3 space-y-0">
                            <RadioGroupItem value="female" id="female" />
                            <Label htmlFor="female" className="font-normal">Female</Label>
                          </div>
                      </RadioGroup>
                      {errors?.gender && <p className="text-sm font-medium text-destructive">{errors.gender}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="job">Job</Label>
                        <Input id="job" name="job" placeholder="e.g., Software Engineer" required />
                         {errors?.job && <p className="text-sm font-medium text-destructive">{errors.job}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="area">Area in Kuwait</Label>
                        <Input id="area" name="area" placeholder="e.g., Salmiya" required />
                        {errors?.area && <p className="text-sm font-medium text-destructive">{errors.area}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                        <Input id="whatsappNumber" name="whatsappNumber" type="tel" placeholder="e.g., 99xxxxxx" required />
                        {errors?.whatsappNumber && <p className="text-sm font-medium text-destructive">{errors.whatsappNumber}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" name="email" placeholder="e.g., jane.doe@example.com" type="email" required />
                        {errors?.email && <p className="text-sm font-medium text-destructive">{errors.email}</p>}
                    </div>
                    
                    {errors?._form && (
                        <p className="text-sm font-medium text-destructive">{errors._form}</p>
                    )}

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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
