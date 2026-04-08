import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { users } from '../models/user.model.js';
import logger from '../config/logger.js';

export const getAllUsers = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users);
  } catch (error) {
    logger.error('Error fetching users:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        avatar: users.avatar,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    logger.error('Error fetching user:', error);
    throw error;
  }
};

export const updateUser = async (id, data, requesterId, requesterRole) => {
  try {
    if (parseInt(id) !== requesterId && requesterRole !== 'admin') {
      throw new Error('Not authorized to update this user');
    }

    const [updated] = await db
      .update(users)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(users.id, parseInt(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        avatar: users.avatar,
      });

    logger.info(`User updated: ${id}`);
    return updated;
  } catch (error) {
    logger.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (id, requesterId, requesterRole) => {
  try {
    if (parseInt(id) !== requesterId && requesterRole !== 'admin') {
      throw new Error('Not authorized to delete this user');
    }

    await db
      .delete(users)
      .where(eq(users.id, parseInt(id)));

    logger.info(`User deleted: ${id}`);
    return { message: 'User deleted successfully' };
  } catch (error) {
    logger.error('Error deleting user:', error);
    throw error;
  }
};