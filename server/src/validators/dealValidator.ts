import { z } from 'zod';

export const createDealSchema = z.object({
  name: z.string().min(1, 'Deal name is required'),
  contactId: z.string().uuid().optional(),
  company: z.string().optional(),
  value: z.number().min(0, 'Deal value must be positive'),
  currency: z.string().length(3).optional(),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().or(z.date()).optional(),
  ownerId: z.string().uuid().optional(),
  description: z.string().optional(),
  products: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0),
    price: z.number().min(0),
  })).optional(),
});

export const updateDealSchema = z.object({
  name: z.string().min(1).optional(),
  contactId: z.string().uuid().optional(),
  company: z.string().optional(),
  value: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']).optional(),
  probability: z.number().min(0).max(100).optional(),
  expectedCloseDate: z.string().datetime().or(z.date()).optional(),
  actualCloseDate: z.string().datetime().or(z.date()).optional(),
  ownerId: z.string().uuid().optional(),
  description: z.string().optional(),
  products: z.array(z.object({
    name: z.string(),
    quantity: z.number().min(0),
    price: z.number().min(0),
  })).optional(),
  status: z.enum(['open', 'won', 'lost']).optional(),
});

export const updateDealStageSchema = z.object({
  stage: z.enum(['prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost']),
});
