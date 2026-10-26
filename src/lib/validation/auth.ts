import { z } from 'zod';

export const signupSchema = z
  .object({
    businessName: z
      .string()
      .trim()
      .min(1, 'Business name is required')
      .max(120, 'Business name must be under 120 characters'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password is too long'),
  })
  .strict();

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;

export const requestPasswordResetSchema = z
  .object({
    email: z.string().trim().email('Please enter a valid email address'),
  })
  .strict();

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .max(100, 'Password is too long'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
