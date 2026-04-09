import { eq, and, gte, lte, ilike, or, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { listings } from '../models/listing.model.js';
import cloudinary from '../config/cloudinary.js';
import logger from '../config/logger.js';

export const uploadImages = async (files) => {
  try {
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'real-estate',
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
          }
        );
        stream.end(file.buffer);
      });
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    logger.error('Error uploading images:', error);
    throw new Error('Error uploading images', { cause: error });
  }
};

export const createListing = async (data, agentId, files = []) => {
  try {
    let images = [];

    if (files.length > 0) {
      images = await uploadImages(files);
    }

    const [newListing] = await db
      .insert(listings)
      .values({
        ...data,
        price: data.price.toString(),
        area: data.area ? data.area.toString() : null,
        images,
        agentId,
      })
      .returning();

    logger.info(`Listing created: ${newListing.id}`);
    return newListing;
  } catch (error) {
    logger.error('Error creating listing:', error);
    throw error;
  }
};

export const getAllListings = async (query) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (query.city) {
      conditions.push(ilike(listings.city, `%${query.city}%`));
    }

    if (query.state) {
      conditions.push(ilike(listings.state, `%${query.state}%`));
    }

    if (query.type) {
      conditions.push(eq(listings.type, query.type));
    }

    if (query.category) {
      conditions.push(eq(listings.category, query.category));
    }

    if (query.minPrice) {
      conditions.push(gte(listings.price, query.minPrice));
    }

    if (query.maxPrice) {
      conditions.push(lte(listings.price, query.maxPrice));
    }

    if (query.bedrooms) {
      conditions.push(eq(listings.bedrooms, parseInt(query.bedrooms)));
    }

    if (query.status) {
      conditions.push(eq(listings.status, query.status));
    } else {
      conditions.push(eq(listings.status, 'available'));
    }

    if (query.search) {
      conditions.push(
        or(
          ilike(listings.title, `%${query.search}%`),
          ilike(listings.description, `%${query.search}%`),
          ilike(listings.location, `%${query.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allListings = await db
      .select()
      .from(listings)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${listings.createdAt} desc`);

    const [{ count }] = await db
      .select({ count: sql`count(*)` })
      .from(listings)
      .where(whereClause);

    return {
      listings: allListings,
      pagination: {
        total: parseInt(count),
        page,
        limit,
        totalPages: Math.ceil(parseInt(count) / limit),
        hasNextPage: page < Math.ceil(parseInt(count) / limit),
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    logger.error('Error fetching listings:', error);
    throw error;
  }
};

export const getListingById = async (id) => {
  try {
    const [listing] = await db
      .select()
      .from(listings)
      .where(eq(listings.id, parseInt(id)))
      .limit(1);

    if (!listing) {
      throw new Error('Listing not found');
    }

    return listing;
  } catch (error) {
    logger.error('Error fetching listing:', error);
    throw error;
  }
};

export const updateListing = async (id, data, agentId, role, files = []) => {
  try {
    const existing = await getListingById(id);

    if (existing.agentId !== agentId && role !== 'admin') {
      throw new Error('Not authorized to update this listing');
    }

    let images = existing.images || [];

    if (files.length > 0) {
      const newImages = await uploadImages(files);
      images = [...images, ...newImages];
    }

    const [updated] = await db
      .update(listings)
      .set({
        ...data,
        price: data.price ? data.price.toString() : existing.price,
        area: data.area ? data.area.toString() : existing.area,
        images,
        updatedAt: new Date(),
      })
      .where(eq(listings.id, parseInt(id)))
      .returning();

    logger.info(`Listing updated: ${id}`);
    return updated;
  } catch (error) {
    logger.error('Error updating listing:', error);
    throw error;
  }
};

export const deleteListing = async (id, agentId, role) => {
  try {
    const existing = await getListingById(id);

    if (existing.agentId !== agentId && role !== 'admin') {
      throw new Error('Not authorized to delete this listing');
    }

    await db.delete(listings).where(eq(listings.id, parseInt(id)));

    logger.info(`Listing deleted: ${id}`);
    return { message: 'Listing deleted successfully' };
  } catch (error) {
    logger.error('Error deleting listing:', error);
    throw error;
  }
};

export const updateListingStatus = async (id, status, agentId, role) => {
  try {
    const existing = await getListingById(id);

    if (existing.agentId !== agentId && role !== 'admin') {
      throw new Error('Not authorized to update this listing');
    }

    const [updated] = await db
      .update(listings)
      .set({ status, updatedAt: new Date() })
      .where(eq(listings.id, parseInt(id)))
      .returning();

    logger.info(`Listing status updated: ${id} -> ${status}`);
    return updated;
  } catch (error) {
    logger.error('Error updating listing status:', error);
    throw error;
  }
};

export const getAgentListings = async (agentId, query) => {
  try {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;
    const offset = (page - 1) * limit;

    const agentListings = await db
      .select()
      .from(listings)
      .where(eq(listings.agentId, parseInt(agentId)))
      .limit(limit)
      .offset(offset)
      .orderBy(sql`${listings.createdAt} desc`);

    return agentListings;
  } catch (error) {
    logger.error('Error fetching agent listings:', error);
    throw error;
  }
};
