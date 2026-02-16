import { z } from 'zod';

export const createTicketSchema = z.object({
  subject: z.string().min(1, 'Subject is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['open', 'pending', 'in_progress', 'resolved', 'closed']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  category: z.string().optional(),
  contactId: z.string().uuid().optional(),
  assignedToId: z.string().uuid().optional(),
  slaDueAt: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export const updateTicketSchema = createTicketSchema.partial();

export const addCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required'),
  isInternal: z.boolean().optional(),
  attachments: z.array(z.any()).optional(),
});
