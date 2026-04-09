import { z } from 'zod';

export const createInquirySchema = z.object({
  listingId: z.number().int().positive(),
  message: z.string().min(10).max(1000).trim(),
});

export const replyInquirySchema = z.object({
  reply: z.string().min(5).max(1000).trim(),
});

export const updateInquiryStatusSchema = z.object({
  status: z.enum(['pending', 'replied', 'closed']),
});
