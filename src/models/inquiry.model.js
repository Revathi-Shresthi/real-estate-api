import {
  pgTable,
  serial,
  integer,
  text,
  varchar,
  timestamp,
} from 'drizzle-orm/pg-core';

export const inquiries = pgTable('inquiries', {
  id: serial('id').primaryKey(),
  listingId: integer('listing_id').notNull(),
  buyerId: integer('buyer_id').notNull(),
  agentId: integer('agent_id').notNull(),
  message: text('message').notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  reply: text('reply'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
