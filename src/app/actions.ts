"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { addUser as dbAddUser } from '@/lib/data';

const UserSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  class: z.string().min(3, { message: 'Class/Course must be at least 3 characters.' }),
});

export type FormState = {
  message: string;
  errors?: {
    name?: string[];
    email?: string[];
    class?: string[];
  };
  user: Awaited<ReturnType<typeof dbAddUser>> | null;
} | null;


export async function addUserAction(prevState: FormState, formData: FormData) {
  const validatedFields = UserSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    class: formData.get('class'),
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
    revalidatePath('/');
    return {
        message: 'User added successfully.',
        user: newUser,
        errors: {}
    };
  } catch (e) {
    return {
      message: 'An unexpected error occurred. Failed to add user.',
      user: null,
      errors: {}
    };
  }
}
