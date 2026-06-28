import {z} from 'zod';

export const loginSchema = z.object({
  mobile: z
    .string()
    .min(10, 'Mobile number must be 10 digits')
    .max(10, 'Mobile number must be 10 digits'),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, 'OTP must be 6 digits'),
});

export const profileSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  city: z.string().min(2, 'City is required'),
});

export const propertyBasicSchema = z.object({
  propertyType: z.string().min(1, 'Property type is required'),
  title: z.string().min(3, 'Title is required'),
  description: z.string().min(10, 'Description is required'),
  price: z.coerce.number().positive('Price must be a valid number'),
  areaSqFt: z.coerce.number().positive('Area must be a valid number'),
});

export const loanCalculatorSchema = z.object({
  loanAmount: z.coerce.number().positive('Loan amount must be a number'),
  interestRate: z.coerce.number().positive('Interest rate must be a number'),
  tenure: z.coerce.number().positive('Tenure must be a number'),
  downPayment: z.coerce.number().min(0, 'Down payment cannot be negative'),
});

export const legalRequestSchema = z.object({
  propertyDetails: z.string().min(3, 'Property details are required'),
  ownerName: z.string().min(2, 'Owner name is required'),
  city: z.string().min(2, 'City is required'),
});

export const supportTicketSchema = z.object({
  issueType: z.string().min(2, 'Issue type is required'),
  subject: z.string().min(3, 'Subject is required'),
  description: z.string().min(10, 'Description is required'),
});
