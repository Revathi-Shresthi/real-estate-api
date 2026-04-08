import { z } from 'zod';

export const createListingSchema = z.object({
  title: z.string().min(5).max(255).trim(),
  description: z.string().min(20).trim(),
  price: z.number().positive(),
  location: z.string().min(3).max(255).trim(),
  city: z.string().min(2).max(100).trim(),
  state: z.string().min(2).max(100).trim(),
  pincode: z.string().max(10).optional(),
  type: z.enum(['sale', 'rent']),
  category: z.enum([
    'apartment',
    'house',
    'villa',
    'plot',
    'commercial',
    'office',
  ]),
  bedrooms: z.number().int().positive().optional(),
  bathrooms: z.number().int().positive().optional(),
  area: z.number().positive().optional(),
  amenities: z.array(z.string()).optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const listingQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  type: z.enum(['sale', 'rent']).optional(),
  category: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  bedrooms: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
});