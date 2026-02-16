import { z } from 'zod';

export const createContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  address: z.record(z.any()).optional(),
  status: z.enum(['active', 'inactive', 'churned']).optional(),
  source: z.enum(['website', 'referral', 'social', 'email', 'event', 'other']).optional(),
  leadScore: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  ownerId: z.string().uuid().optional(),
  customFields: z.record(z.any()).optional(),
});

export const updateContactSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  company: z.string().optional(),
  jobTitle: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  address: z.record(z.any()).optional(),
  status: z.enum(['active', 'inactive', 'churned']).optional(),
  source: z.enum(['website', 'referral', 'social', 'email', 'event', 'other']).optional(),
  leadScore: z.number().min(0).max(100).optional(),
  tags: z.array(z.string()).optional(),
  ownerId: z.string().uuid().optional(),
  customFields: z.record(z.any()).optional(),
});

export const updateLeadScoreSchema = z.object({
  leadScore: z.number().min(0).max(100, 'Lead score must be between 0 and 100'),
});

export const assignContactSchema = z.object({
  ownerId: z.string().uuid('Invalid owner ID'),
});

export const addTagsSchema = z.object({
  tags: z.array(z.string().min(1)).min(1, 'At least one tag is required'),
});

export const removeTagsSchema = z.object({
  tags: z.array(z.string().min(1)).min(1, 'At least one tag is required'),
});

export const bulkImportSchema = z.object({
  contacts: z.array(createContactSchema).min(1, 'At least one contact is required'),
});
