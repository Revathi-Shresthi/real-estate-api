import { eq, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { wishlists } from '../models/wishlist.model.js';
import { listings } from '../models/listing.model.js';
import logger from '../config/logger.js';

export const addToWishlist = async (userId, listingId) => {
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
      .from(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.listingId, listingId)
        )
      )
      .limit(1);

    if (existing) {
      throw new Error('Listing already in wishlist');
    }

    const [wishlist] = await db
      .insert(wishlists)
      .values({ userId, listingId })
      .returning();

    logger.info(`Added to wishlist: user ${userId} listing ${listingId}`);
    return wishlist;
  } catch (error) {
    logger.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (userId, listingId) => {
  try {
    await db
      .delete(wishlists)
      .where(
        and(
          eq(wishlists.userId, userId),
          eq(wishlists.listingId, parseInt(listingId))
        )
      );

    logger.info(`Removed from wishlist: user ${userId} listing ${listingId}`);
    return { message: 'Removed from wishlist successfully' };
  } catch (error) {
    logger.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const getMyWishlist = async (userId) => {
  try {
    const result = await db
      .select()
      .from(wishlists)
      .where(eq(wishlists.userId, userId));

    return result;
  } catch (error) {
    logger.error('Error fetching wishlist:', error);
    throw error;
  }
};