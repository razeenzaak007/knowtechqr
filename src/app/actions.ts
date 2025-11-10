
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addUser as dbAddUser, addUsers as dbAddUsers, checkInUser as dbCheckInUser } from '@/lib/data';
import type { User } from '@/lib/types';

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

const NewUserSchema = z.object({
  name: z.string(),
  age: z.coerce.number(),
  bloodGroup: z.string(),
  gender: z.string(),
  job: z.string(),
  area: z.string(),
  whatsappNumber: z.string(),
  email: z.string().email(),
});

const NewUsersSchema = z.array(NewUserSchema);


export async function importUsersAction(usersData: unknown) {
  const validatedFields = NewUsersSchema.safeParse(usersData);

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error);
    return {
      success: false,
      message: 'The data from the Excel file is not in the correct format. Please check the column headers and data types.',
      count: 0
    };
  }

  try {
    await dbAddUsers(validatedFields.data);
    revalidatePath('/admin');
    return {
      success: true,
      message: `${validatedFields.data.length} users imported successfully.`,
      count: validatedFields.data.length
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
