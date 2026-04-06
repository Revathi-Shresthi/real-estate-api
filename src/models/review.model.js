import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id').notNull(),
  userId: integer('user_id').notNull(),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});