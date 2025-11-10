
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { User } from '@/lib/types';
import { addUser as dbAddUser, addUsers as dbAddUsers, checkInUser as dbCheckInUser } from '@/lib/data';

const UserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().min(1, { message: 'Please enter a valid age.' }),
  bloodGroup: z.string({ required_error: 'Blood group is required.' }).min(1, 'Blood group is required.'),
  gender: z.string({ required_error: 'Please select a gender.' }).min(1, 'Please select a gender.'),
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
    _form?: string[];
  };
  user: User | null;
};


export async function addUserAction(prevState: FormState, formData: FormData): Promise<FormState> {
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
    console.error('addUserAction error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return {
      message: `Database error: ${errorMessage}`,
      user: null,
      errors: {
        _form: [`Database error: ${errorMessage}`]
      }
    };
  }
}

export async function importUsersAction(usersData: any[]) {
  try {
    await dbAddUsers(usersData);
    revalidatePath('/admin');
    return {
      success: true,
      message: `${usersData.length} users imported successfully.`,
      count: usersData.length
    };
  } catch (e) {
    console.error('importUsersAction error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return {
      success: false,
      message: `Database error: ${errorMessage}`,
      count: 0
    };
  }
}

export async function checkInUserAction(userId: string) {
  try {
    const result = await dbCheckInUser(userId);
    if (result.user) {
      if (result.alreadyCheckedIn) {
        return { success: false, alreadyCheckedIn: true, user: result.user, message: `This user has already been checked in at ${new Date(result.user.checkedInAt!).toLocaleString()}.` };
      }
      revalidatePath('/admin');
      return { success: true, alreadyCheckedIn: false, user: result.user, message: `${result.user.name} checked in successfully.` };
    }
    return { success: false, message: 'User not found.' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred during check-in.' };
  }
}
