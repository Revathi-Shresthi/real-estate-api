import { pgTable, serial, integer, timestamp } from 'drizzle-orm/pg-core';

export const wishlists = pgTable('wishlists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull(),
  listingId: integer('listing_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
