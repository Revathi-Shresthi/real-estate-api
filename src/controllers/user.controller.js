import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '../services/user.service.js';
import logger from '../config/logger.js';

export const getAll = async (req, res, next) => {
  try {
    const result = await getAllUsers();
    return res.status(200).json({
      message: 'Users retrieved successfully',
      users: result,
    });
  } catch (error) {
    logger.error('Get users error:', error);
    next(error);
  }
};

export const getById = async (req, res, next) => {
  try {
    const user = await getUserById(req.params.id);
    return res.status(200).json({
      message: 'User retrieved successfully',
      user,
    });
  } catch (error) {
    logger.error('Get user error:', error);
    if (error.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    next(error);
  }
};

export const update = async (req, res, next) => {
  try {
    const user = await updateUser(
      req.params.id,
      req.body,
      req.user.id,
      req.user.role
    );
    return res.status(200).json({
      message: 'User updated successfully',
      user,
    });
  } catch (error) {
    logger.error('Update user error:', error);
    if (error.message === 'Not authorized to update this user') {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};

export const remove = async (req, res, next) => {
  try {
    const result = await deleteUser(
      req.params.id,
      req.user.id,
      req.user.role
    );
    return res.status(200).json(result);
  } catch (error) {
    logger.error('Delete user error:', error);
    if (error.message === 'Not authorized to delete this user') {
      return res.status(403).json({ error: error.message });
    }
    next(error);
  }
};