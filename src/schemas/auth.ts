import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email().min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export const signupSchema = z.object({
  name: z.string().min(1, 'Full Name is required'),
  email: z.email().min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})
