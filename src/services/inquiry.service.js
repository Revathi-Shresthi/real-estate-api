import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { inquiries } from '../models/inquiry.model.js';
import { listings } from '../models/listing.model.js';
import logger from '../config/logger.js';

export const createInquiry = async (buyerId, data) => {
  try {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, data.listingId))
      .limit(1);

    if (!listing) {
      throw new Error('Listing not found');
    }

    const [inquiry] = await db
      .insert(inquiries)
      .values({
        listingId: data.listingId,
        buyerId,
        agentId: listing.agentId,
        message: data.message,
      })
      .returning();

    logger.info(`Inquiry created: ${inquiry.id}`);
    return inquiry;
  } catch (error) {
    logger.error('Error creating inquiry:', error);
    throw error;
  }
};

export const getMyInquiries = async (userId, role) => {
  try {
    let result;

    if (role === 'buyer') {
      result = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.buyerId, userId));
    } else if (role === 'agent') {
      result = await db
        .select()
        .from(inquiries)
        .where(eq(inquiries.agentId, userId));
    } else {
      result = await db.select().from(inquiries);
    }

    return result;
  } catch (error) {
    logger.error('Error fetching inquiries:', error);
    throw error;
  }
};

export const replyToInquiry = async (inquiryId, agentId, reply) => {
  try {
    const [existing] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .limit(1);

    if (!existing) {
      throw new Error('Inquiry not found');
    }

    if (existing.agentId !== agentId) {
      throw new Error('Not authorized to reply to this inquiry');
    }

    const [updated] = await db
      .update(inquiries)
      .set({
        reply,
        status: 'replied',
        updatedAt: new Date(),
      })
      .where(eq(inquiries.id, inquiryId))
      .returning();

    logger.info(`Inquiry replied: ${inquiryId}`);
    return updated;
  } catch (error) {
    logger.error('Error replying to inquiry:', error);
    throw error;
  }
};

export const deleteInquiry = async (inquiryId, userId, role) => {
  try {
    const [existing] = await db
      .select()
      .from(inquiries)
      .where(eq(inquiries.id, inquiryId))
      .limit(1);

    if (!existing) {
      throw new Error('Inquiry not found');
    }

    if (existing.buyerId !== userId && role !== 'admin') {
      throw new Error('Not authorized to delete this inquiry');
    }

    await db.delete(inquiries).where(eq(inquiries.id, inquiryId));

    return { message: 'Inquiry deleted successfully' };
  } catch (error) {
    logger.error('Error deleting inquiry:', error);
    throw error;
  }
};
