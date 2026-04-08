import {
  createListing,
  getAllListings,
  getListingById,
  updateListing,
  deleteListing,
  updateListingStatus,
  getAgentListings,
} from '../services/listing.service.js';
import {
  createListingSchema,
  updateListingSchema,
} from '../validations/listing.validation.js';
import { formatValidationError } from '../utils/format.js';
import logger from '../config/logger.js';

export const create = async (req, res, next) => {
  try {
    const body = {
      title: req.body.title,
      description: req.body.description,
      price: Number(req.body.price),
      location: req.body.location,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      type: req.body.type,
      category: req.body.category,
      bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : undefined,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
      area: req.body.area ? Number(req.body.area) : undefined,
      amenities: req.body.amenities
        ? typeof req.body.amenities === 'string'
          ? JSON.parse(req.body.amenities)
          : req.body.amenities
        : [],
    };

    const validationResult = createListingSchema.safeParse(body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const files = req.files || [];
    const listing = await createListing(
      validationResult.data,
      req.user.id,
      files
    );

    return res.status(201).json({
      message: 'Listing created successfully',
      listing,
    });
  } catch (error) {
    logger.error('Create listing error:', error);
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const result = await getAllListings(req.query);
    return res.status(200).json({
      message: 'Listings retrieved successfully',
      ...result,
    });
  } catch (error) {
    logger.error('Get listings error:', error);
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const listing = await getListingById(req.params.id);
    return res.status(200).json({
      message: 'Listing retrieved successfully',
      listing,
    });
  } catch (error) {
    logger.error('Get listing error:', error);
    if (error.message === 'Listing not found') {
      return res.status(404).json({ error: 'Listing not found' });
    }
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const body = {
      title: req.body.title,
      description: req.body.description,
      price: req.body.price ? Number(req.body.price) : undefined,
      location: req.body.location,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      type: req.body.type,
      category: req.body.category,
      bedrooms: req.body.bedrooms ? Number(req.body.bedrooms) : undefined,
      bathrooms: req.body.bathrooms ? Number(req.body.bathrooms) : undefined,
      area: req.body.area ? Number(req.body.area) : undefined,
      amenities: req.body.amenities
        ? typeof req.body.amenities === 'string'
          ? JSON.parse(req.body.amenities)
          : req.body.amenities
        : undefined,
    };

    const validationResult = updateListingSchema.safeParse(body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const files = req.files || [];
    const listing = await updateListing(
      req.params.id,
      validationResult.data,
      req.user.id,
      req.user.role,
      files
    );

    return res.status(200).json({
      message: 'Listing updated successfully',
      listing,
    });
  } catch (error) {
    logger.error('Update listing error:', error);
    if (error.message === 'Not authorized to update this listing') {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await deleteListing(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return res.status(200).json(result);
  } catch (error) {
    logger.error('Delete listing error:', error);
    if (error.message === 'Not authorized to delete this listing') {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = [
      'available',
      'sold',
      'rented',
      'under_negotiation',
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const listing = await updateListingStatus(
      req.params.id,
      status,
      req.user.id,
      req.user.role
    );

    return res.status(200).json({
      message: 'Listing status updated successfully',
      listing,
    });
  } catch (error) {
    logger.error('Update status error:', error);
    next(error);
  }
};

export const getMyListings = async (req, res, next) => {
  try {
    const agentListings = await getAgentListings(
      req.user.id,
      req.query
    );
    return res.status(200).json({
      message: 'Your listings retrieved successfully',
      listings: agentListings,
    });
  } catch (error) {
    logger.error('Get my listings error:', error);
    next(error);
  }
};