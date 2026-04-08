import { eq, and, avg, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { reviews } from '../models/review.model.js';
import { listings } from '../models/listing.model.js';
import logger from '../config/logger.js';

export const createReview = async (userId, listingId, data) => {
  try {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, listingId))
      .limit(1);

    if (!listing) {
      throw new Error('Listing not found');
    }

    const [existing] = await db
      .select()
      .from(reviews)
      .where(
        and(
          eq(reviews.userId, userId),
          eq(reviews.listingId, listingId)
        )
      )
      .limit(1);

    if (existing) {
      throw new Error('You have already reviewed this listing');
    }

    const [review] = await db
      .insert(reviews)
      .values({
        userId,
        listingId,
        rating: data.rating,
        comment: data.comment,
      })
      .returning();

    logger.info(`Review created: ${review.id}`);
    return review;
  } catch (error) {
    logger.error('Error creating review:', error);
    throw error;
  }
};

export const getListingReviews = async (listingId) => {
  try {
    const result = await db
      .select()
      .from(reviews)
      .where(eq(reviews.listingId, parseInt(listingId)));

    const [{ average }] = await db
      .select({
        average: sql`avg(${reviews.rating})`,
      })
      .from(reviews)
      .where(eq(reviews.listingId, parseInt(listingId)));

    return {
      reviews: result,
      averageRating: average ? parseFloat(average).toFixed(1) : '0.0',
      totalReviews: result.length,
    };
  } catch (error) {
    logger.error('Error fetching reviews:', error);
    throw error;
  }
};

export const deleteReview = async (reviewId, userId, role) => {
  try {
    const [existing] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.id, reviewId))
      .limit(1);

    if (!existing) {
      throw new Error('Review not found');
    }

    if (existing.userId !== userId && role !== 'admin') {
      throw new Error('Not authorized to delete this review');
    }

    await db
      .delete(reviews)
      .where(eq(reviews.id, reviewId));

    return { message: 'Review deleted successfully' };
  } catch (error) {
    logger.error('Error deleting review:', error);
    throw error;
  }
};