import {
  createInquiry,
  getMyInquiries,
  replyToInquiry,
  deleteInquiry,
} from '../services/inquiry.service.js';
import { createInquirySchema, replyInquirySchema } from '../validations/inquiry.validation.js';
import { formatValidationError } from '../utils/format.js';
import logger from '../config/logger.js';

export const create = async (req, res, next) => {
  try {
    const body = {
      ...req.body,
      listingId: parseInt(req.body.listingId),
    };

    const validationResult = createInquirySchema.safeParse(body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const inquiry = await createInquiry(
      req.user.id,
      validationResult.data
    );

    return res.status(201).json({
      message: 'Inquiry sent successfully',
      inquiry,
    });
  } catch (error) {
    logger.error('Create inquiry error:', error);
    next(error);
  }
};

export const getMine = async (req, res, next) => {
  try {
    const result = await getMyInquiries(req.user.id, req.user.role);

    return res.status(200).json({
      message: 'Inquiries retrieved successfully',
      inquiries: result,
    });
  } catch (error) {
    logger.error('Get inquiries error:', error);
    next(error);
  }
};

export const reply = async (req, res, next) => {
  try {
    const validationResult = replyInquirySchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formatValidationError(validationResult.error),
      });
    }

    const inquiry = await replyToInquiry(
      parseInt(req.params.id),
      req.user.id,
      validationResult.data.reply
    );

    return res.status(200).json({
      message: 'Reply sent successfully',
      inquiry,
    });
  } catch (error) {
    logger.error('Reply inquiry error:', error);
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await deleteInquiry(
      parseInt(req.params.id),
      req.user.id,
      req.user.role
    );

    return res.status(200).json(result);
  } catch (error) {
    logger.error('Delete inquiry error:', error);
    next(error);
  }
};