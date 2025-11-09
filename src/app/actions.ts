
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addUser as dbAddUser, checkInUser as dbCheckInUser } from '@/lib/data';

const UserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().min(1, { message: 'Please enter a valid age.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }),
  gender: z.string({ required_error: 'Please select a gender.' }),
  job: z.string().min(2, { message: 'Job must be at least 2 characters.' }),
  area: z.string().min(2, { message: 'Area must be at least 2 characters.' }),
  whatsappNumber: z.string().min(8, { message: 'Please enter a valid WhatsApp number.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export type FormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    age?: string[];
    bloodGroup?: string[];
    gender?: string[];
    job?: string[];
    area?: string[];
    whatsappNumber?: string[];
  };
  user: Awaited<ReturnType<typeof dbAddUser>> | null;
} | null;


export async function addUserAction(prevState: FormState, formData: FormData) {
  const validatedFields = UserSchema.safeParse({
    name: formData.get('name'),
    age: formData.get('age'),
    bloodGroup: formData.get('bloodGroup'),
    gender: formData.get('gender'),
    job: formData.get('job'),
    area: formData.get('area'),
    whatsappNumber: formData.get('whatsappNumber'),
    email: formData.get('email'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation failed. Please correct the errors and try again.',
      user: null,
    };
  }

  try {
    const newUser = await dbAddUser(validatedFields.data);
    revalidatePath('/admin');
    return {
        message: 'User added successfully.',
        user: newUser,
        errors: {}
    };
  } catch (e) {
    console.error(e);
    return {
      message: 'An unexpected error occurred. Failed to add user.',
      user: null,
      errors: {}
    };
  }
}

export async function checkInUserAction(userId: string) {
  try {
    const checkedInUser = await dbCheckInUser(userId);
    if (checkedInUser) {
      revalidatePath('/admin');
      return { success: true, user: checkedInUser, message: `${checkedInUser.name} checked in successfully.` };
    }
    return { success: false, message: 'User not found.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred during check-in.' };
  }
}
